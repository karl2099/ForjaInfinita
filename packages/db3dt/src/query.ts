import type { DBIndex } from "./schema";
export function find(index: DBIndex, alvo:{id?:string;nome?:string;slug?:string}){
  return (alvo.id && index.byId[alvo.id]) || (alvo.nome && index.byNome[alvo.nome]) || (alvo.slug && index.bySlug[alvo.slug]) || null;
}
