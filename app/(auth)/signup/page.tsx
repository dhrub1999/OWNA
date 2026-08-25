import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthScreen } from "../auth-screen";
import { AuthFormSkeleton } from "../auth-form-skeleton";
import { signUpWithPassword } from "../actions";

export const metadata: Metadata = { title: "Create your profile" };

export default function SignupPage(props: PageProps<"/signup">) {
  return (
    <Suspense fallback={<AuthFormSkeleton mode="signup" />}>
      <AuthScreen
        mode="signup"
        action={signUpWithPassword}
        searchParams={props.searchParams}
      />
    </Suspense>
  );
}
