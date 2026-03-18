"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string;
};

type FormData = {
  full_name: string;
  avatar_url: string;
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset } = useForm<FormData>();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
        return;
      }

      setUser(data.user);

      // fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profile) {
        reset({
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
        });
      }

      setLoading(false);
    };

    getUser();
  }, [router, reset]);

  const onSubmit = async (formData: FormData) => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        avatar_url: formData.avatar_url,
      })
      .eq("id", user.id);

    if (error) {
      alert(error.message);
    } else {
      alert("Profile updated");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Account</h1>

      {/* Email */}
      <div>
        <p className="text-sm text-gray-500">Email</p>
        <p>{user?.email}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          {...register("full_name")}
          placeholder="Full Name"
          className="w-full border p-2"
        />

        <input
          {...register("avatar_url")}
          placeholder="Avatar URL"
          className="w-full border p-2"
        />

        <button type="submit" className="bg-black text-white px-4 py-2 w-full">
          Update Profile
        </button>
      </form>

      {/* Logout */}
      <button onClick={handleLogout} className="border px-4 py-2 w-full">
        Logout
      </button>
    </div>
  );
}
