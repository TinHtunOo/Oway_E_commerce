import { unstable_cache } from "next/cache";
import { supabase } from "./supabase/client";

export const getMenCategoryIds = unstable_cache(
  async () => {
    const { data } = await supabase
      .from("products")
      .select("categories!inner(id)")
      .eq("is_active", true)
      .eq("audience", "men");

    return [...new Set(data?.map((p: any) => p.categories.id) ?? [])];
  },
  ["men-category-ids"], // cache key
  { revalidate: 3600 }, // revalidate every 1 hour
);

export const getWomenCategoryIds = unstable_cache(
  async () => {
    const { data } = await supabase
      .from("products")
      .select("categories!inner(id)")
      .eq("is_active", true)
      .eq("audience", "women");

    return [...new Set(data?.map((p: any) => p.categories.id) ?? [])];
  },
  ["women-category-ids"], // cache key
  { revalidate: 3600 }, // revalidate every 1 hour
);

export const getKidCategoryIds = unstable_cache(
  async () => {
    const { data } = await supabase
      .from("products")
      .select("categories!inner(id)")
      .eq("is_active", true)
      .eq("audience", "kids");

    return [...new Set(data?.map((p: any) => p.categories.id) ?? [])];
  },
  ["kid-category-ids"], // cache key
  { revalidate: 3600 }, // revalidate every 1 hour
);
