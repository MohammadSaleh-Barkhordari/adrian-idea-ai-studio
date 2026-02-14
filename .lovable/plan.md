

# Remove Redundant "Outcome" Field

## Rationale

The `outcome` text field and `outcome_notes` textarea serve the same purpose. Now that `outcome_notes` is a large textarea (rows=5) with voice recorder support, the separate `outcome` field is unnecessary clutter.

## Changes

### 1. Database Migration

Drop the `outcome` column from the tasks table:

```sql
ALTER TABLE tasks DROP COLUMN IF EXISTS outcome;
```

### 2. Code Cleanup (2 files)

**`src/components/TaskEditDialog.tsx`**:
- Remove `outcome` from `formData` state
- Remove `userOutcome` state variable
- Remove `outcome: formData.outcome` / `outcome: userOutcome` from update data
- Remove the outcome text input UI section (label + textarea with paperclip icon)
- Keep outcome_notes, outcome voice recorder, and outcome file upload as-is

**`src/components/NewTaskDialog.tsx`**:
- Remove `outcome` from `formData` state
- Remove `outcome: formData.outcome` from insert data
- Remove the outcome text input UI section
- Keep outcome_notes, outcome voice recorder, and outcome file upload

### 3. Update Types

The `src/integrations/supabase/types.ts` file will auto-update after the migration removes the column.

## Result

The form simplifies to: Outcome Notes (textarea) + Voice Recorder Box + File Upload -- no more duplicate text fields for outcomes.

