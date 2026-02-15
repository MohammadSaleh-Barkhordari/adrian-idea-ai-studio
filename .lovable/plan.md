

# Fix: Select Dropdowns Not Showing Saved Values in Task Edit Dialog

## Root Cause

The `useEffect` (line 103) does two things simultaneously:
1. Sets `formData` with saved values (e.g., `assignedTo = "19db583e-..."`)
2. Calls `fetchAuthUsers()` and `fetchRelatedTasks()` asynchronously

On the first render after the effect fires, formData has the correct UUID values, but `authUsers` is still an empty array. This means the `Select` component has `value="19db583e-..."` but no `SelectItem` with that value exists yet. Radix Select shows the placeholder when no item matches the value.

When `fetchAuthUsers` resolves and `setAuthUsers` triggers a re-render, the SelectItems now exist -- but the Select needs the value to be explicitly re-set or the component to properly reconcile. The issue is that Radix Select may not re-evaluate the display text once items load if the value was already set during the "empty items" render.

## Fix: Load Users/Tasks First, Then Set Form Data

Restructure the `useEffect` to fetch async data first, then set formData after the data is available. This ensures that when `formData` values are set, the corresponding `SelectItem` entries already exist.

### File: `src/components/TaskEditDialog.tsx`

**Replace the single useEffect (lines 103-138) with a two-phase approach:**

```tsx
useEffect(() => {
  const initializeForm = async () => {
    if (!open || !task?.id) return;

    // Phase 1: Fetch async data first
    let fetchedUsers: AuthUser[] = [];
    let fetchedTasks: RelatedTask[] = [];

    try {
      const { data, error } = await supabase.functions.invoke('get-auth-users');
      if (!error) {
        fetchedUsers = data?.users || [];
        setAuthUsers(fetchedUsers);
      }
    } catch (error) {
      console.error('Error fetching auth users:', error);
    }

    if (task.project_id) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('id, task_name')
          .eq('project_id', task.project_id)
          .neq('id', task.id)
          .order('created_at', { ascending: false });
        if (!error) {
          fetchedTasks = data || [];
          setRelatedTasks(fetchedTasks);
        }
      } catch (error) {
        console.error('Error fetching related tasks:', error);
      }
    }

    // Phase 2: Set form data AFTER async data is loaded
    setFormData({
      taskName: task.task_name || '',
      taskType: task.task_type || 'general',
      assignedBy: task.assigned_by || 'unassigned',
      assignedTo: task.assigned_to || 'unassigned',
      followBy: task.follow_by || 'unassigned',
      confirmBy: task.confirm_by || 'unassigned',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      description: task.description || '',
      notes: task.notes || '',
      relatedTaskId: task.related_task_id || 'none',
      outcomeNotes: task.outcome_notes || '',
      predecessorTaskId: task.predecessor_task_id || 'none',
      successorTaskId: task.successor_task_id || 'none',
    });

    setStartDate(task.start_time ? new Date(task.start_time) : undefined);
    setDueDate(task.due_date ? new Date(task.due_date) : undefined);
    setSelectedFiles([]);
    setOutcomeAudioUrl(task.outcome_audio_path || null);
    setDescriptionAudioBlob(null);
    setOutcomeAudioBlob(null);
    setUserOutcomeNotes(task.outcome_notes || '');
    setUserStatus(task.status === 'completed' ? 'completed' : 'in_progress');

    fetchExistingFiles();
    fetchProjectName();
  };

  initializeForm();
}, [open, task?.id]);
```

**Also remove the now-unused standalone `fetchAuthUsers` and `fetchRelatedTasks` functions** (lines 155-178), since their logic is now inlined inside the useEffect.

## Why This Fixes the Problem

- By awaiting `fetchAuthUsers` and `fetchRelatedTasks` before calling `setFormData`, both `authUsers` and `relatedTasks` state arrays are populated before the Select components receive their values
- On the render that follows, every Select has both a valid `value` and matching `SelectItem` entries, so Radix correctly displays the selected option instead of the placeholder
- No extra useEffects, no race conditions, no timing issues

## Files Changed

| File | Change |
|------|--------|
| `src/components/TaskEditDialog.tsx` | Restructure useEffect to await async data before setting formData; remove standalone fetch functions |

