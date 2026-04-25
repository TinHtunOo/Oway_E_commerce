"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

type Audience = "men" | "women" | "kids";

interface ProductImage {
  url: string;
  is_primary: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  description: string;
  product_images: ProductImage[];
  categories: Category;
}

interface AccessoriesProps {
  audience: Audience;
}

// ─── Supabase client (replace with your env vars or import) ──────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchAccessoriesProducts(
  audience: Audience,
): Promise<Product[]> {
  const { data: accessoriesCategory, error: catError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "accessories")
    .single();

  if (catError || !accessoriesCategory) {
    console.error("Accessories category not found:", catError);
    return [];
  }

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
        slug,
        parent_id
      )
    `,
    )
    .eq("is_active", true)
    .eq("audience", audience)
    .eq("categories.parent_id", accessoriesCategory.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching accessories:", error);
    return [];
  }

  return (data as unknown as Product[]) ?? [];
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function getPrimaryImage(images: ProductImage[]): string {
  return (
    images.find((img) => img.is_primary)?.url ??
    images[0]?.url ??
    "/placeholder.jpg"
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-stone-200 aspect-[3/4] rounded-2xl mb-3" />
      <div className="bg-stone-200 h-4 rounded w-3/4 mb-2" />
      <div className="bg-stone-200 h-4 rounded w-1/3" />
    </div>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const image = getPrimaryImage(product.product_images);
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col gap-3"
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-100">
        <Image
          src={image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isOutOfStock && (
            <span className="bg-stone-900 text-white text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full">
              Sold Out
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="bg-amber-400 text-stone-900 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full">
              Only {product.stock} left
            </span>
          )}
        </div>

        {/* Category tag */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-white/90 backdrop-blur-sm text-stone-700 text-[10px] font-medium uppercase tracking-widest px-2.5 py-1 rounded-full">
            {product.categories.name}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-stone-800 leading-snug line-clamp-2 group-hover:text-stone-600 transition-colors">
          {product.name}
        </h3>
        <p
          className={`text-sm font-semibold shrink-0 ${
            isOutOfStock ? "text-stone-400 line-through" : "text-stone-900"
          }`}
        >
          ${product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-6 py-2 text-sm font-semibold uppercase tracking-widest transition-colors duration-200 ${
        active ? "text-stone-900" : "text-stone-400 hover:text-stone-600"
      }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900 rounded-full" />
      )}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Accessories({ audience }: AccessoriesProps) {
  const [activeAudience, setActiveAudience] = useState<Audience>(audience);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAccessoriesProducts(activeAudience).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, [activeAudience]);

  const tabs: { label: string; value: Audience }[] = [
    { label: "Men", value: "men" },
    { label: "Women", value: "women" },
    { label: "Kids", value: "kids" },
  ];

  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400 mb-2">
              Collection
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              Accessories
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-stone-200 gap-1">
            {tabs.map((tab) => (
              <TabButton
                key={tab.value}
                label={tab.label}
                active={activeAudience === tab.value}
                onClick={() => setActiveAudience(tab.value)}
              />
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 text-stone-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                />
              </svg>
            </div>
            <p className="text-stone-500 font-medium">
              No accessories found for {activeAudience}.
            </p>
            <p className="text-stone-400 text-sm mt-1">
              Check back soon for new arrivals.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Footer link */}
        {!loading && products.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              href={`/accessories/${activeAudience}`}
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-stone-900 border-b-2 border-stone-900 pb-0.5 hover:border-stone-400 hover:text-stone-400 transition-colors duration-200"
            >
              View all {activeAudience}&apos;s accessories
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
