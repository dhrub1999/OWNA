import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import { siteUrl } from "@/lib/site";
import { jsonLdScript } from "@/lib/seo/structured-data";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// Self-hosted instead of next/font/google: Next has no precalculated
// fallback-font metrics for Parkinsans, which made next/font/google warn
// on every build. next/font/local computes metrics from the file itself,
// so it needs no lookup table entry. File is the variable-weight latin
// woff2 from @fontsource-variable/parkinsans (OFL-1.1, see PARKINSANS-LICENSE.txt).
const parkinsans = localFont({
  src: "./fonts/parkinsans-variable.woff2",
  variable: "--font-sans",
  weight: "300 800",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
});

const SITE_NAME = "OWNA";
const SITE_TITLE = "OWNA — your own corner of the internet";
const SITE_DESCRIPTION =
  "Build a personal page that actually looks like you. Blocks, themes and a link you can share — no code, no hosting, no deploys.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: SITE_TITLE,
    template: "%s · OWNA",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

// Site-wide identity, once. Individual profiles carry their own Person/ProfilePage
// JSON-LD (see lib/seo/structured-data.ts) — this is the marketing site's own.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: siteUrl(),
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: siteUrl(),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${parkinsans.variable} ${plusJakartaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* suppressHydrationWarning: some browser extensions inject an attribute
          here (a random-UUID-keyed marker) before React hydrates; it's not
          part of the app's rendered output. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteJsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
