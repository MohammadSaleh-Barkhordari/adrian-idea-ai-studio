# Export all database tables as one ZIP

Package every table in the app's database into CSV files and bundle them into a single downloadable ZIP.

## What you get

- One ZIP file containing one CSV per table (34 tables: projects, tasks, requests, customers, contacts, interactions, letters, emails, employees, HR data, documents, files, financial records, blog content, Our Life tables, subscriptions, roles, profiles, notification/push settings, join tables).
- Each CSV includes a header row with column names, UTF-8 encoded so Persian text stays readable.
- A `README.txt` inside the ZIP listing each table and its row count, plus the export timestamp.

## Notes

- This exports table data only — not uploaded files in storage (documents, letters, images) and not the database structure/permissions. For a complete backup including schema, use Cloud → Advanced settings → Export data.
- Sensitive tables (employee salaries, bank details, national IDs, login emails) are included since you asked for all tables. Say the word if you want those excluded.
- No changes are made to the app or the database; this is read-only.

## Technical steps

1. Enumerate all base tables in the `public` schema.
2. For each table, run `COPY (SELECT * FROM ...) TO STDOUT WITH CSV HEADER` into `/tmp/db-export/<table>.csv`.
3. Generate `README.txt` with row counts and timestamp.
4. Zip the folder to `/mnt/documents/database-export-<date>.zip` and surface it as a downloadable artifact.
5. Verify the ZIP listing and spot-check a couple of CSVs for correct headers and encoding.
