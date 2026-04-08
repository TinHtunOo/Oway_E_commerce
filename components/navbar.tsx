"use client";

import { supabase } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cartStore";
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
import { useEffect, useRef, useState } from "react";

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

  const lastScrollY = useRef(0);
  const sectionRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeMenu}
        className={`fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity duration-500 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b border-black/10 bg-white transition-transform duration-500 ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Top bar */}
        {/* <div className="hidden lg:block max-w-360 mx-auto px-2 sm:px-6 lg:px-15 pt-2">
          <button
            onClick={() => setLanguage((l) => (l === "MM" ? "EN" : "MM"))}
            className="ml-auto block rounded-md border border-black/10 px-2.5 py-1 text-xs tracking-wide text-foreground-secondary transition-colors hover:bg-black hover:text-white"
          >
            {language === "MM" ? "MM | EN" : "EN | MM"}
          </button>
        </div> */}

        <div className="mx-auto grid grid-cols-2 lg:grid-cols-5 h-19 max-w-360 gap-4 px-2 sm:px-6 lg:px-15">
          {/* Logo */}
          <Link href="/" className="flex items-center lg:col-span-2">
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
            {/* Search */}
            <label className="flex h-[34px] items-center gap-2 rounded-lg border border-black/10 bg-[#f5f5f5] px-3 focus-within:border-black">
              <Search size={14} className="text-foreground-muted" />
              <input
                type="search"
                placeholder="Search products…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 bg-transparent text-sm tracking-[1.5px] text-foreground-primary placeholder:text-foreground-muted outline-none"
              />
            </label>

            <div className="mx-1.5 h-5 w-px bg-black/10" />

            {/* User */}
            <Link
              href={isLogin ? "/account" : "/login"}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground-secondary hover:bg-black hover:text-white transition"
            >
              <User size={22} />
            </Link>

            {/* Cart */}
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
            <Link
              href="/search"
              className="flex h-9 w-9 items-center justify-center text-black hover:bg-black hover:text-white rounded-lg"
            >
              <Search size={22} />
            </Link>

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

        {/* Mobile Drawer */}
        <div
          className={`lg:hidden border-b border-black/10 bg-white transition-all ${
            menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
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
                  className={`px-3 py-1 text-xs rounded-md border ${
                    language === lang
                      ? "bg-black text-white border-black"
                      : "border-black/20 text-foreground-secondary hover:bg-black hover:text-white"
                  }`}
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
