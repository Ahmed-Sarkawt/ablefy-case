# Design System — ablefy Cabinet (Dashboard)

> Source: 7 authenticated screenshots of `myablefy.com/cabinet`  
> Captured: May 3, 2026  
> Pages covered: Overview · Products · Pages/Themes · Coupons · Marketing Tools · Analytics (Traffic) · Analytics (Interactions)

---

## Overview

The ablefy cabinet is a clean, flat, business-focused SaaS dashboard. It uses a **dark sidebar + white content area** layout, with a single bright green as the only accent color. The UI is minimal, with generous whitespace, consistent border radii, and Inter as the sole typeface throughout.

---

## Color Palette

### Brand / Interactive

| Role | Hex | Where used |
|------|-----|------------|
| **Primary Green** | `#17df87` | CTAs, active nav, active tab underline, form focus, checkmarks, switches, progress, "New" badge, FAB buttons, chart fill |
| **Primary Green Hover** | `#31ee95` (lighter) | Button hover states |
| **Primary Green Active/Click** | `#05ab5b` (darker) | Pressed button states |

### Neutrals

| Role | Hex | Where used |
|------|-----|------------|
| **Sidebar / Dark surface** | `#21282e` | Left sidebar background, dark icon tiles |
| **Primary text** | `#21282e` | Headings, body text, nav labels |
| **Secondary text** | `#6c757d` / `#787878` | Subtitles, helper text, muted labels |
| **Placeholder text** | `#adb5bd` | Input placeholders |
| **Border** | `#d7dadf` | Input borders, card dividers |
| **Background (page)** | `#fafafc` | Main content area background |
| **Background (card)** | `#ffffff` | Cards, panels, modals |
| **Light grey surface** | `#f3f5f8` | Sidebar hover, disabled inputs, step rows |

### Status Colors

| Status | Background | Text / Border |
|--------|-----------|---------------|
| **Success / Active** | `#17df87` | `#21282e` |
| **Warning / Info banner** | `#fff8e6` (amber tint) | `#21282e` + amber border |
| **Error** | `#ff1f39` | `#ffffff` |
| **Neutral / Inactive** | `#f3f5f8` | `#6c757d` |
| **Trial notice** | — (inline text) | `#17df87` green link |

### Data Visualization

| Series | Color |
|--------|-------|
| Traffic / primary line | `#17df87` with soft green fill |
| Axis labels / grid | `#d7dadf` lines, `#adb5bd` labels |
| Tooltip | White bg + `box-shadow` |
| "New" dot | `#17df87` |
| "Same" dot | `#6c757d` |

---

## Typography

### Font Family

**Inter** is used exclusively across the entire cabinet UI — headings, body, labels, buttons, nav, and data.

```css
font-family: "Inter", sans-serif;
```

### Type Scale

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Page title (H1) | 20–24px | 600 | 1.2 | "Overview", "Analytics", "Settings", "Create your coupon code" |
| Section title (H2) | 15–16px | 600 | 1.3 | "Your next steps", "Conversion rate", "Main product details" |
| Card title (H3) | 14–15px | 600 | 1.3 | "Incoming payments", "Traffic", "Views of courses" |
| Body / Label | 13–14px | 400 | 1.5 | Form labels, descriptions, nav items |
| Small / Caption | 11–12px | 400 | 1.5 | Chart axis labels, helper text, timestamps |
| Button | 13–14px | 600 | 1 | All button text |
| Input value | 14px | 400 | 1.5 | Text inside form fields |

### Font Weights in Use

| Weight | Usage |
|--------|-------|
| 400 (Regular) | Body text, descriptions, input values, nav items |
| 500 (Medium) | Secondary labels, badge text |
| 600 (Semibold) | Headings, section titles, button text, active nav items |
| 700 (Bold) | Large metric numbers (e.g. "0", "0,00€") |

---

## Spacing

The layout uses an **8px base grid** consistently throughout.

| Token | Value | Usage |
|-------|-------|-------|
| `space-4` | 4px | Icon gaps, tight inline spacing |
| `space-8` | 8px | Input padding (vertical), small gaps |
| `space-12` | 12px | Form group gaps, list item padding |
| `space-16` | 16px | Card internal padding (compact), nav item padding |
| `space-20` | 20px | Section gaps within cards |
| `space-24` | 24px | Card padding, section gutters |
| `space-32` | 32px | Between major sections |
| `space-40` | 40px | Page-level vertical spacing |
| `space-48` | 48px | Large section separation |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 4px | Checkboxes, small tags |
| `radius-md` | 6–8px | Inputs, dropdowns, table rows |
| `radius-lg` | 12–15px | Cards, panels, modals, alert banners |
| `radius-full` | 9999px | Pills (plan badges), radio buttons, avatar, FAB (Help/Add chart) |
| `radius-icon-tile` | 12px | Marketing tool icon squares (dark bg tiles) |

---

## Elevation & Shadows

| Level | CSS | Used on |
|-------|-----|---------|
| Flat | none | Sidebar, most cards |
| Low | `0 1px 3px rgba(0,0,0,0.08)` | Inline cards, rows |
| Medium | `0 4px 16px rgba(0,0,0,0.10)` | Dropdowns, tooltips |
| High | `0 8px 32px rgba(0,0,0,0.15)` | Modals, overlays |
| FAB | `0 4px 12px rgba(23,223,135,0.35)` | Green floating action buttons |

---

## Layout

### Shell Structure

```
┌─────────────────────────────────────────────────────┐
│  Top bar (fixed, ~48px, white)                      │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│  Sidebar     │  Content area                        │
│  (fixed,     │  (scrollable, #fafafc background)    │
│  ~220px,     │  max-width ~900px, centered          │
│  #21282e)    │  padding: 24–32px                    │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

### Top Bar

- Height: ~48px
- Background: `#ffffff`
- Contents: ablefy logo (left) · trial notice + upgrade link (center) · Seller account button · Bell icon · Avatar circle (right)
- Border-bottom: `1px solid #d7dadf`

### Sidebar

- Width: ~220px
- Background: `#21282e`
- Nav items: Icon (16px) + label, 40px row height, `border-radius: 6px`
- **Active item**: Green text + icon (`#17df87`), subtle green-tinted background or left green bar
- **Hover**: Slightly lighter dark background
- **Section groups**: Accordion-expandable with caret
- **"New" badge**: Small pill, green bg, dark text — sits inline after label
- **Sub-items**: Indented ~16px, 13px, appear on expand

### Content Area

- Background: `#fafafc`
- Padding: `24px` horizontal, `32px` top
- Cards/panels: White `#ffffff`, `border-radius: 12–15px`, subtle shadow or `1px solid #d7dadf` border
- Two-column grid for dashboard widgets (analytics cards, KPI cards)
- Single-column for form pages

---

## Components

### Buttons

**Primary (Green)**
```css
background: #17df87;
color: #21282e;
font-size: 13–14px;
font-weight: 600;
padding: 8px 20px;
border-radius: 8px;
border: none;
```
Examples: "Create", "Update", "Save & close", "Add", "Build your community"

**Secondary / Outline**
```css
background: #ffffff;
color: #21282e;
border: 1px solid #d7dadf;
font-size: 13–14px;
font-weight: 600;
padding: 8px 16px;
border-radius: 8px;
```
Examples: "Seller account", "Back to overview", "Deny", "Customize"

**Pill / Back button**
```css
border-radius: 9999px;
padding: 6px 16px;
```
Used for "Back to overview" in top bar on inner pages.

**Floating Action Button (FAB)**
```css
background: #17df87;
border-radius: 9999px;
padding: 10px 20px;
color: #21282e;
font-weight: 600;
box-shadow: 0 4px 12px rgba(23,223,135,0.35);
position: fixed;
bottom: 20px;
right: 20px;
```
Examples: "Help 🎉", "Add chart", "Create" (on Coupons page)

### Form Fields

**Text Input**
```css
background: #ffffff;
border: 1px solid #d7dadf;
border-radius: 8px;
padding: 8px 12px;
font-size: 14px;
color: #21282e;
height: 36–40px;
/* Focus */
border-color: #17df87;
outline: none;
box-shadow: 0 0 0 3px rgba(23,223,135,0.15);
```

**Label**
```css
font-size: 12–13px;
font-weight: 500;
color: #6c757d;
margin-bottom: 4px;
```
Required fields: asterisk `*` after the label in same color.

**Dropdown / Select**
```css
/* Same visual as text input */
/* Trailing chevron icon, right-aligned */
```

**Date Picker**
```css
/* Same as input + calendar icon on right */
```

### Radio Buttons

- Custom styled: 18px circle
- Inactive: White fill, `1.5px solid #d7dadf` border
- Active: White fill with `#17df87` filled inner circle, `1.5px solid #17df87` border

### Checkboxes

- 16px square, `border-radius: 4px`
- Inactive: White fill, `1.5px solid #d7dadf`
- Active: `#17df87` fill, white checkmark icon, no border

### Tabs (Horizontal)

```css
/* Tab bar */
border-bottom: 1px solid #d7dadf;

/* Tab item */
padding: 8px 0;
margin-right: 24px;
font-size: 13–14px;
font-weight: 400;
color: #6c757d;
cursor: pointer;

/* Active tab */
color: #21282e;
font-weight: 600;
border-bottom: 2px solid #17df87;
margin-bottom: -1px;  /* overlaps bar */
```

Seen on: Analytics (Traffic · Payments · Interactions · Orders · Best sellers · Top customers · Campaigns)

### Cards / Panels

```css
background: #ffffff;
border-radius: 12–15px;
border: 1px solid #e9ecef;   /* or */
box-shadow: 0 1px 3px rgba(0,0,0,0.08);
padding: 20–24px;
```

### Alert / Info Banners

**Warning (amber)**
```css
background: #fff8e6;
border: 1px solid #ffb800;
border-radius: 8px;
padding: 10px 16px;
font-size: 13px;
color: #21282e;
```
Example: "Please add your tax number..." banner at top of Overview

**Info (green)**
```css
background: #d4ffe9;
border: 1px solid #17df87;
border-radius: 8px;
```

### Step List (Onboarding)

- Numbered rows, full-width, white bg, `border-radius: 8px`
- Completed step: Green circle checkmark on right
- Active step: Highlighted row (green-tinted)
- Inactive step: Muted grey text, grey circle indicator

### Badges / Pills

**"New" badge**
```css
background: #17df87;
color: #21282e;
font-size: 11px;
font-weight: 600;
padding: 2px 8px;
border-radius: 9999px;
```

**Plan badges** (Essential 3.0, Advanced 3.0, Pro 3.0)
```css
background: #f3f5f8;
color: #21282e;
font-size: 12px;
font-weight: 500;
padding: 4px 10px;
border-radius: 9999px;
border: 1px solid #d7dadf;
```

### Icon Tiles (Marketing Tools grid)

```css
background: #21282e;
border-radius: 12px;
width: 56–64px;
height: 56–64px;
display: flex;
align-items: center;
justify-content: center;
/* Icon: white, ~24px */
```

### Data Tables / Lists

- Row height: ~44px
- Border: `1px solid #f3f5f8` between rows
- Header: `#f3f5f8` bg, `#6c757d` text, 12px caps or 13px semibold
- Body: White bg, `#21282e` text
- Row actions: Icon buttons (copy, settings ⚙, edit ✎) right-aligned

### Modals

```css
background: #ffffff;
border-radius: 15px;
box-shadow: 0 8px 32px rgba(0,0,0,0.15);
padding: 24–32px;
max-width: 480–560px;
```
Close button: `×` top-right, grey icon

### Tooltips

```css
background: #21282e;
color: #ffffff;
font-size: 12px;
padding: 6px 10px;
border-radius: 6px;
box-shadow: 0 2px 8px rgba(0,0,0,0.15);
```

### Notifications / Toast

- Positioned top-right
- Background matches status type (green/red/yellow)
- `border-radius: 8px`, `box-shadow` medium

---

## Navigation Patterns

### Sidebar Nav Groups

```
Overview
Products           ▾   (expandable)
  ├ Products
  ├ Pages
Market & Sell      ▾
  ├ Coupons
  ├ Marketing tools
  ├ Live stream events
  ├ Content-IDs
  ├ Upsell Funnels
  ├ Order Bumps
  ├ Tracking codes
  ├ Email automations
  └ Webhook
Sales OS           ▾
Payments           ▾
Affiliate          ▾
Customers          ▾
Community          ▾   [New]
Mobile App
Analytics          ▾
Checkout Tools     ▾
Cashout
Logs
Settings
```

### Top Bar (Inner Pages)

Replaces trial notice with: `← Back to overview` pill button + page action buttons (e.g. "Seller account", "Publish" toggle)

---

## Icons

- **Style**: Outline / line icons, 16–20px
- **Sidebar icons**: Monochrome, white (`#ffffff`) normally, green (`#17df87`) when active
- **Feature/Marketing icons**: White on dark (`#21282e`) tile background, ~24px
- **Action icons**: `#6c757d` grey (copy, settings, edit pencil, bell, info circle)
- **Brand logo**: ablefy wordmark with green leaf/arrow icon

---

## Motion

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Sidebar accordion expand/collapse | 200ms | ease-out |
| Tab switch underline | 150ms | ease |
| Button hover bg shift | 150ms | ease |
| Dropdown open | 150ms | ease-out |
| Modal appear | 200ms | ease-out |
| Chart data render | 300–500ms | ease-in-out |
| Page transition | 200ms | ease |

---

## Voice & Copy Patterns

| Element | Pattern | Example |
|---------|---------|---------|
| Page titles | Noun phrase | "Overview", "Analytics", "Settings" |
| Section headers | Action or noun | "Your next steps", "Create your coupon code" |
| CTAs | Action verb | "Create", "Update", "Save & close", "Add", "Build your community" |
| Helper text | Friendly, instructional | "Complete these steps to start selling with ablefy." |
| Labels | Short noun | "Name", "Code", "Unit value", "Valid from" |
| Empty states | Neutral | "No data" |

---

## Accessibility Notes

- Focus states: Green ring (`box-shadow: 0 0 0 3px rgba(23,223,135,0.15)`) on interactive elements
- Required fields: `*` asterisk indicator on labels
- Disabled states: Light grey bg (`#f3f5f8`), reduced opacity text
- Icon-only buttons: Paired with tooltips for context
- ⚠ Green (`#17df87`) on white fails WCAG AA for small text — use `#05ab5b` for text on white backgrounds

---

## Design Do's & Don'ts

**Do:**
- Use `#17df87` for all interactive / active states, focus rings, and primary CTAs
- Keep cards white on a `#fafafc` page background — the contrast grounds the layout
- Use Inter at 13–14px / 400 for all body and label text
- Use `border-radius: 12–15px` for cards, `8px` for inputs and buttons, `9999px` for pills and FABs
- Keep the sidebar strictly `#21282e` — it's the visual anchor of every page
- Use an 8px spacing grid throughout

**Don't:**
- Don't use the green for body text on white — contrast fails AA
- Don't introduce a second accent color — the single green is intentional and distinctive
- Don't use heavy shadows — the design is flat-first with only subtle elevation
- Don't mix border-radius values arbitrarily — stick to the sm/md/lg/full scale
- Don't use font weights above 700 or below 400
- Don't add icons without a text label in the sidebar (accessibility)

---

*Source: Visual analysis of 7 authenticated ablefy cabinet screenshots — Overview, Products, Shop Themes, Coupons, Marketing Tools, Analytics (Traffic), Analytics (Interactions). May 3, 2026.*
