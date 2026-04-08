"use client";

import { useRef, useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

const slides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
    overlayText: "TRADITION WOVEN INTO EVERY THREAD",
    title: "MYANMAR HERITAGE TEXTILES",
    paragraph:
      "Handcrafted with centuries of tradition, each piece tells the story of Myanmar's rich textile heritage — from the intricate acheik patterns of Mandalay to the golden threads of Amarapura.",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&q=80",
    overlayText: "SILK THAT SPEAKS OF ROYALTY",
    title: "MANDALAY SILK COLLECTION",
    paragraph:
      "Discover the luminous beauty of Mandalay silk — prized for its extraordinary sheen and rich texture, each piece is handwoven by master artisans using techniques perfected over centuries.",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1600&q=80",
    overlayText: "WAVES OF ANCIENT ARTISTRY",
    title: "THE ART OF ACHEIK",
    paragraph:
      "The legendary wave patterns of Acheik — born in the ancient city of Amarapura — represent the pinnacle of Myanmar textile artistry. Each pattern takes weeks to complete by hand.",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80",
    overlayText: "THREADS OF GOLD AND GLORY",
    title: "GOLDEN PASO COLLECTION",
    paragraph:
      "Adorned with golden threads and intricate embroidery, the paso represents the finest expression of Myanmar formal wear — worn by generations at ceremonies, festivals, and moments of celebration.",
  },
];

export default function HeroSlider() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setActiveIndex(swiper.realIndex);
  }, []);

  const goToSlide = useCallback((index: number) => {
    swiperRef.current?.slideToLoop(index);
  }, []);

  return (
    <section className="relative w-full h-[650px]  sm:h-[700px]  overflow-hidden bg-black ">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        speed={1000}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={handleSlideChange}
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative w-full h-full">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[6000ms] ease-out scale-105"
              style={{ backgroundImage: `url(${slide.image})` }}
            />

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

            {/* Big overlay text — 50% opacity */}
            <div className="absolute inset-0 flex items-center max-w-360 mx-auto justify-center pointer-events-none select-none">
              <span
                className="text-white hidden sm:block opacity-30 font-black tracking-[0.25em] uppercase leading-[90%] text-center font-playfair"
                style={{
                  fontSize: "clamp(1rem, 10vw, 5rem)",
                  letterSpacing: "0.2em",
                }}
              >
                {slide.overlayText}
              </span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Bottom HUD */}
      <div className="absolute bottom-0 left-0  max-w-360 mx-auto  right-0 z-20 flex items-end justify-between px-6 sm:px-10 md:px-16 pb-8 sm:pb-10 pointer-events-none">
        {/* LEFT: Title, Paragraph + Pagination dots */}
        <div className="flex flex-col gap-5 max-w-xs  sm:max-w-sm md:max-w-md pointer-events-auto">
          {/* Slide info */}
          <div className="flex flex-col gap-2">
            <h2 className="text-accent-gold  font-regular text-[10px] sm:text-[13px] leading-tight tracking-[3px] text-shadow-lg/30">
              {slides[activeIndex].title}
            </h2>
            <p className="text-white/75 leading-[150%]  text-[16px] sm:text-[18px] font-newsreader mt-2 sm:mt-4 text-shadow-lg/30">
              {slides[activeIndex].paragraph}
            </p>
            <button className="w-fit py-2.5 px-5 mt-4 sm:py-3.75 sm:mt-8 sm:px-10 text-surface-dark hover:bg-accent-gold-light hover:cursor-pointer font-medium text-[12px] sm:text-[14px] tracking-[2px] bg-accent-gold">
              Shop Collection
            </button>
          </div>

          {/* Pagination dots */}
          <div className="flex items-center gap-2.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="group relative flex items-center justify-center"
              >
                <span
                  className={`block rounded-full transition-all duration-500 ${
                    i === activeIndex
                      ? "w-8 h-[3px] bg-white"
                      : "w-[3px] h-[3px] bg-white/50 hover:bg-white/80"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Page number */}
        <div className="hidden sm:flex items-end gap-1 pb-0.5 pointer-events-none select-none text-white text-[13px] font-funnel-sans tracking-[2px]">
          <span className="text-[15px]">
            0{String(activeIndex + 1).padStart(1, "0")}
          </span>
          <span className="text-foreground-muted ">/0{slides.length}</span>
        </div>
      </div>
    </section>
  );
}
