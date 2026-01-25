import DashboardPreview from "./components/DashboardPreview";
import Navbar from "./components/Navbar";

import Hero from "./components/Hero";
import Features from "./components/Features";
import FAQ from "./components/FAQ";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import Pricing from "./components/Pricing";

export default function Home() {
  return (
    <div>
      <Navbar />

      <Hero />
      <Features />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
