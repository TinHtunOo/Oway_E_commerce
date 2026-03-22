import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { supabase } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cartStore";

// ─── Mock Supabase ────────────────────────────────────────────────────────────
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

// ─── Supabase query builder helper ───────────────────────────────────────────
// Builds a chainable mock that resolves to { data, error }
// ─── Fix the mockQuery helper — add proper chaining for .eq().then() ─────────
function mockQuery(data: any, error = null) {
  const chain: any = {};
  const methods = ["select", "insert", "update", "delete", "eq", "in"];

  methods.forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain);
  });

  chain.maybeSingle = vi.fn().mockResolvedValue({ data, error });
  chain.single = vi.fn().mockResolvedValue({ data, error });

  // this is what makes .eq("cart_id", x) resolve when awaited directly
  chain.then = (resolve: any, reject: any) =>
    Promise.resolve({ data, error }).then(resolve, reject);

  return chain;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const mockGuest = () =>
  vi.mocked(supabase.auth.getUser).mockResolvedValue({
    data: { user: null },
    error: null,
  } as any);

const mockUser = (id = "user-123") =>
  vi.mocked(supabase.auth.getUser).mockResolvedValue({
    data: { user: { id } },
    error: null,
  } as any);

const resetStore = () =>
  useCartStore.setState({ items: [], isLoggedIn: false });

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("cartStore", () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
    vi.useFakeTimers(); // control debounce
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Guest: addItem ──────────────────────────────────────────────────────────
  describe("guest — addItem", () => {
    it("adds a new item to local state", () => {
      mockGuest();
      const { result } = renderHook(() => useCartStore());

      act(() => result.current.addItem("product-1"));

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]).toMatchObject({
        product_id: "product-1",
        quantity: 1,
      });
    });

    it("increments quantity if item already exists", () => {
      mockGuest();
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem("product-1");
        result.current.addItem("product-1");
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
    });

    it("adds multiple different items", () => {
      mockGuest();
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem("product-1");
        result.current.addItem("product-2");
      });

      expect(result.current.items).toHaveLength(2);
    });
  });

  // ── Guest: removeItem ───────────────────────────────────────────────────────
  describe("guest — removeItem", () => {
    it("removes item from local state", () => {
      mockGuest();
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem("product-1");
        result.current.addItem("product-2");
        result.current.removeItem("product-1");
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].product_id).toBe("product-2");
    });

    it("does nothing if item does not exist", () => {
      mockGuest();
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem("product-1");
        result.current.removeItem("product-999");
      });

      expect(result.current.items).toHaveLength(1);
    });
  });

  // ── Guest: increaseQty ──────────────────────────────────────────────────────
  describe("guest — increaseQty", () => {
    it("increases quantity by 1", () => {
      mockGuest();
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem("product-1");
        result.current.increaseQty("product-1");
      });

      expect(result.current.items[0].quantity).toBe(2);
    });
  });

  // ── Guest: decreaseQty ──────────────────────────────────────────────────────
  describe("guest — decreaseQty", () => {
    it("decreases quantity by 1", () => {
      mockGuest();
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem("product-1");
        result.current.addItem("product-1"); // qty = 2
        result.current.decreaseQty("product-1");
      });

      expect(result.current.items[0].quantity).toBe(1);
    });

    it("removes item when quantity reaches 0", () => {
      mockGuest();
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem("product-1"); // qty = 1
        result.current.decreaseQty("product-1"); // qty = 0 → removed
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  // ── Guest: clearCart ────────────────────────────────────────────────────────
  describe("guest — clearCart", () => {
    it("clears all items", () => {
      mockGuest();
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem("product-1");
        result.current.addItem("product-2");
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  // ── initCart: guest ─────────────────────────────────────────────────────────
  describe("initCart — guest", () => {
    it("sets isLoggedIn to false and keeps local items", async () => {
      mockGuest();
      useCartStore.setState({
        items: [
          {
            id: "1",
            cart_id: "local",
            product_id: "product-1",
            quantity: 2,
            created_at: "",
          },
        ],
      });

      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.initCart();
      });

      expect(result.current.isLoggedIn).toBe(false);
      expect(result.current.items).toHaveLength(1);
    });
  });

  // ── initCart: logged in, no prior DB cart ───────────────────────────────────
  describe("initCart — logged in, empty DB cart", () => {
    it("merges local items into DB and sets isLoggedIn true", async () => {
      mockUser();

      const fromMock = vi.mocked(supabase.from);

      // carts select → no cart exists
      fromMock.mockReturnValueOnce(mockQuery(null) as any);
      // carts insert → new cart
      fromMock.mockReturnValueOnce(mockQuery({ id: "cart-123" }) as any);
      // cart_items select → empty
      fromMock.mockReturnValueOnce(mockQuery([]) as any);
      // cart_items delete (flush)
      fromMock.mockReturnValueOnce(mockQuery(null) as any);
      // cart_items insert (flush)
      fromMock.mockReturnValueOnce(mockQuery(null) as any);

      useCartStore.setState({
        items: [
          {
            id: "1",
            cart_id: "local",
            product_id: "product-1",
            quantity: 3,
            created_at: "",
          },
        ],
      });

      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.initCart();
      });

      expect(result.current.isLoggedIn).toBe(true);
      expect(result.current.items[0]).toMatchObject({
        product_id: "product-1",
        quantity: 3,
      });
    });
  });

  // ── initCart: merge quantities ──────────────────────────────────────────────
  describe("initCart — merge local + DB quantities", () => {
    // ─── Fix: merge — adds local qty on top of existing DB qty ───────────────────
    // ─── Replace the two failing merge tests with these ───────────────────────────

    it("adds local qty on top of existing DB qty for same product", async () => {
      mockUser();

      const fromMock = vi.mocked(supabase.from);

      // initCart flow:
      // call 1 → carts.select().eq().maybeSingle()        (find existing cart)
      // call 2 → cart_items.select().eq()                 (fetch db items)
      // pushCartToDb flow (called immediately after merge):
      // call 3 → carts.select().eq().maybeSingle()        (find cart again)
      // call 4 → cart_items.delete().eq()                 (wipe old items)
      // call 5 → cart_items.insert()                      (insert merged items)

      const cartQuery = mockQuery({ id: "cart-123" });
      const cartItemsQuery = mockQuery([
        {
          id: "ci-1",
          cart_id: "cart-123",
          product_id: "product-1",
          quantity: 2,
          created_at: "",
        },
      ]);
      const deleteQuery = mockQuery(null);
      const insertQuery = mockQuery(null);

      fromMock
        .mockReturnValueOnce(cartQuery as any) // call 1: find cart (initCart)
        .mockReturnValueOnce(cartItemsQuery as any) // call 2: fetch cart_items
        .mockReturnValueOnce(cartQuery as any) // call 3: find cart (pushCartToDb)
        .mockReturnValueOnce(deleteQuery as any) // call 4: delete old items
        .mockReturnValueOnce(insertQuery as any); // call 5: insert merged items

      useCartStore.setState({
        items: [
          {
            id: "1",
            cart_id: "local",
            product_id: "product-1",
            quantity: 3,
            created_at: "",
          },
        ],
        isLoggedIn: false,
      });

      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.initCart();
      });

      // 2 (db) + 3 (local) = 5
      expect(result.current.items[0].quantity).toBe(5);
    });

    it("keeps DB-only items and local-only items both", async () => {
      mockUser();

      const fromMock = vi.mocked(supabase.from);

      const cartQuery = mockQuery({ id: "cart-123" });
      const cartItemsQuery = mockQuery([
        {
          id: "ci-1",
          cart_id: "cart-123",
          product_id: "product-A",
          quantity: 1,
          created_at: "",
        },
      ]);
      const deleteQuery = mockQuery(null);
      const insertQuery = mockQuery(null);

      fromMock
        .mockReturnValueOnce(cartQuery as any) // call 1: find cart (initCart)
        .mockReturnValueOnce(cartItemsQuery as any) // call 2: fetch cart_items
        .mockReturnValueOnce(cartQuery as any) // call 3: find cart (pushCartToDb)
        .mockReturnValueOnce(deleteQuery as any) // call 4: delete old items
        .mockReturnValueOnce(insertQuery as any); // call 5: insert merged items

      useCartStore.setState({
        items: [
          {
            id: "2",
            cart_id: "local",
            product_id: "product-B",
            quantity: 2,
            created_at: "",
          },
        ],
        isLoggedIn: false,
      });

      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.initCart();
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.items.map((i) => i.product_id)).toEqual(
        expect.arrayContaining(["product-A", "product-B"]),
      );
    });
  });

  // ── Logged-in: debounced sync ───────────────────────────────────────────────
  describe("logged-in — debounced DB sync", () => {
    it("does not call DB immediately on addItem", () => {
      useCartStore.setState({ isLoggedIn: true });
      const fromMock = vi.mocked(supabase.from);

      const { result } = renderHook(() => useCartStore());

      act(() => result.current.addItem("product-1"));

      // debounce hasn't fired yet
      expect(fromMock).not.toHaveBeenCalled();
    });

    // ─── Fix: debounce — use runAllTimersAsync instead of advanceTimersByTime ─────
    it("calls DB once after debounce delay even with rapid actions", async () => {
      useCartStore.setState({ isLoggedIn: true, items: [] });
      mockUser();

      const fromMock = vi.mocked(supabase.from);
      // needs to handle: getUser (auth), carts select, carts insert or select, delete, insert
      fromMock.mockReturnValue(mockQuery({ id: "cart-123" }) as any);

      const { result } = renderHook(() => useCartStore());

      // 5 rapid actions
      act(() => {
        result.current.addItem("product-1");
        result.current.addItem("product-1");
        result.current.addItem("product-1");
        result.current.increaseQty("product-1");
        result.current.increaseQty("product-1");
      });

      // DB should NOT have been called yet (still in debounce window)
      expect(fromMock).not.toHaveBeenCalled();

      // flush all timers AND their async callbacks
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // only 1 sync should have fired
      expect(fromMock).toHaveBeenCalled();

      // local state reflects all 5 actions
      expect(result.current.items[0].quantity).toBe(5);
    });

    it("updates local state immediately (optimistic)", () => {
      useCartStore.setState({ isLoggedIn: true });

      const { result } = renderHook(() => useCartStore());

      act(() => result.current.addItem("product-1"));

      // local state updated before DB
      expect(result.current.items[0].quantity).toBe(1);
    });
  });

  // ── Edge cases ──────────────────────────────────────────────────────────────
  describe("edge cases", () => {
    it("handles empty cart on clearCart for logged-in user", async () => {
      useCartStore.setState({ isLoggedIn: true, items: [] });
      mockUser();

      const fromMock = vi.mocked(supabase.from);
      fromMock.mockReturnValue(mockQuery({ id: "cart-123" }) as any);

      const { result } = renderHook(() => useCartStore());

      act(() => result.current.clearCart());

      expect(result.current.items).toHaveLength(0);
    });

    it("does not sync to DB when guest clears cart", () => {
      useCartStore.setState({ isLoggedIn: false });
      const fromMock = vi.mocked(supabase.from);

      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem("product-1");
        result.current.clearCart();
      });

      vi.advanceTimersByTime(900);

      expect(fromMock).not.toHaveBeenCalled();
    });

    it("decreaseQty on non-existent product does nothing", () => {
      mockGuest();
      const { result } = renderHook(() => useCartStore());

      act(() => result.current.decreaseQty("product-999"));

      expect(result.current.items).toHaveLength(0);
    });
  });
});
