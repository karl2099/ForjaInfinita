// Arquivo modificado para suportar consulta por channelId
// Original localizado em backend/worker/src/index.ts

// Importação de tipos removida para evitar dependência circular. O tipo `Env`
// é definido pelo Cloudflare Worker durante a compilação. Quando você
// substituir este arquivo no seu projeto, o tipo `Env` já estará no
// escopo e não é necessário importá-lo aqui.

/*
 * Este arquivo é uma cópia do handler original, com acréscimos no endpoint
 * GET /api/characters para permitir filtragem por `channelId` e `guildId`.
 * Quando um `channelId` é fornecido na query string, o Worker resolve (ou cria)
 * a campanha correspondente via `upsertCampaignFromChannel` e usa o ID da campanha
 * resultante na consulta. Se também houver `userId`, a consulta restringe
 * simultaneamente por usuário e campanha, retornando apenas os personagens do
 * usuário naquele canal. Caso contrário, se apenas `userId` ou `campaignId`
 * for informado, mantém o comportamento anterior.  
 */

// Atividade-Discord/backend/worker/src/index.ts

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const C = {
      'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    };

    // Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: C });
    }

    // Helper para JSON
    function j(data: any, status = 200) {
      return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...C },
      });
    }
    const nowSec = () => Math.floor(Date.now() / 1000);

    // Mesma função do código original — cria ou retorna ID da campanha por canal
    async function upsertCampaignFromChannel(env: Env, channelId: string, guildId?: string) {
      const found = await env.DB
        .prepare(`SELECT id FROM campaign WHERE discord_channel_id = ? LIMIT 1`)
        .bind(channelId)
        .first<{ id: string }>();
      if (found?.id) return found.id;
      const r = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
        headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` },
      });
      if (!r.ok) throw new Error(`Discord API ${r.status} - channels/${channelId}`);
      const data = (await r.json()) as { name?: string; guild_id?: string };
      const id = crypto.randomUUID();
      const ts = nowSec();
      const name = data?.name ?? `Campanha ${channelId}`;
      const gId = guildId || (data as any)?.guild_id || null;
      await env.DB.prepare(
        `INSERT INTO campaign (id, name, guild_id, discord_channel_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(id, name, gId, channelId, ts, ts).run();
      return id;
    }

    try {
      /* ===== /api/characters (GET) =====
         Agora aceita channelId e guildId na query string. Se channelId estiver
         presente, resolve a campanha correspondente antes de executar a consulta.
         A lógica de filtragem por userId e/ou campaignId continua igual, com a
         adição de suporte a ambos ao mesmo tempo quando channelId estiver presente. */
      if (url.pathname === '/api/characters' && request.method === 'GET') {
        const userId = url.searchParams.get('userId');
        const campaignIdParam = url.searchParams.get('campaignId');
        const channelIdParam = url.searchParams.get('channelId');
        const guildIdParam = url.searchParams.get('guildId');
        let resolvedCampaignId: string | null = null;
        if (channelIdParam) {
          // resolve ou cria campanha via canal
          resolvedCampaignId = await upsertCampaignFromChannel(
            env,
            String(channelIdParam),
            guildIdParam ? String(guildIdParam) : undefined
          );
        }
        const campaignId = campaignIdParam || resolvedCampaignId;
        let query = `SELECT c.id, c.owner_user_id, c.campaign_id, c.data_json, c.updated_at FROM character c`;
        const params: string[] = [];
        if (userId && campaignId) {
          // filtra por usuário e campanha ao mesmo tempo
          query += ` JOIN binding b ON b.character_id = c.id WHERE b.user_id = ? AND c.campaign_id = ?`;
          params.push(userId, campaignId);
        } else if (userId) {
          // filtra apenas por usuário
          query += ` JOIN binding b ON b.character_id = c.id WHERE b.user_id = ?`;
          params.push(userId);
        } else if (campaignId) {
          // filtra apenas por campanha
          query += ` WHERE c.campaign_id = ?`;
          params.push(campaignId);
        }
        const results = await env.DB.prepare(query).bind(...params).all();
        return j({ characters: results.results }, 200);
      }

      /* ===== /api/character (POST) =====
         A implementação original já permite passar channelId/guildId em vez de campaignId,
         utilizando upsertCampaignFromChannel para resolver a campanha. */
      if (url.pathname === '/api/character' && request.method === 'POST') {
        const body = await request.json();
        const { campaignId, channelId, guildId, ownerUserId, personagem } = body || {};
        if (!personagem) return j({ error: 'personagem obrigatório' }, 400);
        let resolvedCampaignId: string | null = campaignId || null;
        if (!resolvedCampaignId) {
          if (!channelId) return j({ error: 'Informe campaignId ou channelId' }, 400);
          resolvedCampaignId = await upsertCampaignFromChannel(
            env,
            String(channelId),
            guildId ? String(guildId) : undefined
          );
        }
        const id = crypto.randomUUID();
        const ts = nowSec();
        await env.DB.prepare(
          `INSERT INTO "character" (id, campaign_id, owner_user_id, data_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(id, resolvedCampaignId, ownerUserId ?? null, JSON.stringify(personagem), ts, ts).run();
        return j({ characterId: id }, 200);
      }

      /* ===== /api/binding (POST) ===== */
      if (url.pathname === '/api/binding' && request.method === 'POST') {
        const { campaignId, userId, characterId, role } = await request.json();
        if (!campaignId || !userId || !characterId) {
          return j({ error: 'campaignId, userId e characterId obrigatórios' }, 400);
        }
        const ts = nowSec();
        await env.DB.prepare(
          `INSERT INTO binding (campaign_id, user_id, character_id, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(campaignId, userId, characterId, role ?? 'player', ts, ts).run();
        return j({ ok: true }, 200);
      }

      /* ===== /api/campaign (POST) ===== */
      if (url.pathname === '/api/campaign' && request.method === 'POST') {
        const { name } = await request.json();
        if (!name) return j({ error: 'name obrigatório' }, 400);
        const id = crypto.randomUUID();
        const ts = nowSec();
        await env.DB.prepare(
          `INSERT INTO campaign (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)`
        ).bind(id, name, ts, ts).run();
        return j({ campaignId: id }, 200);
      }
	// Recebe logs da página (erro, mensagem, stack)
if (url.pathname === "/api/log" && request.method === "POST") {
  const payload = await request.json().catch(() => ({}));
  // Escreve no log do Worker; visível via wrangler tail
  console.log("Erro recebido do front:", JSON.stringify(payload));
  // Opcional: persistir em D1
  // await env.DB.prepare("INSERT INTO logs (message, source, stack) VALUES (?, ?, ?)").bind(payload.message, payload.filename, payload.stack).run();
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}
  

      return j({ error: 'not found' }, 404);
    } catch (err: any) {
      return j({ error: String(err?.message || err) }, 500);
    }
  },
} satisfies ExportedHandler<Env>;