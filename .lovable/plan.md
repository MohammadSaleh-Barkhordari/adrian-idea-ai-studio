
# Add Notification Sound & Vibration Patterns

## Overview

Enhance push notifications with vibration patterns and sound settings to make "Our Life" notifications more noticeable. Different notification types will have distinct vibration patterns, and Our Life notifications (calendar, financial, todo) will require user interaction (won't auto-dismiss).

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/sw.ts` | Add vibration patterns map, update `showNotification` options |
| `supabase/functions/send-push-notification/index.ts` | Include `type` field in payload |
| `supabase/functions/send-overdue-reminders/index.ts` | Add `type: 'task'` to payload |
| `supabase/functions/send-daily-agenda/index.ts` | Add `type: 'calendar'` to payload |
| `supabase/functions/send-deadline-reminders/index.ts` | Add `type: 'project'` to payload |
| `supabase/functions/test-push-notification/index.ts` | Add `type: 'general'` to payload |

---

## Vibration Patterns

| Type | Pattern (ms) | Description |
|------|--------------|-------------|
| `calendar` | `[200, 100, 200, 100, 200]` | Triple pulse — Our Life |
| `financial` | `[200, 100, 200, 100, 200]` | Triple pulse — Our Life |
| `todo` | `[200, 100, 200, 100, 200]` | Triple pulse — Our Life |
| `task` | `[200, 100, 200]` | Double pulse |
| `project` | `[300]` | Single pulse |
| `general` | `[200]` | Short pulse |

---

## Technical Changes

### 1. Service Worker (`src/sw.ts`)

Add vibration pattern mapping before push handler:

```typescript
const vibrationPatterns: Record<string, number[]> = {
  calendar: [200, 100, 200, 100, 200],
  financial: [200, 100, 200, 100, 200],
  todo: [200, 100, 200, 100, 200],
  task: [200, 100, 200],
  project: [300],
  general: [200],
};
```

Update data parsing to include `type`:

```typescript
data = {
  title: payload.title || data.title,
  body: payload.body || payload.message || data.body,
  icon: payload.icon || data.icon,
  url: payload.url || data.url,
  type: payload.type || 'general',  // NEW
};
```

Update `showNotification` options:

```typescript
{
  body: data.body,
  icon: data.icon,
  badge: '/lovable-uploads/38598e63-607e-4758-bb3d-7fb4e170eae0.png',
  tag: 'notification-' + Date.now(),
  renotify: true,
  silent: false,  // NEW - ensures sound plays
  vibrate: vibrationPatterns[data.type] || vibrationPatterns.general,  // NEW
  requireInteraction: ['calendar', 'financial', 'todo'].includes(data.type),  // NEW
  data: { url: data.url, dateOfArrival: Date.now() },
}
```

### 2. Edge Function Updates

Each edge function's notification payload gets a `type` field:

| Function | Type Value |
|----------|------------|
| `send-push-notification` | `notification_type || 'general'` |
| `send-overdue-reminders` | `'task'` |
| `send-daily-agenda` | `'calendar'` |
| `send-deadline-reminders` | `'project'` |
| `test-push-notification` | `'general'` |

---

## Behavior Summary

| Feature | Our Life Notifications | Other Notifications |
|---------|------------------------|---------------------|
| Vibration | Triple pulse (urgent) | Single/double pulse |
| Sound | System default | System default |
| Auto-dismiss | No (stays until tapped) | Yes |
| Renotify | Yes | Yes |

---

## Platform Support

| Platform | Sound | Vibration |
|----------|-------|-----------|
| Android | Supported | Supported |
| iOS PWA | Supported | Limited |
| Desktop | Supported | Not supported |

Note: Vibration is ignored on desktop browsers but sound still plays.
