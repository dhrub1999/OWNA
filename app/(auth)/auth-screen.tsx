import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";
import { safeNextPath } from "@/lib/validations/auth";
import { AuthForm } from "./auth-form";
import type { AuthResult } from "./actions";

/**
 * The session-aware half of `/login` and `/signup`.
 *
 * Both pages need the same three decisions before a form is worth rendering,
 * so they live here once:
 *
 * 1. An established member has no business on either page. Sending them to
 *    `next` (or the dashboard) is what they meant by clicking a stale "Log in"
 *    link — asking them to authenticate a second time is a dead end that ends
 *    in the state they were already in.
 * 2. A guest sitting on an unpublished draft is *not* redirected. They may
 *    genuinely be here to reach an older account, and only they can weigh that
 *    against losing the draft. They get the warning and the choice.
 * 3. Whatever `?error=` the auth route handlers redirected with gets read and
 *    handed to the form, because a route handler has no other way to say what
 *    went wrong.
 *
 * Reading `searchParams` and cookies makes this dynamic, which is why each page
 * keeps it behind its own `<Suspense>` boundary.
 */
export async function AuthScreen({
  mode,
  action,
  searchParams,
}: {
  mode: "signin" | "signup";
  action: (formData: FormData) => Promise<AuthResult>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(
    typeof params.next === "string" ? params.next : null,
  );

  const viewer = await getViewer();
  if (viewer.state === "member") redirect(next ?? "/dashboard");

  return (
    <AuthForm
      mode={mode}
      action={action}
      next={next}
      errorCode={typeof params.error === "string" ? params.error : null}
      guestDraftUsername={
        viewer.state === "guest-draft" ? viewer.username : null
      }
    />
  );
}
