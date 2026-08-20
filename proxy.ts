import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Session refresh and an optimistic auth gate.
 *
 * In Next.js 16 this file replaces middleware.ts; the behaviour is the same,
 * the name is not.
 *
 * The matcher deliberately covers only the signed-in surfaces. Public profile
 * routes must never reach this function: touching cookies here would attach a
 * Set-Cookie to responses that are otherwise fully cacheable, which would undo
 * the static shell that makes those pages fast.
 *
 * This is an optimistic check, not authorization. It exists so a signed-out
 * visitor gets a redirect instead of a flash of empty dashboard. The real
 * enforcement is RLS in the database plus an explicit user check in every
 * Server Action.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getUser() revalidates the token with Supabase. getSession() only decodes
  // the cookie, so it will happily accept one a user forged themselves.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/editor/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/preview/:path*",
  ],
};
