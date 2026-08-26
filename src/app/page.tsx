import { Navbar } from "@/components/landing/navbar";
import { HeroClient } from "@/components/landing/hero.client";
import { StatsStrip } from "@/components/landing/stats-strip";
import { Services } from "@/components/landing/services";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Verification } from "@/components/landing/verification";
import { CatalogPreview } from "@/components/landing/catalog-preview";
import { TestimonialSlider } from "@/components/landing/testimonial-slider";
import { Faq } from "@/components/landing/faq";
import { CtaBand } from "@/components/landing/cta-band";
import { getLandingStats, getPublishedTestimonials } from "@/server/landing-stats";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [stats, testimonials] = await Promise.all([
    getLandingStats(),
    getPublishedTestimonials(),
  ]);

  return (
    <main className="min-h-screen bg-[#F8E7C9]">
      <Navbar />
      <HeroClient />
      <StatsStrip stats={stats} />
      <Services />
      <HowItWorks />
      <Verification />
      <CatalogPreview />
      <TestimonialSlider testimonials={testimonials} />
      <Faq />
      <CtaBand />
    </main>
  );
}
