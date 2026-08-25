"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * A password field you can read back.
 *
 * Worth the extra control here specifically: the publish gate asks people to
 * invent a password inside a modal, mid-task, with a page they just built
 * waiting behind it. A typo they cannot see becomes an account they cannot get
 * back into, and the recovery path costs an email round trip.
 *
 * The toggle is a `button` inside the field rather than a checkbox beside it so
 * it sits in the tab order right after the input, and it never submits the form
 * (`type="button"` — a bare button inside a form defaults to submit).
 */
export function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false);
  const describedBy = useId();

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-9", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-describedby={describedBy}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-md transition-colors focus-visible:ring-3 focus-visible:outline-none"
      >
        {visible ? (
          <EyeOff className="size-4" />
        ) : (
          <Eye className="size-4" />
        )}
      </button>
      <span id={describedBy} className="sr-only">
        {visible ? "Password is showing" : "Password is hidden"}
      </span>
    </div>
  );
}
