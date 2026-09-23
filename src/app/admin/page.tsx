import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import { detectarPosiblesDuplicados } from "@/lib/duplicados";
import { exigirSesion } from "@/lib/auth";
import { cerrarSesion } from "./login/actions";
import AdminArticleList from "./AdminArticleList";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await exigirSesion("/admin");

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

  const posiblesDuplicados = Object.fromEntries(detectarPosiblesDuplicados(visibles));

  // Detectar notas de la última corrida: todas las del mismo minuto que la más reciente
  const notasUltimaCorridaIds = (() => {
    if (visibles.length === 0) return [];
    const masReciente = new Date(visibles[0].fecha);
    const minutoMasReciente = new Date(masReciente.getFullYear(), masReciente.getMonth(), masReciente.getDate(), masReciente.getHours(), masReciente.getMinutes());
    return visibles
      .filter((a) => {
        const fecha = new Date(a.fecha);
        const minutoNota = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), fecha.getHours(), fecha.getMinutes());
        return minutoNota.getTime() === minutoMasReciente.getTime();
      })
      .map((a) => a.id);
  })();

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
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <form action={cerrarSesion}>
            <button
              type="submit"
              style={{ background: "none", border: "none", color: "#8A8079", fontSize: "13px", cursor: "pointer", padding: 0 }}
            >
              Cerrar sesión
            </button>
          </form>
          <Link
            href="/admin/nueva"
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
          posiblesDuplicados={posiblesDuplicados}
          notasUltimaCorridaIds={notasUltimaCorridaIds}
        />

        {ocultas.length > 0 && (
          <div style={{ marginTop: "36px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 500, color: "#191512" }}>Notas ocultas</h2>
              <span style={{ fontSize: "13px", color: "#8A8079" }}>
                {ocultas.length} nota{ocultas.length === 1 ? "" : "s"}
              </span>
            </div>
            <AdminArticleList articulos={ocultas} posiblesDuplicados={{}} ocultas />
          </div>
        )}
      </div>
    </div>
  );
}
