import type { DB3DT, DBIndex } from "./schema";
const slug = (s:string)=>s.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");

export function buildIndex(db: DB3DT): DBIndex {
  const byId:Record<string,any>={}, byNome:Record<string,any>={}, bySlug:Record<string,any>={};
  const touch=(x:any)=>{ if(!x) return; byId[x.id]=x; if(x.nome) byNome[x.nome]=x; bySlug[x.slug??=slug(x.nome||x.id)]=x; };
  (db.vantagens||[]).forEach(touch);
  (db.desvantagens||[]).forEach(touch);
  (db.pericias||[]).forEach(touch);
  (db.magias||[]).forEach(touch);
  return { byId, byNome, bySlug };
}
