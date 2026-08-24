import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import { siteUrl } from "@/lib/site";
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

const dmSans = DM_Sans({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "OWNA — your own corner of the internet",
    template: "%s · OWNA",
  },
  description:
    "Build a personal page that actually looks like you. Blocks, themes and a link you can share — no code, no hosting, no deploys.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${parkinsans.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* suppressHydrationWarning: some browser extensions inject an attribute
          here (a random-UUID-keyed marker) before React hydrates; it's not
          part of the app's rendered output. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
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
