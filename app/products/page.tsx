import CategoryFilter from "@/components/category-filter";
import { supabase } from "@/lib/supabase/client";
import { Category, ProductCard } from "@/types";
import Image from "next/image";
import Link from "next/link";

interface PageProps {
  searchParams: {
    category?: string;
  };
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
    .order("created_at", { ascending: false });

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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Products</h1>
        <CategoryFilter categories={categories} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm text-left text-gray-600">
          {/* HEAD */}
          <thead className="bg-gray-50 text-xs uppercase text-gray-400 border-b border-gray-200">
            <tr>
              <th className="px-4 py-4 w-16">Image</th>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Description</th>
              <th className="px-4 py-4">Category</th>
              <th className="px-4 py-4 text-right">Price</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-gray-100">
            {products?.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">
                  No products found.
                </td>
              </tr>
            ) : (
              products?.map((product) => {
                const primaryImage =
                  product.product_images?.find((img) => img.is_primary) ??
                  product.product_images?.[0];

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* IMAGE */}
                    <td className="px-4 py-3">
                      {primaryImage ? (
                        <img
                          src={primaryImage.url}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                          No img
                        </div>
                      )}
                    </td>

                    {/* NAME */}
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                      <Link href={`/products/${product.slug}`}>
                        {product.name}
                      </Link>
                    </td>

                    {/* DESCRIPTION */}
                    <td className="px-4 py-3 max-w-xs">
                      <p className="line-clamp-2 text-gray-500">
                        {product.description ?? "—"}
                      </p>
                    </td>

                    {/* CATEGORY */}
                    <td className="px-4 py-3">
                      {product.categories ? (
                        <span className="inline-block bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-full">
                          {product.categories.name}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* PRICE */}
                    <td className="px-4 py-3 text-right font-semibold text-gray-800 whitespace-nowrap">
                      ${Number(product.price).toFixed(2)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
