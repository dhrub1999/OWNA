import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

/**
 * Chrome for the public marketing surface: the landing page plus the legal and
 * contact pages.
 *
 * The group exists so those pages are not orphans — before this, the header and
 * footer were written inline in the landing page, so anything else on the
 * public site would have had to duplicate them or ship without them.
 *
 * The group adds no path segment: `app/(marketing)/page.tsx` is still `/`.
 */
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
