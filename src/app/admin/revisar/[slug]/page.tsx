import { notFound } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { exigirSesion } from "@/lib/auth";
import RevisionForm from "./RevisionForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function RevisarPage({ params }: Props) {
  const { slug } = await params;
  await exigirSesion(`/admin/revisar/${slug}`);

  const supabase = createAdminClient();
  const { data: articulo } = await supabase
    .from("articulos")
    .select("slug,titulo,bajada,cuerpo,seccion,autor,fecha,fuente")
    .eq("slug", slug)
    .maybeSingle();

  if (!articulo) {
    notFound();
  }

  return <RevisionForm articulo={articulo} />;
}
