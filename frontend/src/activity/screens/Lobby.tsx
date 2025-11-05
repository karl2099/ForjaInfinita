import React from "react";

export default function Lobby(
  { campaignId, user, onCreate }:
  { campaignId:string; user:{id:string;name:string}|null; onCreate:()=>void }
){
  return (
    <div style={{padding:24}}>
      <h2>Lobby — Campanha {campaignId}</h2>
      <p>Bem-vindo, {user?.name || "Jogador"}. Em breve listaremos seus personagens.</p>
      <button className="btn" onClick={onCreate}>Novo Personagem</button>
    </div>
  );
}
