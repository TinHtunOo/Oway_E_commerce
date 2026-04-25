import CategoryHeader from "@/components/products/category-header";
import CategoryNavigation from "@/components/products/category-navigation-section";
import ShopFilterBar from "@/components/products/shop-filter-bar";
import { supabase } from "@/lib/supabase/client";
import { Category, ProductCard } from "@/types";
import Image from "next/image";
import Link from "next/link";

interface PageProps {
  searchParams: {
    category?: string;
  };
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category;
  const { data: categoriesdata } = await supabase
    .from("categories")
    .select("name, slug");

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
    .eq("audience", "women")
    .order("name", { ascending: true });

  if (category) {
    query = query.eq("categories.slug", category);
  }

  const { data: productsdata, error } = await query;

  const products = productsdata as ProductCard;
  const categories = categoriesdata as Category;

  if (error) {
    console.error(error);
    return <p className="text-red-500 p-6">Failed to load products.</p>;
  }
  return (
    <main>
      <CategoryHeader
        navigation="Women"
        title="Women's Collection"
        description="Elegant htamein, silk garments, and traditional accessories for every occasion."
        productCount={products?.length}
      />{" "}
      <ShopFilterBar
        categories={["Men", "Women", "Shoes", "Accessories"]}
        // onSortChange={(val) => console.log(val)}
        // onCategoryChange={(val) => console.log(val)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-4 gap-6 max-w-360 px-6 sm:px-10 md:px-16 mx-auto  py-10 md:py-14">
        {products?.map((product) => {
          const primaryImage =
            product.product_images?.find((img) => img.is_primary) ??
            product.product_images?.[0];
          return (
            <Link
              href={`/women/${product.slug}`}
              key={product.id}
              className="mb-10 border border-white hover:border-surface-dark p-px"
            >
              <div className="relative w-full  aspect-[13/20] mb-3 ">
                {primaryImage ? (
                  //   <img
                  //     src={primaryImage.url}
                  //     alt={product.name}
                  //     className=" object-cover border border-gray-100"
                  //   />
                  <Image
                    src={primaryImage.url}
                    alt={product.name}
                    fill
                    className="object-cover "
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
                <p className="text-[13px] font-regular tracking-[1px]  text-foreground-muted mt-1">
                  {formatPrice(product.price)} MMK
                </p>
              </div>
            </Link>
          );
        })}
      </div>
      <CategoryNavigation
        categories={[
          {
            title: "Men's Collection",

            description:
              "Discover our curated selection of traditional Myanmar garments for men — from everyday longyi to ceremonial paso.",
            href: "/men",
            navigation: "Men",
          },
          {
            title: "Kid's Collection",
            description:
              "Adorable traditional longyi and outfits for children, crafted with comfort and cultural pride.",
            href: "/kids",
            navigation: "Kids",
          },
        ]}
      />
    </main>
  );
}
