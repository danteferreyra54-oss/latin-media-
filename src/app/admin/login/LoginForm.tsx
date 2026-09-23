"use client";

import { useActionState } from "react";
import { iniciarSesion } from "./actions";

const campo: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #D9D1C7",
  borderRadius: "6px",
  fontSize: "15px",
  background: "#fff",
  color: "#191512",
  boxSizing: "border-box",
};

const etiqueta: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  color: "#5C534C",
  marginBottom: "6px",
};

export default function LoginForm({ volver }: { volver: string }) {
  const [estado, accion, enviando] = useActionState(iniciarSesion, undefined);

  return (
    <form
      action={accion}
      style={{
        background: "#fff",
        border: "1px solid #E8E1D8",
        borderRadius: "8px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <input type="hidden" name="volver" value={volver} />
      <div>
        <label htmlFor="email" style={etiqueta}>Mail</label>
        <input id="email" name="email" type="email" autoComplete="username" required style={campo} />
      </div>
      <div>
        <label htmlFor="password" style={etiqueta}>Contraseña</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required style={campo} />
      </div>
      {estado?.error && (
        <p style={{ color: "#A81419", fontSize: "13px", margin: 0 }}>{estado.error}</p>
      )}
      <button
        type="submit"
        disabled={enviando}
        style={{
          background: "#A81419",
          color: "#FCFAF6",
          border: "none",
          padding: "10px",
          borderRadius: "6px",
          fontSize: "15px",
          cursor: enviando ? "default" : "pointer",
          opacity: enviando ? 0.7 : 1,
        }}
      >
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
