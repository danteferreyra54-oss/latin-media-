import { redirect } from "next/navigation";
import { estaLogueado } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ volver?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { volver } = await searchParams;

  if (await estaLogueado()) {
    redirect("/admin");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FCFAF6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "var(--font-franklin, sans-serif)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "360px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <span style={{ color: "#191512", fontSize: "22px", fontFamily: "Georgia, serif" }}>
            Latin<span style={{ color: "#A81419" }}>Media</span> — Admin
          </span>
        </div>
        <LoginForm volver={volver ?? "/admin"} />
      </div>
    </div>
  );
}
