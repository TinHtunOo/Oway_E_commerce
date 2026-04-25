import { supabase } from "@/lib/supabase/client";
import { ProductCard } from "@/types";
import Image from "next/image";
import Link from "next/link";

interface AccessoriesProps {
  audience: string;
  accessories: ProductCard;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export default async function Accessories({
  audience,
  accessories,
}: AccessoriesProps) {
  const products = accessories as ProductCard; // ← array type

  return (
    <div className="max-w-360 px-6 sm:px-10 md:px-16 mx-auto">
      <h2 className="mb-3 font-bold text-[20px] uppercase sm:text-[32px] tracking-[4px] font-playfair ">
        {audience}&apos;s Accessories
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6  py-10 md:py-14">
        {products?.map((product) => {
          const primaryImage =
            product.product_images?.find((img) => img.is_primary) ??
            product.product_images?.[0];
          return (
            <Link
              href={`/men/${product.slug}`}
              key={product.id}
              className="mb-10 border border-white hover:border-surface-dark p-px"
            >
              <div className="relative w-full aspect-[13/20] mb-3">
                {primaryImage ? (
                  <Image
                    src={primaryImage.url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                    No img
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-[16px] font-regular text-foreground font-newsreader">
                  {product.name}
                </p>
                <p className="text-[13px] font-regular tracking-[1px] text-foreground-muted mt-1">
                  {formatPrice(product.price)} MMK
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
