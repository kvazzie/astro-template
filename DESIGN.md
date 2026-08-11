---
version: alpha
name: Quiet Foundation
description: A neutral, accessible system for content-focused Astro projects that should feel deliberate before they acquire a brand.
colors:
  light-base-100: "#FAFAFA"
  light-base-200: "#F4F4F5"
  light-base-300: "#E4E4E7"
  light-base-content: "#18181B"
  light-primary: "#1D4ED8"
  light-primary-content: "#FFFFFF"
  light-secondary: "#475569"
  light-secondary-content: "#FFFFFF"
  light-accent: "#0F766E"
  light-accent-content: "#FFFFFF"
  light-neutral: "#27272A"
  light-neutral-content: "#FAFAFA"
  light-info: "#0369A1"
  light-info-content: "#FFFFFF"
  light-success: "#15803D"
  light-success-content: "#FFFFFF"
  light-warning: "#A16207"
  light-warning-content: "#FFFFFF"
  light-error: "#B91C1C"
  light-error-content: "#FFFFFF"
  dark-base-100: "#18181B"
  dark-base-200: "#27272A"
  dark-base-300: "#3F3F46"
  dark-base-content: "#FAFAFA"
  dark-primary: "#93C5FD"
  dark-primary-content: "#172554"
  dark-secondary: "#CBD5E1"
  dark-secondary-content: "#1E293B"
  dark-accent: "#5EEAD4"
  dark-accent-content: "#134E4A"
  dark-neutral: "#E4E4E7"
  dark-neutral-content: "#27272A"
  dark-info: "#7DD3FC"
  dark-info-content: "#0C4A6E"
  dark-success: "#86EFAC"
  dark-success-content: "#14532D"
  dark-warning: "#FDE047"
  dark-warning-content: "#713F12"
  dark-error: "#FCA5A5"
  dark-error-content: "#7F1D1D"
typography:
  display:
    fontFamily: system-ui
    fontSize: 48px
    fontWeight: 650
    lineHeight: 1.08
    letterSpacing: -0.035em
  heading:
    fontFamily: system-ui
    fontSize: 32px
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: -0.025em
  body:
    fontFamily: system-ui
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0em
  label:
    fontFamily: system-ui
    fontSize: 14px
    fontWeight: 550
    lineHeight: 1.4
    letterSpacing: 0em
rounded:
  none: 0px
  control-selector: 4px
  control-field: 6px
  container-box: 10px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  selector-unit: 4px
  field-unit: 4px
  border: 1px
  focus-ring: 2px
  focus-offset: 3px
  daisy-depth: 0
  daisy-noise: 0
  reading-max: 720px
  content-max: 1200px
components:
  button:
    backgroundColor: "{colors.light-primary}"
    textColor: "{colors.light-primary-content}"
    typography: "{typography.label}"
    rounded: "{rounded.control-field}"
    height: 44px
    padding: 16px
  card:
    backgroundColor: "{colors.light-base-100}"
    textColor: "{colors.light-base-content}"
    rounded: "{rounded.container-box}"
    padding: 24px
  input:
    backgroundColor: "{colors.light-base-100}"
    textColor: "{colors.light-base-content}"
    rounded: "{rounded.control-field}"
    height: 44px
    padding: 12px
---

# Quiet Foundation

## Intent

This system is intentionally neutral. It gives a new project accessible defaults,
clear semantic roles, and a restrained rhythm without pretending that the final
brand already exists. Replace the values here as product decisions become real;
do not bypass the system with raw values in components.

## Color

Components use DaisyUI semantic classes. Raw palette variables belong in this
file only. Light and dark themes are specified independently so neither theme is
an algorithmic afterthought.

- `base-*` defines page and layered surfaces.
- `primary` is the main action and focus color.
- `secondary` supports lower-priority actions.
- `accent` marks scarce emphasis, not a competing primary action.
- `info`, `success`, `warning`, and `error` communicate state and always include
  text or another non-color signal.

Every foreground/background pair must meet WCAG AA contrast for its intended text
size. Never use opacity to rescue an otherwise invalid text color.

## Typography

Use the system sans stack. It avoids network requests and gives a generated
project a clean first commit with no font assets to remove. Product typography is
an explicit later decision. Headings are compact and moderately weighted; body
copy prioritizes reading comfort.

## Layout

Prefer a centered content region, a `720px` reading measure, and spacing from the
token scale. Start with document structure and content hierarchy before adding
cards or navigation chrome. Responsive layouts should collapse because their
content relationships demand it, not at arbitrary device names.

## Depth, shape, and motion

The baseline is quiet and nearly flat: one-pixel borders, modest radii, no noise,
and no decorative shadows. Motion must explain state change, remain brief, and
respect `prefers-reduced-motion`. ClientRouter scripts must initialize through
Astro lifecycle events and remain idempotent.

## Components

Use DaisyUI components through semantic classes and customize them through these
tokens. Keep controls at least `44px` high. Focus is always visible. A card is for
a genuinely discrete object, not the default wrapper for every section.

## Do and do not

- Do use translation keys for interface copy and metadata.
- Do preserve semantic HTML before adding ARIA.
- Do make keyboard, contrast, loading, empty, and error states deliberate.
- Do add a token here before introducing a repeated visual value.
- Do not add gradients, glass effects, oversized pills, or ornamental animation
  without a product-specific reason.
- Do not hardcode colors in Astro components.
- Do not make the template's neutral page look like a finished brand.
