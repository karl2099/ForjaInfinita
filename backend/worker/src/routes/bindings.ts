import { json, Env } from "../db";
export async function postBinding(req: Request, env: Env){
  const body = await req.json();
  const id = crypto.randomUUID();
  const now = Date.now();
  const { campaignId, userId, characterId, role="player" } = body || {};
  await env.DB.prepare(
    "INSERT OR REPLACE INTO binding (id, campaign_id, user_id, character_id, role, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(id, campaignId, userId, characterId, role, now).run();
  return json({ ok:true }, env);
}
