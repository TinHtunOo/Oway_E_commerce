import LoginForm from "@/components/login-form";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex">
      {/* Left panel — decorative, hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-[#f5f5f3] px-16 py-12">
        <div>
          <p className="font-newsreader text-5xl leading-tight text-foreground mb-4">
            Welcome back.
          </p>
          <p className="text-sm tracking-[1.5px] text-foreground-muted">
            Sign in to access your orders, wishlist, and account details.
          </p>
        </div>
      </div>

      {/* Right panel — form slides in from left */}
      <div className="flex flex-1 flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        {/* Mobile logo */}
        <div className="flex lg:hidden mb-10">
          <Link href="/">
            <Image src="/peacock.svg" alt="Logo" width={90} height={90} />
          </Link>
        </div>

        <div className="w-full max-w-sm mx-auto lg:mx-0">
          <p className="text-[11px] tracking-[3px] uppercase text-foreground-muted mb-2">
            Sign in
          </p>
          <h1 className="font-newsreader text-3xl text-foreground mb-8">
            Your Account
          </h1>
          <LoginForm />
          <p className="mt-6 text-sm text-foreground-muted">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-foreground underline underline-offset-4 hover:text-black transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
