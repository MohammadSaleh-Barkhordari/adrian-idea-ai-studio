
# Fix PWA Home Screen Icon — Use Company Logo

## Problem

When adding the web app to the home screen, the icon shows a **blue square with "AI" text** instead of the actual company logo. 

**Root Cause:**
- The PWA manifest icons and apple-touch-icon point to `/adrian-idea-favicon-512.png` — a placeholder with blue background and "AI" text
- The actual company logo is at `/lovable-uploads/38598e63-607e-4758-bb3d-7fb4e170eae0.png` — correctly used in Navigation and Footer

## Solution

Update all PWA icon references to use the actual company logo file.

---

## Files to Modify

| File | Changes |
|------|---------|
| `vite.config.ts` | Update manifest icons to use company logo |
| `index.html` | Update apple-touch-icon and favicon references |
| `src/sw.ts` | Update notification icons |

---

## Implementation Details

### 1. Update `vite.config.ts`

Change the PWA manifest icons from `/adrian-idea-favicon-512.png` to `/lovable-uploads/38598e63-607e-4758-bb3d-7fb4e170eae0.png`:

```typescript
icons: [
  {
    src: '/lovable-uploads/38598e63-607e-4758-bb3d-7fb4e170eae0.png',
    sizes: '192x192',
    type: 'image/png'
  },
  {
    src: '/lovable-uploads/38598e63-607e-4758-bb3d-7fb4e170eae0.png',
    sizes: '512x512',
    type: 'image/png'
  },
  {
    src: '/lovable-uploads/38598e63-607e-4758-bb3d-7fb4e170eae0.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'maskable'
  }
]
```

Also update `includeAssets` to reference the correct file.

### 2. Update `index.html`

Change all icon references:

```html
<!-- Update these lines -->
<link rel="icon" type="image/png" sizes="32x32" href="/lovable-uploads/38598e63-607e-4758-bb3d-7fb4e170eae0.png">
<link rel="icon" type="image/png" sizes="192x192" href="/lovable-uploads/38598e63-607e-4758-bb3d-7fb4e170eae0.png">
<link rel="apple-touch-icon" sizes="180x180" href="/lovable-uploads/38598e63-607e-4758-bb3d-7fb4e170eae0.png">
<link rel="shortcut icon" type="image/png" href="/lovable-uploads/38598e63-607e-4758-bb3d-7fb4e170eae0.png">
<meta name="msapplication-TileImage" content="/lovable-uploads/38598e63-607e-4758-bb3d-7fb4e170eae0.png" />
```

### 3. Update `src/sw.ts`

Change notification icon references:

```typescript
icon: '/lovable-uploads/38598e63-607e-4758-bb3d-7fb4e170eae0.png',
// ...
badge: '/lovable-uploads/38598e63-607e-4758-bb3d-7fb4e170eae0.png',
```

---

## Why This Happens

The `adrian-idea-favicon-512.png` file in the public folder is just a placeholder — a blue square with "AI" text. The actual company logo was uploaded to `lovable-uploads/` and is correctly used in the Navigation and Footer components, but the PWA configuration was never updated to use it.

---

## After Deployment

To see the new icon on your home screen:

1. **Delete the PWA** from your iPhone Home Screen
2. Go to Safari and navigate to your app
3. **Add to Home Screen** again
4. The new icon (company logo) should appear

**Note:** iOS caches PWA icons aggressively. If the old icon persists, you may need to:
- Clear Safari cache and website data
- Wait a few minutes before re-adding
- Restart your device
