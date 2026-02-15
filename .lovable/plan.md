
# Full Mobile and Tablet Responsive Pass (Extended)

This plan covers the original audit findings plus all 10 additional areas identified. Changes are CSS/layout only -- no functionality changes.

## Priority 1: Navigation + Dashboard

### DashboardPage.tsx
- Request tables (lines 905+): Add `min-w-[700px]` to `<Table>` elements inside the existing `overflow-x-auto` wrappers (same pattern used for task tables)

### Navigation.tsx
- Already responsive with hamburger menu -- no changes needed

---

## Priority 2: Project Detail + Task Dialogs

### ProjectDetailsPage.tsx
- Main container: Add `sm:px-6` alongside existing `px-4`
- Project overview header (line 461): Add `flex-wrap` to the badges + Edit button row so they wrap on mobile instead of overflowing
- Task card badge rows (line 580): Add `flex-wrap` to the `flex items-center gap-2` container
- Letter section items (line 684): Stack subject/badges/date/download button vertically on mobile using `flex-col sm:flex-row`

### TaskDetailOutcomeDialog.tsx (NEW -- item #1)
- DialogContent (line 283): Change `sm:max-w-[550px]` to `w-[95vw] sm:max-w-[550px]`
- People grid (line 316): Change `grid-cols-2` to `grid-cols-1 sm:grid-cols-2`
- Dates grid (line 336): Change `grid-cols-2` to `grid-cols-1 sm:grid-cols-2`
- Predecessor/Successor grid (line 379): Change `grid-cols-2` to `grid-cols-1 sm:grid-cols-2`
- Ensure `ScrollArea` with `h-[60vh]` works on touch (add `-webkit-overflow-scrolling: touch` if needed via Tailwind class)
- Read-only text: Add `break-words` to prevent long text overflow on narrow screens

### TaskEditDialog.tsx
- DialogContent (line 413): Change `sm:max-w-[500px]` to `w-[95vw] sm:max-w-[500px]`
- The form fields already use single-column layout -- verify no overflow issues

### TaskVoiceRecorderBox.tsx (NEW -- item #2)
- Record button: Add `min-h-[44px] min-w-[44px]` for touch target compliance
- Container: Add `w-full` to ensure full-width on mobile
- Permission denial: The component already has a try/catch with toast notification for permission errors -- this is sufficient for mobile browsers

### NewTaskDialog.tsx
- Verify dialog width is mobile-friendly (uses default `max-w-lg` from DialogContent which is already responsive with `w-[calc(100%-2rem)]`)

---

## Priority 3: Customer Management

### CustomerManagementPage.tsx
- Main container: Change `px-6` to `px-4 sm:px-6`
- Header (line 252): Change `flex items-center justify-between` to `flex flex-col sm:flex-row sm:items-center justify-between gap-4`
- Stats cards (line 266): Change `grid-cols-1 md:grid-cols-4` to `grid-cols-1 sm:grid-cols-2 md:grid-cols-4`
- Customer table: Add `min-w-[800px]` to the Table element
- CustomerForm dialog (line 456): Change `max-w-2xl` to `w-[95vw] sm:max-w-2xl`

### CustomerForm.tsx (NEW -- item #3)
- All `grid grid-cols-2 gap-4` rows: Change to `grid grid-cols-1 sm:grid-cols-2 gap-4`
- All `grid grid-cols-3 gap-4` rows: Change to `grid grid-cols-1 sm:grid-cols-3 gap-4`
- Logo file input and brand color picker already use native inputs -- work on mobile by default
- Tags input uses a standard `<Input>` -- works with mobile keyboard

### CustomerDetailPage.tsx
- Quick stats (line 217): Change `grid-cols-3` to `grid-cols-1 sm:grid-cols-3`
- Contact form dialog: Ensure dialog uses `w-[95vw] sm:max-w-lg` pattern
- Interaction form dialog: Same mobile-friendly width

### CustomerContactForm.tsx (NEW -- item #4)
- Names EN grid (line 209): Change `grid grid-cols-2` to `grid grid-cols-1 sm:grid-cols-2`
- Names FA grid (line 215): Same change
- Gender/Title grid (line 221): Same change
- Job Title FA grid (line 254): Same change
- Job/Dept grid (line 259): Same change
- Contact info grid (line 265): Change `grid grid-cols-3` to `grid grid-cols-1 sm:grid-cols-3`
- Toggles row (line 288): Change `flex items-center gap-6` to `flex flex-col sm:flex-row sm:items-center gap-4`

### CustomerInteractionForm.tsx (NEW -- item #4)
- Dates grid (line 102): Change `grid grid-cols-2` to `grid grid-cols-1 sm:grid-cols-2`

---

## Priority 4: Writing a Letter + Email

### WritingLetterPage.tsx
- Main container: Change `px-6` to `px-4 sm:px-6`

### LetterBuilder.tsx (NEW -- item #6)
- Already has a mobile notice message (line 494): `md:hidden` hint about desktop usage -- this is good
- Canvas wrapper (line 499): The `overflow-auto` already enables horizontal scroll on mobile
- No changes needed beyond what already exists -- the scroll + notice approach is the correct pattern since drag is desktop-only and the 794x1123 canvas cannot be meaningfully resized

### EmailPage.tsx
- Already uses `useIsMobile()` with dedicated mobile layout -- no changes needed

---

## Priority 5: HR, Financial, Blog, Requests

### HRManagementPage.tsx
- Main container: Change `px-6` to `px-4 sm:px-6` (search for the container div)
- Header (line 315): Change `flex items-center justify-between` to `flex flex-col sm:flex-row sm:items-center justify-between gap-4`
- Admin buttons (line 326): Change `flex items-center gap-4` to `flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4`
- Stats cards (line 344): Change `grid-cols-1 md:grid-cols-4` to `grid-cols-1 sm:grid-cols-2 md:grid-cols-4`
- Employee Form Dialog (line 659): Change `max-w-4xl` to `w-[95vw] sm:max-w-4xl`

### EmployeeForm.tsx (NEW -- item #5)
- Tab navigation (line 353): Change `grid-cols-5` on TabsList to use `flex overflow-x-auto` so tabs scroll horizontally on mobile instead of being squeezed
- All `grid grid-cols-2 gap-4` inside Personal, Employment, Banking tabs: Change to `grid grid-cols-1 sm:grid-cols-2 gap-4`
- All `grid grid-cols-3 gap-4`: Change to `grid grid-cols-1 sm:grid-cols-3 gap-4`
- Document upload zones and photo capture use native file inputs -- already work on mobile
- Camera capture works via `accept="image/*"` which triggers camera on mobile

### FinancialAnalysisPage.tsx
- Main container: Change `px-6` to `px-4 sm:px-6`

### BlogDashboardPage.tsx
- Audit for any `px-6` containers and add `px-4 sm:px-6`
- Verify table has `overflow-x-auto`

### CreateRequestPage.tsx
- Audit for any `px-6` containers and add `px-4 sm:px-6`

---

## Priority 6: Gantt Chart (item #7)

### GanttChart.tsx
- The leftMargin=220 is fixed and SVG-based -- changing it would require recalculating text layout
- The chart already has `overflow-x-auto` wrapper
- Add a small "Rotate device for better view" hint on mobile (`md:hidden`) when screen is portrait
- This is the pragmatic approach since reducing leftMargin would truncate task names

---

## Priority 7: Project Dialogs (item #8)

### NewProjectDialog.tsx
- Verify DialogContent width -- uses default `max-w-lg` which is already mobile-responsive via the base dialog component
- Form fields inside use react-hook-form with single-column layout -- should be fine
- Budget input: uses `type="number"` which triggers mobile number keyboard

### ProjectEditDialog.tsx
- Verify same mobile-friendly dialog width
- Customer/contact Select dropdowns: use Radix Select which renders in a portal with z-50 -- should work in dialogs

---

## Priority 8: Date Pickers (item #9)

### Calendar/Popover components
- The base `dialog.tsx` already has `overflow-y-auto` and `max-h-[90vh]`
- Radix Popover renders in a portal above the dialog overlay
- Add `z-[60]` to PopoverContent in date pickers that appear inside dialogs to ensure they render above the dialog's z-50
- Verify that `pointer-events-auto` is present on Calendar components (per the project's shadcn-datepicker pattern)

---

## Priority 9: Select/Dropdown components (item #10)

### Radix Select rendering
- Radix SelectContent already renders via portal with `z-50`
- The base dialog.tsx uses `z-50` -- Selects inside dialogs need to be at least the same z-index
- The existing `select.tsx` component likely already handles this via Radix portal rendering
- Verify and if needed, add `position="popper"` and appropriate z-index to SelectContent to ensure it renders above dialog overlays on mobile

---

## Summary Table

| File | Changes |
|------|---------|
| `src/pages/DashboardPage.tsx` | Add `min-w-[700px]` to request tables |
| `src/pages/ProjectDetailsPage.tsx` | `flex-wrap` on badge rows, stack letter headers on mobile |
| `src/components/TaskDetailOutcomeDialog.tsx` | Mobile-width dialog, responsive grids, break-words |
| `src/components/TaskEditDialog.tsx` | Mobile-width dialog |
| `src/components/TaskVoiceRecorderBox.tsx` | 44px touch targets, full-width container |
| `src/pages/CustomerManagementPage.tsx` | Padding, header wrap, stats grid, dialog width |
| `src/components/CustomerForm.tsx` | Stack all field grids vertically on mobile |
| `src/pages/CustomerDetailPage.tsx` | Stats grid responsive, dialog widths |
| `src/components/CustomerContactForm.tsx` | Stack all field grids vertically on mobile |
| `src/components/CustomerInteractionForm.tsx` | Stack date grid on mobile |
| `src/pages/WritingLetterPage.tsx` | Padding fix |
| `src/pages/HRManagementPage.tsx` | Padding, header wrap, stats grid, dialog width |
| `src/components/EmployeeForm.tsx` | Scrollable tabs, responsive field grids |
| `src/pages/FinancialAnalysisPage.tsx` | Padding fix |
| `src/pages/BlogDashboardPage.tsx` | Padding fix |
| `src/pages/CreateRequestPage.tsx` | Padding fix |
| `src/components/GanttChart.tsx` | Mobile rotate hint |
| `src/components/NewProjectDialog.tsx` | Verify mobile width (likely no changes) |
| `src/components/ProjectEditDialog.tsx` | Verify mobile width (likely no changes) |

All changes are CSS/Tailwind responsive class additions only. No functionality or desktop behavior is affected.
