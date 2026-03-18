"use client";

import { supabase } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cartStore";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isLogin, setIsLogin] = useState<boolean | null>(null);
  const count = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setIsLogin(!!data.user);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLogin(!!session?.user);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

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
            href={isLogin ? "/account" : "/login"}
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            {isLogin ? "Account" : "Login"}
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
