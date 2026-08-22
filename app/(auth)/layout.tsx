import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <Link href="/" className="mb-10" aria-label="OWNA home">
        <Image
          src="/assets/logo/logo-with-name.svg"
          alt="OWNA"
          width={88}
          height={32}
          priority
        />
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
