import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placeholder for `AuthScreen` while the session read resolves.
 *
 * The headings are real text, not skeleton bars: they are the same in every
 * branch the screen can resolve to, so rendering them immediately costs nothing
 * and gives the page something to say during the round trip. Only the parts
 * that genuinely depend on the answer — which alerts appear, which provider
 * buttons — are greyed out, and at the height they will occupy so the form does
 * not jump when it lands.
 */
export function AuthFormSkeleton({ mode }: { mode: "signin" | "signup" }) {
  const isSignUp = mode === "signup";

  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isSignUp ? "Create your profile" : "Welcome back"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isSignUp
            ? "Your own corner of the internet, in a few minutes."
            : "Sign in to keep building."}
        </p>
      </div>

      <Skeleton className="h-8 w-full rounded-lg" />

      <div className="flex items-center gap-3">
        <span className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-xs">or</span>
        <span className="bg-border h-px flex-1" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
    </div>
  );
}
