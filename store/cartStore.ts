import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";
import { supabase } from "@/lib/supabase/client";

// ─── Debounce helper ─────────────────────────────────────────────────────────
function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// ─── Shared DB writer ────────────────────────────────────────────────────────
async function pushCartToDb(items: CartItem[]) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

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
    if (!newCart) return;
    cart = newCart;
  }

  await supabase.from("cart_items").delete().eq("cart_id", cart.id);

  if (items.length > 0) {
    await supabase.from("cart_items").insert(
      items.map((item) => ({
        cart_id: cart!.id,
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    );
  }
}

// ─── Debounced version for actions ───────────────────────────────────────────
const syncToDb = debounce((items: CartItem[]) => {
  pushCartToDb(items);
}, 800);

// ─── Types ───────────────────────────────────────────────────────────────────
type CartStore = {
  items: CartItem[];
  isLoggedIn: boolean;
  initCart: () => Promise<void>;
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  increaseQty: (productId: string) => void;
  decreaseQty: (productId: string) => void;
  clearCart: () => void;
};

// ─── Store ───────────────────────────────────────────────────────────────────
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoggedIn: false,

      // ── Init ───────────────────────────────────────────────────────────────
      initCart: async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          set({ isLoggedIn: false });
          return;
        }

        set({ isLoggedIn: true });

        const { data: cart } = await supabase
          .from("carts")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        let dbItems: CartItem[] = [];

        if (cart) {
          const { data } = await supabase
            .from("cart_items")
            .select("*")
            .eq("cart_id", cart.id);
          dbItems = data || [];
        }

        // merge guest items on top of db items
        const localItems = get().items;
        const merged = [...dbItems];

        for (const local of localItems) {
          const existing = merged.find(
            (i) => i.product_id === local.product_id,
          );
          if (existing) {
            existing.quantity += local.quantity;
          } else {
            merged.push(local);
          }
        }

        set({ items: merged });

        // immediate flush — no debounce on login
        await pushCartToDb(merged);
      },

      // ── Actions ────────────────────────────────────────────────────────────
      addItem: (productId) => {
        const items = [...get().items];
        const existing = items.find((i) => i.product_id === productId);

        if (existing) {
          existing.quantity += 1;
        } else {
          items.push({
            id: crypto.randomUUID(),
            cart_id: "local",
            product_id: productId,
            quantity: 1,
            created_at: new Date().toISOString(),
          });
        }

        set({ items });
        if (get().isLoggedIn) syncToDb(items);
      },

      removeItem: (productId) => {
        const items = get().items.filter((i) => i.product_id !== productId);
        set({ items });
        if (get().isLoggedIn) syncToDb(items);
      },

      increaseQty: (productId) => {
        const items = get().items.map((i) =>
          i.product_id === productId ? { ...i, quantity: i.quantity + 1 } : i,
        );
        set({ items });
        if (get().isLoggedIn) syncToDb(items);
      },

      decreaseQty: (productId) => {
        const items = get()
          .items.map((i) =>
            i.product_id === productId ? { ...i, quantity: i.quantity - 1 } : i,
          )
          .filter((i) => i.quantity > 0);
        set({ items });
        if (get().isLoggedIn) syncToDb(items);
      },

      clearCart: () => {
        set({ items: [] });
        if (get().isLoggedIn) syncToDb([]);
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
