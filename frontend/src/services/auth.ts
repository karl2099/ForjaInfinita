/* ============================ AUTENTICAÇÃO / BOOT (robusto) ============================ */
import { state, els, show } from "./state.js";
import { loadLocal } from "./storage.js";
import { carregarCampanhasDaGuild } from "./campaigns.js";
import { renderCampanhas } from "./ui.js";

// CLIENT_ID do seu App (preservado)
const CLIENT_ID = "1433236527676391444";

/* Detecta se está embutido no Discord (app/iframe) */
function isDiscordEmbed(){
  // UA do app, presença de objetos internos ou rodando como Activity
  return /Discord|discordapp/i.test(navigator.userAgent) ||
         typeof window.__discordSdk !== "undefined" ||
         typeof window.DiscordNative !== "undefined";
}

/* Carrega o SDK do Discord de forma dinâmica (só quando necessário) */
async function loadDiscordSdk(){
  const mod = await import("https://cdn.jsdelivr.net/npm/@discord/embedded-app-sdk@latest/dist/index.mjs");
  return mod;
}

export async function boot(auto=true){
  try{
    if (!isDiscordEmbed()){
      // ====== MODO WEB (fora do Discord) ======
      els.elUiUser.textContent  = "Usuário: visitante (web)";
      els.elUiGuild.textContent = "Servidor: —";

      await carregarCampanhasDaGuild();
      loadLocal();

      if (!state.papel){ show(els.elInicio); }         // <- mostra a tela de Início
else { show(els.elCampanhas); renderCampanhas(); }
      return;
    }

    // ====== MODO DISCORD (Activity) ======
    const { DiscordSDK, authorize, authenticate, getUser, getGuild, setActivity } = await loadDiscordSdk();
    const sdk = new DiscordSDK(CLIENT_ID);

    await sdk.ready();

    const { code } = await authorize({
      client_id: CLIENT_ID,
      response_type: "code",
      scope: ["identify"],
      prompt: "none"
    });

    const token = await authenticate({ client_id: CLIENT_ID, grant_type: "authorization_code", code });
    state.token = token;

    state.me = await getUser();
    try { state.guild = await getGuild(); } catch(_){ state.guild = null; }

    els.elUiUser.textContent  = `Usuário: ${state.me?.username ?? "—"}`;
    els.elUiGuild.textContent = `Servidor: ${state.guild?.name ?? "—"}`;

    try{
      await setActivity({ details: "No Hub • Forja Infinita", state: "Explorando campanhas" });
    }catch(_){ /* ok se falhar */ }

    await carregarCampanhasDaGuild();
    loadLocal();

    if (!state.papel){ show(els.elPapel); }
    else { show(els.elCampanhas); renderCampanhas(); }

  }catch(err){
    console.error("Falha no boot/SSO (usando fallback web):", err);

    // ===== Fallback WEB se algo falhar (inclusive CDN bloqueado) =====
    els.elUiUser.textContent  = "Usuário: visitante (web)";
    els.elUiGuild.textContent = "Servidor: —";

    try { await carregarCampanhasDaGuild(); } catch(_) {}
    loadLocal();

    if (!state.papel){ show(els.elPapel); }
    else { show(els.elCampanhas); renderCampanhas(); }
  }
}
