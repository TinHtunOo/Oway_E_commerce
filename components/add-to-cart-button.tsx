"use client";

import { useCartStore } from "@/store/cartStore";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";

type Props = {
  productId: string;
};

export default function AddToCartButton({ productId }: Props) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(productId);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg text-[12px] tracking-[2px] uppercase transition-colors ${
        added
          ? "bg-green-600 text-white"
          : "bg-black text-white hover:bg-black/80"
      }`}
    >
      <ShoppingBag size={15} />
      {added ? "Added to Cart" : "Add to Cart"}
    </button>
  );
}
