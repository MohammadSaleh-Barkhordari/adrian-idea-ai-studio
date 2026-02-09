

# Push Notification System Enhancement — 4 New Notification Types

## Overview

This plan implements 4 new push notification types to enhance user engagement:

1. **Overdue Task Reminders** — Daily morning check for past-due tasks
2. **Daily Agenda Summary** — Morning digest of today's events and tasks
3. **Task Comment Notifications** — Real-time alerts for comments/mentions
4. **Project Deadline Approaching** — 3-day and 1-day warnings

All implementations follow existing patterns from `task-due-reminders` and `calendar-event-reminders` edge functions, using the same web-push library (`npm:web-push@3.6.7`) and notification preferences system.

---

## Database Changes

### New Table: `task_comments`

Since no comments table exists, we need to create one:

```sql
CREATE TABLE task_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  mentioned_users UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view comments on their assigned tasks" ON task_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_comments.task_id 
      AND (tasks.assigned_to = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can create comments" ON task_comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own comments" ON task_comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all comments" ON task_comments
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
```

---

## Edge Functions

### 1. `send-overdue-reminders/index.ts` (NEW)

Runs daily at **07:00 Iran time (03:30 UTC)**

| Feature | Details |
|---------|---------|
| Query | Tasks where `due_date < today`, `status != 'completed'`, `status != 'cancelled'` |
| Grouping | By `assigned_to` user |
| Notification | Title: `⚠️ Overdue Tasks`, Body: `You have X overdue task(s). Oldest: "[title]" was due [date].` |
| URL | `/dashboard` |

### 2. `send-daily-agenda/index.ts` (NEW)

Runs daily at **06:30 Iran time (03:00 UTC)**

| Feature | Details |
|---------|---------|
| Query | Calendar events AND tasks due TODAY for each user |
| Skip | Users with no events and no tasks today |
| Notification | Title: `📅 Today's Agenda`, Body: `X event(s) and Y task(s) today. First: "[title]" at [time].` |
| URL | `/dashboard` |

### 3. `send-comment-notification/index.ts` (NEW)

Triggered via HTTP call when a comment is added (called from frontend)

| Feature | Details |
|---------|---------|
| Recipients | Task assignee (if different from commenter) + mentioned users |
| Skip | The commenter themselves |
| Notification | Title: `💬 New Comment`, Body: `[name] commented on "[task]": "[first 50 chars]..."` |
| URL | `/projects/[project_id]` or `/dashboard` |

### 4. `send-deadline-reminders/index.ts` (NEW)

Runs daily at **08:00 Iran time (04:30 UTC)**

| Feature | Details |
|---------|---------|
| Query | Projects where `end_date` is exactly 3 days OR 1 day from now |
| Recipients | Project `assigned_to`, `created_by`, and `user_id` |
| Notifications | **3 days:** `📋 Deadline in 3 Days` / **1 day:** `🔴 Deadline Tomorrow!` |
| Body | `Project "[name]" is due on [date]. [X] tasks remaining.` |
| URL | `/projects/[project_id]` |

---

## Cron Job Setup

All cron jobs use `net.http_post` to invoke edge functions:

| Job Name | Schedule | Iran Time | Edge Function |
|----------|----------|-----------|---------------|
| `daily-agenda-summary` | `0 3 * * *` | 06:30 | `send-daily-agenda` |
| `overdue-task-reminders` | `30 3 * * *` | 07:00 | `send-overdue-reminders` |
| `project-deadline-reminders` | `30 4 * * *` | 08:00 | `send-deadline-reminders` |

**Note:** Task comment notifications are triggered in real-time from frontend, not via cron.

---

## Config Updates

### `supabase/config.toml`

Add entries for new edge functions:

```toml
[functions.send-overdue-reminders]
verify_jwt = false

[functions.send-daily-agenda]
verify_jwt = false

[functions.send-deadline-reminders]
verify_jwt = false

[functions.send-comment-notification]
verify_jwt = false
```

---

## Frontend Changes

### Comment Submission Hook

When a user submits a comment on a task, call the `send-comment-notification` edge function:

```typescript
// After successfully inserting comment
await supabase.functions.invoke('send-comment-notification', {
  body: {
    task_id: taskId,
    comment_content: content,
    commenter_id: currentUserId,
    mentioned_user_ids: extractMentions(content)
  }
});
```

---

## Technical Architecture

```text
+------------------+          +-------------------------+
|   pg_cron Jobs   |          |   Frontend Comment      |
|   (3 jobs)       |          |   Submission            |
+--------+---------+          +------------+------------+
         |                                 |
         | net.http_post                   | supabase.functions.invoke
         v                                 v
+--------+---------+          +------------+------------+
| Edge Functions   |          | send-comment-           |
| - send-overdue   |          | notification            |
| - send-daily     |          +------------+------------+
| - send-deadline  |                       |
+--------+---------+                       |
         |                                 |
         +----------------+----------------+
                          |
                          v
              +-----------+-----------+
              | push_subscriptions    |
              | + notification_prefs  |
              +-----------+-----------+
                          |
                          v
              +-----------+-----------+
              | Web Push API          |
              | (VAPID authentication)|
              +-----------------------+
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/send-overdue-reminders/index.ts` | CREATE | Overdue tasks cron function |
| `supabase/functions/send-daily-agenda/index.ts` | CREATE | Daily agenda cron function |
| `supabase/functions/send-deadline-reminders/index.ts` | CREATE | Project deadline cron function |
| `supabase/functions/send-comment-notification/index.ts` | CREATE | Comment notification function |
| `supabase/config.toml` | MODIFY | Add verify_jwt=false for new functions |
| Database migration | RUN | Create task_comments table + cron jobs |

---

## Notification Icon

All notifications will use the updated company logo:
`/lovable-uploads/38598e63-607e-4758-bb3d-7fb4e170eae0.png`

---

## Implementation Order

1. Create database table `task_comments` with RLS policies
2. Create all 4 edge functions
3. Update `supabase/config.toml`
4. Set up 3 cron jobs via SQL
5. (Optional) Add comment UI component to task details

