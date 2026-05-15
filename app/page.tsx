import CategorySection from "@/components/home/categories-section";
import HeroSlider from "@/components/home/hero-slider";
import BestSellerSection from "@/components/home/bestseller-section";
import AboutSection from "@/components/home/about-section";
import FeedbackSection from "@/components/home/feedback-section";
import ContactSection from "@/components/home/contact-section";

export default function Home() {
  return (
    <div className="bg-background    ">
      <HeroSlider />
      <CategorySection />
      <BestSellerSection />
      <AboutSection />
      <FeedbackSection />
      <ContactSection />
    </div>
  );
}
