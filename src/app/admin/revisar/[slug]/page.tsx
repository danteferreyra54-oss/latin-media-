import { redirect, notFound } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import RevisionForm from "./RevisionForm";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ key?: string }>;
}

export default async function RevisarPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { key } = await searchParams;

  if (!key || !process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    redirect("/");
  }

  const supabase = createAdminClient();
  const { data: articulo } = await supabase
    .from("articulos")
    .select("slug,titulo,bajada,cuerpo,seccion,autor,fecha,fuente")
    .eq("slug", slug)
    .maybeSingle();

  if (!articulo) {
    notFound();
  }

  return <RevisionForm articulo={articulo} adminKey={key} />;
}
