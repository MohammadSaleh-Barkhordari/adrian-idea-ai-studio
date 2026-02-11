
ALTER TABLE letters ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES customers(id);
ALTER TABLE letters ADD COLUMN IF NOT EXISTS customer_contact_id uuid REFERENCES customer_contacts(id);
