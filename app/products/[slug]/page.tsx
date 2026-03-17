import AddToCartButton from "@/components/add-to-cart-button";
import { supabase } from "@/lib/supabase/client";
import { ProductDetail } from "@/types";
import Image from "next/image";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

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

  const product = data as ProductDetail;

  if (!product || error) {
    notFound();
  }

  const primaryImage =
    product.product_images?.find((img) => img.is_primary) ??
    product.product_images?.[0];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        {/* Product Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
          {primaryImage && (
            <img
              src={primaryImage.url}
              alt={product.name}
              className="object-cover"
            />
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm text-gray-500">{product.categories?.name}</p>

            <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>

            <p className="mt-4 text-2xl font-semibold">${product.price}</p>
          </div>

          {/* Stock */}
          <p className="text-sm text-gray-600">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          {/* Description */}
          <p className="text-gray-700">{product.description}</p>

          {/* Add to Cart Button */}
          <AddToCartButton productId={product.id} />
        </div>
      </div>
    </div>
  );
}
