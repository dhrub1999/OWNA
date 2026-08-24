import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/marketing/hero";
import { StartBuildingButton } from "@/components/marketing/start-building-button";
import { ProfileRenderer } from "@/components/public/profile-renderer";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { demoProfiles } from "@/lib/demo-profiles";
import { CheckCircle, Layers, Palette, Globe, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      {/* 1. Navigation */}
      <header className="flex h-20 items-center justify-between px-6 sm:px-12 border-b border-border/40">
        <div className="flex items-center gap-12">
          <Link
            href="/"
            aria-label="OWNA home"
            className="text-foreground hover:text-logo-hover transition-colors"
          >
            <Logo className="h-9 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              href="#product"
              className="hover:text-primary transition-colors"
            >
              Product
            </Link>
            <Link
              href="#explore"
              className="hover:text-primary transition-colors"
            >
              Explore
            </Link>
            <Link
              href="#pricing"
              className="hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#resources"
              className="hover:text-primary transition-colors"
            >
              Resources
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm font-medium hover:text-primary transition-colors hidden sm:block"
          >
            Log in
          </Link>
          <StartBuildingButton className="rounded-full px-6">
            Create your OWNA
          </StartBuildingButton>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. Hero */}
        <Hero />

        {/* 3. More than a link */}
        <section className="py-24 sm:py-32 bg-secondary/50" id="product">
          <div className="mx-auto max-w-7xl px-6 sm:px-12">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
                You are more than a list of links.
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-stretch max-w-5xl mx-auto">
              <div className="p-10 rounded-[32px] bg-background border border-border flex flex-col">
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
              </div>

              <div className="p-10 rounded-[32px] bg-foreground text-background flex flex-col relative overflow-hidden">
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
              </div>
            </div>
          </div>
        </section>

        {/* 4. Build Customize Publish */}
        <section className="py-32 sm:py-40">
          <div className="mx-auto max-w-7xl px-6 sm:px-12">
            <div className="grid lg:grid-cols-3 gap-16 lg:gap-12">
              <div className="group">
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
              </div>

              <div className="group">
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
              </div>

              <div className="group">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-8 h-8 text-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4">03 — Publish</h3>
                <p className="text-muted-foreground text-lg mb-8">
                  Go live when you're ready.
                </p>
                <div className="p-6 rounded-2xl bg-secondary/50 border border-border/50 text-sm font-medium flex flex-col justify-center items-center h-[188px]">
                  <div className="w-full max-w-[200px] h-10 bg-primary text-primary-foreground rounded-full shadow-sm flex items-center justify-center mb-4">
                    Publish to Web
                  </div>
                  <div className="text-muted-foreground font-mono text-xs">
                    owna.app/yourname
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Your presence, your way */}
        <section className="py-32 sm:py-48 bg-foreground text-background">
          <div className="mx-auto max-w-7xl px-6 sm:px-12">
            <div className="max-w-4xl mb-24">
              <h2 className="font-display text-[48px] sm:text-[64px] font-bold leading-tight mb-8">
                Why should everyone online look the same?
              </h2>
              <p className="text-xl sm:text-2xl text-background/70 max-w-2xl leading-relaxed">
                Your work isn't generic. Your business isn't generic. Your story
                isn't generic. Your online presence shouldn't be either.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <div className="rounded-[24px] overflow-hidden h-[500px] border border-white/10 bg-background">
                <div className="pointer-events-none h-full overflow-hidden">
                  <ProfileRenderer
                    snapshot={demoProfiles.photographer}
                    isPreview
                  />
                </div>
              </div>
              <div className="rounded-[24px] overflow-hidden h-[500px] border border-white/10 bg-background md:translate-y-16">
                <div className="pointer-events-none h-full overflow-hidden">
                  <ProfileRenderer
                    snapshot={demoProfiles.freelancer}
                    isPreview
                  />
                </div>
              </div>
              <div className="rounded-[24px] overflow-hidden h-[500px] border border-white/10 bg-background md:translate-y-32">
                <div className="pointer-events-none h-full overflow-hidden">
                  <ProfileRenderer snapshot={demoProfiles.creative} isPreview />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Made for people with something to say */}
        <section className="py-32 sm:py-40">
          <div className="mx-auto max-w-7xl px-6 sm:px-12">
            <div className="mb-20">
              <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
                Made for people with something to say.
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-y-16 gap-x-12 lg:gap-x-24">
              <div>
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
              </div>

              <div>
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
              </div>
            </div>
          </div>
        </section>

        {/* 7. Social Proof */}
        <section className="py-24 bg-secondary/30 border-y border-border">
          <div className="mx-auto max-w-7xl px-6 sm:px-12">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-display text-3xl font-bold mb-8">
                  "We had Instagram, WhatsApp and a PDF catalogue. OWNA gave our
                  customers one place to understand what we actually do."
                </h2>
                <div className="font-medium text-lg">AURA Jewellery</div>
                <div className="text-muted-foreground">Paris, France</div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 opacity-50 grayscale">
                {/* Placeholders for logos */}
                <div className="h-8 bg-foreground/20 rounded-md"></div>
                <div className="h-8 bg-foreground/20 rounded-md"></div>
                <div className="h-8 bg-foreground/20 rounded-md"></div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Explore OWNA */}
        <section className="py-32" id="explore">
          <div className="mx-auto max-w-7xl px-6 sm:px-12 text-center">
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-16 tracking-tight">
              The internet is full of people worth discovering.
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
              <div className="aspect-3/4 rounded-2xl bg-secondary/80 border border-border overflow-hidden"></div>
              <div className="aspect-3/4 rounded-2xl bg-secondary border border-border overflow-hidden"></div>
              <div className="aspect-3/4 rounded-2xl bg-secondary/60 border border-border overflow-hidden"></div>
              <div className="aspect-3/4 rounded-2xl bg-secondary/40 border border-border overflow-hidden"></div>
            </div>

            <Button
              size="lg"
              variant="outline"
              className="h-14 rounded-full px-8 text-lg font-medium border-border"
            >
              Explore OWNA Directory
            </Button>
          </div>
        </section>

        {/* 9. Final Brand Statement */}
        <section className="py-40 bg-foreground text-background text-center">
          <div className="mx-auto max-w-4xl px-6 sm:px-12">
            <h2 className="font-display text-[64px] sm:text-[88px] font-bold leading-[1.05] tracking-tight mb-8">
              Own your corner
              <br />
              of the internet.
            </h2>
            <p className="text-xl sm:text-2xl text-background/70 mb-12">
              Build a presence that's unmistakably yours.
            </p>
            <StartBuildingButton
              size="lg"
              className="h-14 rounded-full px-10 text-xl font-medium bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Create your OWNA
            </StartBuildingButton>
          </div>
        </section>
      </main>

      {/* 10. Footer */}
      <footer className="py-20 px-6 sm:px-12 border-t border-border">
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2">
            <Link
              href="/"
              aria-label="OWNA home"
              className="block mb-4 text-foreground hover:text-logo-hover transition-colors w-fit"
            >
              <Logo className="h-[42px] w-auto" />
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              Own your corner of the Internet
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-muted-foreground text-sm">
              <li>
                <Link href="#features" className="hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#explore" className="hover:text-foreground">
                  Explore
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#templates" className="hover:text-foreground">
                  Templates
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-muted-foreground text-sm">
              <li>
                <Link href="/about" className="hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-foreground">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Resources</h4>
            <ul className="space-y-4 text-muted-foreground text-sm">
              <li>
                <Link href="/help" className="hover:text-foreground">
                  Help
                </Link>
              </li>
              <li>
                <Link href="/guides" className="hover:text-foreground">
                  Guides
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-foreground">
                  Community
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-7xl pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
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
    </>
  );
}
