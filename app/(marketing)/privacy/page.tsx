import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/marketing/legal-page";
import { CONTACT_EMAIL } from "@/lib/site";

/**
 * Privacy policy.
 *
 * Written against what the code actually does — Supabase Auth (including
 * anonymous sessions), Supabase Storage for uploads, Vercel hosting and Vercel
 * Web Analytics, `next-themes` in localStorage. Every claim here should be
 * checkable in the repo; if a processor or a cookie changes, this page changes
 * with it. It has not been reviewed by a lawyer.
 */
export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What OWNA collects, why, who processes it, and how to get it deleted.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "25 August 2026";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      updated={UPDATED}
      intro={
        <p>
          OWNA exists to publish a page you control, which means most of what we
          hold is content you deliberately put on the internet. This describes
          the rest: what is collected, who processes it, and how to get it back
          or get rid of it.
        </p>
      }
      sections={[
        {
          id: "what-we-collect",
          heading: "What we collect",
          body: (
            <ul>
              <li>
                <strong>Account identity.</strong> If you sign up with email, we
                store your email address and a hashed password. If you continue
                with Google, we store the account identifier Google returns and
                the email attached to it. We never see your Google password.
              </li>
              <li>
                <strong>Anonymous sessions.</strong> You can build a page before
                creating an account. Doing so creates a real but nameless user
                record with no email attached, held in a cookie on your browser.
                It becomes a normal account only if you choose to add an email
                or link Google at the point you publish.
              </li>
              <li>
                <strong>Your page.</strong> Your handle, display name, bio, the
                blocks you add and their content, your theme, and whether the
                page is published, unlisted or private.
              </li>
              <li>
                <strong>Uploads.</strong> Images you add are stored as files.
                They are compressed in your browser before they leave it.
              </li>
              <li>
                <strong>Onboarding answers.</strong> The three answers in the
                setup questionnaire, stored so that reloading the page does not
                lose your progress.
              </li>
            </ul>
          ),
        },
        {
          id: "what-is-public",
          heading: "What is public",
          body: (
            <>
              <p>
                A published page is public. Anything on it — text, images,
                links, your handle — is visible to anyone who visits the
                address, and to search engines that crawl it.
              </p>
              <p>
                An <strong>unlisted</strong> page is reachable by anyone with
                the link but is deliberately kept out of our sitemap, so we are
                not the ones handing it to a crawler. That is not the same as
                private. A page you have not published is visible only to you.
              </p>
            </>
          ),
        },
        {
          id: "cookies",
          heading: "Cookies and local storage",
          body: (
            <ul>
              <li>
                <strong>A session cookie</strong> set by Supabase Auth. It is
                what keeps you signed in — including for an anonymous draft —
                and the site does not work without it.
              </li>
              <li>
                <strong>A theme preference</strong> in your browser&rsquo;s
                local storage, so the site remembers whether you chose light or
                dark. It never leaves your device.
              </li>
              <li>
                <strong>No advertising or tracking cookies.</strong> We do not
                set any, and we do not sell or share what we hold with
                advertisers.
              </li>
            </ul>
          ),
        },
        {
          id: "analytics",
          heading: "Analytics",
          body: (
            <p>
              We use Vercel Web Analytics to count page views and referrers in
              aggregate. It is cookieless and does not build a profile of you or
              follow you across other sites. We do not run Google Analytics or
              any advertising pixel.
            </p>
          ),
        },
        {
          id: "processors",
          heading: "Who processes your data",
          body: (
            <ul>
              <li>
                <strong>Supabase</strong> — database, authentication and file
                storage. Everything above except analytics lives here.
              </li>
              <li>
                <strong>Vercel</strong> — hosting and the analytics described
                above.
              </li>
              <li>
                <strong>Google</strong> — only if you choose to sign in or link
                with a Google account.
              </li>
            </ul>
          ),
        },
        {
          id: "retention",
          heading: "Keeping and deleting",
          body: (
            <>
              <p>
                Your page and its content are kept for as long as your account
                exists. Deleting your account deletes your profile, your pages,
                your blocks and your published snapshot along with it.
              </p>
              <p>
                Images that are uploaded but never end up on a published page
                are swept automatically once they are more than a day old.
                Abandoned anonymous drafts — started without an account and
                never published — may be removed.
              </p>
              <p>
                To get a copy of what we hold, or to have your account deleted,
                write to{" "}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              </p>
            </>
          ),
        },
        {
          id: "children",
          heading: "Age",
          body: (
            <p>
              OWNA is not intended for children under 13, and we do not
              knowingly collect anything from them. If you believe a child has
              created a page here, tell us and we will remove it.
            </p>
          ),
        },
        {
          id: "changes",
          heading: "Changes and contact",
          body: (
            <>
              <p>
                If this policy changes in a way that affects what we collect or
                who processes it, the date at the top of this page changes and
                we will say so on the page rather than quietly editing it.
              </p>
              <p>
                Questions go to{" "}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, or via
                the <Link href="/contact">contact page</Link>.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
