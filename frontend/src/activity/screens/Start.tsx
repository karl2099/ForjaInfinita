import React from "react";

export default function Start({ onNext }: { onNext: ()=>void }){
  return (
    <div style={{display:"grid", placeItems:"center", minHeight:"100vh"}}>
      <div style={{textAlign:"center"}}>
        <h1 style={{marginBottom: 12}}>Forja Infinita — Activity</h1>
        <button onClick={onNext} className="btn-primary">Iniciar</button>
      </div>
    </div>
  );
}
