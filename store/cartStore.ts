import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";
import { supabase } from "@/lib/supabase/client";

type CartStore = {
  items: CartItem[];
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  increaseQty: (productId: string) => Promise<void>;
  decreaseQty: (productId: string) => Promise<void>;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      // =====================
      // ADD ITEM
      // =====================
      addItem: async (productId) => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // =====================
        // LOGGED-IN → DATABASE
        // =====================
        if (user) {
          // 1. get or create cart
          let { data: cart } = await supabase
            .from("carts")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (!cart) {
            const { data: newCart } = await supabase
              .from("carts")
              .insert({ user_id: user.id })
              .select("id")
              .single();

            if (!newCart) throw new Error("Failed to create cart");
            cart = newCart;
          }

          // 2. check if item exists (ONLY this product)
          const { data: existing } = await supabase
            .from("cart_items")
            .select("id, quantity")
            .eq("cart_id", cart.id)
            .eq("product_id", productId)
            .maybeSingle();

          if (existing) {
            await supabase
              .from("cart_items")
              .update({ quantity: existing.quantity + 1 })
              .eq("id", existing.id);
          } else {
            await supabase.from("cart_items").insert({
              cart_id: cart.id,
              product_id: productId,
              quantity: 1,
            });
          }

          return; // ❗ stop here (no local update)
        }

        // =====================
        // GUEST → LOCAL STORAGE
        // =====================
        const items = [...get().items];

        const existing = items.find((i) => i.product_id === productId);

        if (existing) {
          existing.quantity += 1;
        } else {
          items.push({
            id: crypto.randomUUID(),
            cart_id: "local-cart",
            product_id: productId,
            quantity: 1,
            created_at: new Date().toISOString(),
          });
        }

        set({ items });
      },

      // =====================
      // REMOVE ITEM
      // =====================
      removeItem: async (productId) => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: cart } = await supabase
            .from("carts")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (!cart) return;

          await supabase
            .from("cart_items")
            .delete()
            .eq("cart_id", cart.id)
            .eq("product_id", productId);

          return;
        }

        // guest
        set({
          items: get().items.filter((item) => item.product_id !== productId),
        });
      },

      // =====================
      // INCREASE QTY
      // =====================
      increaseQty: async (productId) => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: cart } = await supabase
            .from("carts")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (!cart) return;

          const { data: existing } = await supabase
            .from("cart_items")
            .select("id, quantity")
            .eq("cart_id", cart.id)
            .eq("product_id", productId)
            .maybeSingle();

          if (!existing) return;

          await supabase
            .from("cart_items")
            .update({ quantity: existing.quantity + 1 })
            .eq("id", existing.id);

          return;
        }

        // guest
        const items = [...get().items];
        const item = items.find((i) => i.product_id === productId);

        if (item) item.quantity += 1;

        set({ items });
      },

      // =====================
      // DECREASE QTY
      // =====================
      decreaseQty: async (productId) => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: cart } = await supabase
            .from("carts")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (!cart) return;

          const { data: existing } = await supabase
            .from("cart_items")
            .select("id, quantity")
            .eq("cart_id", cart.id)
            .eq("product_id", productId)
            .maybeSingle();

          if (!existing) return;

          if (existing.quantity <= 1) {
            await supabase.from("cart_items").delete().eq("id", existing.id);
          } else {
            await supabase
              .from("cart_items")
              .update({ quantity: existing.quantity - 1 })
              .eq("id", existing.id);
          }

          return;
        }

        // guest
        const items = [...get().items];
        const item = items.find((i) => i.product_id === productId);

        if (item) {
          item.quantity -= 1;

          if (item.quantity <= 0) {
            return get().removeItem(productId);
          }
        }

        set({ items });
      },

      // =====================
      // CLEAR CART (guest only)
      // =====================
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        items: state.items,
      }),
    },
  ),
);
