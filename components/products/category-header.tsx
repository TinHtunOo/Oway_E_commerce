// components/CategoryHeader.tsx

import Link from "next/link";

type Props = {
  navigation: string;
  title: string;
  description: string;
  productCount: number | undefined;
};

export default function CategoryHeader({
  navigation,
  title,
  description,
  productCount,
}: Props) {
  return (
    <section className="w-full">
      <div className="max-w-360 px-6 sm:px-10 md:px-16 mx-auto py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="text-[12px] font-regular text-foreground-muted mb-4">
          <span>
            <Link className="hover:text-foreground" href={"/"}>
              Home
            </Link>{" "}
            / <span className="text-foreground">{navigation}</span>
          </span>
        </nav>

        {/* Content */}
        <div className="max-w-3xl">
          <h1 className=" mb-3 font-bold text-[40px] sm:text-[64px] tracking-[4px] font-playfair">
            {title}
          </h1>

          <p className="text-[17px] font-normal font-newsreader text-foreground-secondary mb-4">
            {description}
          </p>

          <p className="text-[13px] text-foreground-muted">
            {productCount} Products
          </p>
        </div>
      </div>
    </section>
  );
}
