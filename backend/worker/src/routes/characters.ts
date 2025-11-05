import { json, Env } from "../db";

export async function postCharacter(req: Request, env: Env){
  const body = await req.json();
  const id = crypto.randomUUID();
  const now = Date.now();
  const { campaignId, ownerUserId, personagem } = body || {};
  await env.DB.prepare(
    "INSERT INTO character (id, campaign_id, owner_user_id, data_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(id, campaignId, ownerUserId, JSON.stringify(personagem), now, now).run();
  return json({ characterId: id }, env);
}
