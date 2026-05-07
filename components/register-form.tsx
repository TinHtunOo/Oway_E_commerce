"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.full_name } },
    });

    if (error) {
      if (error.message === "User already registered") {
        setServerError("This email is already registered. Please sign in.");
      } else {
        setServerError(error.message);
      }
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="space-y-3">
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center mb-6">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="font-newsreader text-2xl text-foreground">
          Account created
        </p>
        <p className="text-sm text-foreground-muted tracking-[0.5px] leading-relaxed">
          Your account is ready.{" "}
          <a
            href="/login"
            className="text-foreground underline underline-offset-4"
          >
            Sign in
          </a>{" "}
          to start shopping.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="border border-red-200 bg-red-50 text-red-600 text-xs tracking-[0.5px] px-4 py-3 rounded-lg">
          {serverError}
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="block text-[11px] tracking-[2px] uppercase text-foreground-muted">
          Full Name
        </label>
        <input
          {...register("full_name")}
          placeholder="Ko Aung"
          className="w-full border border-black/10 bg-[#f9f9f9] rounded-lg px-4 py-2.5 text-sm tracking-[0.5px] text-foreground-primary placeholder:text-foreground-muted outline-none focus:border-black transition-colors"
        />
        {errors.full_name && (
          <p className="text-red-500 text-xs mt-1">
            {errors.full_name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="block text-[11px] tracking-[2px] uppercase text-foreground-muted">
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="you@example.com"
          className="w-full border border-black/10 bg-[#f9f9f9] rounded-lg px-4 py-2.5 text-sm tracking-[0.5px] text-foreground-primary placeholder:text-foreground-muted outline-none focus:border-black transition-colors"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="block text-[11px] tracking-[2px] uppercase text-foreground-muted">
          Password
        </label>
        <input
          {...register("password")}
          type="password"
          placeholder="••••••••"
          className="w-full border border-black/10 bg-[#f9f9f9] rounded-lg px-4 py-2.5 text-sm tracking-[0.5px] text-foreground-primary placeholder:text-foreground-muted outline-none focus:border-black transition-colors"
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label className="block text-[11px] tracking-[2px] uppercase text-foreground-muted">
          Confirm Password
        </label>
        <input
          {...register("confirm_password")}
          type="password"
          placeholder="••••••••"
          className="w-full border border-black/10 bg-[#f9f9f9] rounded-lg px-4 py-2.5 text-sm tracking-[0.5px] text-foreground-primary placeholder:text-foreground-muted outline-none focus:border-black transition-colors"
        />
        {errors.confirm_password && (
          <p className="text-red-500 text-xs mt-1">
            {errors.confirm_password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-black text-white py-3 rounded-lg text-[12px] tracking-[2px] uppercase hover:bg-black/80 disabled:opacity-40 transition-colors mt-2"
      >
        {isSubmitting ? "Creating account…" : "Create Account"}
      </button>
      <p className="mt-6 text-sm text-foreground-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-foreground underline underline-offset-4 hover:text-black transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
