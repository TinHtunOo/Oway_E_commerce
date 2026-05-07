"use client";

import { supabase } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cartStore";
import { ProductResult } from "@/types";
import {
  ChevronRight,
  Globe,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";

type Language = "MM" | "EN";

const NAV_LINKS = [
  { label: "Men", href: "/men" },
  { label: "Women", href: "/women" },
  { label: "Kids", href: "/kids" },
] as const;

export default function Navbar() {
  const [isLogin, setIsLogin] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("MM");
  const [searchQuery, setSearchQuery] = useState("");
  const [visible, setVisible] = useState(true);
  const [searchResults, setSearchResults] = useState<ProductResult | null>(
    null,
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Mobile search state
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileResultsOpen, setMobileResultsOpen] = useState(false);
  const [mobileQuery, setMobileQuery] = useState("");
  const [mobileResults, setMobileResults] = useState<ProductResult | null>(
    null,
  );
  const [isMobileSearching, setIsMobileSearching] = useState(false);

  const lastScrollY = useRef(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const count = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSearchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults(null);
      setSearchOpen(false);
      return;
    }
    setIsSearching(true);
    const { data } = await supabase
      .from("products")
      .select(
        `id, name, slug, price, product_images (url, is_primary), categories!inner (id, name, slug)`,
      )
      .ilike("name", `%${q}%`)
      .limit(6);
    setSearchResults(data as ProductResult);
    setSearchOpen(true);
    setIsSearching(false);
  }, []);

  const fetchMobileResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setMobileResults(null);
      setMobileResultsOpen(false);
      return;
    }
    setIsMobileSearching(true);
    const { data } = await supabase
      .from("products")
      .select(
        `id, name, slug, price, product_images (url, is_primary), categories!inner (id, name, slug)`,
      )
      .ilike("name", `%${q}%`)
      .limit(8);
    setMobileResults(data as ProductResult);
    setMobileResultsOpen(true);
    setIsMobileSearching(false);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSearchResults(val), 300);
  };

  const handleMobileSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMobileQuery(val);
    if (mobileDebounceRef.current) clearTimeout(mobileDebounceRef.current);
    mobileDebounceRef.current = setTimeout(() => fetchMobileResults(val), 300);
  };

  const openMobileSearch = () => {
    setMobileSearchOpen(true);
    setMenuOpen(false);
    setTimeout(() => mobileInputRef.current?.focus(), 350);
  };

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
    setMobileResultsOpen(false);
    setMobileQuery("");
    setMobileResults(null);
  };

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setIsLogin(!!data.user);
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLogin(!!session?.user);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const threshold = sectionRef.current?.offsetHeight ?? 76;
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;
      lastScrollY.current = currentY;
      if (currentY < threshold) {
        setVisible(true);
        return;
      }
      if (delta > 6) {
        setVisible(false);
        setMenuOpen(false);
      } else if (delta < -6) setVisible(true);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile search or menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen || mobileSearchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, mobileSearchOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Menu backdrop */}
      <div
        onClick={closeMenu}
        className={`fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity duration-500 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Mobile search backdrop */}
      <div
        onClick={closeMobileSearch}
        className={`fixed inset-0 z-60 bg-black/50 lg:hidden transition-opacity duration-300 ${
          mobileSearchOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ── Mobile Search Drawer ── */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm z-70 bg-white lg:hidden flex flex-col transition-transform duration-300 ease-in-out ${
          mobileSearchOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-black/10">
          <Search size={16} className="text-foreground-muted flex-shrink-0" />
          <input
            ref={mobileInputRef}
            type="search"
            value={mobileQuery}
            onChange={handleMobileSearchChange}
            placeholder="Search products…"
            className="flex-1 bg-transparent text-sm tracking-[1.5px] text-foreground-primary placeholder:text-foreground-muted outline-none"
          />
          {isMobileSearching ? (
            <span className="h-4 w-4 animate-spin rounded-full border border-black/30 border-t-black flex-shrink-0" />
          ) : (
            <button
              onClick={closeMobileSearch}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5 flex-shrink-0"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Results panel — slides up from below the input */}
        <div
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            mobileResultsOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {mobileResults?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <Search
                size={32}
                className="text-black/10 mb-4"
                strokeWidth={1}
              />
              <p className="text-sm text-foreground-secondary">
                No results for &quot;{mobileQuery}&quot;
              </p>
            </div>
          ) : (
            <>
              <p className="px-5 py-3 text-[10px] tracking-[2px] uppercase text-foreground-muted border-b border-black/5">
                Products
              </p>
              <ul>
                {mobileResults?.map((product) => {
                  const primaryImage =
                    product.product_images?.find((img) => img.is_primary) ??
                    product.product_images?.[0];
                  return (
                    <li
                      key={product.id}
                      className="border-b border-black/5 last:border-0"
                    >
                      <Link
                        href={`/products/${product.slug}`}
                        onClick={closeMobileSearch}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f9f9f9] active:bg-[#f5f5f5] transition-colors"
                      >
                        {/* Thumbnail */}
                        <div className="h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden bg-[#f5f5f5]">
                          {primaryImage ? (
                            <Image
                              src={primaryImage.url}
                              alt={product.name}
                              width={56}
                              height={56}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-black/5" />
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] tracking-[1.5px] uppercase text-foreground-muted mb-0.5">
                            {product.categories.name}
                          </p>
                          <p className="truncate text-sm text-foreground-primary font-newsreader">
                            {product.name}
                          </p>
                          <p className="text-xs text-foreground-secondary mt-0.5">
                            {product.price.toLocaleString()} MMK
                          </p>
                        </div>
                        <ChevronRight
                          size={14}
                          className="text-black/30 flex-shrink-0"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* View all footer */}
              <div className="border-t border-black/10 sticky bottom-0 bg-white">
                <Link
                  href={`/search?q=${encodeURIComponent(mobileQuery)}`}
                  onClick={closeMobileSearch}
                  className="flex items-center justify-center gap-2 py-4 text-[11px] tracking-[2px] uppercase text-foreground-secondary hover:text-black transition-colors"
                >
                  View all results
                  <ChevronRight size={13} />
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Empty state when no query yet */}
        {!mobileQuery && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 pb-16">
            <Search size={36} className="text-black/8" strokeWidth={1} />
            <p className="text-sm text-foreground-muted tracking-[1px] text-center">
              Start typing to search our collection
            </p>
          </div>
        )}
      </div>

      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-white transition-transform duration-500 ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto grid grid-cols-2 lg:grid-cols-5 h-19 max-w-360 gap-4 px-2 sm:px-6 lg:px-15">
          {/* Logo */}
          <Link href="/" className="flex items-center lg:col-span-2 -ml-6">
            <Image
              src="/peacock.svg"
              alt="Oway logo"
              width={130}
              height={130}
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center mx-auto navbar">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="px-3.5 py-1.5 text-[13px] tracking-[1.5px] text-foreground-secondary transition-colors hover:bg-black hover:text-white rounded-md"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-1 ml-auto col-span-2">
            <div ref={searchRef} className="relative">
              <label className="flex h-[34px] items-center gap-2 rounded-lg border-2 border-black/10 bg-[#f5f5f5] px-3 focus-within:border-black">
                <Search size={14} className="text-foreground-muted" />
                <input
                  type="search"
                  placeholder="Search products…"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() =>
                    searchResults &&
                    searchResults.length > 0 &&
                    setSearchOpen(true)
                  }
                  className="w-40 bg-transparent text-sm tracking-[1.5px] text-foreground-primary placeholder:text-foreground-muted outline-none"
                />
                {isSearching && (
                  <span className="h-3 w-3 animate-spin rounded-full border border-black/30 border-t-black" />
                )}
              </label>

              {searchOpen && (
                <div className="absolute left-0 top-[calc(100%+8px)] w-80 rounded-xl border border-black/10 bg-white shadow-xl overflow-hidden z-50">
                  {searchResults?.length === 0 ? (
                    <p className="px-4 py-5 text-sm text-foreground-secondary text-center">
                      No products found for &quot;{searchQuery}&quot;
                    </p>
                  ) : (
                    <>
                      <ul>
                        {searchResults?.map((product) => {
                          const primaryImage =
                            product.product_images?.find(
                              (img) => img.is_primary,
                            ) ?? product.product_images?.[0];
                          return (
                            <li key={product.id}>
                              <Link
                                href={`/products/${product.slug}`}
                                onClick={() => {
                                  setSearchOpen(false);
                                  setSearchQuery("");
                                }}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-[#f5f5f5] transition-colors group"
                              >
                                <div className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-[#f5f5f5]">
                                  {primaryImage ? (
                                    <Image
                                      src={primaryImage.url}
                                      alt={product.name}
                                      width={48}
                                      height={48}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full bg-black/5" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="truncate text-sm font-medium text-foreground-primary group-hover:text-black">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-foreground-secondary">
                                    {product.categories.name}
                                  </p>
                                </div>
                                <p className="text-sm font-semibold text-foreground-primary whitespace-nowrap">
                                  {product.price.toLocaleString()} MMK
                                </p>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="border-t border-black/10">
                        <Link
                          href={`/search?q=${encodeURIComponent(searchQuery)}`}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center justify-center gap-1.5 py-3 text-xs tracking-[1px] text-foreground-secondary hover:text-black transition-colors"
                        >
                          View all results for &quot;{searchQuery}&quot;
                          <ChevronRight size={13} />
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="mx-1.5 h-5 w-px bg-black/10" />

            <Link
              href={isLogin ? "/account" : "/login"}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground-secondary hover:bg-black hover:text-white transition"
            >
              <User size={22} />
            </Link>

            <Link
              href="/cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-foreground-secondary hover:bg-black hover:text-white transition"
            >
              <ShoppingCart size={22} />
              {count > 0 && (
                <span className="absolute right-0 top-0 flex h-[20px] w-[20px] items-center justify-center rounded-full bg-accent-gold text-black text-[12px] font-medium">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-foreground-secondary hover:bg-black hover:text-white transition"
            >
              <Globe size={22} />
            </Link>
          </div>

          {/* Mobile */}
          <div className="flex lg:hidden items-center gap-1 ml-auto">
            {/* Search icon triggers drawer */}
            <button
              onClick={openMobileSearch}
              className="flex h-9 w-9 items-center justify-center text-black hover:bg-black hover:text-white rounded-lg"
            >
              <Search size={22} />
            </button>

            <Link
              href="/cart"
              className="relative flex h-9 w-9 items-center justify-center text-black hover:bg-black hover:text-white rounded-lg"
            >
              <ShoppingCart size={22} />
              {count > 0 && (
                <span className="absolute right-0 top-0 flex h-[20px] w-[20px] items-center justify-center rounded-full bg-accent-gold text-black text-[12px]">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="flex h-9 w-9 items-center justify-center text-black hover:bg-black hover:text-white rounded-lg"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer (nav menu) */}
        <div
          className={`lg:hidden relative z-70 border-b border-black/10 bg-white transition-all ${menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 hidden"}`}
        >
          <div className="px-8 pb-5 pt-2">
            <div className="border-b border-black/10 py-3">
              <Link
                href={isLogin ? "/account" : "/login"}
                onClick={closeMenu}
                className="flex items-center gap-3"
              >
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-black/20">
                  <User size={16} />
                </span>
                <span>
                  <p className="text-sm text-foreground-primary">
                    {isLogin ? "My Account" : "Login / Register"}
                  </p>
                  <p className="text-xs text-foreground-secondary">
                    {isLogin
                      ? "Manage your account"
                      : "Sign in to your account"}
                  </p>
                </span>
              </Link>
            </div>

            <nav>
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={closeMenu}
                  className="flex justify-between tracking-[1px] items-center border-b border-black/10 py-3 text-foreground-primary hover:text-accent-gold"
                >
                  {label} <ChevronRight />
                </Link>
              ))}
            </nav>

            <div className="flex gap-3 pt-4">
              {(["MM", "EN"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 text-xs rounded-md border ${language === lang ? "bg-black text-white border-black" : "border-black/20 text-foreground-secondary hover:bg-black hover:text-white"}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
