import type { Metadata } from "next";
import { Pricing } from "@/components/marketing/pricing";

/**
 * Pricing, as its own indexable URL.
 *
 * Previously "pricing" lived only as a `#pricing` anchor on the homepage, so a
 * commercial-intent search ("owna pricing") had nothing dedicated to rank —
 * it competed with every other homepage query at once. This renders the exact
 * same <Pricing /> section the homepage anchor still scrolls to, so the two
 * can never say different things about what OWNA costs.
 */
export const metadata: Metadata = {
  title: "Pricing",
  description:
    "OWNA is free. Every block, every theme, your own handle — nothing sits behind a paywall.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <div className="pt-20 sm:pt-28">
      <div className="mx-auto max-w-3xl px-6 text-center sm:px-12">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Pricing
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          One plan, free while OWNA is still becoming what it&apos;s going to be.
        </p>
      </div>
      <Pricing />
    </div>
  );
}
