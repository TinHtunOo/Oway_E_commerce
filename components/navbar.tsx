"use client";

import { supabase } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cartStore";
import { Menu, Search, ShoppingCart, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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

  const count = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );

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

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="relative z-50 border-b border-gray-200 bg-white ">
      <div className="hidden lg:block max-w-360 mx-auto px-4 sm:px-6 lg:px-15 pt-2">
        {/* Language toggle */}
        <button
          onClick={() => setLanguage((l) => (l === "MM" ? "EN" : "MM"))}
          className=" rounded-md border border-gray-200 px-2.5 py-1 block ml-auto text-xs font-medium tracking-wide text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          aria-label="Toggle language"
        >
          {language === "MM" ? "MM | EN" : "EN | MM"}
        </button>
      </div>
      <div className="mx-auto grid grid-cols-2 lg:grid-cols-5 h-19 max-w-360  gap-4 px-4 sm:px-6 lg:px-15">
        {/* Brand */}
        <Link
          href="/"
          className="flex shrink-0 items-center  lg:col-span-2"
          aria-label="Oway home"
        >
          <Image src="/peacock.svg" alt="Oway logo" width={130} height={130} />
        </Link>

        {/* Desktop — centre nav links */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center navbar mx-auto lg:flex "
        >
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="rounded-md px-3.5 py-1.5 text-[13px] tracking-[1.5px] text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop — right actions */}
        <div className="hidden items-center gap-1 ml-auto lg:flex col-span-2">
          {/* Search */}
          <label className="flex h-[34px] items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 transition-colors focus-within:border-gray-400">
            <Search size={14} className="shrink-0 text-gray-400" />
            <input
              type="search"
              placeholder="Search products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 bg-transparent text-sm placeholder:text-[13px] placeholder:tracking-[1.5px] tracking-[1.5px] text-gray-900 placeholder-gray-400 outline-none"
              aria-label="Search products"
            />
          </label>

          <div className="mx-1.5 h-5 w-px bg-gray-200" aria-hidden="true" />

          {/* User / Account */}
          <Link
            href={isLogin ? "/account" : "/login"}
            aria-label={isLogin ? "Account" : "Login"}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <User size={22} />
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label={`Cart, ${count} items`}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <ShoppingCart size={22} />
            {count > 0 && (
              <span className="absolute right-1 top-1 flex h-[14px] w-[14px] items-center justify-center rounded-full border-[1.5px] border-white bg-red-500 text-[9px] font-medium text-white">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile — right actions */}
        <div className="flex items-center gap-1 lg:hidden ml-auto">
          <Link
            href="/search"
            aria-label="Search"
            className="flex sm:hidden h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <Search size={18} />
          </Link>

          <label className="hidden sm:flex h-[34px] items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 transition-colors focus-within:border-gray-400">
            <Search size={14} className="shrink-0 text-gray-400" />
            <input
              type="search"
              placeholder="Search products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 bg-transparent text-sm placeholder:text-[13px] placeholder:tracking-[1.5px] tracking-[1.5px] text-gray-900 placeholder-gray-400 outline-none"
              aria-label="Search products"
            />
          </label>

          <Link
            href="/cart"
            aria-label={`Cart, ${count} items`}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <ShoppingCart size={18} />
            {count > 0 && (
              <span className="absolute right-1 top-1 flex h-[14px] w-[14px] items-center justify-center rounded-full border-[1.5px] border-white bg-red-500 text-[9px] font-medium text-white">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-drawer"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`absolute left-0 right-0 top-full overflow-hidden border-b border-gray-200 bg-white transition-all duration-300 ease-in-out lg:hidden ${
          menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-5 pt-1">
          {/* Drawer brand */}
          <div className="flex items-center gap-2 border-b border-gray-100 py-4">
            <Image src="/peacock.svg" alt="Oway logo" width={28} height={28} />
            <span className="text-[15px] font-semibold tracking-tight text-gray-900">
              Oway
            </span>
          </div>

          {/* Login / Account */}
          <div className="border-b border-gray-100 py-3">
            <Link
              href={isLogin ? "/account" : "/login"}
              onClick={closeMenu}
              className="flex items-center gap-3"
            >
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-gray-200 text-gray-500">
                <User size={16} />
              </span>
              <span>
                <p className="text-sm font-medium text-gray-900">
                  {isLogin ? "My Account" : "Login / Register"}
                </p>
                <p className="text-xs text-gray-500">
                  {isLogin ? "Manage your account" : "Sign in to your account"}
                </p>
              </span>
            </Link>
          </div>

          {/* Nav links */}
          <nav aria-label="Mobile navigation links">
            <ul role="list">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    onClick={closeMenu}
                    className="flex items-center border-b border-gray-100 py-3 text-[15px] text-gray-800 transition-colors hover:text-gray-500"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Language switcher */}
          <div className="flex items-center gap-3 pt-4">
            <span className="text-xs font-medium text-gray-500">Language</span>
            {(["MM", "EN"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                aria-pressed={language === lang}
                className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                  language === lang
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
