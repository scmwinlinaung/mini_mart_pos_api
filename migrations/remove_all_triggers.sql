--- Migration: Remove All Triggers
--- Description: Remove all database triggers as logic has been moved to service layer
--- Date: 2026-03-31

--- Drop Sale Triggers
DROP TRIGGER IF EXISTS trg_sale_stock ON sales;
DROP FUNCTION IF EXISTS fn_process_sale_stock CASCADE;

--- Drop Purchase Triggers
DROP TRIGGER IF EXISTS trg_purchase_stock ON purchase_items;
DROP TRIGGER IF EXISTS trg_purchase_status_received ON purchases;
DROP TRIGGER IF EXISTS trg_purchase_item_delete ON purchase_items;
DROP TRIGGER IF EXISTS trg_purchase_soft_delete ON purchases;

--- Drop Purchase Functions
DROP FUNCTION IF EXISTS fn_process_purchase_stock CASCADE;
DROP FUNCTION IF EXISTS fn_process_purchase_status_received CASCADE;
DROP FUNCTION IF EXISTS fn_process_purchase_item_delete CASCADE;
DROP FUNCTION IF EXISTS fn_process_purchase_soft_delete CASCADE;

--- Drop Dashboard Refresh Triggers
DROP TRIGGER IF EXISTS trg_refresh_dashboard_sales ON sales;
DROP TRIGGER IF EXISTS trg_refresh_dashboard_expenses ON expenses;
DROP TRIGGER IF EXISTS trg_refresh_dashboard_products ON products;

--- Drop Dashboard Refresh Function
DROP FUNCTION IF EXISTS trigger_refresh_dashboard_summary CASCADE;

--- Verify all triggers have been removed
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name IN (
    'trg_sale_stock',
    'trg_purchase_stock',
    'trg_purchase_status_received',
    'trg_purchase_item_delete',
    'trg_purchase_soft_delete',
    'trg_refresh_dashboard_sales',
    'trg_refresh_dashboard_expenses',
    'trg_refresh_dashboard_products'
);

--- Expected result: 0 rows (all triggers removed)
