/* ============================ CAMPANHAS ============================ */
import { state } from "./state.js";
import { saveLocal } from "./storage.js";

export function gerarCodigo(){ return Math.random().toString(36).slice(2, 8).toUpperCase(); }

export function criarCampanha(nome){
  const c = { id: crypto.randomUUID(), nome, codigo: gerarCodigo() };
  state.campanhas.push(c);
  saveLocal();
  return c;
}

export function ingressarPorCodigo(codigo){
  let c = state.campanhas.find(x=>x.codigo===codigo.toUpperCase());
  if (!c){
    c = { id: crypto.randomUUID(), nome:`Campanha ${codigo}`, codigo: codigo.toUpperCase() };
    state.campanhas.push(c);
    saveLocal();
  }
  return c;
}

export async function carregarCampanhasDaGuild(){
  // tenta /campanhas.json
  try{
    const res = await fetch('/campanhas.json', { cache:'no-store' });
    const all = await res.json();
    const gid = state.guild?.id || null;
    let lista = Array.isArray(all) ? all.slice() : [];
    if (gid) lista = lista.filter(c => !c.guildId || c.guildId === gid);

    for (const c of lista){
      if (!c.id)     c.id = crypto.randomUUID();
      if (!c.nome)   c.nome = "Campanha";
      if (!c.codigo) c.codigo = gerarCodigo();
    }
    if (lista.length){
      state.campanhas = lista;
      saveLocal();
      return;
    }
  }catch(_){ /* fallback abaixo */ }

  // fallback: exemplo
  if (!state.campanhas || !state.campanhas.length){
    state.campanhas = [
      { id: crypto.randomUUID(), nome: "Crônicas de Exemplo", codigo: gerarCodigo() }
    ];
    saveLocal();
  }
}
