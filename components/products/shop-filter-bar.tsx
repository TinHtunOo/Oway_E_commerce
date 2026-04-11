"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  categories: string[];
  // onSortChange?: (value: string) => void;
  // onCategoryChange?: (value: string) => void;
};

export default function ShopFilterBar({
  categories,
  // onSortChange,
  // onCategoryChange,
}: Props) {
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [selectedSort, setSelectedSort] = useState("Sort by");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const sortOptions = [
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
  ];

  return (
    <div className="w-full bg-surface-warm">
      <div className="max-w-360 px-6 sm:px-10 md:px-16 mx-auto py-3 flex items-center justify-between gap-4">
        {/* SORT (LEFT) */}
        <div className="relative">
          <button
            onClick={() => setSortOpen((prev) => !prev)}
            className="flex items-center gap-2 border  px-4 py-2 text-sm hover:bg-gray-50"
          >
            {selectedSort}
            <ChevronDown size={16} />
          </button>

          {sortOpen && (
            <div className="absolute mt-2 w-48 bg-white border  shadow-md z-10">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedSort(option.label);
                    setSortOpen(false);
                    // onSortChange?.(option.value);
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
            className="flex items-center gap-2 border border-stroke px-4 py-2  text-sm hover:bg-gray-50"
          >
            {selectedCategory}
            <ChevronDown size={16} />
          </button>

          {filterOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-stroke  shadow-md z-10 max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedCategory("All Categories");
                  setFilterOpen(false);
                  // onCategoryChange?.("all");
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                All Categories
              </button>

              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setFilterOpen(false);
                    // onCategoryChange?.(cat);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
