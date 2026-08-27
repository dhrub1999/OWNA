import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { Pricing } from "@/components/marketing/pricing";
import { ProfileRail } from "@/components/marketing/profile-rail";
import { StartBuildingButton } from "@/components/marketing/start-building-button";
import { ProfileRenderer } from "@/components/public/profile-renderer";
import { demoProfiles } from "@/lib/demo-profiles";
import { BlurFade } from "@/components/magicui/blur-fade";
import { CheckCircle, Layers, Palette, Globe } from "lucide-react";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      {/* 1. Hero */}
      <Hero />

      {/* 2. More than a link */}
      <section className="scroll-mt-20 py-24 sm:py-32 bg-secondary/50" id="product">
        <div className="mx-auto max-w-7xl px-6 sm:px-12">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
              You are more than a list of links.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-stretch max-w-5xl mx-auto">
            <BlurFade
              inView
              direction="up"
              className="p-10 rounded-[32px] bg-background border border-border flex flex-col"
            >
              <h3 className="font-display text-2xl font-bold mb-8">
                Basic link page
              </h3>
              <ul className="space-y-4 text-muted-foreground text-lg flex-1">
                <li className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />{" "}
                  photo
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />{" "}
                  bio
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />{" "}
                  links
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />{" "}
                  social icons
                </li>
              </ul>
            </BlurFade>

            <BlurFade
              inView
              direction="up"
              delay={0.12}
              className="p-10 rounded-[32px] bg-foreground text-background flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
              <h3 className="font-display text-2xl font-bold mb-8 relative z-10 text-background">
                OWNA
              </h3>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-5 text-background font-medium text-lg relative z-10">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" /> identity
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />{" "}
                  introduction
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" /> services
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" /> portfolio
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" /> projects
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />{" "}
                  testimonials
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" /> gallery
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" /> contact
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" /> booking
                </li>
              </ul>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* 3. Build, customize, publish */}
      <section className="py-32 sm:py-40">
        <div className="mx-auto max-w-7xl px-6 sm:px-12">
          <div className="grid lg:grid-cols-3 gap-16 lg:gap-12">
            <BlurFade inView direction="up" className="group">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <Layers className="w-8 h-8 text-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">01 — Build</h3>
              <p className="text-muted-foreground text-lg mb-8">
                Choose what belongs on your page.
              </p>
              <div className="p-6 rounded-2xl bg-secondary/50 border border-border/50 text-sm font-medium space-y-3">
                <div className="p-3 bg-background rounded-lg shadow-sm border border-border">
                  Hero
                </div>
                <div className="p-3 bg-background rounded-lg shadow-sm border border-border">
                  Projects
                </div>
                <div className="p-3 bg-background rounded-lg shadow-sm border border-border opacity-50 border-dashed">
                  Add Block...
                </div>
              </div>
            </BlurFade>

            <BlurFade inView direction="up" delay={0.1} className="group">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <Palette className="w-8 h-8 text-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">02 — Customize</h3>
              <p className="text-muted-foreground text-lg mb-8">
                Make it look like you.
              </p>
              <div className="p-6 rounded-2xl bg-secondary/50 border border-border/50 text-sm font-medium grid grid-cols-2 gap-3">
                <div className="h-10 bg-background rounded-lg shadow-sm border border-border flex items-center px-3">
                  Colors
                </div>
                <div className="h-10 bg-background rounded-lg shadow-sm border border-border flex items-center px-3">
                  Type
                </div>
                <div className="h-10 bg-background rounded-lg shadow-sm border border-border flex items-center px-3 col-span-2">
                  Layout
                </div>
              </div>
            </BlurFade>

            <BlurFade inView direction="up" delay={0.2} className="group">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-8 h-8 text-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">03 — Publish</h3>
              <p className="text-muted-foreground text-lg mb-8">
                Go live when you&rsquo;re ready.
              </p>
              <div className="p-6 rounded-2xl bg-secondary/50 border border-border/50 text-sm font-medium flex flex-col justify-center items-center h-[188px]">
                <div className="w-full max-w-[200px] h-10 bg-primary text-primary-foreground rounded-full shadow-sm flex items-center justify-center mb-4">
                  Publish to Web
                </div>
                <div className="text-muted-foreground font-mono text-xs">
                  owna.app/yourname
                </div>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* 4. Your presence, your way */}
      <section className="py-32 sm:py-48 bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-6 sm:px-12">
          <div className="max-w-4xl mb-24">
            <h2 className="font-display text-[48px] sm:text-[64px] font-bold leading-tight mb-8">
              Why should everyone online look the same?
            </h2>
            <p className="text-xl sm:text-2xl text-background/70 max-w-2xl leading-relaxed">
              Your work isn&rsquo;t generic. Your business isn&rsquo;t generic. Your
              story isn&rsquo;t generic. Your online presence shouldn&rsquo;t be
              either.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* BlurFade nests inside the static translate-y wrapper rather than
                carrying it directly — Motion drives `transform` via inline
                style, which would otherwise silently override the Tailwind
                translate-y utility that gives this grid its stagger. */}
            <div>
              <BlurFade
                inView
                direction="up"
                className="rounded-[24px] overflow-hidden h-[500px] border border-white/10 bg-background"
              >
                <div className="pointer-events-none h-full overflow-hidden">
                  <ProfileRenderer
                    snapshot={demoProfiles.photographer}
                    isPreview
                  />
                </div>
              </BlurFade>
            </div>
            <div className="md:translate-y-16">
              <BlurFade
                inView
                direction="up"
                delay={0.1}
                className="rounded-[24px] overflow-hidden h-[500px] border border-white/10 bg-background"
              >
                <div className="pointer-events-none h-full overflow-hidden">
                  <ProfileRenderer
                    snapshot={demoProfiles.freelancer}
                    isPreview
                  />
                </div>
              </BlurFade>
            </div>
            <div className="md:translate-y-32">
              <BlurFade
                inView
                direction="up"
                delay={0.2}
                className="rounded-[24px] overflow-hidden h-[500px] border border-white/10 bg-background"
              >
                <div className="pointer-events-none h-full overflow-hidden">
                  <ProfileRenderer
                    snapshot={demoProfiles.creative}
                    isPreview
                  />
                </div>
              </BlurFade>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Made for people with something to say */}
      <section className="py-32 sm:py-40">
        <div className="mx-auto max-w-7xl px-6 sm:px-12">
          <div className="mb-20">
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
              Made for people with something to say.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-y-16 gap-x-12 lg:gap-x-24">
            <BlurFade inView direction="up">
              <h3 className="text-2xl font-bold mb-2">
                Independent professionals
              </h3>
              <p className="text-muted-foreground text-lg mb-8">
                Your expertise deserves a home.
              </p>
              <div className="rounded-2xl border border-border p-8 bg-secondary/30">
                <div className="font-medium mb-4">Common blocks:</div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-1.5 rounded-full border border-border bg-background text-sm">
                    About
                  </span>
                  <span className="px-4 py-1.5 rounded-full border border-border bg-background text-sm">
                    Services
                  </span>
                  <span className="px-4 py-1.5 rounded-full border border-border bg-background text-sm">
                    Testimonials
                  </span>
                </div>
              </div>
            </BlurFade>

            <BlurFade inView direction="up" delay={0.1}>
              <h3 className="text-2xl font-bold mb-2">Small businesses</h3>
              <p className="text-muted-foreground text-lg mb-8">
                Bring your brand beyond social media.
              </p>
              <div className="rounded-2xl border border-border p-8 bg-secondary/30">
                <div className="font-medium mb-4">Common blocks:</div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-1.5 rounded-full border border-border bg-background text-sm">
                    Gallery
                  </span>
                  <span className="px-4 py-1.5 rounded-full border border-border bg-background text-sm">
                    Contact
                  </span>
                  <span className="px-4 py-1.5 rounded-full border border-border bg-background text-sm">
                    Booking Links
                  </span>
                </div>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* 6. Social proof.

          The quote's other half used to be three grey rectangles marked
          "Placeholders for logos". Rather than invent a logo wall for a
          product that has not shipped one, the quote now sits beside the page
          it is describing: AURA is one of the curated personas in
          `lib/demo-profiles.ts`, rendered live. The claim and the evidence
          for it end up in the same row. */}
      <section className="border-y border-border bg-secondary/30 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-12">
          <BlurFade
            inView
            direction="up"
            className="grid items-center gap-16 lg:grid-cols-[7fr_5fr] lg:gap-24"
          >
            <figure>
              <blockquote className="font-display text-3xl leading-[1.25] font-bold tracking-tight text-balance sm:text-[40px]">
                &ldquo;We had Instagram, WhatsApp and a PDF catalogue. OWNA
                gave our customers one place to understand what we actually
                do.&rdquo;
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                <span
                  aria-hidden
                  className="h-10 w-px shrink-0 bg-border"
                />
                <span>
                  <span className="block text-lg font-medium">
                    AURA Jewellery
                  </span>
                  <span className="block text-muted-foreground">
                    Paris, France
                  </span>
                </span>
              </figcaption>
            </figure>

            <div className="mx-auto w-full max-w-[340px] lg:max-w-none">
              {/* Masked at the foot for the same reason as the Explore rail: a
                  fixed-height window otherwise cuts the page off mid-button.
                  No drop shadow — a mask clips its own element's shadow, and
                  the border is doing the work anyway. */}
              <div className="h-[460px] overflow-hidden rounded-[28px] border border-border bg-background [mask-image:linear-gradient(to_bottom,#000_78%,transparent_99%)]">
                <div className="pointer-events-none h-full overflow-hidden">
                  <ProfileRenderer
                    snapshot={demoProfiles.jewellery}
                    isPreview
                  />
                </div>
              </div>
              <p className="mt-4 text-center text-sm text-muted-foreground lg:text-left">
                owna.app/aura-jewellery
              </p>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* 7. Explore. Left-aligned rather than centred, and a rail rather than
          four empty boxes — see components/marketing/profile-rail.tsx. */}
      <section className="scroll-mt-20 overflow-hidden py-32" id="explore">
        <div className="mx-auto max-w-7xl px-6 sm:px-12">
          <div className="mb-14 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="font-display max-w-[16ch] text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              The internet is full of people worth discovering.
            </h2>
            <p className="max-w-[38ch] text-lg leading-relaxed text-muted-foreground">
              Five pages, five themes, one renderer. Every one of these is a
              real starting point you can pick during setup.
            </p>
          </div>

          <ProfileRail />

          <div className="mt-14 flex flex-col items-start gap-5 border-t border-border pt-10 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-[46ch] text-muted-foreground">
              A public directory is coming. Until then, the fastest way to see
              one is to build it.
            </p>
            <StartBuildingButton className="h-14 shrink-0 rounded-full px-8 text-base font-semibold transition-transform active:scale-[0.98]">
              Create your OWNA
            </StartBuildingButton>
          </div>
        </div>
      </section>

      {/* 8. Pricing — the destination of the nav's `#pricing`. */}
      <Pricing />

      {/* 9. Final Brand Statement */}
      <section className="py-40 bg-foreground text-background text-center">
        <BlurFade inView direction="up" className="mx-auto max-w-4xl px-6 sm:px-12">
          <h2 className="font-display text-[64px] sm:text-[88px] font-bold leading-[1.05] tracking-tight mb-8">
            Own your corner
            <br />
            of the internet.
          </h2>
          <p className="text-xl sm:text-2xl text-background/70 mb-12">
            Build a presence that&rsquo;s unmistakably yours.
          </p>
          <StartBuildingButton
            size="lg"
            className="h-14 rounded-full px-10 text-xl font-medium bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Create your OWNA
          </StartBuildingButton>
        </BlurFade>
      </section>
    </>
  );
}
