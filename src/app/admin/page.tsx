import { redirect } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import { detectarPosiblesDuplicados } from "@/lib/duplicados";
import AdminArticleList from "./AdminArticleList";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ key?: string }>;
}

export default async function AdminPage({ searchParams }: Props) {
  const { key } = await searchParams;

  if (!key || !process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    redirect("/");
  }

  const supabase = createAdminClient();
  const [{ data: articulos }, { count: totalNotas }] = await Promise.all([
    supabase
      .from("articulos")
      .select("id, titulo, seccion, autor, fecha, slug, fuente, oculta")
      .order("fecha", { ascending: false })
      .limit(100),
    supabase.from("articulos").select("*", { count: "exact", head: true }),
  ]);

  const visibles = (articulos || []).filter((a) => !a.oculta);
  const ocultas = (articulos || []).filter((a) => a.oculta);

  const posiblesDuplicados = [...detectarPosiblesDuplicados(visibles)];

  return (
    <div
      style={{ minHeight: "100vh", background: "#FCFAF6", fontFamily: "var(--font-franklin, sans-serif)" }}
    >
      <div
        style={{
          background: "#191512",
          padding: "14px 24px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <span style={{ color: "#FCFAF6", fontSize: "16px", fontFamily: "Georgia, serif" }}>
          Latin<span style={{ color: "#A81419" }}>Media</span> — Admin
        </span>
        <Link
          href={`/admin/nueva?key=${key}`}
          style={{
            background: "#A81419",
            color: "#FCFAF6",
            padding: "6px 16px",
            borderRadius: "6px",
            fontSize: "13px",
            textDecoration: "none",
          }}
        >
          + Nueva nota
        </Link>
      </div>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          <h1 style={{ fontSize: "18px", fontWeight: 500, color: "#191512" }}>Artículos publicados</h1>
          <span style={{ fontSize: "13px", color: "#8A8079" }}>
            {totalNotas ?? 0} nota{totalNotas === 1 ? "" : "s"} en total
          </span>
        </div>
        <AdminArticleList
          articulos={visibles}
          adminKey={key}
          posiblesDuplicados={posiblesDuplicados}
        />

        {ocultas.length > 0 && (
          <div style={{ marginTop: "36px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 500, color: "#191512" }}>Notas ocultas</h2>
              <span style={{ fontSize: "13px", color: "#8A8079" }}>
                {ocultas.length} nota{ocultas.length === 1 ? "" : "s"}
              </span>
            </div>
            <AdminArticleList articulos={ocultas} adminKey={key} posiblesDuplicados={[]} ocultas />
          </div>
        )}
      </div>
    </div>
  );
}
