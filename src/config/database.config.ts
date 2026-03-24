import { Sequelize } from 'sequelize';
import env from './env.config';

export const sequelize = new Sequelize({
  host: env.database.host,
  port: env.database.port,
  database: env.database.database,
  username: env.database.username,
  password: env.database.password,
  dialect: 'postgres',
  logging: env.nodeEnv === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: false,
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');

    // Drop views that depend on tables being altered
    if (env.nodeEnv === 'development') {
      console.log('Dropping dependent views and triggers for schema sync...');
      await sequelize.query('DROP VIEW IF EXISTS daily_sales_summary CASCADE;');
      await sequelize.query('DROP VIEW IF EXISTS product_performance CASCADE;');
      await sequelize.query('DROP VIEW IF EXISTS low_stock_alert CASCADE;');
      await sequelize.query('DROP MATERIALIZED VIEW IF EXISTS mv_monthly_sales_summary CASCADE;');
      await sequelize.query('DROP MATERIALIZED VIEW IF EXISTS mv_yearly_sales_summary CASCADE;');
      await sequelize.query('DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_summary CASCADE;');
      await sequelize.query('DROP MATERIALIZED VIEW IF EXISTS mv_monthly_expenses CASCADE;');
      await sequelize.query('DROP MATERIALIZED VIEW IF EXISTS mv_low_stock_products CASCADE;');

      // Drop triggers that depend on columns being altered
      await sequelize.query('DROP TRIGGER IF EXISTS trg_sale_stock ON sales;');
      await sequelize.query('DROP TRIGGER IF EXISTS trg_sale_refund ON sales;');
      await sequelize.query('DROP TRIGGER IF EXISTS trg_purchase_stock ON purchase_items;');
      await sequelize.query('DROP TRIGGER IF EXISTS trg_purchase_status_received ON purchases;');
      await sequelize.query('DROP TRIGGER IF EXISTS trg_refresh_dashboard_sales ON sales;');
      await sequelize.query('DROP TRIGGER IF EXISTS trg_refresh_dashboard_expenses ON expenses;');
      await sequelize.query('DROP TRIGGER IF EXISTS trg_refresh_dashboard_products ON products;');
      console.log('Views and triggers dropped successfully');

      // Sync all models
      await sequelize.sync({ alter: true });
      console.log('Database synchronized');

      // Recreate views from schema.sql
      console.log('Recreating views and triggers...');
      await recreateViews();
      await recreateTriggers();
      console.log('Views and triggers recreated successfully');
    } else {
      await sequelize.sync();
      console.log('Database synchronized');
    }
  } catch (error) {
    console.error('Unable to connect to database:', error);
    process.exit(1);
  }
};

// Helper function to recreate views after sync
const recreateViews = async (): Promise<void> => {
  // Recreate daily_sales_summary view
  await sequelize.query(`
    CREATE VIEW daily_sales_summary AS
    SELECT
      DATE(created_at) as sale_date,
      COUNT(*) as total_transactions,
      SUM(grand_total) as total_sales,
      SUM(quantity) as total_items_sold,
      AVG(grand_total) as average_transaction_value
    FROM sales
    WHERE payment_status = 'PAID'
    GROUP BY DATE(created_at)
    ORDER BY sale_date DESC;
  `);

  // Recreate product_performance view
  await sequelize.query(`
    CREATE VIEW product_performance AS
    SELECT
      p.product_id,
      p.product_name,
      p.barcode,
      COUNT(s.sale_id) as times_sold,
      COALESCE(SUM(s.quantity), 0) as total_quantity_sold,
      COALESCE(SUM(s.grand_total), 0) as total_revenue
    FROM products p
    LEFT JOIN sales s ON p.product_id = s.product_id AND s.payment_status = 'PAID'
    GROUP BY p.product_id, p.product_name, p.barcode
    ORDER BY total_revenue DESC;
  `);

  // Recreate low_stock_alert view
  await sequelize.query(`
    CREATE VIEW low_stock_alert AS
    SELECT
      product_id,
      product_name,
      barcode,
      stock_quantity,
      reorder_level,
      (reorder_level - stock_quantity) as needed_to_reorder
    FROM products
    WHERE stock_quantity <= reorder_level AND is_active = TRUE
    ORDER BY needed_to_reorder DESC;
  `);

  // Recreate materialized views
  await sequelize.query(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS mv_monthly_sales_summary AS
    SELECT
      DATE_TRUNC('month', created_at) as month,
      EXTRACT(MONTH FROM created_at) as month_num,
      TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as month_name,
      EXTRACT(YEAR FROM created_at) as year,
      COUNT(DISTINCT invoice_no) as sales_count,
      COALESCE(SUM(grand_total), 0) as revenue,
      COALESCE(SUM(tax_amount), 0) as total_tax,
      COALESCE(SUM(discount_amount), 0) as total_discount
    FROM sales
    WHERE payment_status = 'PAID'
    GROUP BY DATE_TRUNC('month', created_at), EXTRACT(MONTH FROM created_at), EXTRACT(YEAR FROM created_at), TO_CHAR(DATE_TRUNC('month', created_at), 'Mon')
    ORDER BY year DESC, month_num DESC;
  `);

  await sequelize.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_monthly_sales_unique ON mv_monthly_sales_summary(month, year);
    CREATE INDEX IF NOT EXISTS idx_mv_monthly_sales_year ON mv_monthly_sales_summary(year DESC, month_num DESC);
  `);

  await sequelize.query(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS mv_yearly_sales_summary AS
    SELECT
      EXTRACT(YEAR FROM created_at) as year,
      COUNT(DISTINCT invoice_no) as sales_count,
      COALESCE(SUM(grand_total), 0) as revenue,
      COALESCE(SUM(tax_amount), 0) as total_tax,
      COALESCE(SUM(discount_amount), 0) as total_discount
    FROM sales
    WHERE payment_status = 'PAID'
    GROUP BY EXTRACT(YEAR FROM created_at)
    ORDER BY year DESC;
  `);

  await sequelize.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_yearly_sales_unique ON mv_yearly_sales_summary(year);
  `);

  await sequelize.query(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_summary AS
    SELECT
      1 as id,
      COALESCE(SUM(s.grand_total), 0) as total_revenue,
      COALESCE(SUM(p.cost_price * s.quantity), 0) as total_cost,
      (SELECT COALESCE(SUM(amount), 0) FROM expenses) as total_expenses,
      COUNT(DISTINCT s.invoice_no) as total_sales,
      (SELECT COUNT(*) FROM products WHERE is_active = true) as total_products,
      (SELECT COUNT(*) FROM products WHERE stock_quantity <= reorder_level AND is_active = true) as low_stock_products,
      NOW() as last_updated
    FROM sales s
    LEFT JOIN products p ON s.product_id = p.product_id
    WHERE s.payment_status = 'PAID'
      AND s.created_at >= DATE_TRUNC('year', CURRENT_DATE);
  `);

  await sequelize.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_dashboard_summary_id ON mv_dashboard_summary(id);
  `);

  await sequelize.query(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS mv_monthly_expenses AS
    SELECT
      DATE_TRUNC('month', created_at) as month,
      EXTRACT(MONTH FROM created_at) as month_num,
      TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as month_name,
      EXTRACT(YEAR FROM created_at) as year,
      COALESCE(SUM(amount), 0) as expenses
    FROM expenses
    GROUP BY DATE_TRUNC('month', created_at), EXTRACT(MONTH FROM created_at), EXTRACT(YEAR FROM created_at), TO_CHAR(DATE_TRUNC('month', created_at), 'Mon')
    ORDER BY year DESC, month_num DESC;
  `);

  await sequelize.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_monthly_expenses_unique ON mv_monthly_expenses(month, year);
    CREATE INDEX IF NOT EXISTS idx_mv_monthly_expenses_year ON mv_monthly_expenses(year DESC, month_num DESC);
  `);

  await sequelize.query(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS mv_low_stock_products AS
    SELECT
      1 as id,
      COUNT(*) as low_stock_count
    FROM products
    WHERE is_active = true
      AND stock_quantity <= reorder_level;
  `);

  await sequelize.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_low_stock_id ON mv_low_stock_products(id);
  `);
};

// Helper function to recreate triggers after sync
const recreateTriggers = async (): Promise<void> => {
  // Create the function for processing sale stock
  await sequelize.query(`
    CREATE OR REPLACE FUNCTION fn_process_sale_stock()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE products
      SET stock_quantity = stock_quantity - NEW.quantity,
          updated_at = NOW()
      WHERE product_id = NEW.product_id;

      INSERT INTO stock_movements (product_id, user_id, movement_type, quantity, notes, created_at)
      VALUES (NEW.product_id, NEW.user_id, 'SALE', -NEW.quantity, 'Sale ID: ' || NEW.sale_id || ' - ' || NEW.product_name, NOW());

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create the sale stock trigger
  await sequelize.query(`
    CREATE TRIGGER trg_sale_stock
    AFTER INSERT ON sales
    FOR EACH ROW
    WHEN (NEW.payment_status = 'PAID')
    EXECUTE FUNCTION fn_process_sale_stock();
  `);

  // Create the function for processing sale refunds
  await sequelize.query(`
    CREATE OR REPLACE FUNCTION fn_process_sale_refund()
    RETURNS TRIGGER AS $$
    BEGIN
      IF (NEW.payment_status = 'REFUNDED' AND OLD.payment_status = 'PAID') THEN
        UPDATE products
        SET stock_quantity = stock_quantity + NEW.quantity,
            updated_at = NOW()
        WHERE product_id = NEW.product_id;

        INSERT INTO stock_movements (product_id, user_id, movement_type, quantity, notes, created_at, updated_at)
        VALUES (NEW.product_id, NEW.user_id, 'RETURN', NEW.quantity, 'Refund for Sale ID: ' || NEW.sale_id, NOW(), NOW());
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create the sale refund trigger
  await sequelize.query(`
    CREATE TRIGGER trg_sale_refund
    AFTER UPDATE OF payment_status ON sales
    FOR EACH ROW
    EXECUTE FUNCTION fn_process_sale_refund();
  `);

  // Create the function for processing purchase stock
  await sequelize.query(`
    CREATE OR REPLACE FUNCTION fn_process_purchase_stock()
    RETURNS TRIGGER AS $$
    DECLARE
      purchase_user_id INT;
      purchase_status VARCHAR(8);
    BEGIN
      -- Get purchase status and user_id
      SELECT status, user_id INTO purchase_status, purchase_user_id
      FROM purchases
      WHERE purchase_id = NEW.purchase_id;

      -- Only process stock if purchase is RECEIVED
      IF purchase_status = 'RECEIVED' THEN
        UPDATE products
        SET stock_quantity = stock_quantity + NEW.quantity,
            cost_price = NEW.buy_price
        WHERE product_id = NEW.product_id;

        INSERT INTO stock_movements (product_id, user_id, movement_type, quantity, notes, created_at)
        VALUES (NEW.product_id, purchase_user_id, 'PURCHASE', NEW.quantity, 'Stock In Purchase ID: ' || NEW.purchase_id, NOW());
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create the function for processing purchase status change to RECEIVED
  await sequelize.query(`
    CREATE OR REPLACE FUNCTION fn_process_purchase_status_received()
    RETURNS TRIGGER AS $$
    DECLARE
      purchase_item RECORD;
    BEGIN
      -- Only process when status changes to RECEIVED
      IF NEW.status = 'RECEIVED' AND OLD.status != 'RECEIVED' THEN
        FOR purchase_item IN
          SELECT product_id, quantity, buy_price
          FROM purchase_items
          WHERE purchase_id = NEW.purchase_id
        LOOP
          UPDATE products
          SET stock_quantity = stock_quantity + purchase_item.quantity,
              cost_price = purchase_item.buy_price
          WHERE product_id = purchase_item.product_id;

          INSERT INTO stock_movements (product_id, user_id, movement_type, quantity, notes, created_at)
          VALUES (purchase_item.product_id, NEW.user_id, 'PURCHASE', purchase_item.quantity, 'Stock In Purchase ID: ' || NEW.purchase_id, NOW());
        END LOOP;
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create the purchase stock trigger
  await sequelize.query(`
    CREATE TRIGGER trg_purchase_stock
    AFTER INSERT ON purchase_items
    FOR EACH ROW
    EXECUTE FUNCTION fn_process_purchase_stock();
  `);

  // Create the purchase status change trigger
  await sequelize.query(`
    CREATE TRIGGER trg_purchase_status_received
    AFTER UPDATE OF status ON purchases
    FOR EACH ROW
    EXECUTE FUNCTION fn_process_purchase_status_received();
  `);

  // Create the function for refreshing dashboard summary
  await sequelize.query(`
    CREATE OR REPLACE FUNCTION trigger_refresh_dashboard_summary()
    RETURNS TRIGGER AS $$
    BEGIN
      REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_summary;
      REFRESH MATERIALIZED VIEW CONCURRENTLY mv_low_stock_products;
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create the refresh triggers for sales, expenses, and products
  await sequelize.query(`
    CREATE TRIGGER trg_refresh_dashboard_sales
    AFTER INSERT OR UPDATE OR DELETE ON sales
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_refresh_dashboard_summary();
  `);

  await sequelize.query(`
    CREATE TRIGGER trg_refresh_dashboard_expenses
    AFTER INSERT OR UPDATE OR DELETE ON expenses
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_refresh_dashboard_summary();
  `);

  await sequelize.query(`
    CREATE TRIGGER trg_refresh_dashboard_products
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_refresh_dashboard_summary();
  `);
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
};

export default sequelize;
