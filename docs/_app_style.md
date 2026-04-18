# Ovis Loop Data Viewer - UI Style Guide

This document extensively details the visual design systems, custom utilities, and elemental styling applied across the Ovis Loop Data Viewer to achieve a premium, futuristic, glassmorphic aesthetic.

---

## 1. Core Theming & Variables

The application abandons traditional flat dark modes in favor of an intense, glowing, semi-transparent hierarchy.

**Root Variables (`src/index.css`)**
*   **Background (`--background`)**: `#030305` — A deep "obsidian" black to provide high contrast for glowing elements.
*   **Foreground (`--foreground`)**: `#F8F8F8` — Crisp off-white.
*   **Primary (`--primary`)**: `#F59E0B` — Vibrant Amber. Used for active navigation, glowing outlines, counts, and primary accents. 
*   **Destructive (`--destructive`)**: `#EF4444` — True Red for error states.
*   **Secondary / Intersecting elements**: Generally utilize RGBA translucent whites (e.g., `rgba(255, 255, 255, 0.05)`) and darks (`rgba(15, 15, 20, 0.4)`) to enable backdrop blurring.
*   **Typography**: The `Geist` font family is used globally to maintain an ultra-modern, geometric technical look.

---

## 2. Global Utilities (Glassmorphism)

Custom glassmorphic utility classes are injected via `@layer components` in Tailwind to easily construct the UI backbone.

*   **`.glass-panel`**: The primary surface element. 
    *   *Implementation:* `bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] rounded-2xl`
    *   *Effect:* Creates a highly polished frosted glass tile with a subtle luminous top-inset edge, providing physical "thickness" to the UI.
*   **`.glass-input`**: The primary interaction field.
    *   *Implementation:* `bg-black/20 backdrop-blur-lg border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all`
    *   *Effect:* A recessed glass pool that transitions smoothly to a glowing amber rim when focused.

---

## 3. Structural Layout (`App.tsx`)

### The Ambient Canvas
*   The primary body maintains `#030305`, but is overlaid with two massive, blurred (`blur-[120px]` / `blur-[100px]`), absolute gradient orbs floating off-screen: 
    *   Top Left: A soft Amber (`primary/5`) glow.
    *   Bottom Right: A subtle Blue (`blue-500/5`) glow.
*   This mimics an "engine room" or "data nexus" lighting environment without polluting content legibility.

### The App Header
*   **Main Container:** Utilizes a full `.glass-panel` wrapper.
*   **Title (`OVIS LOOP`):** Implements an aggressive gradient-clip-text styling (`from-white via-white/80 to-primary/80`) paired with `italic tracking-tight` for a fast, dynamic feeling.
*   **Subtitle:** Off-white/40 (`text-white/40 uppercase tracking-wider`).
*   **Language Selector:** Nestled inside a secondary `bg-black/20` capsule alongside the `Globe` icon in Amber (`text-primary`). The dropdown menu opens as a floating `.glass-panel`.

### Category Navigation (The Pills)
*   Standard UI Tabs are replaced by **animated layout pills** using Framer Motion. 
*   **Inactive State:** Unstyled text (`text-white/50`, hovering to `text-white/80` with a subtle `bg-white/5` shift).
*   **Active State:** Text transitions to solid Amber (`text-primary`), backed by an absolute `framer-motion` sliding pill indicator that physically bounds between tabs using spring physics (`type: "spring", bounce: 0.2`). The pill features `bg-primary/10 border-primary/20`.

### State Feedback Elements
*   **Loading:** An absolute-centered state featuring a standard `Loader2` spin, surrounded by an absolute, pulsing amber drop-shadow blur, creating the illusion of a glowing energy core. The text is technical (`uppercase tracking-widest`).
*   **Error State:** A specialized red `.glass-panel` (`border-destructive/20 bg-destructive/5`).

---

## 4. The Data Grid (`DataTable.tsx`)

### Controls Bar
*   Constructed as an inline `.glass-panel` (`bg-white/[0.02] border-white/5 backdrop-blur-md`).
*   **Search Box**: Wrapped in `.glass-input`, utilizing a left-aligned Search icon (`text-primary/70`).
*   **Sort / Direction Dropdowns**: Technical labeling (`SORT PARAMS` in `text-white/40 uppercase font-medium`) guides the `.glass-input` dropdown buttons.

### Card Mechanics
Uses staggered `framer-motion` cascading entrances (cascading from `y: 20` to `0` with variable delays), creating a cascading waterfall visual as data loads.

**Interactive Node Cards (Entries)**
*   **Base Styling**: Implements `.glass-panel` overlaid with `hover:border-primary/50`.
*   **Hover Physics (`framer-motion`)**: Hovering triggers `scale: 1.02, translateY: -4px` (floating upwards slightly).
*   **Internal Glow Effect**: A hidden `absolute` gradient (`bg-gradient-to-br from-primary/10 to-transparent opacity-0`) gracefully fades in on `group-hover:opacity-100`, making the card "light up".

### Internal Card Elements (Data Display)
*   **Group Badges**: 
    *   *GroupID*: High-tech pill (`bg-white/5 border border-white/10 text-xs text-white/80 tracking-wider`).
    *   *Row Count*: Accent pill (`bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-widest border border-primary/20`).
*   **Title Block**: Uses background clipping to fade text (`bg-gradient-to-r from-white to-white/70`).
*   **Comment Block**: Amber tinted italic notes (`text-primary/80 font-medium italic`).
*   **Primary Description (`desc`)**: 
    *   Recessed data block heavily inspired by HUD panels (`bg-black/40 border border-white/5 inset-shadow-sm`).
    *   Labels are ultra-small and aggressive (`text-[10px] font-bold text-white/40 uppercase tracking-widest`).
*   **Extra Fields Grid**: 
    *   Lower priority data sits inside a 2-column grid.
    *   Elements use a subtle `bg-white/5` rounding with `font-mono` text constraints for a programmatic feel. 

### Empty State
*   A ghost center panel containing a glowing `Sparkle` icon housed inside a `w-20 h-20 bg-white/5 border-white/10` ring.
