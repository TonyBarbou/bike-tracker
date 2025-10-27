# Color System Documentation

This project uses a centralized color system that makes it easy to modify colors across the entire application.

## Overview

Colors are defined in **two files** that work together:

1. **`lib/colors.ts`** - TypeScript/JavaScript constants for use in components
2. **`app/colors.css`** - CSS variables for use in stylesheets

Both files contain the same color values, ensuring consistency across the application.

## How to Modify Colors

### For Components (TypeScript/JavaScript)

Colors used in JavaScript/TypeScript files (like map routes, dynamic styles) are imported from `lib/colors.ts`:

```typescript
import { map as mapColors } from '@/lib/colors';

// Use in your code
const routeColor = mapColors.routeGpx; // Returns '#3b82f6'
```

**To change these colors:**
1. Open `bike-tracker/lib/colors.ts`
2. Find the color you want to change
3. Update the hex value
4. Save the file

### For Tailwind/CSS Classes

Colors used in Tailwind classes and CSS are defined in `app/colors.css` as CSS variables:

```css
/* In colors.css */
:root {
  --map-route-gpx: #3b82f6;
}
```

**To change these colors:**
1. Open `bike-tracker/app/colors.css`
2. Find the CSS variable you want to change
3. Update the hex value
4. Save the file

## Color Categories

### Brand Colors
Main brand identity colors used throughout the site.
- `brand.primaryRed` / `--brand-primary-red`
- `brand.primaryOrange` / `--brand-primary-orange`
- `brand.accentRed` / `--brand-accent-red`
- `brand.accentOrange` / `--brand-accent-orange`

### Background Colors
Page and component backgrounds.
- `bg.primary` / `--bg-primary`
- `bg.secondary` / `--bg-secondary`
- `bg.tertiary` / `--bg-tertiary`
- etc.

### Text Colors
Typography and content colors.
- `text.primary` / `--text-primary`
- `text.secondary` / `--text-secondary`
- etc.

### Status Colors
Success, warning, error, and info states.
- `status.success.*` / `--status-success-*`
- `status.warning.*` / `--status-warning-*`
- `status.error.*` / `--status-error-*`
- `status.info.*` / `--status-info-*`

### Timeline Colors
Journey timeline specific colors.
- `timeline.past.*` / `--timeline-past-*`
- `timeline.today.*` / `--timeline-today-*`
- `timeline.future.*` / `--timeline-future-*`

### Map Colors
Mapbox visualization colors.
- `map.routePlanned` / `--map-route-planned` - Gray for planned routes
- `map.routeCompleted` / `--map-route-completed` - Amber for completed routes
- `map.routeGpx` / `--map-route-gpx` - Blue for GPX tracks
- `map.livePosition` / `--map-live-position` - Red for current position
- `map.popup.*` / `--map-popup-*` - Popup text colors

## Usage Examples

### In React Components

```typescript
import { map as mapColors, brand, status } from '@/lib/colors';

function MyComponent() {
  return (
    <div style={{ 
      backgroundColor: brand.primaryRed,
      color: status.success.text 
    }}>
      Content
    </div>
  );
}
```

### In Mapbox Layers

```typescript
import { map as mapColors } from '@/lib/colors';

map.addLayer({
  id: 'route',
  type: 'line',
  paint: {
    'line-color': mapColors.routeGpx,  // Uses #3b82f6
    'line-width': 3,
  },
});
```

### In CSS

```css
.my-element {
  background-color: var(--brand-primary-red);
  color: var(--text-primary);
  border-color: var(--border-default);
}
```

## Dark Mode

Dark mode colors are automatically handled in `colors.css` using the `@media (prefers-color-scheme: dark)` query. The system automatically swaps background and text colors when dark mode is enabled.

## Important Notes

1. **Keep both files in sync**: When you change a color, update it in BOTH `lib/colors.ts` AND `app/colors.css`
2. **Map colors must use TypeScript constants**: Mapbox requires JavaScript strings, so these colors come from `lib/colors.ts`
3. **Tailwind classes use CSS variables**: The CSS file is imported in `globals.css` to make variables available to Tailwind

## Quick Reference

| Purpose | File to Edit | Example |
|---------|--------------|---------|
| Map route colors | `lib/colors.ts` | `map.routeGpx = '#3b82f6'` |
| Button colors (Tailwind) | `app/colors.css` | `--status-success-button: #16a34a` |
| Brand colors (both) | Both files | Keep in sync! |
| Dark mode colors | `app/colors.css` | Under `@media (prefers-color-scheme: dark)` |
