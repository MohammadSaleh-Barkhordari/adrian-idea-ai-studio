

# Drop `created_by` from Tasks + Add Cancellation Tracking — COMPLETED

All changes from this plan have been implemented:
- ✅ Dropped `created_by` column from tasks table
- ✅ Added `canceled_by` (uuid) and `canceled_at` (timestamptz) columns
- ✅ Removed `created_by` references from DashboardPage, GanttChart, ProjectDetailsPage
- ✅ Added cancellation auto-set logic in TaskEditDialog and NewTaskDialog (both admin and non-admin paths)
