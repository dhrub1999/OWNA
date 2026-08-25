"use client";

import { useState } from "react";
import { MailWarning, X } from "lucide-react";
import { resendConfirmation } from "@/app/(auth)/actions";
import { ResendButton } from "@/components/auth/resend-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * Shown until the user clicks the confirmation link Supabase sent them.
 *
 * Dismissing only hides it for this render — it isn't persisted, so a fresh
 * page load brings it back for as long as the address is still unconfirmed.
 * That's deliberate: this is the one place a still-unconfirmed guest account
 * gets reminded at all, and an unconfirmed account is one forgotten password
 * away from being unreachable forever.
 *
 * No `seedCooldown` here, unlike the signup screen. Someone can land on this
 * dashboard days after the original email went out, and starting a fresh
 * 60-second wait for a message that arrived last Tuesday would be nonsense.
 */
export function ConfirmEmailBanner({ email }: { email: string }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <Alert variant="warning" className="pr-2">
      <MailWarning />
      <AlertTitle>Confirm your email</AlertTitle>
      <AlertDescription>
        <p>
          We sent a link to <span className="font-medium">{email}</span>. Until
          you open it, you won&rsquo;t be able to sign back in if you lose this
          browser session.
        </p>
        <ResendButton
          action={resendConfirmation}
          address={email}
          scope="confirm-email"
          idleLabel="Resend email"
        />
      </AlertDescription>

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2"
      >
        <X className="size-4" />
      </Button>
    </Alert>
  );
}
