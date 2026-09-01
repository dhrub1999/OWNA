import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * First letter of the first and last word, e.g. "Jane Doe" -> "JD". Falls
 * back to "?" for a name-less profile rather than rendering an empty circle.
 */
function initials(name: string | null) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return "?";
  const first = parts[0]!.charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : "";
  return (first + last).toUpperCase();
}

export function UserAvatar({
  avatarUrl,
  name,
  size,
  className,
}: {
  avatarUrl: string | null;
  name: string | null;
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  return (
    <Avatar size={size} className={className}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
      <AvatarFallback>{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
