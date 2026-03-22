"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

// ── Skeleton for a single cart row ──────────────────────────────────────────
function CartItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border animate-pulse">
      <div className="w-20 h-20 rounded-lg bg-muted shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-40 bg-muted rounded" />
        <div className="h-3 w-20 bg-muted rounded" />
      </div>
      <div className="h-8 w-24 bg-muted rounded-lg" />
      <div className="h-8 w-8 bg-muted rounded-lg" />
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────
function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <ShoppingBag
        className="w-12 h-12 text-muted-foreground"
        strokeWidth={1.25}
      />
      <div>
        <p className="text-lg font-medium">Your cart is empty</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add some items to get started
        </p>
      </div>
      <Link
        href="/products"
        className="mt-2 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4"
      >
        Continue shopping <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function CartPage() {
  const {
    items,
    total,
    productsLoading,
    increaseQty,
    decreaseQty,
    removeItem,
  } = useCart();

  const isLoading = productsLoading && items.length > 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Cart</h1>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <CartItemSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && <EmptyCart />}

      {/* Cart items */}
      {!isLoading && items.length > 0 && (
        <>
          <div className="space-y-4">
            {items.map((item) => {
              const image =
                item.product?.product_images?.find(
                  (img: any) => img.is_primary,
                ) ?? item.product?.product_images?.[0];

              return (
                <div
                  key={item.product_id}
                  className="flex items-center gap-4 border border-border p-4 rounded-xl"
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0 relative">
                    <Image
                      src={image?.url ?? "/placeholder.png"}
                      alt={item.product?.name ?? "Product image"}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Name + price */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {item.product?.name ?? "—"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      ${item.product?.price?.toFixed(2) ?? "—"}
                    </p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => decreaseQty(item.product_id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    <span className="w-6 text-center text-sm font-medium">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => increaseQty(item.product_id)}
                      disabled={
                        item.quantity >= (item.product?.stock ?? Infinity)
                      }
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line total */}
                  <p className="w-20 text-right text-sm font-medium shrink-0">
                    ${((item.product?.price ?? 0) * item.quantity).toFixed(2)}
                  </p>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-8 flex flex-col items-end gap-4">
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
              Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
