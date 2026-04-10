import Image from "next/image";
import Link from "next/link";

export default function AboutSection() {
  return (
    <section className="w-full py-8 md:py-16">
      <div className="max-w-360  px-6 sm:px-10 md:px-16  mx-auto flex flex-col lg:flex-row items-center gap-6 md:gap-8">
        {/* Photo — left */}
        <div className="w-full lg:w-2/5 flex-shrink-0">
          <div className="relative w-full aspect-video lg:aspect-square  overflow-hidden">
            <Image
              src="/home/about_image.png"
              alt="About photo"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Info — right */}
        <div className="relative w-full lg:w-3/5 flex flex-col gap-6 border-l border-accent-gold-light pl-10">
          <div className="absolute -top-1.5 -left-1.5  w-3 h-3 bg-accent-gold-light rotate-45"></div>
          <div className="absolute -bottom-1.5 -left-1.5  w-3 h-3 bg-accent-gold-light rotate-45"></div>

          {/* Eyebrow label */}
          <span className="text-[13px] font-medium tracking-[3px] uppercase text-accent-gold">
            OUR HERITAGE{" "}
          </span>

          {/* Title */}
          <h2
            className="  font-bold text-foreground   leading-[105%] font-playfair"
            style={{
              fontSize: "clamp(30px, 5vw, 64px)",
            }}
          >
            CENTURIES OF CRAFTSMANSHIP{" "}
          </h2>

          {/* Paragraphs */}
          <p className="text-base md:text-[17px] font-regular leading-[170%] font-newsreader text-foreground-secondary">
            Oway celebrates the rich textile heritage of Myanmar, where every
            thread tells a story passed down through generations. Our artisans
            use time-honored techniques — from the intricate Acheik wave
            patterns of Amarapura to the lustrous silk of Mandalay — to create
            garments that honor tradition while embracing modern elegance.
          </p>

          <p className="text-base md:text-[17px] font-regular leading-[170%] font-newsreader text-foreground-secondary">
            Each piece is handwoven with care, ensuring that the beauty and
            cultural significance of Myanmar&apos;s textile arts endure for
            generations to come.
          </p>

          {/* Optional CTA */}
          <div className="pt-2">
            <Link
              href="#contact"
              className="inline-flex items-center gap-2 text-accent-gold hover:text-accent-gold-light tracking-[1px]  text-[14px] font-medium transition-colors"
            >
              Discover Our Story
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-4"
                viewBox="0 0 32 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12h22M18 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
