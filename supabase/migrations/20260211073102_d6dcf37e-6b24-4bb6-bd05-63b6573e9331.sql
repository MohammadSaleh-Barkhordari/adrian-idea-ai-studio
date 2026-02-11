
ALTER TABLE adrian_projects 
  ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES customers(id);

ALTER TABLE adrian_projects 
  ADD COLUMN IF NOT EXISTS client_contact_id uuid REFERENCES customer_contacts(id);

CREATE INDEX IF NOT EXISTS idx_adrian_projects_customer ON adrian_projects(customer_id);
