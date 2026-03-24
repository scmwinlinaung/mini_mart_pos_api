-- Migration: Add Refund Trigger
-- Description: Automatically restore stock and create stock movement when a sale is refunded
-- Date: 2025-03-24

-- Trigger Function: Auto-Restore Stock on Refund
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

-- Drop trigger if exists (for re-running this migration)
DROP TRIGGER IF EXISTS trg_sale_refund ON sales;

-- Create the trigger
CREATE TRIGGER trg_sale_refund
AFTER UPDATE OF payment_status ON sales
FOR EACH ROW
EXECUTE FUNCTION fn_process_sale_refund();

-- Verify trigger creation
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trg_sale_refund';
