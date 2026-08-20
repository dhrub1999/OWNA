import { Suspense } from "react";
import type { Metadata } from "next";
import { MailCheck } from "lucide-react";

export const metadata: Metadata = { title: "Check your email" };

async function EmailLine({ searchParams }: PageProps<"/signup/check-email">) {
  const { email } = await searchParams;
  const address = typeof email === "string" ? email : null;

  return (
    <p className="text-muted-foreground mt-3 text-sm">
      {address ? (
        <>
          We sent a confirmation link to{" "}
          <span className="text-foreground font-medium">{address}</span>.
        </>
      ) : (
        <>We sent you a confirmation link.</>
      )}{" "}
      Open it and you’ll land straight in the builder.
    </p>
  );
}

export default function CheckEmailPage(props: PageProps<"/signup/check-email">) {
  return (
    <div className="text-center">
      <MailCheck className="text-muted-foreground mx-auto size-8" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Check your email</h1>
      <Suspense fallback={<p className="text-muted-foreground mt-3 text-sm">&nbsp;</p>}>
        <EmailLine {...props} />
      </Suspense>
    </div>
  );
}
