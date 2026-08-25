import { cn } from "@/lib/utils"

/**
 * Placeholder shape for content that has not arrived.
 *
 * Tinted from `foreground`, not from `muted`. In this palette `--muted` and
 * `--background` are both `#F7F6F2` in light mode, so a `bg-muted` skeleton was
 * exactly the colour of the page behind it — every loading state in the app
 * rendered as blank space. Deriving the tint from the contrasting colour means
 * it cannot collide with whatever surface it is placed on, in either theme.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-foreground/10", className)}
      {...props}
    />
  )
}

export { Skeleton }
