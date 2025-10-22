-- Pharmacy Management System Database Schema
-- Run this script in your Supabase SQL editor

-- Create suppliers table
CREATE TABLE IF NOT EXISTS public.suppliers (
  id serial NOT NULL,
  name text NOT NULL,
  contact text NULL,
  address text NULL,
  phone text NULL,
  created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT suppliers_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id serial NOT NULL,
  name text NOT NULL,
  code text NOT NULL,
  price_buy numeric(10, 2) NOT NULL,
  price_sell numeric(10, 2) NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  category text NULL,
  supplier_id integer NULL,
  created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_code_key UNIQUE (code),
  CONSTRAINT fk_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (id) ON DELETE SET NULL,
  CONSTRAINT products_stock_check CHECK ((stock >= 0))
) TABLESPACE pg_default;

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id serial NOT NULL,
  supplier_id integer NOT NULL,
  total_amount numeric(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_by uuid NOT NULL,
  created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT purchase_orders_pkey PRIMARY KEY (id),
  CONSTRAINT purchase_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users (id),
  CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES suppliers (id) ON DELETE CASCADE,
  CONSTRAINT purchase_orders_status_check CHECK (
    (
      status = ANY (
        ARRAY[
          'pending'::text,
          'approved'::text,
          'completed'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

-- Create purchase_order_items table
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id serial NOT NULL,
  purchase_order_id integer NOT NULL,
  product_id integer NOT NULL,
  quantity integer NOT NULL,
  price_buy numeric(10, 2) NOT NULL,
  total numeric(10, 2) NOT NULL,
  CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id),
  CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (id) ON DELETE CASCADE,
  CONSTRAINT purchase_order_items_price_check CHECK ((price_buy >= (0)::numeric)),
  CONSTRAINT purchase_order_items_quantity_check CHECK ((quantity > 0))
) TABLESPACE pg_default;

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
) TABLESPACE pg_default;

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
    (
      action_type = ANY (
        ARRAY['insert'::text, 'update'::text, 'delete'::text]
      )
    )
  )
) TABLESPACE pg_default;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products (supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders (supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_by ON purchase_orders (created_by);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_purchase_order_id ON purchase_order_items (purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_product_id ON stock_logs (product_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_user_id ON stock_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id);

-- Function to handle purchase order received status
CREATE OR REPLACE FUNCTION handle_purchase_order_received()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'received' AND OLD.status != 'received' THEN
    INSERT INTO stock_logs (product_id, quantity, type, user_id, reason, price_buy)
    SELECT
      poi.product_id,
      poi.quantity,
      'in',
      auth.uid(), -- Gunakan auth.uid() untuk ID pengguna
      'Received from purchase order ' || NEW.id,
      poi.price_buy
    FROM purchase_order_items poi
    WHERE poi.purchase_order_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for purchase order status update
DROP TRIGGER IF EXISTS purchase_order_status_update ON purchase_orders;
CREATE TRIGGER purchase_order_status_update
AFTER UPDATE ON purchase_orders
FOR EACH ROW
EXECUTE FUNCTION handle_purchase_order_received();

-- Function to update product stock
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'in' THEN
    -- Validasi bahwa price_buy tidak null untuk stok masuk
    IF NEW.price_buy IS NULL THEN
      RAISE EXCEPTION 'price_buy cannot be null for stock_logs type "in"';
    END IF;
    -- Tambah stok
    UPDATE products
    SET stock = stock + NEW.quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.product_id;
  ELSIF NEW.type = 'out' THEN
    -- Kurangi stok
    UPDATE products
    SET stock = stock - NEW.quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.product_id;
    -- Validasi stok tidak boleh negatif
    IF (SELECT stock FROM products WHERE id = NEW.product_id) < 0 THEN
      RAISE EXCEPTION 'Stock cannot be negative for product_id %', NEW.product_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for stock log updates
DROP TRIGGER IF EXISTS stock_log_update ON stock_logs;
CREATE TRIGGER stock_log_update
AFTER INSERT ON stock_logs
FOR EACH ROW
EXECUTE FUNCTION update_product_stock();

-- Function to update purchase order total when items are added/modified
CREATE OR REPLACE FUNCTION update_purchase_order_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE purchase_orders
  SET total_amount = (
    SELECT COALESCE(SUM(total), 0)
    FROM purchase_order_items
    WHERE purchase_order_id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id)
  ),
  updated_at = CURRENT_TIMESTAMP
  WHERE id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for purchase order total updates
DROP TRIGGER IF EXISTS purchase_order_items_update_total ON purchase_order_items;
CREATE TRIGGER purchase_order_items_update_total
AFTER INSERT OR UPDATE OR DELETE ON purchase_order_items
FOR EACH ROW
EXECUTE FUNCTION update_purchase_order_total();

-- Function to log purchase order changes (audit)
CREATE OR REPLACE FUNCTION log_purchase_order_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action_type, table_name, record_id, details)
    VALUES (auth.uid(), 'insert', 'purchase_orders', NEW.id,
            jsonb_build_object('supplier_id', NEW.supplier_id, 'total_amount', NEW.total_amount, 'status', NEW.status));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action_type, table_name, record_id, details)
    VALUES (auth.uid(), 'update', 'purchase_orders', NEW.id,
            jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status, 'old_amount', OLD.total_amount, 'new_amount', NEW.total_amount));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, action_type, table_name, record_id, details)
    VALUES (auth.uid(), 'delete', 'purchase_orders', OLD.id,
            jsonb_build_object('supplier_id', OLD.supplier_id, 'total_amount', OLD.total_amount, 'status', OLD.status));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for purchase order audit logging
DROP TRIGGER IF EXISTS purchase_order_audit_trigger ON purchase_orders;
CREATE TRIGGER purchase_order_audit_trigger
AFTER INSERT OR DELETE OR UPDATE ON purchase_orders
FOR EACH ROW
EXECUTE FUNCTION log_purchase_order_changes();

-- Enable Row Level Security (RLS)
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your authentication requirements)
CREATE POLICY "Allow all operations for authenticated users on suppliers" ON suppliers
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users on products" ON products
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users on purchase_orders" ON purchase_orders
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users on purchase_order_items" ON purchase_order_items
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users on stock_logs" ON stock_logs
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users on audit_logs" ON audit_logs
FOR ALL USING (auth.role() = 'authenticated');
