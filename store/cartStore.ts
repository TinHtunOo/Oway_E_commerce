import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";
import { supabase } from "@/lib/supabase/client";

// ─── Debounce helper ─────────────────────────────────────────────────────────
function debounce(fn: (items: CartItem[], userId: string) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (items: CartItem[], userId: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(items, userId), ms);
  };
}

// ─── Shared DB writer ─────────────────────────────────────────────────────────
async function pushCartToDb(items: CartItem[], userId: string) {
  let { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!cart) {
    const { data: newCart } = await supabase
      .from("carts")
      .insert({ user_id: userId })
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
const syncToDb = debounce((items: CartItem[], userId: string) => {
  pushCartToDb(items, userId);
}, 800);

// ─── Types ───────────────────────────────────────────────────────────────────
type CartStore = {
  items: CartItem[];
  userId: string | null;
  // add to store state
  cartId: string | null;
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
      userId: null,
      // add to store state
      cartId: null,

      // ── Init ─────────────────────────────────────────────────────────────
      initCart: async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          set({ userId: null });
          return;
        }

        set({ userId: user.id });

        let cart = await supabase
          .from("carts")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle()
          .then(({ data }) => data);

        if (!cart) {
          const { data: newCart } = await supabase
            .from("carts")
            .insert({ user_id: user.id })
            .select("id")
            .single();
          cart = newCart;
        }

        if (!cart) return;
        set({ cartId: cart.id });

        const { data } = await supabase
          .from("cart_items")
          .select("*")
          .eq("cart_id", cart.id);

        const dbItems: CartItem[] = data || [];

        const localItems = get().items.filter(
          (local) => local.cart_id === "local",
        );

        const merged = [...dbItems];

        for (const local of localItems) {
          const existingIndex = merged.findIndex(
            (db) => db.product_id === local.product_id,
          );

          if (existingIndex !== -1) {
            merged[existingIndex] = {
              ...merged[existingIndex],
              quantity: merged[existingIndex].quantity + local.quantity,
            };
          } else {
            merged.push(local);
          }
        }

        // mark all as synced with real cart_id
        const synced = merged.map((item) => ({
          ...item,
          cart_id: cart!.id,
        }));

        set({ items: synced });
        await pushCartToDb(synced, user.id);
      },

      // ── Actions ───────────────────────────────────────────────────────────
      addItem: (productId) => {
        const { items, userId, cartId } = get();
        const updated = [...items];
        const existing = updated.find((i) => i.product_id === productId);

        if (existing) {
          existing.quantity += 1;
        } else {
          updated.push({
            id: crypto.randomUUID(),
            cart_id: cartId ?? "local", // ← use real cartId if logged in
            product_id: productId,
            quantity: 1,
            created_at: new Date().toISOString(),
          });
        }

        set({ items: updated });
        if (userId) syncToDb(updated, userId);
      },

      removeItem: (productId) => {
        const { userId } = get();
        const items = get().items.filter((i) => i.product_id !== productId);
        set({ items });
        if (userId) syncToDb(items, userId);
      },

      increaseQty: (productId) => {
        const { userId } = get();
        const items = get().items.map((i) =>
          i.product_id === productId ? { ...i, quantity: i.quantity + 1 } : i,
        );
        set({ items });
        console.log(userId);

        if (userId) syncToDb(items, userId);
      },

      decreaseQty: (productId) => {
        const { userId } = get();
        const items = get()
          .items.map((i) =>
            i.product_id === productId ? { ...i, quantity: i.quantity - 1 } : i,
          )
          .filter((i) => i.quantity > 0);
        set({ items });
        if (userId) syncToDb(items, userId);
      },

      clearCart: () => {
        const { userId } = get();
        set({ items: [] });
        if (userId) syncToDb([], userId);
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
