/**
 * The marketing site's primary navigation.
 *
 * Hrefs are root-relative (`/#product`, not `#product`) because the same list
 * renders on `/privacy`, `/terms` and `/contact`, where a bare fragment would
 * resolve against a page that has no such section.
 *
 * Every entry must point at something that exists. The list is deliberately
 * short: a nav item for a section the page does not have reads as a broken
 * promise, not as a roadmap.
 */
export const NAV_LINKS = [
  { href: "/#product", label: "Product" },
  { href: "/#explore", label: "Explore" },
  { href: "/#pricing", label: "Pricing" },
] as const;
