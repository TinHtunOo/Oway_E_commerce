"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { supabase } from "@/lib/supabase/client";

export default function CartPage() {
  const cartItems = useCartStore((state) => state.items);
  const { removeItem, increaseQty, decreaseQty } = useCartStore();

  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (cartItems.length === 0) return;

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

    fetchProducts();
  }, [cartItems]);

  const merged = cartItems?.map((item) => {
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

  if (cartItems.length === 0) {
    return <div className="p-6">Cart is empty</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="mb-6">Cart</h1>

      <div className="space-y-4">
        {merged.map((item) => (
          <div
            key={item.product_id}
            className="flex items-center gap-4 border p-4 rounded-xl"
          >
            <Image
              src={
                item.products?.product_images?.[0]?.url || "/placeholder.png"
              }
              alt={item.products?.name || ""}
              width={80}
              height={80}
              className="rounded-lg"
            />

            <div className="flex-1">
              <h2 className="h4">{item.products?.name}</h2>
              <p>${item.products?.price}</p>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => decreaseQty(item.product_id)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => increaseQty(item.product_id)}>+</button>
            </div>

            <button
              onClick={() => removeItem(item.product_id)}
              className="text-red-500"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between">
        <h2 className="h3">Total: ${total.toFixed(2)}</h2>
      </div>
    </div>
  );
}
