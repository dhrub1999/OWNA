import Link from "next/link";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <Link
        href="/"
        className="mb-10 text-lg font-semibold tracking-tight"
        aria-label="OWNA home"
      >
        OWNA
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
