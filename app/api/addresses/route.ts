import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient(); // ✅ creates client with cookie context

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { data: address, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ address: address ?? null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient(); // ✅ this reads the auth cookie correctly

    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("userData", user);
    if (!user)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const userId = user.id;
    const body = await req.json();

    const { data: existing } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", userId)
      .single();

    let addressId: string;

    if (existing) {
      const { data, error } = await supabase
        .from("addresses")
        .update({
          line1: body.line1,
          line2: body.line2 ?? null,
          city: body.city,
          state: body.state ?? null,
          postal_code: body.postal_code ?? null,
          country: body.country,
          is_default: true,
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error || !data)
        return NextResponse.json(
          { error: "Failed to update address" },
          { status: 500 },
        );

      addressId = data.id;
    } else {
      const { data, error } = await supabase
        .from("addresses")
        .insert({
          user_id: userId,
          line1: body.line1,
          line2: body.line2 ?? null,
          city: body.city,
          state: body.state ?? null,
          postal_code: body.postal_code ?? null,
          country: body.country,
          is_default: true,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error || !data)
        return NextResponse.json(
          { error: "Failed to save address" },
          { status: 500 },
        );

      addressId = data.id;
    }

    return NextResponse.json({ addressId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
