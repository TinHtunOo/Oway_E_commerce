"use client";

import Image from "next/image";
import { useCart } from "@/hooks/useCart";

export default function CartPage() {
  const { items, total, increaseQty, decreaseQty, removeItem, loading } =
    useCart();

  if (loading) return <div className="p-6">Loading...</div>;

  if (items.length === 0) {
    return <div className="p-6">Cart is empty</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="mb-6">Cart</h1>

      <div className="space-y-4">
        {items.map((item) => (
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
