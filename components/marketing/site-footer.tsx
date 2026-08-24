import Link from "next/link";
import { Logo } from "@/components/logo";

/**
 * The marketing footer.
 *
 * Every link here resolves. The previous version listed a blog, careers,
 * guides, a community and a help centre — nine routes, none of which exist —
 * so the footer's job (proving the thing is real) was being done by links that
 * 404. Sections that do not exist are simply absent rather than stubbed.
 */
const COLUMNS = [
  {
    heading: "Product",
    links: [
      { href: "/#product", label: "What you can build" },
      { href: "/#explore", label: "Explore" },
      { href: "/#pricing", label: "Pricing" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/signup", label: "Sign up" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/contact", label: "Contact" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-20 sm:px-12">
      <div className="mx-auto mb-16 grid max-w-7xl grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-[2fr_1fr_1fr_1fr] md:gap-12">
        <div className="col-span-2 md:col-span-1">
          <Link
            href="/"
            aria-label="OWNA home"
            className="mb-4 block w-fit text-foreground transition-colors hover:text-logo-hover"
          >
            <Logo className="h-[42px] w-auto" />
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">
            Own your corner of the Internet
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.heading}>
            <h4 className="mb-6 font-bold">{column.heading}</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
        {/* Literal, not `new Date()`: under `cacheComponents` a clock read
            during prerender forces the whole footer dynamic. */}
        <div>OWNA © 2026</div>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
