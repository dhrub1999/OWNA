import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        muted: "bg-muted/40 text-foreground border-border",
        destructive:
          "bg-destructive/8 text-destructive border-destructive/25 dark:bg-destructive/15 [&>svg]:text-destructive",
        warning:
          "bg-amber-500/10 text-amber-900 border-amber-500/30 dark:text-amber-200 dark:bg-amber-400/10 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400",
        success:
          "bg-emerald-500/10 text-emerald-900 border-emerald-500/30 dark:text-emerald-200 dark:bg-emerald-400/10 [&>svg]:text-emerald-600 dark:[&>svg]:text-emerald-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        role: "alert",
        className: cn(alertVariants({ variant }), className),
      },
      props
    ),
    render,
    state: { slot: "alert", variant },
  })
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-2 text-sm opacity-90 [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, alertVariants }
