"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      if (error.message === "Email not confirmed") {
        setServerError("Please confirm your email before signing in.");
      } else if (error.message === "Invalid login credentials") {
        setServerError("Invalid email or password. Please try again.");
      } else {
        setServerError(error.message);
      }
      return;
    }

    router.push("/account");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="border border-red-200 bg-red-50 text-red-600 text-xs tracking-[0.5px] px-4 py-3 rounded-lg">
          {serverError}
        </div>
      )}

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

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-black text-white py-3 rounded-lg text-[12px] tracking-[2px] uppercase hover:bg-black/80 disabled:opacity-40 transition-colors mt-2"
      >
        {isSubmitting ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
