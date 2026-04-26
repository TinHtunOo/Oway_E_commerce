"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Category } from "@/types";

interface Props {
  categories: Category;
}

function toTitleCase(str: string) {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ShopFilterBar({ categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const selectedSort = searchParams.get("sort") ?? "Sort by";
  const selectedCategory = searchParams.get("category") ?? "All Categories";

  const sortOptions = [
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
  ];

  // const updateParam = (key: string, value: string | null) => {
  //   const params = new URLSearchParams(searchParams.toString());
  //   if (value === null) {
  //     params.delete(key);
  //   } else {
  //     params.set(key, value);
  //   }
  //   router.push(`${pathname}?${params.toString()}`);
  // };
  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false }); // 👈
  };

  return (
    <div className="w-full bg-surface-warm">
      <div className="max-w-360 px-6 sm:px-10 md:px-16 mx-auto py-3 flex items-center justify-between gap-4">
        {/* SORT (LEFT) */}
        <div className="relative">
          <button
            onClick={() => setSortOpen((prev) => !prev)}
            className="flex items-center gap-2 border px-4 py-2 text-sm hover:bg-gray-50"
          >
            {selectedSort === "price-asc"
              ? "Price: Low to High"
              : selectedSort === "price-desc"
                ? "Price: High to Low"
                : "Sort by"}
            <ChevronDown size={16} />
          </button>

          {sortOpen && (
            <div className="absolute mt-2 w-48 bg-white border shadow-md z-10">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    updateParam("sort", option.value);
                    setSortOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* FILTER (RIGHT) */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen((prev) => !prev)}
            className="flex items-center gap-2 border border-stroke px-4 py-2 text-sm hover:bg-gray-50"
          >
            {toTitleCase(selectedCategory)}
            <ChevronDown size={16} />
          </button>

          {filterOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-stroke shadow-md z-10 max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  updateParam("category", null);
                  setFilterOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                All Categories
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => {
                    updateParam("category", cat.slug);
                    setFilterOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
