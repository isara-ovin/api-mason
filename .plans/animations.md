# APIMason — Animation Strategy

> **Goal:** Pleasing micro-animations that make the tool feel interactive and alive, without sacrificing performance.

## Animation Inventory

| Animation | Technique | Duration | CSS Property | Trigger |
|-----------|-----------|----------|-------------|---------|
| Node appears on canvas | `motion.div` scale 0→1 + opacity 0→1 | 200ms | `transform`, `opacity` | Drag-drop / create |
| Node removed | `AnimatePresence` scale 1→0.8 + fade | 150ms | `transform`, `opacity` | Delete |
| Edge connects | SVG `stroke-dashoffset` animation | 400ms | `stroke-dashoffset` | Connection made |
| Panel opens (config) | `AnimatePresence` slide-X + fade | 250ms | `transform`, `opacity` | Select block |
| Panel closes | Reverse slide-X + fade | 200ms | `transform`, `opacity` | Deselect |
| Active node pulse | CSS `@keyframes` glow ring | 1.5s loop | `box-shadow` | Execution running |
| Step complete | Check icon spring bounce | 300ms | `transform`, `opacity` | Block finishes |
| Sidebar item hover | `motion.div` scale 1→1.02 + bg shift | 150ms | `transform`, `background` | Mouse enter |
| Sidebar drag start | Scale 1→1.05 + shadow | 100ms | `transform`, `box-shadow` | Drag start |
| Toast notification | `react-hot-toast` built-in spring | 200ms | — | API call |
| Execution progress bar | CSS width transition | continuous | `width` | SSE updates |
| Theme toggle | CSS `transition` on variables | 300ms | `color`, `background` | Toggle click |

## Performance Rules

### Do ✅

- Animate **only** `transform` and `opacity` — these are GPU-composited and skip layout/paint
- Use `LazyMotion` with `domAnimation` features (~15kb) instead of full `domMax` (~25kb)
- Use `m` components (from LazyMotion) instead of `motion` for smaller bundles
- Keep interaction animations **≤ 300ms** for snappy feel
- Keep ambient loops **≤ 2s** per cycle
- Use CSS `@keyframes` for simple ambient animations (glow, pulse) — no React re-renders
- Let React Flow handle viewport culling — off-screen nodes don't animate

### Don't ❌

- Don't animate `width`, `height`, `top`, `left`, `margin`, `padding` — these trigger layout recalculation
- Don't use `will-change` as a permanent style — only add during active animations
- Don't animate more than ~20 nodes simultaneously
- Don't use `domMax` unless you need drag/layout animations
- Don't use JS-based `setInterval` for animations — use CSS or `requestAnimationFrame`

## Motion Config Presets

```typescript
// Reusable spring configs
export const springs = {
  snappy: { type: "spring", stiffness: 500, damping: 30 },
  gentle: { type: "spring", stiffness: 300, damping: 25 },
  bounce: { type: "spring", stiffness: 400, damping: 15 },
} as const;

// Standard animation variants
export const variants = {
  nodeEnter: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
    transition: springs.snappy,
  },
  panelSlide: {
    initial: { x: 300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 300, opacity: 0 },
    transition: springs.gentle,
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2 },
  },
};
```

## CSS Keyframes (for ambient animations)

```css
/* Active node glow during execution */
@keyframes node-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  50%      { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0); }
}

.node--executing {
  animation: node-pulse 1.5s ease-in-out infinite;
}

/* Edge flow indicator */
@keyframes edge-flow {
  to { stroke-dashoffset: -20; }
}

.edge--active path {
  stroke-dasharray: 5 5;
  animation: edge-flow 0.8s linear infinite;
}
```
