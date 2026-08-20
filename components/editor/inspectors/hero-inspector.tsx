"use client";

import { AlignCenter, AlignLeft } from "lucide-react";
import { ImageField } from "../image-field";
import {
  PanelSection,
  SegmentedField,
  SwitchField,
  TextAreaField,
  TextField,
} from "../controls";
import { useEditor } from "../editor-store";
import { useBlockProps, type InspectorProps } from "./use-block-props";

export function HeroInspector({ block }: InspectorProps) {
  const [props, set] = useBlockProps<"hero">(block);
  const { profile } = useEditor().document;

  return (
    <>
      <PanelSection title="Content">
        <TextField
          label="Name"
          value={props.headline}
          onChange={(value) => set("headline", value)}
          placeholder={profile.displayName || profile.username}
          hint="Leave blank to use your profile name"
          maxLength={80}
        />
        <TextField
          label="Tagline"
          value={props.tagline}
          onChange={(value) => set("tagline", value)}
          placeholder="UI Engineer · Designer · Builder"
          maxLength={120}
        />
        <TextAreaField
          label="Bio"
          value={props.bio}
          onChange={(value) => set("bio", value)}
          placeholder="A sentence or two about you."
          maxLength={500}
          rows={4}
        />
        <ImageField
          label="Photo"
          value={props.avatarUrl}
          onChange={(value) => set("avatarUrl", value)}
          hint={profile.avatarUrl && !props.avatarUrl ? "Using your account photo" : undefined}
        />
        <TextField
          label="Status"
          value={props.status}
          onChange={(value) => set("status", value)}
          placeholder="Building something new"
          maxLength={60}
        />
        <TextField
          label="Location"
          value={props.location}
          onChange={(value) => set("location", value)}
          placeholder="Kolkata, India"
          maxLength={60}
        />
      </PanelSection>

      <PanelSection title="Appearance">
        <SegmentedField
          label="Alignment"
          value={props.align}
          onChange={(value) => set("align", value)}
          options={[
            { value: "left", label: "Left", icon: <AlignLeft className="size-3.5" /> },
            { value: "center", label: "Center", icon: <AlignCenter className="size-3.5" /> },
          ]}
        />
        <SegmentedField
          label="Photo size"
          value={props.avatarSize}
          onChange={(value) => set("avatarSize", value)}
          options={[
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
          ]}
        />
        <SwitchField
          label="Show photo"
          checked={props.showAvatar}
          onChange={(value) => set("showAvatar", value)}
        />
        <SwitchField
          label="Show @username"
          checked={props.showUsername}
          onChange={(value) => set("showUsername", value)}
        />
      </PanelSection>
    </>
  );
}
