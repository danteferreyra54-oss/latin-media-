import { redirect } from "next/navigation";
import Link from "next/link";
import NotaForm from "../NotaForm";
import { crearNota } from "./actions";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ key?: string }>;
}

export default async function NuevaNotaPage({ searchParams }: Props) {
  const { key } = await searchParams;

  if (!key || !process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    redirect("/");
  }

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
          href={`/admin?key=${key}`}
          style={{ color: "#FCFAF6", fontSize: "16px", fontFamily: "Georgia, serif", textDecoration: "none" }}
        >
          Latin<span style={{ color: "#A81419" }}>Media</span> — Admin
        </Link>
        <Link
          href={`/admin?key=${key}`}
          style={{ color: "#8A8079", fontSize: "13px", textDecoration: "none" }}
        >
          ← Volver al listado
        </Link>
      </div>

      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "24px 16px 64px" }}>
        <h1 style={{ fontSize: "18px", fontWeight: 500, marginBottom: "20px", color: "#191512" }}>
          Nueva nota
        </h1>
        <NotaForm adminKey={key} guardar={crearNota.bind(null, key)} textoBoton="Guardar nota" mensajeExito="Nota creada." />
      </div>
    </div>
  );
}
