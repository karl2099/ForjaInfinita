// Arquivo modificado para adicionar suporte a channelId/guildId
// Original localizado em frontend/src/services/api.ts

const API_BASE = "https://forja-activity.kdc2099.workers.dev"; // domínio do Worker

/*
 * Cria um personagem no banco. Agora aceita tanto `campaignId` quanto
 * `channelId`/`guildId`. Se `campaignId` não for fornecido mas `channelId`
 * estiver presente, o Worker criará (ou reaproveitará) a campanha
 * correspondente ao canal automaticamente.
 */
export async function apiCreateCharacter(body: {
  campaignId?: string;
  channelId?: string;
  guildId?: string;
  ownerUserId: string | null;
  personagem: any;
}): Promise<{ characterId: string }> {
  const r = await fetch(`${API_BASE}/api/character`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Falha ao criar personagem");
  return r.json();
}

/*
 * Cria uma associação entre um usuário e um personagem. Sem alterações em
 * relação ao original.
 */
export async function apiCreateBinding(body: {
  campaignId: string;
  userId: string;
  characterId: string;
  role?: "player" | "gm";
}): Promise<{ ok: true }> {
  const r = await fetch(`${API_BASE}/api/binding`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Falha no binding");
  return r.json();
}

/*
 * Lista os personagens salvos. Agora suporta filtrar por channelId e guildId,
 * além de userId e campaignId. Se channelId estiver presente, o Worker
 * resolverá automaticamente o campaignId correspondente ao canal. Quando
 * ambos userId e channelId são passados, apenas os personagens daquele
 * usuário naquele canal serão retornados.
 */
export async function apiGetCharacters(opts: {
  userId?: string;
  campaignId?: string;
  channelId?: string;
  guildId?: string;
} = {}): Promise<{ characters: any[] }> {
  const params = new URLSearchParams();
  if (opts.userId) params.append("userId", opts.userId);
  if (opts.campaignId) params.append("campaignId", opts.campaignId);
  if (opts.channelId) params.append("channelId", opts.channelId);
  if (opts.guildId) params.append("guildId", opts.guildId);
  const query = params.toString();
  const r = await fetch(`${API_BASE}/api/characters${query ? `?${query}` : ""}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!r.ok) throw new Error("Falha ao obter personagens");
  return r.json();
}