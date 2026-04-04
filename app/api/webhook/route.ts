import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { orderId, userId } = paymentIntent.metadata;

      if (!orderId || !userId) {
        console.error("Missing metadata in payment intent");
        break;
      }
      console.log("✅ payment_intent.succeeded fired");

      console.log("orderId", orderId);
      console.log("userId", userId);

      // 1. Update order status to "confirmed"
      const { data, error: orderError } = await supabase
        .from("orders")
        .update({
          status: "confirmed", // OrderStatus: pending → confirmed
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("user_id", userId)
        .select(); // ✅ add select to see what was updated

      console.log("DB update result:", data);
      console.log("DB update error:", orderError); // safety check — must belong to this user
      if (orderError) {
        console.error("Failed to update order:", orderError);
        return NextResponse.json(
          { error: "DB update failed" },
          { status: 500 },
        );
      }

      // 2. Fetch order items to decrement stock
      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", orderId);

      if (itemsError) {
        console.error("Failed to fetch order items:", itemsError);
        break;
      }

      // 3. Decrement stock for each product
      for (const item of orderItems) {
        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.product_id)
          .single();

        if (product) {
          await supabase
            .from("products")
            .update({ stock: product.stock - item.quantity })
            .eq("id", item.product_id);
        }
      }

      console.log(`✅ Order ${orderId} confirmed, stock updated.`);
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { orderId, userId } = paymentIntent.metadata;

      if (!orderId || !userId) break;

      // Mark order as cancelled on payment failure
      const { error } = await supabase
        .from("orders")
        .update({
          status: "cancelled", // OrderStatus: pending → cancelled
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("user_id", userId);

      if (error) console.error("Failed to cancel order:", error);
      else console.log(`❌ Order ${orderId} cancelled due to payment failure.`);

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
