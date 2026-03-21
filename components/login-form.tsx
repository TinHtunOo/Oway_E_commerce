"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { mergeCartToDB } from "@/lib/cart/helper";

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
      console.error("Login error:", error.message);

      // Friendly error messages
      if (error.message === "Email not confirmed") {
        setServerError(
          "Please confirm your email before signing in, or ask admin to disable email confirmation.",
        );
      } else if (error.message === "Invalid login credentials") {
        setServerError("Invalid email or password. Please try again.");
      } else {
        setServerError(error.message);
      }
      return;
    }

    // Success → go to account page
    router.push("/account");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Server Error */}
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
          {serverError}
        </div>
      )}

      <div>
        <input
          {...register("email")}
          type="email"
          placeholder="Email"
          className="w-full border rounded-lg px-4 py-2"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <input
          {...register("password")}
          type="password"
          placeholder="Password"
          className="w-full border rounded-lg px-4 py-2"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-emerald-700 text-white py-2 rounded-lg hover:bg-emerald-800 disabled:opacity-50"
      >
        {isSubmitting ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
