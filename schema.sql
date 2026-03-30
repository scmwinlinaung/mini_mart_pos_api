-- Mini Mart POS Database Schema

-- 1. Roles (Admin, Cashier, Manager)
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name varchar(15) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users (Staff login)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username varchar(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL, -- Store BCrypt/Argon2 hash, not plain text
    full_name varchar(50),
    role_id INT REFERENCES roles(role_id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories (Beverages, Snacks, Home)
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name varchar(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Suppliers (Who you buy from)
CREATE TABLE suppliers (
    supplier_id SERIAL PRIMARY KEY,
    company_name varchar(50) NOT NULL,
    contact_name varchar(50),
    phone_number varchar(15),
    email varchar(254),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Unit Types (Standardized units of measurement) - MOVED BEFORE PRODUCTS
CREATE TABLE unit_types (
    unit_id SERIAL PRIMARY KEY,
    unit_code varchar(50) NOT NULL UNIQUE, -- 'PCS', 'KG', 'L', etc.
    unit_name varchar(50) NOT NULL, -- 'Pieces', 'Kilograms', 'Liters'
    is_weighted BOOLEAN DEFAULT FALSE, -- For barcode scales (weight-based items)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Products (The core table for Barcode Scanners)
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(category_id),
    supplier_id INT REFERENCES suppliers(supplier_id), -- Preferred supplier
    unit_type_id INT REFERENCES unit_types(unit_id), -- Default unit for this product

    -- BARCODE: The most critical field for your scanner
    barcode varchar(50) UNIQUE NOT NULL,

    product_name varchar(50) NOT NULL,
    description TEXT,

    -- MONEY: Stored in Myanmar Kyat (MMK)
    cost_price FLOAT DEFAULT 0.0,
    sell_price FLOAT NOT NULL,

    -- INVENTORY TRACKING
    stock_quantity INT DEFAULT 0,
    reorder_level INT DEFAULT 10, -- Alert when stock is low

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Customers (Optional for Walk-in, Required for Loyalty)
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    phone_number varchar(15) UNIQUE,
    full_name varchar(50),
    address TEXT,
    loyalty_points INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Sales (Single transaction record with simplified structure)
CREATE TABLE sales (
    sale_id SERIAL PRIMARY KEY,
    invoice_no varchar(50) NOT NULL, -- e.g., 'INV-20231025-001' (shared across line items in same transaction)
    user_id INT REFERENCES users(user_id), -- Cashier
    customer_id INT REFERENCES customers(customer_id) ON DELETE CASCADE, -- Nullable for walk-ins

    -- PRODUCT REFERENCE
    product_id INT REFERENCES products(product_id),
    unit_type_id INT REFERENCES unit_types(unit_id),
    barcode varchar(50) NOT NULL, -- Denormalized for performance and receipts

    -- TRANSACTION DETAILS
    product_name varchar(50) NOT NULL, -- Snapshot for receipts/history
    quantity INT NOT NULL DEFAULT 1,

    -- SNAPSHOT PRICES: Store price at moment of sale (in case product price changes later)
    unit_price FLOAT NOT NULL, -- Individual unit price
    total_price FLOAT NOT NULL, -- (quantity * unit_price)

    -- MONEY CALCULATIONS
    tax_amount FLOAT DEFAULT 0.0,
    discount_amount FLOAT DEFAULT 0.0,
    sub_total FLOAT DEFAULT 0.0,
    grand_total FLOAT NOT NULL, -- (total_price + tax_amount - discount_amount)

    payment_method TEXT CHECK (payment_method IN ('CASH', 'CARD', 'QR', 'CREDIT')),
    payment_status TEXT DEFAULT 'PAID' CHECK (payment_status IN ('PAID', 'PENDING', 'REFUNDED')),

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Stock Ledger
CREATE TABLE stock_movements (
    movement_id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(product_id),
    user_id INT REFERENCES users(user_id),

    movement_type TEXT CHECK (movement_type IN ('SALE', 'PURCHASE', 'RETURN', 'RETURN_IN', 'RETURN_OUT', 'DAMAGE', 'EXPIRED', 'THEFT', 'LOSS', 'CORRECTION')),
    quantity INT NOT NULL, -- Positive for adding stock, Negative for removing

    notes TEXT, -- e.g. "Invoice #123" or "Sale #99"
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Purchases (Stock coming in)
CREATE TABLE purchases (
    purchase_id SERIAL PRIMARY KEY,
    supplier_id INT REFERENCES suppliers(supplier_id),
    user_id INT REFERENCES users(user_id),

    supplier_invoice_no varchar(50) UNIQUE,
    total_amount FLOAT DEFAULT 0.0,
    status varchar(8) DEFAULT 'PENDING', -- 'PENDING', 'RECEIVED'

    purchase_date TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Purchase Items
CREATE TABLE purchase_items (
    item_id SERIAL PRIMARY KEY,
    purchase_id INT REFERENCES purchases(purchase_id),
    product_id INT REFERENCES products(product_id),

    quantity INT NOT NULL,
    buy_price FLOAT NOT NULL, -- Cost per unit
    expiry_date DATE, -- Critical for Mini Marts

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Expense Categories
CREATE TABLE expense_categories (
    category_id SERIAL PRIMARY KEY,
    category_name TEXT NOT NULL, -- 'Rent', 'Utilities', 'Salary'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Expenses
CREATE TABLE expenses (
    expense_id SERIAL PRIMARY KEY,
    category_id INT REFERENCES expense_categories(category_id),
    user_id INT REFERENCES users(user_id),

    title TEXT NOT NULL,
    description TEXT,

    amount FLOAT NOT NULL, -- Money as Double
    expense_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PERFORMANCE INDEXES - Create after all tables are created
-- These indexes are critical for dashboard performance with 100k+ records
-- ============================================

-- Index for fast barcode lookups - critical for scanner performance
CREATE INDEX idx_products_barcode ON products(barcode);

-- Additional performance indexes for reporting and queries
CREATE INDEX idx_sales_user ON sales(user_id);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_barcode ON sales(barcode);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at);

-- ============================================
-- OPTIMIZED DASHBOARD INDEXES for 100k+ Records
-- ============================================

-- 1. Composite index for yearly sales aggregation (most critical for dashboard)
-- Covers queries that filter by created_at and need grand_total
CREATE INDEX idx_sales_date_grand_total ON sales(created_at DESC, grand_total)
    WHERE payment_status = 'PAID';

-- 2. Index for monthly sales aggregation with payment status filter
-- Note: DATE_TRUNC index removed (requires IMMUTABLE), covered by composite index

-- 3. Index for low stock queries (covers both stock_quantity and reorder_level)
CREATE INDEX idx_products_stock_alert ON products(stock_quantity, reorder_level)
    WHERE is_active = true AND stock_quantity <= reorder_level;

-- 4. Index for active products count
CREATE INDEX idx_products_active_count ON products(product_id)
    WHERE is_active = true;

-- 5. Index for expense aggregations by date
CREATE INDEX idx_expenses_date_amount ON expenses(created_at, amount);

-- 6. Index for sales with products join (dashboard cost calculation)
CREATE INDEX idx_sales_product_cost ON sales(product_id, created_at, quantity)
    WHERE payment_status = 'PAID';

-- 7. Covering index for invoice count queries
CREATE INDEX idx_sales_invoice_count ON sales(invoice_no, created_at)
    WHERE payment_status = 'PAID';

-- 8. Index for expenses by date
CREATE INDEX idx_expenses_date ON expenses(created_at, expense_date);

-- HELPER VIEWS FOR REPORTING

-- View: Daily Sales Summary
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

-- View: Product Performance
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

-- View: Low Stock Alert
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

-- ============================================
-- MATERIALIZED VIEWS for Dashboard Performance
-- Pre-computed aggregations that refresh automatically
-- Much faster than running complex aggregations on 100k+ records
-- ============================================

-- 1. Monthly Sales Summary Materialized View
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

-- Create indexes on materialized view for faster lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_monthly_sales_unique ON mv_monthly_sales_summary(month, year);
CREATE INDEX IF NOT EXISTS idx_mv_monthly_sales_year ON mv_monthly_sales_summary(year DESC, month_num DESC);

-- 2. Yearly Sales Summary Materialized View
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

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_yearly_sales_unique ON mv_yearly_sales_summary(year);

-- 3. Dashboard Summary Materialized View (real-time summary stats)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_summary AS
SELECT
    1 as id, -- Single row
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

-- Create index
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_dashboard_summary_id ON mv_dashboard_summary(id);

-- 4. Monthly Expenses Materialized View
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

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_monthly_expenses_unique ON mv_monthly_expenses(month, year);
CREATE INDEX IF NOT EXISTS idx_mv_monthly_expenses_year ON mv_monthly_expenses(year DESC, month_num DESC);

-- 5. Low Stock Products Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_low_stock_products AS
SELECT
    1 as id,  -- Single row with unique id for CONCURRENTLY refresh
    COUNT(*) as low_stock_count
FROM products
WHERE is_active = true
    AND stock_quantity <= reorder_level;

-- Create unique index (required for CONCURRENTLY refresh)
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_low_stock_id ON mv_low_stock_products(id);

-- AUTOMATION TRIGGERS

-- A. Trigger: Auto-Deduct Stock on Sale
CREATE OR REPLACE FUNCTION fn_process_sale_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Deduct from Product Inventory
    UPDATE products
    SET stock_quantity = stock_quantity - NEW.quantity,
        updated_at = NOW()
    WHERE product_id = NEW.product_id;

    -- 2. Add entry to Stock Ledger
    INSERT INTO stock_movements (product_id, user_id, movement_type, quantity, notes, created_at, updated_at)
    VALUES (NEW.product_id, NEW.user_id, 'SALE', -NEW.quantity, 'Sale ID: ' || NEW.sale_id || ' - ' || NEW.product_name, NOW(), NOW());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sale_stock
AFTER INSERT ON sales
FOR EACH ROW
WHEN (NEW.payment_status = 'PAID') -- Only deduct stock for paid sales
EXECUTE FUNCTION fn_process_sale_stock();

-- C. Trigger: Auto-Restore Stock on Refund
CREATE OR REPLACE FUNCTION fn_process_sale_refund()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process if payment_status changed to 'REFUNDED' and was previously 'PAID'
    IF (NEW.payment_status = 'REFUNDED' AND OLD.payment_status = 'PAID') THEN
        -- 1. Restore stock to Product Inventory
        UPDATE products
        SET stock_quantity = stock_quantity + NEW.quantity,
            updated_at = NOW()
        WHERE product_id = NEW.product_id;

        -- 2. Add entry to Stock Ledger for refund
        INSERT INTO stock_movements (product_id, user_id, movement_type, quantity, notes, created_at, updated_at)
        VALUES (NEW.product_id, NEW.user_id, 'RETURN', NEW.quantity, 'Refund for Sale ID: ' || NEW.sale_id, NOW(), NOW());
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sale_refund
AFTER UPDATE OF payment_status ON sales
FOR EACH ROW
EXECUTE FUNCTION fn_process_sale_refund();

-- B. Trigger: Placeholder for Purchase Items Insert
-- Note: Stock is NO LONGER added here to prevent double addition
-- Stock is only added when purchase status changes to RECEIVED (see trg_purchase_status_received)
CREATE OR REPLACE FUNCTION fn_process_purchase_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Stock is now only added when purchase status changes to RECEIVED
    -- This trigger no longer adds stock to prevent double addition
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- B.2. Trigger: Process Stock When Purchase Status Changes to RECEIVED
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

            INSERT INTO stock_movements (product_id, user_id, movement_type, quantity, notes, created_at, updated_at)
            VALUES (purchase_item.product_id, NEW.user_id, 'PURCHASE', purchase_item.quantity, 'Stock In Purchase ID: ' || NEW.purchase_id, NOW(), NOW());
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_purchase_stock
AFTER INSERT ON purchase_items
FOR EACH ROW
EXECUTE FUNCTION fn_process_purchase_stock();

CREATE TRIGGER trg_purchase_status_received
AFTER UPDATE OF status ON purchases
FOR EACH ROW
EXECUTE FUNCTION fn_process_purchase_status_received();

-- B.3. Trigger: Process Stock When Purchase Item is Deleted
CREATE OR REPLACE FUNCTION fn_process_purchase_item_delete()
RETURNS TRIGGER AS $$
DECLARE
    purchase_status VARCHAR(8);
    purchase_user_id INT;
BEGIN
    -- Get purchase status and user_id
    SELECT status, user_id INTO purchase_status, purchase_user_id
    FROM purchases
    WHERE purchase_id = OLD.purchase_id;

    -- Only process stock if purchase was RECEIVED (stock was added)
    IF purchase_status = 'RECEIVED' THEN
        -- 1. Subtract from Product Inventory (reverse the purchase)
        UPDATE products
        SET stock_quantity = stock_quantity - OLD.quantity
        WHERE product_id = OLD.product_id;

        -- 2. Add entry to Stock Ledger for deletion
        INSERT INTO stock_movements (product_id, user_id, movement_type, quantity, notes, created_at, updated_at)
        VALUES (OLD.product_id, purchase_user_id, 'CORRECTION', -OLD.quantity, 'Deleted Purchase Item ID: ' || OLD.item_id || ' (Purchase ID: ' || OLD.purchase_id || ')', NOW(), NOW());
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_purchase_item_delete
AFTER DELETE ON purchase_items
FOR EACH ROW
EXECUTE FUNCTION fn_process_purchase_item_delete();

-- B.4. Trigger: Process Stock When Purchase is Soft-Deleted (isActive = false)
CREATE OR REPLACE FUNCTION fn_process_purchase_soft_delete()
RETURNS TRIGGER AS $$
DECLARE
    purchase_item RECORD;
BEGIN
    -- Only process when isActive changes to false
    IF NEW.is_active = FALSE AND OLD.is_active = TRUE THEN
        -- Only reverse stock if purchase was RECEIVED
        IF NEW.status = 'RECEIVED' THEN
            -- Process all purchase items for this purchase
            FOR purchase_item IN
                SELECT product_id, quantity, item_id
                FROM purchase_items
                WHERE purchase_id = NEW.purchase_id
                AND is_active = TRUE
            LOOP
                -- 1. Subtract from Product Inventory (reverse the purchase)
                UPDATE products
                SET stock_quantity = stock_quantity - purchase_item.quantity
                WHERE product_id = purchase_item.product_id;

                -- 2. Add entry to Stock Ledger for soft-delete
                INSERT INTO stock_movements (product_id, user_id, movement_type, quantity, notes, created_at, updated_at)
                VALUES (purchase_item.product_id, NEW.user_id, 'CORRECTION', -purchase_item.quantity, 'Soft-Deleted Purchase ID: ' || NEW.purchase_id || ' (Item ID: ' || purchase_item.item_id || ')', NOW(), NOW());
            END LOOP;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_purchase_soft_delete
AFTER UPDATE OF is_active ON purchases
FOR EACH ROW
EXECUTE FUNCTION fn_process_purchase_soft_delete();

-- ============================================
-- AUTO-REFRESH TRIGGERS FOR MATERIALIZED VIEWS
-- Automatically refresh dashboard materialized views when data changes
-- ============================================

-- Function to refresh dashboard summary materialized views (for triggers)
CREATE OR REPLACE FUNCTION trigger_refresh_dashboard_summary()
RETURNS TRIGGER AS $$
BEGIN
    -- Refresh dashboard summary (only the critical one)
    -- Using CONCURRENTLY to avoid locking
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_low_stock_products;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh all materialized views (manual call)
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_sales_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_yearly_sales_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_expenses;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_low_stock_products;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-refresh on sales changes
CREATE TRIGGER trg_refresh_dashboard_sales
AFTER INSERT OR UPDATE OR DELETE ON sales
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_dashboard_summary();

-- Triggers to auto-refresh on expenses changes
CREATE TRIGGER trg_refresh_dashboard_expenses
AFTER INSERT OR UPDATE OR DELETE ON expenses
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_dashboard_summary();

-- Triggers to auto-refresh on products changes
CREATE TRIGGER trg_refresh_dashboard_products
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_dashboard_summary();

-- Insert default data
INSERT INTO roles (role_name) VALUES
('admin'),
('manager'),
('cashier');

-- Create a default admin user (password: admin123 - should be changed in production)
INSERT INTO users (username, password_hash, full_name, role_id, is_active) VALUES
('admin', '7fcf4ba391c48784edde599889d6e3f1e47a27db36ecc050cc92f259bfac38afad2c68a1ae804d77075e8fb722503f3eca2b2c1006ee6f6c7b7628cb45fffd1d', 'System Administrator', 1, true);

-- -- Insert default categories
-- INSERT INTO categories (category_name, description) VALUES
-- ('အချိုရည်များ', ''),
-- ('စားသောက်ကုန်ပစ္စည်းများ', ''),
-- ('အိမ်သုံးပစ္စည်းများ', ''),
-- ('လျှပ်စစ်ပစ္စည်းများ',''),
-- ('ကိုယ်ရေးကိုယ်တာသုံးပစ္စည်းများ',''),
-- ('ထမင်းအသုပ်များ',''),
-- ('စာရေးကိရိယာပစ္စည်းများ','');

-- Insert default unit types
INSERT INTO unit_types (unit_code, unit_name, is_weighted) VALUES
('PCS', 'အရေအတွက်', FALSE),
('KG', 'ကီလိုဂရမ်', TRUE),
('G', 'ဂရမ်', TRUE),
('L', 'လီတာ', FALSE),
('ML', 'မီလီလီတာ', FALSE),
('M', 'မီတာ', FALSE),
('CM', 'စင်တီမီတာ', FALSE),
('BOX', 'ဘူး', FALSE),
('PACK', 'အထုပ်', FALSE),
('BOTTLE', 'ဘူးကြီး', FALSE),
('CAN', 'အမှုန့်', FALSE),
('BAG', 'အိတ်', FALSE);

-- -- Insert sample suppliers
-- INSERT INTO suppliers (company_name, contact_name, phone_number, address) VALUES
-- ('မြန်မာ့စီးပွားရေးကုမ္ပဏီ', 'ဦးအောင်မြင့်', '09-123456789', 'မန္တလေးမြို့၊ ချမ်းအေးသာဇံ'),
-- ('စက်မှုလက်မှုထုတ်ကုန်များ', 'ဒေါ်နန်းနွယ်ဝင်း', '09-987654321', 'ရန်ကုန်မြို့၊ လမ်းမတော်'),
-- ('အစားအသောက်ဖြန့်ချီရေး', 'ဦးကျော်ဇော', '09-456789012', 'နေပြည်တော်မြို့'),
-- ('လျှပ်စစ်ပစ္စည်းကုမ္ပဏီ', 'ဦးမင်းထွန်း', '09-789012345', 'မန္တလေးမြို့၊ အောင်မြေသာစံ'),
-- ('ဆေးဝါးနှင့်ကျန်းမာရေး', 'ဒေါက်တာခင်ခင်မြ', '09-234567890', 'ရန်ကုန်မြို့၊ ဗိုလ်တထောင်'),
-- ('စားသောက်ကုန်ပစ္စည်းများ', 'ဦးဇော်ဝင်း', '09-345678901', 'ရန်ကုန်မြို့၊ သင်္ဃန်းကျွန်း'),
-- ('အိမ်သုံးပစ္စည်းအရောင်း', 'ဒေါ်မြမြစိန်', '09-567890123', 'မန္တလေးမြို့၊ ပြည်ကြီးမဏေ'),
-- ('ကုန်းလမ်းပို့ဆောင်ရေး', 'ဦးထွန်းထွန်း', '09-678901234', 'ရန်ကုန်မြို့၊ လှည်းတန်း'),
-- ('ရွှေစည်သာထုတ်လုပ်ရေး', 'ဦးစိန်စိန်', '09-890123456', 'မန္တလေးမြို့၊ ဇော်ဂျီ');

-- Insert default expense categories (Myanmar language)
INSERT INTO expense_categories (category_name) VALUES
('အိမ်ခြံ'),                    -- Rent
('လျှပ်စစ်မီတာ'),             -- Electricity
('ရေဘေး'),                     -- Water
('ဝန်ထမ်းလစာ'),               -- Staff Salary
('ပစ္စည်းကုန်ကျွန်း'),          -- Supplies
('ပို့ဆောင်ရေး'),               -- Transportation
('ဆောက်လုပ်ရေးပစ္စည်းများ'),     -- Construction Materials
('ပြုပြင်ထိန်းသိမ်းမှု'),        -- Maintenance
('ကြော်ငြာပြဿနာ'),             -- Advertising
('ဆက်သွယ်ရေးကုန်ကျစရိတ်'),       -- Communication Expenses
('အခွန်ကုန်ကျစရိတ်'),           -- Tax Expenses
('ဘဏ်ဝန်ဆောင်မှုကုန်ကျစရိတ်'),     -- Bank Service Charges
('အခြားကုန်ကျစရိတ်များ');        -- Other Expenses