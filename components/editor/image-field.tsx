"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImage } from "@/lib/uploads/upload";
import { ACCEPTED_MIME } from "@/lib/uploads/compress";
import { Field } from "./controls";

/**
 * Pick an image: upload one, or paste a URL.
 *
 * Both paths are offered because they serve different people — a phone photo
 * needs uploading, whereas a link to an existing portfolio image should not
 * have to be downloaded and re-uploaded to be usable.
 */
export function ImageField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);

    const result = await uploadImage(file);
    setUploading(false);

    if (result.ok) onChange(result.url);
    else setError(result.message);
  }

  return (
    <Field label={label} hint={hint}>
      <div className="flex flex-col gap-2">
        {value ? (
          <div className="bg-muted relative overflow-hidden rounded-md border">
            {/* An arbitrary user URL, inside the editor rather than on a
                public page. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt=""
              className="h-24 w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label={`Remove ${label.toLowerCase()}`}
              className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        ) : null}

        <div className="relative flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus aria-hidden="true" />
            )}
            {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
          </Button>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_MIME.join(",")}
            className="sr-only"
            onChange={(event) => {
              void onFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </div>

        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="…or paste an image URL"
          className="text-xs"
          spellCheck={false}
        />

        {error ? (
          <p role="alert" className="text-destructive text-[11px]">
            {error}
          </p>
        ) : null}
      </div>
    </Field>
  );
}
