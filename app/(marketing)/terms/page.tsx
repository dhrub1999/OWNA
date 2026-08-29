import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/marketing/legal-page";
import { CONTACT_EMAIL } from "@/lib/site";

/**
 * Terms of use.
 *
 * Deliberately short and specific to what OWNA is today: one free tier, pages
 * you can publish and take down, handles from a shared namespace. It has not
 * been reviewed by a lawyer, and the beta and liability sections in particular
 * should be before launch.
 */
export const metadata: Metadata = {
  title: "Terms",
  description:
    "The rules for using OWNA: your content, your handle, and what we will and will not host.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "25 August 2026";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms"
      updated={UPDATED}
      intro={
        <p>
          Using OWNA means agreeing to what is below. It is short because the
          product is small: you make a page, we host it, and either of us can
          walk away.
        </p>
      }
      sections={[
        {
          id: "the-service",
          heading: "What you get",
          body: (
            <>
              <p>
                OWNA gives you a page at an address of the form{" "}
                <strong>owna.online/yourhandle</strong>, an editor for it, and a
                publish button. Every part of it is currently free, with no
                usage limits beyond what is needed to keep the service standing
                up.
              </p>
              <p>
                It is early. Features can change, and there is no uptime promise
                yet. If something is going away we will tell you before it does,
                with enough notice to get your content out.
              </p>
            </>
          ),
        },
        {
          id: "your-content",
          heading: "Your content stays yours",
          body: (
            <>
              <p>
                You own everything you put on your page. Nothing here transfers
                that.
              </p>
              <p>
                You do give us permission to store your content, to serve it to
                people who visit your page, and to render a preview of it — an
                image for social cards, for instance. That permission covers
                running the service and nothing else. It ends when you delete
                the content, except for copies that outlive it in backups or in
                other people&rsquo;s caches, which we cannot reach.
              </p>
            </>
          ),
        },
        {
          id: "what-not-to-publish",
          heading: "What not to publish",
          body: (
            <>
              <p>Do not use OWNA to put up:</p>
              <ul>
                <li>anything illegal where you are or where we operate;</li>
                <li>
                  material that impersonates a real person or organisation, or
                  that is designed to make someone believe they are somewhere
                  they are not;
                </li>
                <li>
                  content you do not have the rights to — someone else&rsquo;s
                  photographs, writing or brand;
                </li>
                <li>malware, phishing, or links to either;</li>
                <li>
                  content that harasses a specific person or incites violence
                  against anyone.
                </li>
              </ul>
              <p>
                We will take down a page that does any of this, and we do not
                need to warn you first if it is causing active harm.
              </p>
            </>
          ),
        },
        {
          id: "handles",
          heading: "Handles",
          body: (
            <>
              <p>
                Handles come from one shared namespace, first come first served.
                Some words are reserved because the site itself needs them.
              </p>
              <p>
                We may reclaim a handle that impersonates a person or a
                trademark holder, or one that was clearly taken to sell on. We
                will not reclaim one just because someone else wants it.
              </p>
            </>
          ),
        },
        {
          id: "accounts",
          heading: "Accounts and drafts",
          body: (
            <>
              <p>
                You are responsible for what happens under your account, and for
                keeping your sign-in details to yourself.
              </p>
              <p>
                A page you start without an account lives in a nameless session
                tied to your browser. Clearing your cookies or switching devices
                without creating an account will lose it, and abandoned drafts
                may be deleted. Create an account if you want a draft to
                survive.
              </p>
            </>
          ),
        },
        {
          id: "ending",
          heading: "Ending it",
          body: (
            <>
              <p>
                You can unpublish or delete your page at any time, and delete
                your account with it. See the{" "}
                <Link href="/privacy">privacy page</Link> for what deletion
                removes.
              </p>
              <p>
                We can suspend or close an account that breaks these terms. If
                we close yours for any other reason, you will get notice and a
                way to take your content with you.
              </p>
            </>
          ),
        },
        {
          id: "liability",
          heading: "As-is",
          body: (
            <p>
              OWNA is provided as it is, without warranty. We are not liable for
              lost content, lost income or lost opportunity arising from using
              it, to the extent the law where you are allows us to say so. Keep
              your own copy of anything you would be upset to lose.
            </p>
          ),
        },
        {
          id: "changes",
          heading: "Changes and contact",
          body: (
            <>
              <p>
                If these terms change materially, the date at the top of this
                page changes and we will say what changed rather than editing
                quietly.
              </p>
              <p>
                Anything unclear here is worth asking about:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
