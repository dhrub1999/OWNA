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
      { href: "/for", label: "Built for you" },
      { href: "/discover", label: "Discover" },
      { href: "/pricing", label: "Pricing" },
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
    <footer className="border-t border-border px-[clamp(16px,4vw,48px)] py-[clamp(48px,7vw,72px)]">
      <div className="mx-auto mb-[clamp(36px,5vw,56px)] flex max-w-7xl flex-wrap gap-[clamp(28px,4vw,48px)]">
        <div className="min-w-0 flex-[1_1_240px]">
          <Link
            href="/"
            aria-label="OWNA home"
            className="mb-4 block w-fit text-foreground transition-colors hover:text-logo-hover"
          >
            <Logo className="h-9 w-auto" />
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">
            Own your corner of the Internet
          </p>
        </div>

        {/* A nested row rather than four flat flex items: without it, each
            link column wraps to its own breakpoint independently and the
            three go ragged. Grouped like this, Product/Account/Legal move as
            one block and only drop below the brand column together. */}
        <div className="flex min-w-0 flex-[2_1_300px] flex-wrap gap-[clamp(20px,3vw,40px)]">
          {COLUMNS.map((column) => (
            <div key={column.heading} className="min-w-0 flex-[1_1_108px]">
              <h4 className="mb-5 font-bold">{column.heading}</h4>
              <ul className="flex flex-col gap-3.5 text-sm text-muted-foreground">
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
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-border pt-7 text-sm text-muted-foreground md:flex-row">
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
