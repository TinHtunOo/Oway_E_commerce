import AddToCartButton from "@/components/add-to-cart-button";
import { ProductDetail } from "@/types";
import { formatPrice } from "@/app/men/page";
import Image from "next/image";

interface ProductDetailProps {
  product: ProductDetail;
}

export default function ProductDetailView({ product }: ProductDetailProps) {
  if (product == null) return <div>Wrong Product</div>;

  const images = product.product_images ?? [];
  const primaryImage = images.find((img) => img.is_primary) ?? images[0];
  const inStock = product.stock > 0;

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-360 mx-auto px-6 sm:px-10 md:px-16 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20">
          {/* ── Image panel ── */}
          <div className="space-y-3 max-w-sm mx-auto w-full">
            <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl bg-[#f5f5f5]">
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="h-full w-full bg-black/5" />
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[#f5f5f5] border-2 transition-colors ${
                      img.is_primary ? "border-black" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`${product.name} ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Info panel ── */}
          <div className="flex flex-col gap-6 md:py-4">
            <div>
              <p className="text-[11px] tracking-[3px] uppercase text-foreground-muted mb-2">
                {product.categories?.name}
              </p>
              <h1 className="font-newsreader text-3xl md:text-4xl text-foreground leading-tight">
                {product.name}
              </h1>
            </div>

            <p className="font-newsreader text-2xl text-foreground">
              {formatPrice(product.price)}{" "}
              <span className="text-base text-foreground-muted">MMK</span>
            </p>

            <div className="border-t border-black/10" />

            {product.description && (
              <p className="text-sm text-foreground-muted leading-relaxed tracking-[0.5px]">
                {product.description}
              </p>
            )}

            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${inStock ? "bg-green-500" : "bg-red-400"}`}
              />
              <p className="text-xs tracking-[1.5px] uppercase text-foreground-muted">
                {inStock ? `${product.stock} in stock` : "Out of stock"}
              </p>
            </div>

            <div className="pt-2">
              <AddToCartButton productId={product.id} />
            </div>

            <div className="border-t border-black/10" />

            <dl className="space-y-2">
              <div className="flex justify-between text-xs tracking-[1px]">
                <dt className="uppercase text-foreground-muted">Category</dt>
                <dd className="text-foreground-primary">
                  {product.categories?.name}
                </dd>
              </div>
              <div className="flex justify-between text-xs tracking-[1px]">
                <dt className="uppercase text-foreground-muted">
                  Availability
                </dt>
                <dd className={inStock ? "text-green-600" : "text-red-500"}>
                  {inStock ? "In Stock" : "Out of Stock"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </main>
  );
}
