"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cartStore";

export const useCart = () => {
  const {
    items,
    isLoggedIn,
    addItem,
    removeItem,
    increaseQty,
    decreaseQty,
    clearCart,
    initCart,
  } = useCartStore();

  const [products, setProducts] = useState<Record<string, any>>({});
  const [productsLoading, setProductsLoading] = useState(false);
  const fetchedIds = useRef<Set<string>>(new Set());

  // ── Init once on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    initCart();
  }, []);

  // ── Re-init on auth state change ───────────────────────────────────────────
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") initCart();
      if (event === "SIGNED_OUT") {
        clearCart();
        useCartStore.setState({ isLoggedIn: false });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Fetch missing products ─────────────────────────────────────────────────
  useEffect(() => {
    if (items.length === 0) return;

    const ids = [...new Set(items.map((i) => i.product_id))];
    const missingIds = ids.filter((id) => !fetchedIds.current.has(id));

    if (missingIds.length === 0) return;

    // mark as fetched immediately to prevent duplicate requests
    missingIds.forEach((id) => fetchedIds.current.add(id));

    let cancelled = false; // prevent state update if component unmounts

    const fetch = async () => {
      setProductsLoading(true);

      const { data } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          slug,
          price,
          stock,
          product_images (
            url,
            is_primary
          )
        `,
        )
        .in("id", missingIds);

      if (cancelled) return;

      if (data) {
        setProducts((prev) => ({
          ...prev,
          ...Object.fromEntries(data.map((p) => [p.id, p])),
        }));
      }

      setProductsLoading(false);
    };

    fetch();

    return () => {
      cancelled = true;
    };
  }, [items]); // ← removed fetchProducts from deps, no more useCallback needed

  // ── Join items with product data ───────────────────────────────────────────
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
    isLoggedIn,
    productsLoading,
    addItem,
    removeItem,
    increaseQty,
    decreaseQty,
    clearCart,
  };
};
