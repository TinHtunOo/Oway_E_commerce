import { Minus } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    feedback:
      "The Acheik longyi I purchased is breathtaking. The craftsmanship is unlike anything I've seen — every pattern tells a story of Myanmar's rich heritage.",
    name: "THIN THIN AUNG",
    location: "Yangon",
  },
  {
    feedback:
      "Oway's collection beautifully bridges tradition and modernity. My htamein received countless compliments at a formal dinner in Mandalay.",
    name: "KHIN MAR WIN",
    location: "Mandalay",
  },
  {
    feedback:
      "The quality of silk and the precision of the weaving patterns are extraordinary. Oway preserves what makes Myanmar textiles truly special.",
    name: "SU SU HLAING",
    location: "Bagan",
  },
];

export default function FeedbackSection() {
  return (
    <section className=" relative w-full py-5 lg:py-20 overflow-hidden  bg-surface-dark/90">
      <Image
        src="/home/feedback_background.png"
        alt="background"
        fill
        className="object-cover opacity-5"
      />
      <div className=" relative max-w-360 px-6 py-10 sm:px-10 md:px-16 mx-auto flex flex-col items-center gap-12 ">
        <span className="absolute hidden lg:block top-0 left-0 w-20 h-20 border-t border-l border-accent-gold-light" />
        <span className="absolute hidden lg:block top-0 right-0 w-20 h-20 border-t border-r border-accent-gold-light" />
        <span className="absolute hidden lg:block bottom-0 left-0 w-20 h-20 border-b border-l border-accent-gold-light" />
        <span className="absolute hidden lg:block bottom-0 right-0 w-20 h-20 border-b border-r border-accent-gold-light" />

        {/* Title */}
        <h2 className="max-w-[600px] text-center font-bold text-[40px] lg:text-[72px] leading-[105%] font-playfair text-foreground-inverse">
          VOICES OF OUR PATRONS
        </h2>

        {/* Cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-12">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col gap-3 border-t border-surface/20 p-8"
            >
              {/* Feedback */}
              <p className="flex-1 text-base italic leading-[170%] font-newsreader  text-foreground-inverse">
                &ldquo;{t.feedback}&rdquo;
              </p>

              <p className=" text-accent-gold-light uppercase flex items-center gap-1 font-medium text-[12px] tracking-[2px] ">
                <Minus />
                {t.name}
              </p>
              <p className="text-[12px] font-regular tracking-[1px] text-foreground-muted">
                {t.location}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
