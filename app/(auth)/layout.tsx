import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <Link
        href="/"
        className="mb-10 text-foreground hover:text-logo-hover transition-colors"
        aria-label="OWNA home"
      >
        <Logo className="h-8 w-auto" />
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
