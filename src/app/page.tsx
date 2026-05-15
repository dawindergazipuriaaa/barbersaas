
import Team from "./components/Teams";
import Hero from "./components/Hero";
import Second from "./components/Second";
import Prices from "./components/Prices";
import PriceList from "./components/PriceList";
import Services from "./components/Services";
import Gallery from "./components/Gallery";
import ContactUs from "./components/ContactUs";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
    <main>
      <Hero />
      <section>
        <Second />
      </section>
      <section id="prices">
        <Prices />
      </section>
      
      <PriceList />
      <section id="services">
        <Services />
      </section>
      <section id="team">
        <Team />
      </section>
      <section id="gallery">
        <Gallery />
      </section>
      <section id="contactus">
        <ContactUs />
      </section>
      <Footer />

    </main>
    
      
      

    </>
  );
}
