--- Migration: Remove Refund Trigger
--- Description: Remove the refund trigger as stock restoration is now handled in the service layer
--- Date: 2026-03-31

--- Drop the refund trigger
DROP TRIGGER IF EXISTS trg_sale_refund ON sales;

--- Drop the refund function
DROP FUNCTION IF EXISTS fn_process_sale_refund();

--- Verify trigger removal
SELECT
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trg_sale_refund';
