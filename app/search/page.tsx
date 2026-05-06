// app/search/page.tsx
import ShopFilterBar from "@/components/products/shop-filter-bar";
import { getSearchCategoryIds } from "@/lib/cached-categories";
import { supabase } from "@/lib/supabase/client";
import { Category, ProductCard } from "@/types";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PageProps {
  searchParams: {
    q?: string;
    sort?: string;
    category?: string;
  };
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const sort = params.sort;
  const category = params.category;

  let products: ProductCard | null = null;
  let categories: Category | null = null;

  if (q) {
    let query = supabase
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
      .eq("is_active", true)
      .ilike("name", `%${q}%`);

    if (sort === "price-asc") {
      query = query.order("price", { ascending: true });
    } else if (sort === "price-desc") {
      query = query.order("price", { ascending: false });
    } else {
      query = query.order("name", { ascending: true });
    }

    if (category) {
      query = query.eq("categories.slug", category);
    }

    const { data: productsData } = await query;
    products = productsData as ProductCard;

    const categoryIds = await getSearchCategoryIds(q);

    if (categoryIds.length > 0) {
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("name, slug")
        .in("id", categoryIds);
      categories = categoriesData as Category;
    }
  }

  const resultCount = products?.length ?? 0;

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="border-b border-black/10 bg-white">
        <div className="max-w-360 mx-auto px-6 sm:px-10 md:px-16 py-12 md:py-16">
          <p className="text-[17px] font-normal font-newsreader text-foreground-secondary mb-4">
            Search Results
          </p>

          {q ? (
            <>
              {/* Content */}
              <div className="max-w-3xl">
                <h1 className=" mb-3 font-bold text-[35px] sm:text-[58px] tracking-[4px] font-playfair">
                  &ldquo;{q}&rdquo;
                </h1>

                <p className="text-[13px] text-foreground-muted">
                  {resultCount === 0
                    ? "No products found"
                    : `${resultCount} product${resultCount !== 1 ? "s" : ""}`}{" "}
                </p>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl md:text-5xl font-newsreader text-foreground mb-2">
                What are you looking for?
              </h1>
              <p className="text-sm tracking-[1px] text-foreground-muted">
                Enter a search term to explore our collection.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Filter bar — only when there are results with categories */}
      {q && categories && categories.length > 0 && (
        <ShopFilterBar categories={categories} />
      )}

      {/* Results grid */}
      {q && (
        <div className="max-w-360 px-6 sm:px-10 md:px-16 mx-auto py-10 md:py-14">
          {resultCount === 0 ? (
            <EmptyState query={q} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {products?.map((product) => {
                const primaryImage =
                  product.product_images?.find((img) => img.is_primary) ??
                  product.product_images?.[0];

                return (
                  <Link
                    href={`products/${product.slug}`}
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
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-[11px] tracking-[1.5px] text-foreground-muted uppercase mb-1">
                        {product.categories?.name}
                      </p>
                      <p className="text-[16px] font-regular text-foreground font-newsreader">
                        {product.name}
                      </p>
                      <p className="text-[13px] tracking-[1px] text-foreground-muted mt-1">
                        {formatPrice(product.price)} MMK
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Search size={40} className="text-black/10 mb-6" strokeWidth={1} />
      <p className="font-newsreader text-2xl text-foreground mb-2">
        No results for &ldquo;{query}&rdquo;
      </p>
      <p className="text-sm text-foreground-muted tracking-[1px] mb-8">
        Try a different spelling or browse our collections below.
      </p>
      <div className="flex gap-4">
        {[
          { label: "Men", href: "/men" },
          { label: "Women", href: "/women" },
          { label: "Kids", href: "/kids" },
        ].map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="px-5 py-2 text-[12px] tracking-[2px] uppercase border border-black/20 hover:bg-black hover:text-white transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
