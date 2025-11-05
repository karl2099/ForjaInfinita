/* ============================ STORAGE (por guild) ============================ */
import { state } from "./state.js";

function storageKey(){
  const g = state.guild?.id || 'guild_desconhecida';
  return `fi_hub_${g}`;
}

export function loadLocal(){
  try{
    const raw = localStorage.getItem(storageKey());
    if (!raw) return;
    const obj = JSON.parse(raw);
    state.papel         = obj.papel         ?? state.papel;
    state.campanhas     = obj.campanhas     ?? state.campanhas;
    state.campanhaAtual = obj.campanhaAtual ?? state.campanhaAtual;
  }catch(_){}
}

export function saveLocal(){
  const obj = {
    papel: state.papel,
    campanhas: state.campanhas,
    campanhaAtual: state.campanhaAtual
  };
  localStorage.setItem(storageKey(), JSON.stringify(obj));
}
