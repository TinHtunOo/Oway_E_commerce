import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="text-lg font-semibold">
          Logo
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            Home
          </Link>
          <Link
            href="/products"
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            Products
          </Link>
        </div>
      </div>
    </nav>
  );
}
