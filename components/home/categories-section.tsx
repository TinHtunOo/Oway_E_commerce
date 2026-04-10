import Image from "next/image";

type Item = {
  id: number;
  name: string;
  image: string;
};

const items: Item[] = [
  { id: 1, name: "Men", image: "/home/collection_image_1.png" },
  { id: 2, name: "Women", image: "/home/collection_image_2.png" },
  { id: 3, name: "Kids", image: "/home/collection_image_3.png" },
  { id: 4, name: "Accessories", image: "/home/collection_image_4.png" },
];

export default function CategorySection() {
  return (
    <section className="relative py-16 bg-background overflow-hidden">
      {/* Background Image */}
      {/* <Image
        src="/home/collection_background.png"
        alt="background"
        fill
        className="object-cover opacity-5"
      /> */}

      {/* Top Left Decoration */}
      <div className="absolute top-6 left-6 flex items-center">
        <div className="w-3 h-3 border border-accent-gold-light bg-accent-gold-light rotate-45" />
        <div className="w-20 h-[1px] bg-accent-gold-light" />
      </div>

      {/* Top Right Decoration */}
      <div className="absolute top-6 right-6 flex items-center ">
        <div className="w-20 h-[1px] bg-accent-gold-light" />
        <div className="w-3 h-3 border border-accent-gold-light bg-accent-gold-light rotate-45" />
      </div>

      <div className="max-w-360 px-6 sm:px-10 md:px-16 mx-auto">
        {/* Title */}
        <h2 className=" text-center mb-6 lg:mb-12 uppercase font-bold text-[22px] lg:text-[42px] tracking-[4px] text-foreground font-playfair">
          Shop by Category{" "}
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="text-center">
              <div className="relative w-full  aspect-4/5 mb-3">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover "
                />
              </div>

              <p className="text-[14px] tracking-[3px] font-medium uppercase text-foreground text-center font-funnel-sans">
                {item.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
