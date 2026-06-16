import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Products } from "@/components/Products";
import { Advantages } from "@/components/Advantages";
import { Process } from "@/components/Process";
import { Stats } from "@/components/Stats";
import { Contacts } from "@/components/Contacts";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Products />
        <Advantages />
        <Process />
        <Stats />
        <Contacts />
      </main>
      <Footer />
    </>
  );
}
