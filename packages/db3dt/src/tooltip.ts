export function tooltipShort(x:any){ return x?.nome || String(x?.id || ""); }
export function tooltipLong(x:any){ return `**${x?.nome||x?.id}**\n${x?.descricao||""}`; }
