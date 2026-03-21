import { supabase } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cartStore";

export const mergeCartToDB = async (userId: string) => {
  const { items, clearCart } = useCartStore.getState();

  if (items.length === 0) return;

  // 1. get or create cart
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

    if (!newCart) throw new Error("Failed to create cart");
    cart = newCart;
  }

  // 2. loop items → minimal queries per item
  for (const localItem of items) {
    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cart.id)
      .eq("product_id", localItem.product_id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("cart_items")
        .update({
          quantity: existing.quantity + localItem.quantity,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({
        cart_id: cart.id,
        product_id: localItem.product_id,
        quantity: localItem.quantity,
      });
    }
  }

  // 3. clear local cart
  clearCart();
};
