import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import RedNacional from "@/components/RedNacional";
import { redProvincias } from "@/lib/mock-data";

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
