export type Env = { DB: D1Database; CORS_ORIGIN?: string };

export async function runMigrations(env: Env){
  // Em dev você pode ler schema.sql pelo bundle; aqui deixamos no README para aplicar manualmente via wrangler d1 execute
}

export function json(data: any, env: Env, status=200){
  const headers = { "Content-Type":"application/json", "Access-Control-Allow-Origin": env.CORS_ORIGIN || "*" };
  return new Response(JSON.stringify(data), { status, headers });
}
