import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BlurFade } from "@/components/magicui/blur-fade";
import { ProfileRenderer } from "@/components/public/profile-renderer";
import { demoProfiles, PURPOSE_OPTIONS } from "@/lib/demo-profiles";

/**
 * Index of the five persona landing pages (/for/{persona}).
 *
 * Exists so there is one findable link into that route tree — without it,
 * the pages were only reachable by search or by already being on one of the
 * other four.
 *
 * Each card renders the same live demo snapshot its persona page links to
 * (lib/demo-profiles.ts), so the picker shows the actual page a visitor
 * would get rather than five identical rows of text.
 */
export const metadata: Metadata = {
  title: "Built for you",
  description: "OWNA pages built around how you actually work. Pick what's closest to you.",
  alternates: { canonical: "/for" },
};

export default function ForIndexPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20 sm:px-12 sm:py-28">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
        Built for you.
      </h1>
      <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted-foreground">
        The same product, shaped around how you actually work.
      </p>

      <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {PURPOSE_OPTIONS.map((option, i) => (
          <BlurFade key={option.id} inView direction="up" delay={i * 0.06}>
            <Link href={`/for/${option.id}`} className="group block">
              <div className="relative h-[320px] overflow-hidden rounded-[20px] border border-border bg-background transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] [mask-image:linear-gradient(to_bottom,#000_85%,transparent_99%)] group-hover:-translate-y-1">
                <div className="pointer-events-none h-full overflow-hidden">
                  <ProfileRenderer snapshot={demoProfiles[option.id]} isPreview />
                </div>
              </div>

              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold tracking-tight">
                    {option.label}
                  </h2>
                  <p className="mt-1.5 max-w-[34ch] text-sm leading-relaxed text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <ArrowUpRight
                  aria-hidden
                  strokeWidth={2}
                  className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                />
              </div>
            </Link>
          </BlurFade>
        ))}
      </div>
    </div>
  );
}
