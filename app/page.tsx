import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Blocks, Paintbrush, Zap } from "lucide-react";
import { ProfileRenderer } from "@/components/public/profile-renderer";
import { Button } from "@/components/ui/button";
import { demoSnapshot } from "@/lib/demo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * The landing page.
 *
 * The example on the right is a real snapshot rendered by the real
 * `ProfileRenderer`, not a screenshot — so it can never quietly stop matching
 * what the product actually produces.
 */
export default function HomePage() {
  return (
    <>
      <header className="flex h-14 items-center gap-3 px-4 sm:px-8">
        <Link href="/" aria-label="OWNA home">
          <Image
            src="/assets/logo/logo-with-name.svg"
            alt="OWNA"
            width={80}
            height={28}
            priority
          />
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" render={<Link href="/login" />}>
            Sign in
          </Button>
          <Button size="sm" render={<Link href="/signup" />}>
            Create your profile
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Your own corner of the internet.
            </h1>
            <p className="text-muted-foreground mt-5 text-lg">
              Not another identical link page. Build a page that looks like you —
              blocks you arrange, colours and type you choose, on a link you can
              share anywhere.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" render={<Link href="/signup" />}>
                Create your profile
                <ArrowRight />
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/maya" />}>
                See an example
              </Button>
            </div>

            <p className="text-muted-foreground mt-4 font-mono text-sm">
              owna.app/<span className="text-foreground">yourname</span>
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border shadow-xl">
            <div className="bg-muted flex items-center gap-1.5 border-b px-3 py-2">
              <span className="size-2.5 rounded-full bg-red-400/70" />
              <span className="size-2.5 rounded-full bg-amber-400/70" />
              <span className="size-2.5 rounded-full bg-emerald-400/70" />
              <span className="text-muted-foreground ml-2 font-mono text-xs">
                owna.app/maya
              </span>
            </div>
            <div className="pointer-events-none max-h-[30rem] overflow-hidden">
              <ProfileRenderer snapshot={demoSnapshot("dark")} isPreview />
            </div>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3 sm:px-8">
            <Feature
              icon={<Blocks aria-hidden="true" />}
              title="Blocks, not templates"
              body="Hero, links, projects, galleries, Spotify, YouTube. Drag them into the order you want and hide what you don’t."
            />
            <Feature
              icon={<Paintbrush aria-hidden="true" />}
              title="Design it properly"
              body="Ten starting themes, then every colour, font, corner and gap is yours. Nothing locks after you pick a preset."
            />
            <Feature
              icon={<Zap aria-hidden="true" />}
              title="Fast for visitors"
              body="Published pages are prerendered and cached, and republish without a rebuild. Your page loads like a page, not like a website builder."
            />
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto w-full max-w-2xl px-4 py-20 text-center sm:px-8">
            <h2 className="text-2xl font-semibold tracking-tight">
              Take your name before someone else does.
            </h2>
            <Button size="lg" className="mt-6" render={<Link href="/signup" />}>
              Create your profile
              <ArrowRight />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t px-4 py-6 text-center sm:px-8">
        <Image
          src="/assets/logo/logo-with-name.svg"
          alt="OWNA"
          width={60}
          height={21}
          className="mx-auto opacity-50"
        />
      </footer>
    </>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="bg-muted mb-3 inline-flex size-9 items-center justify-center rounded-lg [&_svg]:size-4">
        {icon}
      </div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-muted-foreground mt-1.5 text-sm">{body}</p>
    </div>
  );
}
