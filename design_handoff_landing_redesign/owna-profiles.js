/**
 * Data + renderer lifted from the OWNA codebase so the landing page can show
 * real profiles instead of screenshots.
 *
 *  - PRESETS      mirrors lib/themes/presets.ts (values copied verbatim)
 *  - demoProfiles mirrors lib/demo-profiles.ts
 *  - renderProfile is a port of components/public/profile-renderer.tsx plus
 *    app/profile.css, with every custom property resolved to a literal so it
 *    needs no stylesheet.
 */

export const FONT_STACKS = {
  inter: '"Inter", system-ui, sans-serif',
  geist: '"Geist", system-ui, sans-serif',
  sora: '"Sora", system-ui, sans-serif',
  outfit: '"Outfit", system-ui, sans-serif',
  "space-grotesk": '"Space Grotesk", system-ui, sans-serif',
  "plus-jakarta-sans": '"Plus Jakarta Sans", system-ui, sans-serif',
  bricolage: '"Bricolage Grotesque", system-ui, sans-serif',
  playfair: '"Playfair Display", Georgia, serif',
  "instrument-serif": '"Instrument Serif", Georgia, serif',
  "jetbrains-mono": '"JetBrains Mono", ui-monospace, monospace',
};

export const FONT_LABELS = {
  inter: "Inter",
  geist: "Geist",
  sora: "Sora",
  outfit: "Outfit",
  "space-grotesk": "Space Grotesk",
  "plus-jakarta-sans": "Plus Jakarta Sans",
  bricolage: "Bricolage Grotesque",
  playfair: "Playfair Display",
  "instrument-serif": "Instrument Serif",
  "jetbrains-mono": "JetBrains Mono",
};

const TYPE_RAMP = { xs: 0.75, sm: 0.875, base: 1, lg: 1.125, xl: 1.375, "2xl": 1.75, "3xl": 2.25, "4xl": 3 };

const SHADOWS = {
  none: "none",
  soft: "0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -12px rgb(0 0 0 / 0.12)",
  medium: "0 2px 4px rgb(0 0 0 / 0.06), 0 16px 40px -16px rgb(0 0 0 / 0.20)",
  hard: "0 4px 0 0 currentColor",
};

export const LAYOUT_WIDTHS = { narrow: "34rem", default: "42rem", wide: "56rem", full: "100%" };

export const PRESETS = {
  minimal: {
    name: "Minimal",
    description: "White space, quiet type, nothing shouting.",
    theme: {
      colors: { background: "#ffffff", foreground: "#18181b", muted: "#71717a", accent: "#2563eb", accentForeground: "#ffffff", card: "#fafafa", cardForeground: "#18181b", border: "#e4e4e7", button: "#18181b", buttonForeground: "#ffffff" },
      typography: { headingFont: "inter", bodyFont: "inter", scale: 1, headingWeight: "600" },
      radius: { base: 10, button: 10, image: 12, card: 14, avatar: "circle" },
      spacing: { padding: 24, block: 28, section: 64 },
      background: { kind: "solid" },
      effects: { shadow: "none", cardBorder: true, glass: false },
    },
    layout: { width: "default", align: "center", style: "stack" },
  },
  dark: {
    name: "Dark",
    description: "Near-black canvas with a cool blue accent.",
    theme: {
      colors: { background: "#0a0a0b", foreground: "#fafafa", muted: "#a1a1aa", accent: "#60a5fa", accentForeground: "#0a0a0b", card: "#161618", cardForeground: "#fafafa", border: "#27272a", button: "#fafafa", buttonForeground: "#0a0a0b" },
      typography: { headingFont: "geist", bodyFont: "geist", scale: 1.05, headingWeight: "700" },
      radius: { base: 12, button: 12, image: 14, card: 18, avatar: "circle" },
      spacing: { padding: 24, block: 28, section: 64 },
      background: { kind: "solid" },
      effects: { shadow: "soft", cardBorder: true, glass: false },
    },
    layout: { width: "default", align: "center", style: "card" },
  },
  glass: {
    name: "Glass",
    description: "Frosted cards floating over a deep gradient.",
    theme: {
      colors: { background: "#2e1065", foreground: "#f5f3ff", muted: "#c4b5fd", accent: "#a78bfa", accentForeground: "#1e1b4b", card: "#4c1d95", cardForeground: "#f5f3ff", border: "#7c3aed", button: "#f5f3ff", buttonForeground: "#2e1065" },
      typography: { headingFont: "outfit", bodyFont: "outfit", scale: 1.05, headingWeight: "600" },
      radius: { base: 18, button: 999, image: 18, card: 24, avatar: "circle" },
      spacing: { padding: 24, block: 24, section: 72 },
      background: { kind: "gradient", from: "#4c1d95", to: "#1e1b4b", angle: 165 },
      effects: { shadow: "medium", cardBorder: true, glass: true },
    },
    layout: { width: "default", align: "center", style: "card" },
  },
  retro: {
    name: "Retro",
    description: "Warm paper, heavy borders, offset shadows.",
    theme: {
      colors: { background: "#f5ecd7", foreground: "#3b2412", muted: "#8a6a4a", accent: "#c2410c", accentForeground: "#fff7ed", card: "#fffaf0", cardForeground: "#3b2412", border: "#3b2412", button: "#c2410c", buttonForeground: "#fff7ed" },
      typography: { headingFont: "space-grotesk", bodyFont: "plus-jakarta-sans", scale: 1.05, headingWeight: "700", letterSpacing: -0.03 },
      radius: { base: 4, button: 4, image: 4, card: 6, avatar: "square" },
      spacing: { padding: 24, block: 26, section: 56 },
      background: { kind: "pattern", pattern: "diagonal", opacity: 8 },
      effects: { shadow: "hard", cardBorder: true, glass: false },
    },
    layout: { width: "default", align: "left", style: "card" },
  },
  cyber: {
    name: "Cyber",
    description: "Terminal black with an electric cyan edge.",
    theme: {
      colors: { background: "#05060a", foreground: "#e2e8f0", muted: "#64748b", accent: "#22d3ee", accentForeground: "#05060a", card: "#0b0f18", cardForeground: "#e2e8f0", border: "#1e293b", button: "#22d3ee", buttonForeground: "#05060a" },
      typography: { headingFont: "jetbrains-mono", bodyFont: "jetbrains-mono", scale: 0.95, headingWeight: "700", letterSpacing: -0.01 },
      radius: { base: 2, button: 2, image: 2, card: 4, avatar: "square" },
      spacing: { padding: 20, block: 22, section: 48 },
      background: { kind: "pattern", pattern: "grid", opacity: 10 },
      effects: { shadow: "none", cardBorder: true, glass: false },
    },
    layout: { width: "default", align: "left", style: "stack" },
  },
  editorial: {
    name: "Editorial",
    description: "Serif headlines, generous measure, magazine calm.",
    theme: {
      colors: { background: "#faf9f7", foreground: "#1c1917", muted: "#78716c", accent: "#7c2d12", accentForeground: "#fef3c7", card: "#f5f4f1", cardForeground: "#1c1917", border: "#e7e5e4", button: "#1c1917", buttonForeground: "#faf9f7" },
      typography: { headingFont: "playfair", bodyFont: "plus-jakarta-sans", scale: 1.15, headingWeight: "700", letterSpacing: -0.02 },
      radius: { base: 2, button: 2, image: 2, card: 4, avatar: "rounded" },
      spacing: { padding: 28, block: 34, section: 80 },
      background: { kind: "solid" },
      effects: { shadow: "none", cardBorder: false, glass: false },
    },
    layout: { width: "wide", align: "left", style: "stack" },
  },
  soft: {
    name: "Soft",
    description: "Pastel lilac, rounded everything, gentle depth.",
    theme: {
      colors: { background: "#f6f3ff", foreground: "#2e2a3d", muted: "#6d6885", accent: "#6151d8", accentForeground: "#ffffff", card: "#ffffff", cardForeground: "#2e2a3d", border: "#e6e1fb", button: "#6151d8", buttonForeground: "#ffffff" },
      typography: { headingFont: "plus-jakarta-sans", bodyFont: "plus-jakarta-sans", scale: 1, headingWeight: "700" },
      radius: { base: 20, button: 999, image: 22, card: 26, avatar: "circle" },
      spacing: { padding: 24, block: 24, section: 64 },
      background: { kind: "solid" },
      effects: { shadow: "soft", cardBorder: false, glass: false },
    },
    layout: { width: "default", align: "center", style: "card" },
  },
  colorful: {
    name: "Colorful",
    description: "Cream and hot pink, loud on purpose.",
    theme: {
      colors: { background: "#fffbeb", foreground: "#18181b", muted: "#78716c", accent: "#db2777", accentForeground: "#ffffff", card: "#ffffff", cardForeground: "#18181b", border: "#fde68a", button: "#db2777", buttonForeground: "#ffffff" },
      typography: { headingFont: "bricolage", bodyFont: "outfit", scale: 1.15, headingWeight: "800", letterSpacing: -0.04 },
      radius: { base: 16, button: 999, image: 20, card: 24, avatar: "circle" },
      spacing: { padding: 24, block: 26, section: 64 },
      background: { kind: "pattern", pattern: "dots", opacity: 14 },
      effects: { shadow: "medium", cardBorder: false, glass: false },
    },
    layout: { width: "default", align: "center", style: "card" },
  },
  professional: {
    name: "Professional",
    description: "Navy on white. Reads well on a recruiter's laptop.",
    theme: {
      colors: { background: "#ffffff", foreground: "#0f172a", muted: "#64748b", accent: "#1e40af", accentForeground: "#ffffff", card: "#f8fafc", cardForeground: "#0f172a", border: "#e2e8f0", button: "#1e40af", buttonForeground: "#ffffff" },
      typography: { headingFont: "inter", bodyFont: "inter", scale: 0.98, headingWeight: "600" },
      radius: { base: 6, button: 6, image: 8, card: 10, avatar: "rounded" },
      spacing: { padding: 24, block: 24, section: 56 },
      background: { kind: "solid" },
      effects: { shadow: "none", cardBorder: true, glass: false },
    },
    layout: { width: "narrow", align: "left", style: "stack" },
  },
  portfolio: {
    name: "Portfolio",
    description: "Charcoal grid built to put work first.",
    theme: {
      colors: { background: "#101014", foreground: "#f4f4f5", muted: "#8b8b93", accent: "#a3e635", accentForeground: "#101014", card: "#1a1a20", cardForeground: "#f4f4f5", border: "#2a2a32", button: "#a3e635", buttonForeground: "#101014" },
      typography: { headingFont: "sora", bodyFont: "inter", scale: 1.05, headingWeight: "700", letterSpacing: -0.03 },
      radius: { base: 10, button: 8, image: 10, card: 14, avatar: "rounded" },
      spacing: { padding: 28, block: 32, section: 72 },
      background: { kind: "solid" },
      effects: { shadow: "soft", cardBorder: true, glass: false },
    },
    layout: { width: "wide", align: "left", style: "grid" },
  },
};

export const PRESET_ORDER = ["minimal", "dark", "glass", "retro", "cyber", "editorial", "soft", "colorful", "professional", "portfolio"];

export const BLOCK_META = {
  hero: { label: "Hero", description: "Your photo, name and one line about you.", group: "You" },
  text: { label: "Text", description: "A heading and a paragraph.", group: "Content" },
  social: { label: "Social links", description: "Icons for the platforms you're on.", group: "Content" },
  links: { label: "Links", description: "Buttons pointing anywhere you like.", group: "Content" },
  projects: { label: "Projects", description: "Cards for the things you've made.", group: "Content" },
  image: { label: "Image", description: "A single picture, optionally linked.", group: "Media" },
  gallery: { label: "Gallery", description: "A grid of images.", group: "Media" },
  embed: { label: "Embed", description: "A Spotify or YouTube player.", group: "Media" },
  divider: { label: "Divider", description: "A line or a gap.", group: "Structure" },
};

/* Lucide 1.33.0 (ISC) node data, copied from node_modules/lucide-react. */
export const LUCIDE = {
  "user-round": [["circle", { cx: 12, cy: 8, r: 5 }], ["path", { d: "M20 21a8 8 0 0 0-16 0" }]],
  type: [["path", { d: "M12 4v16" }], ["path", { d: "M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" }], ["path", { d: "M9 20h6" }]],
  "at-sign": [["circle", { cx: 12, cy: 12, r: 4 }], ["path", { d: "M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" }]],
  "link-2": [["path", { d: "M9 17H7A5 5 0 0 1 7 7h2" }], ["path", { d: "M15 7h2a5 5 0 1 1 0 10h-2" }], ["line", { x1: 8, x2: 16, y1: 12, y2: 12 }]],
  "layout-grid": [["rect", { width: 7, height: 7, x: 3, y: 3, rx: 1 }], ["rect", { width: 7, height: 7, x: 14, y: 3, rx: 1 }], ["rect", { width: 7, height: 7, x: 14, y: 14, rx: 1 }], ["rect", { width: 7, height: 7, x: 3, y: 14, rx: 1 }]],
  image: [["rect", { width: 18, height: 18, x: 3, y: 3, rx: 2, ry: 2 }], ["circle", { cx: 9, cy: 9, r: 2 }], ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }]],
  images: [["path", { d: "m22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16" }], ["path", { d: "M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2" }], ["circle", { cx: 13, cy: 7, r: 1, fill: "currentColor" }], ["rect", { x: 8, y: 2, width: 14, height: 14, rx: 2 }]],
  play: [["path", { d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" }]],
  minus: [["path", { d: "M5 12h14" }]],
  plus: [["path", { d: "M5 12h14" }], ["path", { d: "M12 5v14" }]],
  check: [["path", { d: "M20 6 9 17l-5-5" }]],
  "arrow-up-right": [["path", { d: "M7 7h10v10" }], ["path", { d: "M7 17 17 7" }]],
  "map-pin": [["path", { d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" }], ["circle", { cx: 12, cy: 10, r: 3 }]],
  "grip-vertical": [["circle", { cx: 9, cy: 12, r: 1 }], ["circle", { cx: 9, cy: 5, r: 1 }], ["circle", { cx: 9, cy: 19, r: 1 }], ["circle", { cx: 15, cy: 12, r: 1 }], ["circle", { cx: 15, cy: 5, r: 1 }], ["circle", { cx: 15, cy: 19, r: 1 }]],
  monitor: [["rect", { width: 20, height: 14, x: 2, y: 3, rx: 2 }], ["line", { x1: 8, x2: 16, y1: 21, y2: 21 }], ["line", { x1: 12, x2: 12, y1: 17, y2: 21 }]],
  smartphone: [["rect", { width: 14, height: 20, x: 5, y: 2, rx: 2, ry: 2 }], ["path", { d: "M12 18h.01" }]],
  "shield-check": [["path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" }], ["path", { d: "m9 12 2 2 4-4" }]],
  lock: [["rect", { width: 18, height: 11, x: 3, y: 11, rx: 2, ry: 2 }], ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4" }]],
  globe: [["circle", { cx: 12, cy: 12, r: 10 }], ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" }], ["path", { d: "M2 12h20" }]],
  mail: [["path", { d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" }], ["rect", { x: 2, y: 4, width: 20, height: 16, rx: 2 }]],
  "chevron-down": [["path", { d: "m6 9 6 6 6-6" }]],
};

export const BLOCK_ICON = {
  hero: "user-round", text: "type", social: "at-sign", links: "link-2",
  projects: "layout-grid", image: "image", gallery: "images", embed: "play", divider: "minus",
};

/** Simple Icons (CC0-1.0) glyphs, as committed in components/icons/social-icons.tsx. */
export const SOCIAL_PATHS = {
  instagram: "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077",
  github: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  dribbble: "M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z",
};

export const LINKEDIN_NODE = [
  ["circle", { cx: 4.2, cy: 4, r: 2.4 }],
  ["rect", { x: 2.1, y: 8.6, width: 4.2, height: 12.4, rx: 0.3 }],
  ["path", { d: "M9.2 8.6h4v1.9c.93-1.42 2.5-2.2 4.24-2.2 3.38 0 5.56 2.2 5.56 6.2V21h-4.2v-5.9c0-2-.86-3.2-2.6-3.2-1.75 0-2.8 1.18-2.8 3.2V21h-4.2z" }],
];

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

function alphaHex(percent) {
  return Math.round((clamp(percent, 0, 100) / 100) * 255).toString(16).padStart(2, "0");
}
function withAlpha(hex, percent) {
  const base = hex.length === 9 ? hex.slice(0, 7) : hex;
  return `${base}${alphaHex(percent)}`;
}

const PATTERN_SIZES = { dots: "16px 16px", grid: "24px 24px", diagonal: "14px 14px", noise: "7px 7px, 13px 13px" };
function patternImage(pattern, color) {
  switch (pattern) {
    case "dots": return `radial-gradient(${color} 1px, transparent 1px)`;
    case "grid": return `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`;
    case "diagonal": return `repeating-linear-gradient(45deg, ${color} 0 1px, transparent 1px 10px)`;
    default: return `radial-gradient(${color} 0.5px, transparent 0.5px), radial-gradient(${color} 0.5px, transparent 0.5px)`;
  }
}

/** A preset id (or explicit theme/layout) resolved into literal render values. */
export function resolveTheme(theme, layout) {
  const { colors, typography: ty, radius, spacing, background, effects } = theme;
  const scale = ty.scale ?? 1;
  const text = {};
  for (const [name, rem] of Object.entries(TYPE_RAMP)) {
    const weighted = name === "xs" || name === "sm" || name === "base" ? 1 + (scale - 1) * 0.4 : scale;
    text[name] = `${(rem * weighted).toFixed(4)}rem`;
  }

  let pageBg = colors.background;
  let pageImage = "none";
  let pageSize = "auto";
  if (background.kind === "gradient") {
    pageBg = background.from;
    pageImage = `linear-gradient(${background.angle}deg, ${background.from}, ${background.to})`;
    pageSize = "cover";
  } else if (background.kind === "pattern") {
    pageImage = patternImage(background.pattern, withAlpha(colors.foreground, background.opacity));
    pageSize = PATTERN_SIZES[background.pattern];
  } else if (background.kind === "image" && background.url) {
    pageImage = `linear-gradient(${withAlpha(colors.background, background.overlay)}, ${withAlpha(colors.background, background.overlay)}), url("${background.url}")`;
    pageSize = "cover";
  }

  return {
    c: colors,
    text,
    fontHeading: FONT_STACKS[ty.headingFont] ?? FONT_STACKS.inter,
    fontBody: FONT_STACKS[ty.bodyFont] ?? FONT_STACKS.inter,
    weightHeading: ty.headingWeight ?? "600",
    weightBody: ty.bodyWeight ?? "400",
    trackingHeading: `${ty.letterSpacing ?? 0}em`,
    radius,
    radiusAvatar: radius.avatar === "circle" ? "9999px" : radius.avatar === "rounded" ? `${radius.image}px` : "0px",
    spacing,
    shadow: SHADOWS[effects.shadow],
    cardBorder: effects.cardBorder ? "1px" : "0px",
    cardBg: effects.glass ? withAlpha(colors.card, 55) : colors.card,
    cardBlur: effects.glass ? "12px" : "0px",
    width: LAYOUT_WIDTHS[layout.width],
    align: layout.align === "center" ? "center" : "left",
    items: layout.align === "center" ? "center" : "flex-start",
    pageBg, pageImage, pageSize,
  };
}

function icon(React, name, size, extra) {
  const nodes = LUCIDE[name] || [];
  return React.createElement(
    "svg",
    { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", width: size, height: size, "aria-hidden": true, style: { flexShrink: 0, ...(extra || {}) } },
    nodes.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs })),
  );
}

function socialIcon(React, platform, size) {
  if (platform === "linkedin") {
    return React.createElement(
      "svg",
      { viewBox: "0 0 24 24", fill: "currentColor", width: size, height: size, "aria-hidden": true },
      LINKEDIN_NODE.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs })),
    );
  }
  if (platform === "email") return icon(React, "mail", size);
  const d = SOCIAL_PATHS[platform];
  if (!d) return icon(React, "globe", size);
  return React.createElement(
    "svg",
    { viewBox: "0 0 24 24", fill: "currentColor", width: size, height: size, "aria-hidden": true },
    React.createElement("path", { d }),
  );
}

const KNOWN_PLATFORMS = ["instagram", "x", "linkedin", "github", "youtube", "discord", "tiktok", "facebook", "twitch", "dribbble", "behance", "website", "email"];
const AVATAR_PX = { sm: 64, md: 96, lg: 132 };
const ICON_EM = { sm: "1rem", md: "1.15rem", lg: "1.35rem" };
const SOCIAL_BOX = { sm: 36, md: 44, lg: 52 };
const BTN_PAD = { sm: "0.55em 0.9em", md: "0.75em 1.1em", lg: "0.95em 1.4em" };

function heading(t, extra) {
  return { fontFamily: t.fontHeading, fontWeight: t.weightHeading, letterSpacing: t.trackingHeading, lineHeight: 1.15, margin: 0, ...extra };
}

function renderBlock(React, block, t, ctx) {
  const p = block.props;
  const key = block.id;

  if (block.type === "hero") {
    const alignSelf = p.align === "left" ? "flex-start" : "center";
    const children = [];
    if (p.showAvatar !== false && p.avatarUrl) {
      children.push(React.createElement("img", {
        key: "av", src: p.avatarUrl, alt: "", width: AVATAR_PX[p.avatarSize || "md"], height: AVATAR_PX[p.avatarSize || "md"],
        style: { width: AVATAR_PX[p.avatarSize || "md"], height: AVATAR_PX[p.avatarSize || "md"], borderRadius: t.radiusAvatar, objectFit: "cover", border: `${t.cardBorder} solid ${t.c.border}` },
      }));
    }
    children.push(React.createElement("div", { key: "nm", style: { display: "flex", flexDirection: "column", gap: 6 } }, [
      React.createElement("h1", { key: "h", style: heading(t, { fontSize: t.text["3xl"] }) }, p.headline || ctx.profile.displayName || ctx.profile.username),
      p.showUsername === false ? null : React.createElement("p", { key: "u", style: { color: t.c.muted, fontSize: t.text.sm, margin: 0 } }, `@${ctx.profile.username}`),
    ]));
    if (p.tagline) children.push(React.createElement("p", { key: "tg", style: { fontSize: t.text.lg, color: t.c.muted, margin: 0 } }, p.tagline));
    if (p.bio) children.push(React.createElement("p", { key: "b", style: { fontSize: t.text.base, maxWidth: "46ch", margin: 0, whiteSpace: "pre-wrap" } }, p.bio));
    if (p.status || p.location) {
      children.push(React.createElement("div", { key: "m", style: { display: "flex", flexWrap: "wrap", gap: "8px 14px", fontSize: t.text.sm, color: t.c.muted, alignItems: "center" } }, [
        p.status ? React.createElement("span", { key: "s", style: { display: "inline-flex", alignItems: "center", gap: "0.45em", padding: "0.3em 0.7em", borderRadius: 999, border: `1px solid ${t.c.border}`, fontSize: t.text.xs } }, [
          React.createElement("span", { key: "d", style: { width: 8, height: 8, borderRadius: 999, background: t.c.accent, display: "inline-block" } }),
          p.status,
        ]) : null,
        p.location ? React.createElement("span", { key: "l", style: { display: "inline-flex", alignItems: "center", gap: 6 } }, [icon(React, "map-pin", 14), p.location]) : null,
      ]));
    }
    return React.createElement("header", { key, style: { display: "flex", flexDirection: "column", gap: 14, alignItems: alignSelf, minWidth: 0 } }, children);
  }

  if (block.type === "text") {
    return React.createElement("section", { key, style: { minWidth: 0, color: p.tone === "muted" ? t.c.muted : p.tone === "accent" ? t.c.accent : undefined } }, [
      p.heading ? React.createElement("h2", { key: "h", style: heading(t, { fontSize: t.text.xl, marginBottom: "0.75em" }) }, p.heading) : null,
      p.body ? React.createElement("p", { key: "b", style: { whiteSpace: "pre-wrap", maxWidth: "62ch", margin: 0, marginInline: t.align === "center" ? "auto" : undefined, fontSize: t.text[p.size === "sm" ? "sm" : p.size === "lg" ? "lg" : "base"] } }, p.body) : null,
    ]);
  }

  if (block.type === "links") {
    const items = (p.items || []).filter((i) => i.label);
    if (!items.length) return null;
    return React.createElement("section", { key, style: { minWidth: 0 } }, [
      p.heading ? React.createElement("h2", { key: "h", style: heading(t, { fontSize: t.text.xl, marginBottom: "0.75em" }) }, p.heading) : null,
      React.createElement("ul", { key: "u", style: { display: "flex", flexDirection: "column", gap: 10, listStyle: "none", margin: 0, padding: 0 } },
        items.map((item, i) => React.createElement("li", { key: item.id || i },
          React.createElement("div", {
            style: {
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.6em", width: "100%", textAlign: "left",
              borderRadius: t.radius.button, fontWeight: 500, padding: BTN_PAD[p.size || "md"], fontSize: t.text[p.size === "sm" ? "sm" : p.size === "lg" ? "lg" : "base"],
              border: "1px solid transparent",
              background: p.style === "solid" ? t.c.button : p.style === "card" ? t.cardBg : "transparent",
              color: p.style === "solid" ? t.c.buttonForeground : p.style === "card" ? t.c.cardForeground : "inherit",
              borderColor: p.style === "outline" || p.style === "card" ? t.c.border : "transparent",
              boxShadow: p.style === "card" ? t.shadow : undefined,
            },
          }, [
            React.createElement("span", { key: "t", style: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 } }, [
              React.createElement("span", { key: "l", style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, item.label),
              item.description ? React.createElement("span", { key: "d", style: { fontSize: t.text.xs, opacity: 0.7, fontWeight: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, item.description) : null,
            ]),
            p.showArrow === false ? null : icon(React, "arrow-up-right", 16, { opacity: 0.6 }),
          ]),
        )),
      ),
    ]);
  }

  if (block.type === "social") {
    const links = (p.links || []).map((l) => ({ ...l, platform: KNOWN_PLATFORMS.includes(l.platform) ? l.platform : "website" }));
    if (!links.length) return null;
    const box = SOCIAL_BOX[p.size || "md"];
    return React.createElement("nav", { key, style: { minWidth: 0 } }, [
      p.heading ? React.createElement("h2", { key: "h", style: heading(t, { fontSize: t.text.xl, marginBottom: "0.75em" }) }, p.heading) : null,
      React.createElement("ul", { key: "u", style: { display: "flex", gap: 10, flexWrap: "wrap", listStyle: "none", margin: 0, padding: 0, justifyContent: t.align === "center" ? "center" : "flex-start" } },
        links.map((l, i) => React.createElement("li", { key: l.id || i },
          React.createElement("span", {
            style: {
              display: "inline-flex", alignItems: "center", justifyContent: "center", width: box, height: box,
              border: `1px solid ${t.c.border}`, color: "inherit",
              borderRadius: p.shape === "circle" ? 999 : p.shape === "rounded" ? t.radius.button : 0,
              fontSize: ICON_EM[p.size || "md"],
            },
          }, socialIcon(React, l.platform, "1em")),
        )),
      ),
    ]);
  }

  if (block.type === "projects") {
    const items = (p.items || []).filter((i) => i.name);
    if (!items.length) return null;
    const cols = ctx.narrow ? 1 : Math.min(p.columns || 2, 3);
    const ratio = { "16:9": "16 / 9", "4:3": "4 / 3", "1:1": "1 / 1", none: undefined }[p.imageRatio || "16:9"];
    return React.createElement("section", { key, style: { minWidth: 0 } }, [
      p.heading ? React.createElement("h2", { key: "h", style: heading(t, { fontSize: t.text.xl, marginBottom: "0.75em" }) }, p.heading) : null,
      React.createElement("div", { key: "g", style: { display: "grid", gap: 16, gridTemplateColumns: p.layout === "list" ? "1fr" : `repeat(${cols}, minmax(0, 1fr))` } },
        items.map((item, i) => React.createElement("div", {
          key: item.id || i,
          style: { display: "flex", flexDirection: "column", gap: 10, padding: 14, borderRadius: t.radius.card, border: `${t.cardBorder} solid ${t.c.border}`, background: t.cardBg, color: t.c.cardForeground, boxShadow: t.shadow, textAlign: "left" },
        }, [
          ratio && item.imageUrl ? React.createElement("div", { key: "m", style: { width: "100%", aspectRatio: ratio, borderRadius: t.radius.image * 0.8, overflow: "hidden", background: "rgba(128,128,128,0.12)" } },
            React.createElement("img", { src: item.imageUrl, alt: item.name, loading: "lazy", style: { width: "100%", height: "100%", objectFit: "cover", display: "block" } })) : null,
          React.createElement("h3", { key: "n", style: heading(t, { fontSize: t.text.lg }) }, item.name),
          p.showDescription !== false && item.description ? React.createElement("p", { key: "d", style: { fontSize: t.text.sm, color: t.c.muted, margin: 0 } }, item.description) : null,
          p.showTags !== false && (item.tags || []).length ? React.createElement("ul", { key: "t", style: { display: "flex", flexWrap: "wrap", gap: 6, listStyle: "none", margin: 0, padding: 0 } },
            item.tags.map((tag) => React.createElement("li", { key: tag, style: { fontSize: t.text.xs, padding: "0.25em 0.6em", borderRadius: 999, background: withAlpha(t.c.accent, 14), color: t.c.accent } }, tag))) : null,
        ])),
      ),
    ]);
  }

  if (block.type === "gallery") {
    const all = (p.images || []).filter((i) => i.url);
    const isBento = p.layout === "bento";
    const images = isBento ? all.slice(0, 6) : all;
    if (!images.length) return null;
    const gap = p.gap ?? 8;
    const cols = ctx.narrow ? 2 : p.columns || 3;
    const wrapStyle = isBento
      ? { display: "grid", gap, gridAutoFlow: "dense", gridTemplateColumns: `repeat(${ctx.narrow ? 2 : 4}, minmax(0, 1fr))`, gridAutoRows: `${(ctx.contentWidth - (ctx.narrow ? 1 : 3) * gap) / (ctx.narrow ? 2 : 4)}px`, listStyle: "none", margin: 0, padding: 0 }
      : p.layout === "masonry"
        ? { columns: cols, columnGap: gap, listStyle: "none", margin: 0, padding: 0 }
        : { display: "grid", gap, gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, listStyle: "none", margin: 0, padding: 0 };

    return React.createElement("section", { key, style: { minWidth: 0 } }, [
      p.heading ? React.createElement("h2", { key: "h", style: heading(t, { fontSize: t.text.xl, marginBottom: "0.75em" }) }, p.heading) : null,
      React.createElement("ul", { key: "g", style: wrapStyle }, images.map((im, i) => {
        const span = isBento ? { square: { c: 1, r: 1 }, landscape: { c: 2, r: 1 }, portrait: { c: 1, r: 2 } }[im.shape] : null;
        const itemStyle = { minWidth: 0, minHeight: 0 };
        if (isBento) {
          const one = images.length === 1;
          itemStyle.gridColumn = `span ${one ? 2 : span.c}`;
          itemStyle.gridRow = `span ${one ? 2 : span.r}`;
        } else if (p.layout === "masonry") {
          itemStyle.breakInside = "avoid";
          itemStyle.marginBottom = gap;
        } else {
          itemStyle.aspectRatio = "1 / 1";
        }
        return React.createElement("li", { key: im.id || i, style: itemStyle }, [
          React.createElement("img", { key: "i", src: im.url, alt: im.alt || "", loading: "lazy", style: { width: "100%", height: p.layout === "masonry" ? "auto" : "100%", objectFit: "cover", display: "block", borderRadius: t.radius.image } }),
          p.showCaptions && im.caption ? React.createElement("p", { key: "c", style: { marginTop: "0.6em", fontSize: t.text.sm, color: t.c.muted } }, im.caption) : null,
        ]);
      })),
    ]);
  }

  if (block.type === "image" && p.url) {
    return React.createElement("section", { key, style: { minWidth: 0 } }, [
      React.createElement("img", { key: "i", src: p.url, alt: p.alt || "", loading: "lazy", style: { display: "block", width: "100%", height: "auto", borderRadius: t.radius.image, aspectRatio: p.ratio && p.ratio !== "auto" ? p.ratio.replace(":", " / ") : undefined, objectFit: p.fit || "cover" } }),
      p.caption ? React.createElement("p", { key: "c", style: { marginTop: "0.6em", fontSize: t.text.sm, color: t.c.muted } }, p.caption) : null,
    ]);
  }

  if (block.type === "divider") {
    const w = p.width === "half" ? "50%" : p.width === "short" ? "25%" : "100%";
    if (p.variant === "space") return React.createElement("div", { key, style: { height: p.height ?? 24 } });
    return React.createElement("hr", {
      key,
      style: {
        border: 0, width: w, margin: 0, marginInline: t.align === "center" ? "auto" : undefined,
        borderTop: p.variant === "dashed" ? `${p.thickness || 1}px dashed ${t.c.border}` : p.variant === "dots" ? undefined : `${p.thickness || 1}px solid ${t.c.border}`,
        height: p.variant === "dots" ? p.thickness || 1 : undefined,
        backgroundImage: p.variant === "dots" ? `radial-gradient(${t.c.border} 40%, transparent 40%)` : undefined,
        backgroundSize: p.variant === "dots" ? "8px 8px" : undefined,
        backgroundRepeat: p.variant === "dots" ? "repeat-x" : undefined,
      },
    });
  }

  return null;
}

/**
 * Port of ProfileRenderer. `opts.contentWidth` is the pixel width the profile
 * will be laid out at — it stands in for the container queries profile.css uses,
 * which an inline-styled port cannot express.
 */
export function renderProfile(React, snapshot, opts = {}) {
  const { theme, layout, blocks, profile } = snapshot;
  const t = resolveTheme(theme, layout);
  const contentWidth = opts.contentWidth ?? 420;
  const ctx = { profile, narrow: contentWidth < 520, contentWidth: contentWidth - theme.spacing.padding * 2 };
  const visible = opts.visibleTypes ? blocks.filter((b) => opts.visibleTypes.includes(b.type)) : blocks;
  const shown = opts.limit ? visible.slice(0, opts.limit) : visible;

  return React.createElement("div", {
    style: {
      minHeight: "100%",
      color: t.c.foreground,
      backgroundColor: t.pageBg,
      backgroundImage: t.pageImage,
      backgroundSize: t.pageSize,
      backgroundPosition: "center",
      backgroundRepeat: "repeat",
      fontFamily: t.fontBody,
      fontWeight: t.weightBody,
      fontSize: t.text.base,
      lineHeight: 1.6,
    },
  }, React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: t.width,
      marginInline: "auto",
      paddingInline: t.spacing.padding,
      paddingBlock: opts.sectionPadding ?? t.spacing.section,
      display: "flex",
      flexDirection: "column",
      gap: t.spacing.block,
      textAlign: t.align,
      alignItems: "stretch",
    },
  }, shown.map((b) => renderBlock(React, b, t, ctx))));
}

const block = (id, type, props) => ({ id, type, props });

export const demoProfiles = {
  consultant: {
    preset: "professional",
    profile: { username: "sarah-consulting", displayName: "Sarah Jenkins", bio: "", avatarUrl: "", status: "Accepting new clients", location: "London" },
    blocks: [
      block("hero-1", "hero", { headline: "Sarah Jenkins", tagline: "Strategic Growth Consultant", bio: "Helping B2B SaaS companies scale from $1M to $10M ARR through operational efficiency and go-to-market strategy.", avatarUrl: "https://i.pravatar.cc/480?img=47", showAvatar: true, status: "Accepting new clients", location: "London", avatarSize: "md", align: "center", showUsername: true }),
      block("links-1", "links", { items: [
        { id: "l1", label: "Book a Discovery Call", url: "example.com", description: "30-min strategy session" },
        { id: "l2", label: "Read my Newsletter", url: "example.com", description: "Weekly insights on scaling SaaS" },
      ], style: "solid", size: "md", showArrow: true }),
      block("social-1", "social", { links: [{ id: "s1", platform: "linkedin" }, { id: "s2", platform: "twitter" }], shape: "circle", size: "md", style: "icon", layout: "row" }),
    ],
  },
  jewellery: {
    preset: "editorial",
    profile: { username: "aura-jewellery", displayName: "AURA", bio: "", avatarUrl: "", status: "New collection live", location: "Paris" },
    blocks: [
      block("hero-2", "hero", { headline: "AURA", tagline: "Handcrafted fine jewellery", bio: "Ethically sourced materials, designed and made in our Paris atelier. Pieces meant to be worn every day.", showAvatar: false, status: "New collection live", location: "Paris", align: "center", showUsername: true }),
      block("gallery-2", "gallery", { heading: "The Ethereal Collection", images: [
        { id: "g1", url: "https://picsum.photos/seed/aura-ring-gold/700/700", alt: "Gold ring", caption: "The Ethereal ring", shape: "square" },
        { id: "g2", url: "https://picsum.photos/seed/aura-necklace-pearl/700/700", alt: "Pearl necklace", caption: "Moonlit necklace", shape: "square" },
        { id: "g3", url: "https://picsum.photos/seed/aura-earrings-drop/700/700", alt: "Drop earrings", caption: "Tidal earrings", shape: "square" },
      ], layout: "grid", columns: 3, gap: 8, showCaptions: true }),
      block("links-2", "links", { items: [
        { id: "l1", label: "Shop the Ethereal Collection", url: "example.com", description: "Our newest arrivals" },
        { id: "l2", label: "Custom Bridal Design", url: "example.com", description: "Book a consultation" },
      ], style: "solid", size: "md", showArrow: true }),
      block("social-2", "social", { links: [{ id: "s1", platform: "instagram" }, { id: "s2", platform: "pinterest" }], shape: "circle", size: "md", style: "icon", layout: "row" }),
    ],
  },
  photographer: {
    preset: "portfolio",
    profile: { username: "marc-photo", displayName: "Marc Dubois", bio: "", avatarUrl: "", status: "Available for booking", location: "New York" },
    blocks: [
      block("hero-3", "hero", { headline: "Marc Dubois", tagline: "Editorial & Commercial Photographer", bio: "Capturing light and shadow. Selected clients include Vogue, GQ, and Nike.", avatarUrl: "https://i.pravatar.cc/480?img=13", showAvatar: true, status: "Available for booking", location: "New York", avatarSize: "md", align: "center", showUsername: true }),
      block("gallery-3", "gallery", { heading: "Selected work", images: [
        { id: "g1", url: "https://picsum.photos/seed/marc-portrait-editorial/700/900", alt: "Editorial portrait", shape: "portrait" },
        { id: "g2", url: "https://picsum.photos/seed/marc-street-mono/900/700", alt: "Street photography", shape: "landscape" },
        { id: "g3", url: "https://picsum.photos/seed/marc-studio-campaign/700/700", alt: "Studio campaign shot", shape: "square" },
        { id: "g4", url: "https://picsum.photos/seed/marc-portrait-bw/700/900", alt: "Black and white portrait", shape: "portrait" },
        { id: "g5", url: "https://picsum.photos/seed/marc-location-fashion/900/700", alt: "Location fashion shoot", shape: "landscape" },
        { id: "g6", url: "https://picsum.photos/seed/marc-detail-shot/700/700", alt: "Detail shot", shape: "square" },
      ], layout: "bento", columns: 3, gap: 8, showCaptions: false }),
      block("social-3", "social", { links: [{ id: "s1", platform: "instagram" }, { id: "s2", platform: "email" }], shape: "circle", size: "md", style: "icon", layout: "row" }),
      block("links-3", "links", { items: [
        { id: "l1", label: "View Portfolio", url: "example.com", description: "Selected works 2024" },
        { id: "l2", label: "Client Galleries", url: "example.com", description: "Private access" },
      ], style: "solid", size: "md", showArrow: true }),
    ],
  },
  freelancer: {
    preset: "cyber",
    profile: { username: "dev-alex", displayName: "Alex Chen", bio: "", avatarUrl: "", status: "Building things", location: "Remote" },
    blocks: [
      block("hero-4", "hero", { headline: "Alex Chen", tagline: "Full-stack Developer", bio: "Specializing in React, Node, and Web3. Turning coffee into scalable applications.", avatarUrl: "https://i.pravatar.cc/480?img=68", showAvatar: true, status: "Building things", location: "Remote", avatarSize: "md", align: "center", showUsername: true }),
      block("projects-4", "projects", { heading: "Recent work", items: [
        { id: "p1", name: "Ledgerline", description: "Real-time expense tracking for small teams, built on Next.js and Postgres.", imageUrl: "https://picsum.photos/seed/alex-project-ledgerline/720/480", tags: ["Next.js", "Postgres"] },
        { id: "p2", name: "Kiln", description: "A queue-based image pipeline for a print-on-demand marketplace.", imageUrl: "https://picsum.photos/seed/alex-project-kiln/720/480", tags: ["Node", "Redis"] },
        { id: "p3", name: "Fielded", description: "Web3 attendance verification for hybrid meetups.", imageUrl: "https://picsum.photos/seed/alex-project-fielded/720/480", tags: ["Solidity", "React"] },
      ], layout: "grid", columns: 3, imageRatio: "16:9", showTags: true, showDescription: true }),
      block("links-4", "links", { items: [
        { id: "l1", label: "My GitHub", url: "github.com", description: "Open source contributions" },
        { id: "l2", label: "Read my Blog", url: "example.com", description: "Technical writing" },
      ], style: "solid", size: "md", showArrow: true }),
      block("social-4", "social", { links: [{ id: "s1", platform: "github" }, { id: "s2", platform: "twitter" }], shape: "circle", size: "md", style: "icon", layout: "row" }),
    ],
  },
  creative: {
    preset: "glass",
    profile: { username: "maya", displayName: "Maya Chandra", bio: "", avatarUrl: "", status: "Type designer", location: "Bengaluru" },
    blocks: [
      block("hero-5", "hero", { headline: "Maya Chandra", tagline: "Type designer · Occasional developer", bio: "I draw letterforms and argue about kerning. Currently working on a variable serif for screens.", avatarUrl: "https://i.pravatar.cc/480?img=44", showAvatar: true, status: "Open to commissions", location: "Bengaluru", avatarSize: "md", align: "center", showUsername: true }),
      block("gallery-5", "gallery", { heading: "Recent work", images: [
        { id: "g1", url: "https://picsum.photos/seed/maya-specimen-serif/700/900", alt: "Kerala Serif specimen sheet", caption: "Kerala Serif, six optical sizes", shape: "portrait" },
        { id: "g2", url: "https://picsum.photos/seed/maya-sketchbook-letters/900/700", alt: "Letterform sketches", caption: "Sketchbook studies", shape: "landscape" },
        { id: "g3", url: "https://picsum.photos/seed/maya-poster-type/700/700", alt: "Type poster", caption: "Commissioned poster", shape: "square" },
      ], layout: "masonry", columns: 3, gap: 8, showCaptions: true }),
      block("social-5", "social", { links: [{ id: "s1", platform: "instagram" }, { id: "s2", platform: "github" }, { id: "s3", platform: "dribbble" }], shape: "circle", size: "md", style: "icon", layout: "row" }),
      block("links-5", "links", { items: [
        { id: "l1", label: "Specimen — Kerala Serif", url: "example.com/specimen", description: "A variable serif in six optical sizes" },
        { id: "l2", label: "Commission a typeface", url: "example.com/hire", description: "" },
      ], style: "solid", size: "md", showArrow: true }),
    ],
  },
};

/** demoProfiles entry -> the snapshot shape renderProfile expects. */
export function snapshotFor(id) {
  const demo = demoProfiles[id];
  const preset = PRESETS[demo.preset];
  return { profile: demo.profile, theme: preset.theme, layout: preset.layout, blocks: demo.blocks };
}

/** lib/demo-profiles.ts PURPOSE_OPTIONS, verbatim. */
export const PURPOSE_OPTIONS = [
  { id: "consultant", label: "Coaching or consulting", description: "A home for your services and how to book you." },
  { id: "photographer", label: "Photography", description: "A gallery-first page that puts your work up front." },
  { id: "freelancer", label: "Freelance or independent work", description: "Portfolio, projects and a way to get in touch." },
  { id: "creative", label: "Creative portfolio", description: "For artists, writers and makers of things." },
  { id: "jewellery", label: "Selling products", description: "Showcase what you make or sell." },
];
