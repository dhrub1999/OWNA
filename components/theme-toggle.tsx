"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const TOGGLE_CLASS_NAME = cn(
  buttonVariants({ variant: "ghost", size: "icon" }),
  "rounded-full h-9 w-9 border border-border"
)

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  // AnimatedThemeToggler renders one of two icons depending on the resolved
  // theme, which next-themes only knows client-side — rendering it before
  // mount would mismatch the server's markup. A same-sized, inert button
  // holds the layout until then, same as next-themes' own guidance.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-9 w-9 border border-border"
        aria-hidden
        tabIndex={-1}
      />
    )
  }

  const currentTheme = theme === "system" ? resolvedTheme : theme

  return (
    <AnimatedThemeToggler
      theme={currentTheme === "dark" ? "dark" : "light"}
      onThemeChange={setTheme}
      className={TOGGLE_CLASS_NAME}
    />
  )
}
