import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full  pt-16  bg-surface-dark/90 border-t border-stroke">
      <div className="max-w-360 px-6 sm:px-10 md:px-16 mx-auto flex flex-col gap-12">
        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left: Brand */}
          <div className="flex flex-col gap-4 max-w-md">
            <Link href="/" className="flex items-center lg:col-span-2 -ml-10">
              <Image
                src="/peacock_white.svg"
                alt="Oway logo"
                width={200}
                height={200}
              />
            </Link>
            <p className=" text-foreground-muted font-newsreader font-regular text-[16px] leading-[170%]">
              Preserving Myanmar&apos;s textile heritage through timeless
              craftsmanship and contemporary design.
            </p>
          </div>

          {/* Right: Links */}
          <div className="grid grid-cols-2 gap-8">
            {/* Shop */}
            <div className="flex flex-col gap-3">
              <h4 className="text-[12px] font-medium text-accent-gold-light uppercase tracking-[2px]">
                Shop
              </h4>
              <ul className="flex flex-col gap-2 font-regular text-[14px] text-foreground-muted">
                <li className="hover:text-foreground-inverse">
                  <a href="#">Men</a>
                </li>
                <li className="hover:text-foreground-inverse">
                  <a href="#">Women</a>
                </li>
                <li className="hover:text-foreground-inverse">
                  <a href="#">Kids</a>
                </li>
                <li className="hover:text-foreground-inverse">
                  <a href="#">Accesories</a>
                </li>
              </ul>
            </div>

            {/* Help */}
            <div className="flex flex-col gap-3">
              <h4 className="text-[12px] font-medium text-accent-gold-light uppercase tracking-[2px]">
                Help
              </h4>
              <ul className="flex flex-col gap-2 font-regular text-[14px] text-foreground-muted ">
                <li className="hover:text-foreground-inverse">
                  <a href="#">Contact</a>
                </li>
                <li className="hover:text-foreground-inverse">
                  <a href="#">FAQs</a>
                </li>
                <li className="hover:text-foreground-inverse">
                  <a href="#">Shipping</a>
                </li>
                <li className="hover:text-foreground-inverse">
                  <a href="#">Returns</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-foreground-muted/30 pb-6 pt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left */}
          <p className="text-[12px] font-normal text-foreground-muted">
            © {new Date().getFullYear()} OWAY. All rights reserved.
          </p>

          {/* Right */}
          <div className="flex items-center gap-6 text-[12px] font-normal text-foreground-muted">
            <a className="hover:text-foreground-inverse" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-foreground-inverse" href="#">
              Terms of Services
            </a>
            <a className="hover:text-foreground-inverse" href="#">
              Cookies Preferences
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
