import React from "react";

export default function Header({
  onHome,
  onBack,
  showBack = true,
}: {
  onHome: () => void;
  onBack: () => void;
  showBack?: boolean;
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        background: "rgba(0,0,0,.35)",
        backdropFilter: "blur(6px)",
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn" onClick={onHome}>Início</button>
        {showBack && <button className="btn" onClick={onBack}>Voltar</button>}
      </div>

      <img
        src="/assets/img/hub-logo2.png"
        alt="Forja Infinita"
        style={{
          height: "clamp(40px, 6vw, 72px)",
          objectFit: "contain",
          transform: "translateY(2px)",
          opacity: .95,
        }}
      />

      {/* espaçador simétrico do lado direito */}
      <div style={{ width: 120 }} />
    </div>
  );
}
