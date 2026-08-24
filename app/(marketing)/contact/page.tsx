import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CONTACT_EMAIL } from "@/lib/site";

/**
 * Contact.
 *
 * No form. There is no endpoint behind one, and a form that silently fails is a
 * worse gap than no form at all — so this routes to a real inbox with the
 * subject line already filled in, which is the part people get wrong.
 *
 * Change the address in one place: `CONTACT_EMAIL` in `lib/site.ts`.
 */
export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach the people who build OWNA.",
  alternates: { canonical: "/contact" },
};

const ROUTES = [
  {
    heading: "Something is broken",
    detail:
      "An editor that will not save, a page that will not publish, a theme rendering wrong. Tell us what you were doing and what happened instead.",
    subject: "Bug report",
  },
  {
    heading: "Report a page",
    detail:
      "Impersonation, stolen work, phishing, or anything else that should not be hosted here. Include the address of the page.",
    subject: "Reporting a page",
  },
  {
    heading: "Your data",
    detail:
      "A copy of what we hold, a correction, or deletion of your account and everything on it.",
    subject: "Data request",
  },
  {
    heading: "Anything else",
    detail:
      "A feature you want, a question about where this is going, or a note about something you built.",
    subject: "Hello",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20 sm:px-12 sm:py-28">
      <div className="grid gap-16 lg:grid-cols-[5fr_7fr] lg:gap-24">
        <div className="lg:pt-2">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Say hello.
          </h1>
          <p className="mt-6 max-w-[40ch] text-lg leading-relaxed text-muted-foreground">
            One inbox, read by the people who build this. Pick whichever line
            below fits and the subject will already be right.
          </p>

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-10 inline-flex items-center gap-2 font-mono text-lg text-foreground underline decoration-border underline-offset-[6px] transition-colors hover:decoration-primary"
          >
            {CONTACT_EMAIL}
          </a>

          <p className="mt-10 max-w-[42ch] border-l-2 border-border pl-5 text-[15px] leading-relaxed text-muted-foreground">
            If your page is already live and you need it down in a hurry, you
            can unpublish it yourself from the{" "}
            <Link
              href="/dashboard"
              className="font-medium text-foreground underline underline-offset-4"
            >
              dashboard
            </Link>{" "}
            without waiting for a reply.
          </p>
        </div>

        {/* Divided rows rather than four cards: these are routes to the same
            inbox, not four separate things. */}
        <ul className="divide-y divide-border border-y border-border">
          {ROUTES.map((route) => (
            <li key={route.subject}>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(route.subject)}`}
                className="group flex items-start justify-between gap-6 py-7 transition-colors hover:bg-secondary/60 active:bg-secondary sm:px-2"
              >
                <span>
                  <span className="font-display block text-xl font-bold tracking-tight">
                    {route.heading}
                  </span>
                  <span className="mt-2 block max-w-[52ch] leading-relaxed text-muted-foreground">
                    {route.detail}
                  </span>
                </span>
                <ArrowUpRight
                  aria-hidden
                  strokeWidth={2}
                  className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
