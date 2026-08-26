import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PURPOSE_OPTIONS } from "@/lib/demo-profiles";

/**
 * Index of the five persona landing pages (/for/{persona}).
 *
 * Exists so there is one findable link into that route tree — without it,
 * the pages were only reachable by search or by already being on one of the
 * other four.
 */
export const metadata: Metadata = {
  title: "Built for you",
  description: "OWNA pages built around how you actually work — pick what's closest to you.",
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

      <ul className="mt-14 divide-y divide-border border-y border-border">
        {PURPOSE_OPTIONS.map((option) => (
          <li key={option.id}>
            <Link
              href={`/for/${option.id}`}
              className="group flex items-start justify-between gap-6 py-7 transition-colors hover:bg-secondary/60 sm:px-2"
            >
              <span>
                <span className="font-display block text-xl font-bold tracking-tight">
                  {option.label}
                </span>
                <span className="mt-2 block max-w-[52ch] text-muted-foreground leading-relaxed">
                  {option.description}
                </span>
              </span>
              <ArrowUpRight
                aria-hidden
                strokeWidth={2}
                className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
