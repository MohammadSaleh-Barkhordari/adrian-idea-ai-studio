

# Attach Files from Projects in Email Compose

## What It Does

Adds a new "Attach from Project" option alongside the existing "Attach File" button. Users can:
1. Select a project from the project list
2. Choose a category: Document, File, or Letter
3. See the list of items in that category for the selected project
4. Pick one to attach -- it gets added to the attachment list using its storage path
5. Repeat or manually attach files as usual

## Technical Details

### File: `src/components/email/EmailCompose.tsx`

**New state variables:**
- `showProjectAttach` (boolean) -- toggles the project attachment picker UI
- `attachProjects` -- list of projects from `adrian_projects` (id, project_id, project_name)
- `attachSelectedProjectId` -- selected project's `project_id` (text)
- `attachCategory` -- `'document' | 'file' | 'letter' | ''`
- `attachItems` -- list of items fetched based on category (id, name, storage_path, bucket)

**Data fetching:**
- `fetchProjects()` -- queries `adrian_projects` for `project_id, project_name`, ordered by name
- `fetchAttachItems(projectId, category)` -- based on category:
  - **Document**: queries `documents` where `project_id = projectId`, returns `file_name`, `file_path` (bucket: `Documents`)
  - **File**: queries `files` where `project_id = projectId`, returns `file_name`, `file_path` (bucket: `Files`)
  - **Letter**: queries `letters` where `project_id = projectId` and `status = 'final_generated'`, returns `letter_title` or `subject` as name, `final_image_url` as path (bucket: `Letters`)

**When user selects an item:**
- Add it to `preloadedAttachments` array with `{ name, storage_path, bucket }` -- these are already handled by the existing send logic which passes them to the `send-email` edge function

**New UI (in the attachments section):**
- A second button "Attach from Project" next to the existing "Attach File" button
- When clicked, shows a small inline panel with three cascading selects:
  1. Project dropdown
  2. Category dropdown (Document / File / Letter) -- disabled until project is selected
  3. Item list -- disabled until category is selected, shows matching items
- A small "Add" button to confirm and add the selected item to attachments
- The panel can be collapsed/dismissed

**Reset logic:**
- Clear project attachment state on dialog close/discard

### No database changes needed
All tables and storage buckets already exist.

