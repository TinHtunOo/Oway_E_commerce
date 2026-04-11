// components/CategoryNavigation.tsx

import Link from "next/link";

type Category = {
  title: string;
  description: string;
  href: string;
  navigation: string;
};

type Props = {
  categories: Category[];
};

export default function CategoryNavigation({ categories }: Props) {
  return (
    <section className="w-full bg-surface-warm">
      <h2 className="text-center pt-20 text-[13px] tracking-[3px] font-medium text-accent-gold">
        EXPLORE OTHER COLLECTIONS
      </h2>
      <div className="max-w-360 px-6 sm:px-10 md:px-16 mx-auto  py-10 md:py-14 grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.title}
            className="bg-surface p-6 md:p-8 hover:shadow-sm transition"
          >
            <div className="max-w-md">
              <h3 className=" text-foreground uppercase max-w-[200px] mb-3 mt-10 font-bold text-[36px] leading-[105%] font-playfair">
                {cat.title}
              </h3>

              <p className="text-[15px] font-normal font-newsreader leading-[160%] text-foreground-secondary mb-5">
                {cat.description}
              </p>

              <Link
                href={cat.href}
                className="inline-flex items-center gap-1 text-[13px] font-medium text-accent-gold "
              >
                Shop {cat.navigation}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-3"
                  viewBox="0 0 32 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12h22M18 5l7 7-7 7" />
                </svg>{" "}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
