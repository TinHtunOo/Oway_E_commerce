import RegisterForm from "@/components/register-form";
import Image from "next/image";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-screen w-full flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-[#f5f5f3] px-16 py-12">
        <div>
          <p className="font-newsreader text-5xl leading-tight text-foreground mb-4">
            Join us today.
          </p>
          <p className="text-sm tracking-[1.5px] text-foreground-muted">
            Create an account to start shopping Myanmar&apos;s finest
            traditional garments.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        {/* Mobile logo */}
        <div className="flex lg:hidden mb-10">
          <Link href="/">
            <Image src="/peacock.svg" alt="Logo" width={90} height={90} />
          </Link>
        </div>

        <div className="w-full max-w-sm mx-auto lg:mx-0">
          <p className="text-[11px] tracking-[3px] uppercase text-foreground-muted mb-2">
            Create account
          </p>
          <h1 className="font-newsreader text-3xl text-foreground mb-8">
            Get Started
          </h1>
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
