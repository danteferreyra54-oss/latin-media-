import Link from "next/link";
import NotaForm from "../NotaForm";
import { exigirSesion } from "@/lib/auth";
import { crearNota } from "./actions";

export const dynamic = "force-dynamic";

export default async function NuevaNotaPage() {
  await exigirSesion("/admin/nueva");

  return (
    <div style={{ minHeight: "100vh", background: "#FCFAF6" }}>
      <div
        style={{
          background: "#191512",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/admin"
          style={{ color: "#FCFAF6", fontSize: "16px", fontFamily: "Georgia, serif", textDecoration: "none" }}
        >
          Latin<span style={{ color: "#A81419" }}>Media</span> — Admin
        </Link>
        <Link
          href="/admin"
          style={{ color: "#8A8079", fontSize: "13px", textDecoration: "none" }}
        >
          ← Volver al listado
        </Link>
      </div>

      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "24px 16px 64px" }}>
        <h1 style={{ fontSize: "18px", fontWeight: 500, marginBottom: "20px", color: "#191512" }}>
          Nueva nota
        </h1>
        <NotaForm guardar={crearNota} textoBoton="Guardar nota" mensajeExito="Nota creada." />
      </div>
    </div>
  );
}
