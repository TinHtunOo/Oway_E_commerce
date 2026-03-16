"use client";

import { Category } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";

interface CategoryFilterProps {
  categories: Category;
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category");

  const handleFilter = (slug: string | null) => {
    const params = new URLSearchParams(searchParams);

    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }

    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => handleFilter(null)}
        className={`rounded-md px-4 py-2 text-sm border ${
          !currentCategory ? "bg-black text-white" : "bg-white text-gray-700"
        }`}
      >
        All
      </button>

      {categories.map((category) => (
        <button
          key={category.slug}
          onClick={() => handleFilter(category.slug)}
          className={`rounded-md px-4 py-2 text-sm border ${
            currentCategory === category.slug
              ? "bg-black text-white"
              : "bg-white text-gray-700"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
