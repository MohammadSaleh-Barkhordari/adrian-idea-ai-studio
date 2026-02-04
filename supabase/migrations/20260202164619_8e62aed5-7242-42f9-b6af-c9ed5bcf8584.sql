-- Make file_path nullable since CSV doesn't have this column
ALTER TABLE documents ALTER COLUMN file_path DROP NOT NULL;
ALTER TABLE documents ALTER COLUMN file_name DROP NOT NULL;