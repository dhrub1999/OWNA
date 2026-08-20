"use client";

import { profileUrlLabel } from "@/lib/site";
import { snapshotSeo } from "@/lib/blocks/snapshot";
import { draftToSnapshot } from "@/lib/editor/document";
import { ImageField } from "./image-field";
import {
  PanelSection,
  SegmentedField,
  TextAreaField,
  TextField,
} from "./controls";
import { useEditor, useEditorDispatch } from "./editor-store";

/**
 * Page-level settings: who this profile is, and how it looks when shared.
 *
 * The SEO fields show the generated fallback as placeholder text rather than
 * pre-filling it, so a user who writes nothing still gets a sensible title and
 * a user who writes something is never fighting a default.
 */
export function PagePanel() {
  const { document } = useEditor();
  const dispatch = useEditorDispatch();
  const { profile } = document;

  const set = (patch: Partial<typeof profile>, field: string) =>
    dispatch({ type: "update-profile", patch, field });

  const generated = snapshotSeo(draftToSnapshot(document));

  return (
    <>
      <PanelSection title="Profile">
        <TextField
          label="Display name"
          value={profile.displayName}
          onChange={(value) => set({ displayName: value }, "displayName")}
          placeholder={profile.username}
          maxLength={80}
        />
        <TextAreaField
          label="Bio"
          value={profile.bio}
          onChange={(value) => set({ bio: value }, "bio")}
          maxLength={500}
          rows={3}
          placeholder="Used when a block leaves its own bio blank."
        />
        <ImageField
          label="Profile photo"
          value={profile.avatarUrl}
          onChange={(value) => set({ avatarUrl: value }, "avatarUrl")}
        />
        <TextField
          label="Status"
          value={profile.status}
          onChange={(value) => set({ status: value }, "status")}
          placeholder="Open to work"
          maxLength={60}
        />
        <TextField
          label="Location"
          value={profile.location}
          onChange={(value) => set({ location: value }, "location")}
          maxLength={60}
        />
      </PanelSection>

      <PanelSection title="Sharing" defaultOpen={false}>
        <TextField
          label="Page title"
          value={profile.seoTitle}
          onChange={(value) => set({ seoTitle: value }, "seoTitle")}
          placeholder={generated.title}
          hint="Search results & tabs"
          maxLength={120}
        />
        <TextAreaField
          label="Description"
          value={profile.seoDescription}
          onChange={(value) => set({ seoDescription: value }, "seoDescription")}
          placeholder={generated.description}
          maxLength={300}
          rows={3}
        />
        <ImageField
          label="Social preview"
          value={profile.ogImageUrl}
          onChange={(value) => set({ ogImageUrl: value }, "ogImageUrl")}
          hint="1200×630 works best"
        />
        <p className="text-muted-foreground text-[11px]">
          Leave the preview blank and we’ll generate one from your theme.
        </p>
      </PanelSection>

      <PanelSection title="Visibility" defaultOpen={false}>
        <SegmentedField
          label="Who can see this"
          value={profile.visibility}
          onChange={(value) => set({ visibility: value }, "visibility")}
          options={[
            { value: "public", label: "Public" },
            { value: "unlisted", label: "Unlisted" },
            { value: "private", label: "Private" },
          ]}
          columns={3}
        />
        <p className="text-muted-foreground text-[11px]">
          {profile.visibility === "public"
            ? `Anyone can find ${profileUrlLabel(profile.username)}.`
            : profile.visibility === "unlisted"
              ? "Reachable by link, but kept out of search and the sitemap."
              : "Nobody but you. The public URL returns a 404."}
        </p>
      </PanelSection>
    </>
  );
}
