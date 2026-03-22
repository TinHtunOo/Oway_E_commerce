import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useCart } from "@/hooks/useCart";
import { useCartStore } from "@/store/cartStore";
import { supabase } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(),
  },
}));

vi.mock("@/store/cartStore", () => ({
  useCartStore: vi.fn(),
}));

const mockProducts = [
  {
    id: "product-1",
    name: "Test Shoes",
    slug: "test-shoes",
    price: 99.99,
    stock: 10,
    product_images: [{ url: "/shoe.jpg", is_primary: true }],
  },
  {
    id: "product-2",
    name: "Test Hat",
    slug: "test-hat",
    price: 29.99,
    stock: 5,
    product_images: [{ url: "/hat.jpg", is_primary: false }],
  },
];

const mockStoreItems = [
  {
    id: "ci-1",
    cart_id: "local",
    product_id: "product-1",
    quantity: 2,
    created_at: "",
  },
  {
    id: "ci-2",
    cart_id: "local",
    product_id: "product-2",
    quantity: 1,
    created_at: "",
  },
];

const mockStore = {
  items: mockStoreItems,
  isLoggedIn: false,
  initCart: vi.fn(),
  addItem: vi.fn(),
  removeItem: vi.fn(),
  increaseQty: vi.fn(),
  decreaseQty: vi.fn(),
  clearCart: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useCartStore).mockReturnValue(mockStore as any);

  // products fetch
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockResolvedValue({ data: mockProducts }),
  } as any);
});

describe("useCart", () => {
  // ── Initialization ──────────────────────────────────────────────────────────
  describe("initialization", () => {
    it("calls initCart on mount", () => {
      renderHook(() => useCart());
      expect(mockStore.initCart).toHaveBeenCalledTimes(1);
    });

    it("subscribes to auth state changes", () => {
      renderHook(() => useCart());
      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
    });

    it("unsubscribes from auth on unmount", () => {
      const unsubscribe = vi.fn();
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: { unsubscribe } },
      } as any);

      const { unmount } = renderHook(() => useCart());
      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  // ── Product joining ─────────────────────────────────────────────────────────
  describe("product joining", () => {
    it("joins items with fetched product data", async () => {
      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.items[0].product).not.toBeNull();
      });

      expect(result.current.items[0].product?.name).toBe("Test Shoes");
      expect(result.current.items[1].product?.name).toBe("Test Hat");
    });

    it("product is null while loading", () => {
      // delay the product fetch
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnValue(new Promise(() => {})), // never resolves
      } as any);

      const { result } = renderHook(() => useCart());

      expect(result.current.items[0].product).toBeNull();
    });

    it("does not re-fetch already cached products", async () => {
      const fromMock = vi.mocked(supabase.from);

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.items[0].product).not.toBeNull();
      });

      const callCount = fromMock.mock.calls.length;

      // trigger a re-render with same items
      act(() => {
        vi.mocked(useCartStore).mockReturnValue({
          ...mockStore,
          items: [...mockStoreItems],
        } as any);
      });

      // no additional fetch
      expect(fromMock.mock.calls.length).toBe(callCount);
    });
  });

  // ── Total calculation ───────────────────────────────────────────────────────
  describe("total", () => {
    it("calculates total correctly", async () => {
      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.items[0].product).not.toBeNull();
      });

      // (99.99 × 2) + (29.99 × 1) = 229.97
      expect(result.current.total).toBeCloseTo(229.97, 2);
    });

    it("returns 0 total when products not yet loaded", () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnValue(new Promise(() => {})),
      } as any);

      const { result } = renderHook(() => useCart());

      expect(result.current.total).toBe(0);
    });

    it("returns 0 total for empty cart", () => {
      vi.mocked(useCartStore).mockReturnValue({
        ...mockStore,
        items: [],
      } as any);

      const { result } = renderHook(() => useCart());

      expect(result.current.total).toBe(0);
    });
  });

  // ── Action delegation ───────────────────────────────────────────────────────
  describe("actions", () => {
    it("delegates addItem to store", async () => {
      const { result } = renderHook(() => useCart());
      await act(async () => result.current.addItem("product-1"));
      expect(mockStore.addItem).toHaveBeenCalledWith("product-1");
    });

    it("delegates removeItem to store", async () => {
      const { result } = renderHook(() => useCart());
      await act(async () => result.current.removeItem("product-1"));
      expect(mockStore.removeItem).toHaveBeenCalledWith("product-1");
    });

    it("delegates increaseQty to store", async () => {
      const { result } = renderHook(() => useCart());
      await act(async () => result.current.increaseQty("product-1"));
      expect(mockStore.increaseQty).toHaveBeenCalledWith("product-1");
    });

    it("delegates decreaseQty to store", async () => {
      const { result } = renderHook(() => useCart());
      await act(async () => result.current.decreaseQty("product-1"));
      expect(mockStore.decreaseQty).toHaveBeenCalledWith("product-1");
    });

    it("delegates clearCart to store", async () => {
      const { result } = renderHook(() => useCart());
      await act(async () => result.current.clearCart());
      expect(mockStore.clearCart).toHaveBeenCalled();
    });
  });

  // ── Auth state change ───────────────────────────────────────────────────────
  describe("auth state change", () => {
    it("calls initCart on SIGNED_IN", () => {
      let capturedCallback: (event: string) => void = () => {};

      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(
        (cb: any) => {
          capturedCallback = cb;
          return { data: { subscription: { unsubscribe: vi.fn() } } } as any;
        },
      );

      renderHook(() => useCart());

      act(() => capturedCallback("SIGNED_IN"));

      // initCart called once on mount + once on SIGNED_IN
      expect(mockStore.initCart).toHaveBeenCalledTimes(2);
    });

    // ─── Fix: SIGNED_OUT — patch setState on the actual store ────────────────────
    it("calls clearCart on SIGNED_OUT", () => {
      let capturedCallback: (event: string) => void = () => {};

      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(
        (cb: any) => {
          capturedCallback = cb;
          return { data: { subscription: { unsubscribe: vi.fn() } } } as any;
        },
      );

      // expose setState so the hook can call it
      vi.mocked(useCartStore).mockReturnValue({
        ...mockStore,
        setState: vi.fn(), // ← add this
      } as any);

      // also patch it on the module level since hook calls useCartStore.setState directly
      (useCartStore as any).setState = vi.fn();

      renderHook(() => useCart());

      act(() => capturedCallback("SIGNED_OUT"));

      expect(mockStore.clearCart).toHaveBeenCalled();
      expect((useCartStore as any).setState).toHaveBeenCalledWith({
        isLoggedIn: false,
      });
    });
  });
});
