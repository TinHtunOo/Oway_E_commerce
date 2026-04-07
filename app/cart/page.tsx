"use client";

import { useCart } from "@/hooks/useCart";
import { ProductImage } from "@/types";
import { Lock } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const {
    items,
    total,
    removeItem,
    increaseQty,
    decreaseQty,
    isLoggedIn,
    clearCart,
  } = useCart();
  const router = useRouter();
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-lg text-muted-foreground">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Your Cart</h1>

      {/* ── Item List ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {items.map((item) => {
          const product = item.product;
          const primaryImage =
            product?.product_images?.find((img: ProductImage) => img.is_primary)
              ?.url ??
            product?.product_images?.[0]?.url ??
            null;

          return (
            <div
              key={item.product_id}
              className="flex gap-4 items-center border rounded-xl p-4"
            >
              {/* Image */}
              <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-muted shrink-0">
                {primaryImage ? (
                  <Image
                    src={primaryImage}
                    alt={product?.name ?? "Product"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {product?.name ?? "Loading..."}
                </p>
                <p className="text-sm text-muted-foreground">
                  ฿{product?.price?.toFixed(2) ?? "—"}
                </p>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => decreaseQty(item.product_id)}
                  className="w-8 h-8 rounded-full border flex items-center justify-center text-lg hover:bg-muted"
                >
                  −
                </button>
                <span className="w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => increaseQty(item.product_id)}
                  className="w-8 h-8 rounded-full border flex items-center justify-center text-lg hover:bg-muted"
                >
                  +
                </button>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeItem(item.product_id)}
                className="text-sm text-destructive hover:underline shrink-0"
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Order Total ─────────────────────────────────────────────────── */}
      <div className="mt-8 border-t pt-6 flex items-center justify-between">
        <span className="text-lg font-medium">Total</span>
        <span className="text-lg font-semibold">฿{total.toFixed(2)}</span>
      </div>

      {/* ── Checkout ────────────────────────────────────────────────────── */}
      {isLoggedIn ? (
        <button
          onClick={() => router.push("/checkout")}
          className="mt-4 w-full bg-primary hover:bg-purple-500 hover:cursor-pointer text-primary-foreground rounded-xl py-3 font-medium hover:opacity-90 transition"
        >
          Checkout
        </button>
      ) : (
        <button
          onClick={() => router.push("/login")}
          className="mt-4 w-full bg-primary hover:bg-purple-500 hover:cursor-pointer text-primary-foreground rounded-xl py-3 font-medium hover:opacity-90 transition"
        >
          <span className=" flex items-center justify-center gap-1">
            <Lock size={16} /> Checkout
          </span>
        </button>
      )}

      <button
        onClick={clearCart}
        className="mt-4 w-full bg-primary hover:bg-purple-500 hover:cursor-pointer text-primary-foreground rounded-xl py-3 font-medium hover:opacity-90 transition"
      >
        Clear Cart
      </button>
    </div>
  );
}
