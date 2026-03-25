-- Migration: Add new stock movement types
-- Description: Extends stock_movements table to support damage, expired, theft, loss, and return types

-- Drop the old CHECK constraint
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_movement_type_check;

-- Add new CHECK constraint with expanded movement types
ALTER TABLE stock_movements
ADD CONSTRAINT stock_movements_movement_type_check
CHECK (movement_type IN (
    'SALE',           -- Stock out: Sale to customer
    'PURCHASE',       -- Stock in: Purchase from supplier
    'RETURN',         -- Stock in: Customer return
    'RETURN_IN',      -- Stock in: Customer return (more explicit)
    'RETURN_OUT',     -- Stock out: Return to supplier
    'DAMAGE',         -- Stock out: Damaged goods
    'EXPIRED',        -- Stock out: Expired goods
    'THEFT',          -- Stock out: Stolen goods
    'LOSS',           -- Stock out: General loss/shrinkage
    'CORRECTION'      -- Stock adjustment: Manual recount correction (±)
));

COMMENT ON COLUMN stock_movements.movement_type IS 'Type of stock movement: SALE, PURCHASE, RETURN, RETURN_IN, RETURN_OUT, DAMAGE, EXPIRED, THEFT, LOSS, CORRECTION';
COMMENT ON COLUMN stock_movements.quantity IS 'Quantity change: Positive for stock in, Negative for stock out';
