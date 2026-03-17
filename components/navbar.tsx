"use client";

import { useCartStore } from "@/store/cartStore";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const count = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="text-lg font-semibold">
          Logo
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            Home
          </Link>
          <Link
            href="/products"
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            Products
          </Link>

          <Link
            href="/cart"
            className=" relative text-sm font-medium text-gray-700 hover:text-black"
          >
            <ShoppingCart />

            {count > 0 && (
              <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full px-2">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
