import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, cartItems, total, shippingAddressId } = await req.json();
    const supabase = await createClient();
    // 1. Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        status: "pending",
        total,
        shipping_address_id: shippingAddressId ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 },
      );
    }

    // 2. Insert order items
    const orderItems = cartItems.map(
      (item: { id: string; qty: number; price: number }) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.qty,
        unit_price: item.price,
        created_at: new Date().toISOString(),
      }),
    );

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      return NextResponse.json(
        { error: "Failed to create order items" },
        { status: 500 },
      );
    }

    return NextResponse.json({ orderId: order.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
