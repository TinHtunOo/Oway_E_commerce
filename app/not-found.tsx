import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-sm w-full space-y-6">
        <div>
          <p className="font-newsreader text-[120px] leading-none text-black/5 select-none">
            404
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] tracking-[3px] uppercase text-foreground-muted">
            Page Not Found
          </p>
          <h1 className="font-newsreader text-3xl text-foreground">
            Nothing here.
          </h1>
          <p className="text-sm text-foreground-muted tracking-[0.5px] leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist yet. We&apos;re
            still building. Check back soon.{" "}
          </p>
        </div>

        <div className="border-t border-black/10" />

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="flex items-center justify-center w-full bg-black text-white py-3 rounded-lg text-[12px] tracking-[2px] uppercase hover:bg-black/80 transition-colors"
          >
            Go Home
          </Link>
          <div className="flex gap-3">
            {[
              { label: "Men", href: "/men" },
              { label: "Women", href: "/women" },
              { label: "Kids", href: "/kids" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="flex-1 flex items-center justify-center py-3 border border-black/10 rounded-lg text-[11px] tracking-[2px] uppercase text-foreground-muted hover:border-black hover:text-black transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
