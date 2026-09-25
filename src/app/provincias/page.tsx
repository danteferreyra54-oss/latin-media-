import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import RedNacional from "@/components/RedNacional";
import { redProvincias } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Noticias de las provincias",
  description: "La red de redacciones de Latin Media en las provincias argentinas: las noticias locales de cada lugar del país.",
  alternates: { canonical: "/provincias" },
};

export default async function ProvinciasPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-fade">
        <RedNacional provincias={redProvincias} />
      </main>
      <SiteFooter />
    </>
  );
}
