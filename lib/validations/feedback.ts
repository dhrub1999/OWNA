import { z } from "zod";

export const HEARD_ABOUT_OPTIONS = [
  { value: "twitter", label: "Twitter / X" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "google", label: "Google search" },
  { value: "friend", label: "A friend or colleague" },
  { value: "other", label: "Somewhere else" },
] as const;

export const feedbackSchema = z.object({
  message: z.string().trim().min(1, "Say a little more?").max(2000),
  heardAbout: z
    .enum(HEARD_ABOUT_OPTIONS.map((option) => option.value) as [string, ...string[]])
    .optional(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
