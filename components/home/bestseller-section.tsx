import Image from "next/image";
import Link from "next/link";

type Item = {
  id: number;
  name: string;
  image: string;
  price: string;
  slug: string;
};

const items: Item[] = [
  {
    id: 1,
    name: "Black Onyx Gold Longyi",
    image: "/home/bestseller_image_1.jpg",
    price: "48,000 MMK",
    slug: "black-onyx-gold-longyi",
  },
  {
    id: 2,
    name: "Indigo Stripe Silk Htamein",
    image: "/home/bestseller_image_2.jpg",
    price: "65,000 MMK",
    slug: "indigo-stripe-silk-htamein",
  },
  {
    id: 3,
    name: "Midnight Indigo Zip Htamein",
    image: "/home/bestseller_image_3.jpg",
    price: "52,000 MMK",
    slug: "midnight-indigo-zip-htamein",
  },
  {
    id: 4,
    name: "Royal Red Longyi",
    image: "/home/bestseller_image_4.jpg",
    price: "47,000 MMK",
    slug: "royal-red-longyi",
  },
];

export default function BestSellerSection() {
  return (
    <section className="relative pb-16 bg-background overflow-hidden">
      {/* Background Image */}
      {/* <Image
        src="/home/collection_background.png"
        alt="background"
        fill
        className="object-cover opacity-5"
      /> */}

      {/* Top Left Decoration */}
      <div className="absolute bottom-6 left-6 flex items-center">
        <div className="w-3 h-3 border border-accent-gold-light bg-accent-gold-light rotate-45" />
        <div className="w-20 h-[1px] bg-accent-gold-light" />
      </div>

      {/* Top Right Decoration */}
      <div className="absolute bottom-6 right-6 flex items-center ">
        <div className="w-20 h-[1px] bg-accent-gold-light" />
        <div className="w-3 h-3 border border-accent-gold-light bg-accent-gold-light rotate-45" />
      </div>

      <div className="max-w-360 px-6 sm:px-10 md:px-16 mx-auto">
        {/* Title */}
        <h2 className=" text-center mb-6 uppercase lg:mb-12 font-bold text-[22px] lg:text-[42px] tracking-[4px] text-foreground font-playfair">
          Our Best Sellers{" "}
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-4 gap-6">
          {items.map((item) => (
            <Link
              href={`/products/${item.slug}`}
              key={item.id}
              className="border border-white hover:border-foreground"
            >
              <div className="relative w-full  aspect-4/5 mb-3">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover "
                />
              </div>
              <div className="p-2">
                <p className="text-[16px] font-regular text-foreground font-newsreader">
                  {item.name}
                </p>
                <p className="text-[13px] font-regular tracking-[1px]  text-foreground-muted mt-1">
                  {item.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
