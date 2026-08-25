import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { ResendButton } from "@/components/auth/resend-button";
import { Skeleton } from "@/components/ui/skeleton";
import { resendSignupConfirmation } from "../../actions";

export const metadata: Metadata = { title: "Check your email" };

/**
 * The pause between signing up and confirming.
 *
 * This screen used to be terminal: it named the address and stopped. Every way
 * that pause actually fails — mail that never lands, a typo'd address, a link
 * that expires while someone is asleep — left the visitor with nothing to click
 * and an account they could not reach. All three now have an exit.
 */
async function CheckEmailBody({ searchParams }: PageProps<"/signup/check-email">) {
  const { email } = await searchParams;
  const address = typeof email === "string" ? email : null;

  return (
    <>
      <p className="text-muted-foreground mt-3 text-sm">
        {address ? (
          <>
            We sent a confirmation link to{" "}
            <span className="text-foreground font-medium">{address}</span>.
          </>
        ) : (
          <>We sent you a confirmation link.</>
        )}{" "}
        Open it and you&rsquo;ll land straight in the builder.
      </p>

      {address ? (
        <div className="mt-6 flex flex-col items-center gap-2">
          {/* `seedCooldown`: signing up sent one a second ago. Starting the
              clock already running is the honest state, and it stops the first
              impulse from being a duplicate send. */}
          <ResendButton
            action={resendSignupConfirmation}
            address={address}
            scope="signup"
            seedCooldown
            idleLabel="Didn't get it? Send it again"
          />
          <p className="text-muted-foreground text-sm">
            Wrong address?{" "}
            <Link
              href="/signup"
              className="text-foreground underline underline-offset-4"
            >
              Sign up again
            </Link>
          </p>
        </div>
      ) : null}
    </>
  );
}

export default function CheckEmailPage(props: PageProps<"/signup/check-email">) {
  return (
    <div className="text-center">
      <MailCheck className="text-muted-foreground mx-auto size-8" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Check your email</h1>
      <Suspense
        fallback={
          <div className="mt-3 flex flex-col items-center gap-2">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
        }
      >
        <CheckEmailBody {...props} />
      </Suspense>
    </div>
  );
}
