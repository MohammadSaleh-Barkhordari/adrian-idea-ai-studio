

# Add has_attachment Column to Emails Table

## Change

Add a `has_attachment` boolean column to the `emails` table, defaulting to `false`.

## Database Migration

```sql
ALTER TABLE public.emails ADD COLUMN has_attachment boolean NOT NULL DEFAULT false;
```

## Code Updates

1. **`src/components/email/EmailCompose.tsx`** -- When sending an email with attachments, set `has_attachment: true` in the insert.

2. **`src/components/email/EmailQuickAdd.tsx`** -- No change needed (quick-add doesn't support attachments, so the default `false` is correct).

3. **`src/components/email/EmailList.tsx`** -- Add `has_attachment` to the select query and show a paperclip icon next to emails that have attachments.

4. **`supabase/functions/receive-email/index.ts`** -- When inserting inbound emails, set `has_attachment: true` if the email has attachments.

The types file will auto-update after the migration.

