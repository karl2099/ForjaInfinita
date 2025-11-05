import React from "react";
export default function RoleSelect({ onPlayer, onGM }:{ onPlayer:()=>void; onGM:()=>void }){
  return (
    <div style={{display:"grid", placeItems:"center", height:"100vh", gap:12}}>
      <h2>Escolha seu papel</h2>
      <div style={{display:"flex", gap:12}}>
        <button className="btn-primary" onClick={onPlayer}>Jogador</button>
        <button className="btn" onClick={onGM}>Mestre</button>
      </div>
    </div>
  );
}
