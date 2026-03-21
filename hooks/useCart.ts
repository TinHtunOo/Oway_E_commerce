"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cartStore";

export const useCart = () => {
  const localItems = useCartStore((state) => state.items);
  const store = useCartStore();

  const [items, setItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // =====================
  // LOAD CART (guest / user)
  // =====================

  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoggedIn(false);
        setItems(localItems);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);

      const { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!cart) {
        setItems([]);
        setLoading(false);
        return;
      }

      const { data: cartItems } = await supabase
        .from("cart_items")
        .select("*")
        .eq("cart_id", cart.id);

      setItems(cartItems || []);
      setLoading(false);
    };
    loadCart();
  }, [localItems]);

  // =====================
  // LOAD PRODUCTS
  // =====================

  useEffect(() => {
    const loadProducts = async (cartItems: any[]) => {
      if (cartItems.length === 0) {
        setProducts([]);
        return;
      }

      const ids = [...new Set(cartItems.map((i) => i.product_id))];

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
        .in("id", ids);

      setProducts(data || []);
    };
    loadProducts(items);
  }, [items]);

  // =====================
  // EFFECTS
  // =====================

  // =====================
  // MERGE
  // =====================
  const merged = items.map((item) => {
    const product = products.find((p) => p.id === item.product_id);

    return {
      ...item,
      products: product,
    };
  });

  const total = merged.reduce(
    (sum, item) => sum + (item.products?.price || 0) * item.quantity,
    0,
  );

  // =====================
  // ACTION WRAPPERS
  // =====================
  const addItem = async (productId: string) => {
    await store.addItem(productId);
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === productId);

      if (existing) {
        return prev.map((i) =>
          i.product_id === productId ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }

      return [
        ...prev,
        {
          product_id: productId,
          quantity: 1,
        },
      ];
    });
  };

  const removeItem = async (productId: string) => {
    await store.removeItem(productId);
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  };

  const increaseQty = async (productId: string) => {
    await store.increaseQty(productId);
    setItems((prev) =>
      prev.map((i) =>
        i.product_id === productId ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    );
  };

  const decreaseQty = async (productId: string) => {
    await store.decreaseQty(productId);
    setItems((prev) =>
      prev
        .map((i) =>
          i.product_id === productId ? { ...i, quantity: i.quantity - 1 } : i,
        )
        .filter((i) => i.quantity > 0),
    );
  };

  return {
    items: merged,
    total,
    loading,
    isLoggedIn,
    addItem,
    removeItem,
    increaseQty,
    decreaseQty,
  };
};
