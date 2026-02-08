

# Add Edit and Delete Buttons to Tasks Section

## Overview

Add edit and delete icon buttons to each task in the Tasks section of the Project Details page. The delete action will show a confirmation dialog before permanently removing the task from the database.

## Current State

- Tasks are displayed in a card list format (lines 508-547 in `ProjectDetailsPage.tsx`)
- Each task card shows: title, status badge, priority badge, assigned user, due date, description, and creation date
- `TaskEditDialog` component exists but is not imported in `ProjectDetailsPage.tsx`
- `AlertDialog` component is available for delete confirmation

## Implementation

### 1. Add Required Imports

Add to `src/pages/ProjectDetailsPage.tsx`:

```typescript
import { Trash2 } from 'lucide-react';  // Add to existing lucide imports
import { TaskEditDialog } from '@/components/TaskEditDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
```

### 2. Add State Variables

Add new state for managing the edit dialog and delete confirmation:

```typescript
const [taskEditDialogOpen, setTaskEditDialogOpen] = useState(false);
const [selectedTask, setSelectedTask] = useState<Task | null>(null);
const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
const [deleting, setDeleting] = useState(false);
```

### 3. Add Delete Handler Function

```typescript
const handleDeleteTask = async () => {
  if (!taskToDelete) return;
  
  setDeleting(true);
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskToDelete.id);
    
    if (error) throw error;
    
    setTasks(tasks.filter(t => t.id !== taskToDelete.id));
    toast({
      title: "Success",
      description: "Task deleted successfully",
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    toast({
      title: "Error",
      description: "Failed to delete task",
      variant: "destructive",
    });
  } finally {
    setDeleting(false);
    setDeleteConfirmOpen(false);
    setTaskToDelete(null);
  }
};
```

### 4. Update Task Card UI

Modify the task card (lines 509-547) to include edit and delete buttons:

```tsx
{tasks.map((task) => (
  <div key={task.id} className="border rounded-lg p-3">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        {/* Existing task content */}
      </div>
      
      {/* NEW: Action buttons */}
      <div className="flex items-center gap-1 ml-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            setSelectedTask(task);
            setTaskEditDialogOpen(true);
          }}
          title="Edit task"
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            setTaskToDelete(task);
            setDeleteConfirmOpen(true);
          }}
          title="Delete task"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>
))}
```

### 5. Add TaskEditDialog Component

Add after the existing dialogs at the bottom of the component:

```tsx
{selectedTask && (
  <TaskEditDialog
    open={taskEditDialogOpen}
    onOpenChange={setTaskEditDialogOpen}
    task={selectedTask}
    userRole={userRole || 'general_user'}
    onTaskUpdated={() => {
      if (projectId && user) {
        loadProjectData(projectId, user.id);
      }
      setSelectedTask(null);
    }}
  />
)}
```

### 6. Add Delete Confirmation Dialog

Add the AlertDialog for delete confirmation:

```tsx
<AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Task</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to delete "{taskToDelete?.title}"? 
        This action cannot be undone and will permanently remove the task.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
      <AlertDialogAction
        onClick={handleDeleteTask}
        disabled={deleting}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        {deleting ? 'Deleting...' : 'Delete'}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/ProjectDetailsPage.tsx` | Add imports, state, delete handler, UI buttons, and dialogs |

## Visual Result

Each task card will now have two icon buttons on the right side:
- Pencil icon - Opens the TaskEditDialog for editing
- Trash icon (red) - Opens confirmation dialog, then deletes on confirm

## Technical Details

- The `Pencil` icon is already imported (line 16)
- `Trash2` icon needs to be added to imports
- `TaskEditDialog` requires `task`, `userRole`, `open`, `onOpenChange`, and `onTaskUpdated` props
- Delete operation uses Supabase `.delete()` with task ID filter
- Local state is updated after successful deletion to avoid refetching

