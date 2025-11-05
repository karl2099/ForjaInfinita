export const onRequest = async ({ request, env }) => {
  const url = new URL(request.url);
  // repassa para o Worker mantendo o path /api/*
  return env.API.fetch(new Request(url.toString().replace("/api", ""), request));
};
