import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { ResendButton } from "@/components/auth/resend-button";
import { Skeleton } from "@/components/ui/skeleton";
import { resendPasswordReset } from "../../actions";

export const metadata: Metadata = { title: "Check your email" };

/**
 * Shown after a reset request, whether or not the address had an account.
 *
 * The wording has to hold for both cases at once — anything that reads as
 * confirmation the account exists would undo the neutrality
 * `requestPasswordReset` is careful to keep. "If that address has an account"
 * is doing real work, not hedging.
 */
async function SentBody({ searchParams }: PageProps<"/forgot-password/sent">) {
  const { email } = await searchParams;
  const address = typeof email === "string" ? email : null;

  return (
    <>
      <p className="text-muted-foreground mt-3 text-sm">
        If{" "}
        {address ? (
          <span className="text-foreground font-medium">{address}</span>
        ) : (
          "that address"
        )}{" "}
        has an OWNA account, a link to set a new password is on its way. It works
        once, and expires in an hour.
      </p>

      {address ? (
        <div className="mt-6 flex justify-center">
          <ResendButton
            action={resendPasswordReset}
            address={address}
            scope="recovery"
            seedCooldown
            idleLabel="Didn't get it? Send it again"
          />
        </div>
      ) : null}
    </>
  );
}

export default function ResetSentPage(props: PageProps<"/forgot-password/sent">) {
  return (
    <div className="text-center">
      <MailCheck className="text-muted-foreground mx-auto size-8" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        Check your email
      </h1>
      <Suspense
        fallback={
          <div className="mt-3 flex flex-col items-center gap-2">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-44" />
          </div>
        }
      >
        <SentBody {...props} />
      </Suspense>

      <p className="text-muted-foreground mt-8 text-sm">
        <Link
          href="/login"
          className="text-foreground underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
