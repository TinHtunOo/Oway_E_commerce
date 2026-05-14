import { supabase } from "@/lib/supabase/client";
import { ProductDetail } from "@/types";

export async function getProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
    id,
    name,
    slug,
    price,
    stock,
    description,
    product_images (
      url,
      is_primary
    ),
    categories!inner (
      id,
      name,
      slug
    )
  `,
    )
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data as unknown as ProductDetail;
}
