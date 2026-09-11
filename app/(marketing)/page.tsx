import type { Metadata } from "next";
import { BlockGrid } from "@/components/marketing/block-grid";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { Faq } from "@/components/marketing/faq";
import { Hero } from "@/components/marketing/hero";
import { PersonaPicker } from "@/components/marketing/persona-picker";
import { Pricing } from "@/components/marketing/pricing";
import { ProfileRail } from "@/components/marketing/profile-rail";
import { Trust } from "@/components/marketing/trust";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      {/* 1. Hero — the live editor */}
      <Hero />

      {/* 2. "Start from where you actually are." — persona picker */}
      <PersonaPicker />

      {/* 3. The nine blocks, and the one a link-in-bio tool gives you. */}
      <BlockGrid />

      {/* 5. "Five real pages, one renderer." — Explore rail */}
      <ProfileRail />

      {/* 6. "Nothing clever is happening to your page." — trust */}
      <Trust />

      {/* 7. "Free, for now." — pricing */}
      <Pricing />

      {/* 8. "Straight answers." — FAQ */}
      <Faq />

      {/* 9. Closing CTA — the one panel that inverts against its surroundings */}
      <ClosingCta />
    </>
  );
}
