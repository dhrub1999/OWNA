import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getUser } from "@/lib/supabase/server";
import { updatePassword } from "../actions";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Set a new password" };

/**
 * The far end of a recovery link.
 *
 * `/auth/confirm` has already exchanged the token for a live session by the
 * time anyone gets here, so the only thing left to check is that the session
 * exists. It usually will not when someone reaches this URL any other way — a
 * bookmark, a back button, a link opened twice — and that case needs its own
 * answer rather than an empty form that fails on submit.
 */
async function ResetBody() {
  const user = await getUser();

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>This reset link is no longer valid</AlertTitle>
        <AlertDescription>
          <p>
            Reset links expire after an hour and only work once. Ask for a fresh
            one and it&rsquo;ll be in your inbox in a moment.
          </p>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/forgot-password" />}
          >
            Send a new link
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return <ResetPasswordForm action={updatePassword} />;
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Set a new password
        </h1>
        <p className="text-muted-foreground text-sm">
          Pick something you haven&rsquo;t used elsewhere.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        }
      >
        <ResetBody />
      </Suspense>
    </div>
  );
}
