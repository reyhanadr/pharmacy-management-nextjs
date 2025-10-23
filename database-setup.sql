-- Pharmacy Management System - Database Setup for Audit Logs
-- Run this SQL in your Supabase database

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id serial NOT NULL,
  user_id uuid NULL,
  action_type text NOT NULL,
  table_name text NOT NULL,
  record_id integer NULL,
  details jsonb NOT NULL,
  created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id),
  CONSTRAINT audit_logs_action_type_check CHECK (
    (action_type = ANY (ARRAY['insert'::text, 'update'::text, 'delete'::text]))
  )
);

-- Create stock_logs table
CREATE TABLE IF NOT EXISTS public.stock_logs (
  id serial NOT NULL,
  product_id integer NOT NULL,
  quantity integer NOT NULL,
  type text NOT NULL,
  date timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  user_id uuid NOT NULL,
  reason text NULL,
  price_buy numeric(10, 2) NULL,
  CONSTRAINT stock_logs_pkey PRIMARY KEY (id),
  CONSTRAINT stock_logs_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT stock_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id),
  CONSTRAINT stock_logs_type_check CHECK ((type = ANY (ARRAY['in'::text, 'out'::text])))
);

-- Create function to update product stock
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'in' THEN
    UPDATE products
    SET stock = stock + NEW.quantity
    WHERE id = NEW.product_id;
  ELSIF NEW.type = 'out' THEN
    UPDATE products
    SET stock = GREATEST(0, stock - NEW.quantity)
    WHERE id = NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for stock updates
DROP TRIGGER IF EXISTS stock_log_update ON stock_logs;
CREATE TRIGGER stock_log_update
AFTER INSERT ON stock_logs
FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- Create function to log audit trail
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
DECLARE
  details_json jsonb;
BEGIN
  -- Build details JSON based on operation type
  IF TG_OP = 'INSERT' THEN
    details_json := to_jsonb(NEW);
    INSERT INTO audit_logs (user_id, action_type, table_name, record_id, details)
    VALUES (auth.uid(), 'insert', TG_TABLE_NAME, NEW.id, details_json);
  ELSIF TG_OP = 'UPDATE' THEN
    details_json := jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    );
    INSERT INTO audit_logs (user_id, action_type, table_name, record_id, details)
    VALUES (auth.uid(), 'update', TG_TABLE_NAME, NEW.id, details_json);
  ELSIF TG_OP = 'DELETE' THEN
    details_json := to_jsonb(OLD);
    INSERT INTO audit_logs (user_id, action_type, table_name, record_id, details)
    VALUES (auth.uid(), 'delete', TG_TABLE_NAME, OLD.id, details_json);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for important tables
DROP TRIGGER IF EXISTS audit_products ON products;
CREATE TRIGGER audit_products
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

DROP TRIGGER IF EXISTS audit_transactions ON transactions;
CREATE TRIGGER audit_transactions
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- Create function to log stock changes from transactions
CREATE OR REPLACE FUNCTION log_stock_from_transaction()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
BEGIN
  IF NEW.status = 'completed' THEN
    -- Loop through each item in the transaction
    FOR item IN SELECT * FROM jsonb_to_recordset(NEW.items) AS x(
      product_id int,
      quantity int,
      product_name text,
      product_code text,
      price_sell numeric,
      total numeric
    )
    LOOP
      -- Only create stock log if quantity is valid
      IF item.quantity IS NOT NULL AND item.quantity > 0 THEN
        INSERT INTO stock_logs (product_id, quantity, type, user_id, reason)
        VALUES (
          item.product_id,
          item.quantity,
          'out',
          NEW.user_id,
          'Sale - Transaction #' || NEW.id
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for transaction stock logging
DROP TRIGGER IF EXISTS transaction_stock_logging ON transactions;
CREATE TRIGGER transaction_stock_logging
AFTER INSERT ON transactions
FOR EACH ROW EXECUTE FUNCTION log_stock_from_transaction();

-- Enable Row Level Security (RLS) for audit tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your user roles)
CREATE POLICY "Users can view audit logs" ON audit_logs
FOR SELECT USING (true);

CREATE POLICY "Users can view stock logs" ON stock_logs
FOR SELECT USING (true);

-- Grant necessary permissions
GRANT SELECT ON audit_logs TO authenticated;
GRANT SELECT ON stock_logs TO authenticated;
GRANT USAGE ON SEQUENCE audit_logs_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE stock_logs_id_seq TO authenticated;

-- Insert some sample data for testing (optional)
-- INSERT INTO products (name, code, price_sell, stock) VALUES
-- ('Paracetamol 500mg', 'PARA001', 5000, 100),
-- ('Amoxicillin 500mg', 'AMOX002', 20000, 50);

COMMENT ON TABLE audit_logs IS 'Audit trail for all data changes in the system';
COMMENT ON TABLE stock_logs IS 'Stock movement logs for inventory tracking';
