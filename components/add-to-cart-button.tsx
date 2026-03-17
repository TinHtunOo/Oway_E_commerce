"use client";

import { useCartStore } from "@/store/cartStore";

type Props = {
  productId: string;
};

export default function AddToCartButton({ productId }: Props) {
  const addItem = useCartStore((state) => state.addItem);

  return <button onClick={() => addItem(productId)}>Add to Cart</button>;
}
