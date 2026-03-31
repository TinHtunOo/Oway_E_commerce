"use client";

import { useCartStore } from "@/store/cartStore";
import { supabase } from "@/lib/supabase/client";
import { useQueries } from "@tanstack/react-query";

export const useCart = () => {
  const {
    items,
    userId,
    addItem,
    removeItem,
    increaseQty,
    decreaseQty,
    clearCart,
  } = useCartStore();

  const productIds = items.map((i) => i.product_id);

  // ── Fetch product data for cart items ─────────────────────────────────────
  const productsData = useQueries({
    queries: productIds.map((id) => ({
      queryKey: ["product", id],
      queryFn: async () => {
        const { data } = await supabase
          .from("products")
          .select(
            `id, name, slug, price, stock, product_images (url, is_primary)`,
          )
          .eq("id", id)
          .single();
        return data;
      },
      staleTime: 1000 * 60 * 5,
    })),
  });

  // ── Join items with product data ───────────────────────────────────────────
  const products = Object.fromEntries(
    productsData
      .filter((result) => result.data)
      .map((result) => [result.data!.id, result.data]),
  );

  const cartItems = items.map((item) => ({
    ...item,
    product: products[item.product_id] ?? null,
  }));

  const total = cartItems.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0,
  );

  return {
    items: cartItems,
    total,
    isLoggedIn: !!userId,
    addItem,
    removeItem,
    increaseQty,
    decreaseQty,
    clearCart,
  };
};
