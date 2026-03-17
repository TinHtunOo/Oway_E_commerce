import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";

type CartStore = {
  items: CartItem[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  increaseQty: (productId: string) => void;
  decreaseQty: (productId: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId) => {
        const items = [...get().items];

        const existing = items.find((item) => item.product_id === productId);

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

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.product_id !== productId),
        });
      },

      increaseQty: (productId) => {
        const items = [...get().items];
        const item = items.find((i) => i.product_id === productId);

        if (item) item.quantity += 1;

        set({ items });
      },

      decreaseQty: (productId) => {
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

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage", // key in localStorage
      partialize: (state) => ({
        items: state.items,
      }),
    },
  ),
);
