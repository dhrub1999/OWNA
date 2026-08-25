import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthScreen } from "../auth-screen";
import { AuthFormSkeleton } from "../auth-form-skeleton";
import { signInWithPassword } from "../actions";

export const metadata: Metadata = { title: "Sign in" };

/**
 * `AuthScreen` reads the session and the query string, both of which are
 * request data. With Cache Components on, that has to sit behind a Suspense
 * boundary so the rest of the page can still be prerendered.
 */
export default function LoginPage(props: PageProps<"/login">) {
  return (
    <Suspense fallback={<AuthFormSkeleton mode="signin" />}>
      <AuthScreen
        mode="signin"
        action={signInWithPassword}
        searchParams={props.searchParams}
      />
    </Suspense>
  );
}
