

# Fix Letter PDF Layout: RTL Alignment

## Step 1: Enhanced Position Logging

Update the `logCurrentPositions` function in `LetterBuilder.tsx` to measure actual rendered element sizes from the DOM.

### How it works

Each letter element is rendered inside a `CustomDraggable` wrapper. The function will:

1. Query each draggable element inside `#letter-canvas` by its `id` prop
2. Get the inner content div's `getBoundingClientRect()` relative to the canvas
3. Calculate and log the full bounding box:

```
Box: [name] -> High X: [x + width], High Y: [y], Low X: [x], Low Y: [y + height], Width: [width], Height: [height]
```

### Technical detail

`CustomDraggable` positions elements using `style.left` and `style.top`. The actual width/height comes from the rendered content. We will iterate over all position keys, find their corresponding DOM elements in the canvas, and measure them using `getBoundingClientRect()` offset by the canvas rect.

After this change, clicking "Log Current Positions" will print the full bounding box for every element to the console. You can then generate a test letter and share the log output.

## Step 2: RTL Right-Edge Alignment (after log confirmation)

Once you confirm the logged values, apply these rules:

- **Keep unchanged**: basmala, closing2, signature, stamp
- **Date**: Anchor from its current High X (right edge), keep current High Y
- **6 aligned boxes** (recipientName, recipientInfo, subject, greeting, body, closing1): Set all their High X (right edge) equal to greeting's current High X. Each box keeps its own High Y (vertical position). New `x = greeting_highX - box_width`.

## Step 3: Save as New Defaults

Update the default `positions` state in `LetterBuilder.tsx` with the calculated values.

## Files Changed

| File | Action | Detail |
|------|--------|--------|
| `src/components/LetterBuilder.tsx` | Modify | Enhanced `logCurrentPositions` with bounding box measurement; later update default positions |

