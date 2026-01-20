import Navbar from "./components/Navbar";

import Hero from "./components/Hero";
import FAQ from "./components/FAQ";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div>
      <Navbar />

      <Hero />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}