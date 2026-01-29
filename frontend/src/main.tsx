// Arquivo modificado para ler channelId/guildId da URL e repassar aos componentes
// Original localizado em frontend/src/main.tsx

import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import Start from "./activity/screens/Start";
import RoleSelect from "./activity/screens/RoleSelect";
import CreateCharacter from "./activity/screens/CreateCharacter";
import Lobby from "./activity/screens/Lobby";
import PlayerHub from "./activity/screens/PlayerHub";
import Header from "./activity/components/Header";
import "./ui";
import { bootRouter } from "./router";
// desabilitamos bootRouter se não for necessário, mas mantemos a chamada original
bootRouter();

type Screen = "start" | "role" | "playerHub" | "create" | "lobby";

function App() {
  // Lê parâmetros da query (channelId, guildId, userId) de forma estática
  const searchParams = new URLSearchParams(window.location.search);
  const initialChannelId = searchParams.get("channelId") || undefined;
  const initialGuildId = searchParams.get("guildId") || undefined;
  const initialUserId = searchParams.get("userId") || undefined;

  const [screen, setScreen] = useState<Screen>("start");
  const [channelId] = useState<string | undefined>(initialChannelId);
  const [guildId] = useState<string | undefined>(initialGuildId);
  const [user] = useState<{ id: string; name: string }>(() => {
    const uid = initialUserId || "u_demo";
    return { id: uid, name: uid === "u_demo" ? "Jogador Demo" : uid };
  });

  // Mantivemos uma campanha fixa apenas para Lobby; em outros lugares usamos channelId
  const [campaignId] = useState("camp_demo");

  // Quando o jogador abre um personagem existente, guardamos o id para repassar ao destino
  const [openCharacterId, setOpenCharacterId] = useState<string | undefined>(undefined);

  const goHome = () => setScreen("start");
  const goBack = () => {
    setScreen((s) => {
      if (s === "role") return "start";
      if (s === "playerHub") return "role";
      if (s === "create") return "playerHub";
      if (s === "lobby") return "role";
      return "start";
    });
  };

  return (
    <>
      <Header onHome={goHome} onBack={goBack} showBack={screen !== "start"} />
      <div style={{ paddingTop: 72 }}>
        {screen === "start" && <Start onNext={() => setScreen("role")} />}
        {screen === "role" && (
          <RoleSelect onPlayer={() => setScreen("playerHub")} onGM={() => setScreen("lobby")} />
        )}
        {screen === "playerHub" && (
          <PlayerHub
            userId={user.id}
            channelId={channelId}
            guildId={guildId}
            onCreate={() => {
              setOpenCharacterId(undefined);
              setScreen("create");
            }}
            onOpenChar={(id) => {
              setOpenCharacterId(id);
              setScreen("create");
            }}
          />
        )}
        {screen === "create" && (
          <CreateCharacter
            channelId={channelId}
            guildId={guildId}
            userId={user.id}
            characterId={openCharacterId}
          />
        )}
        {screen === "lobby" && (
          <Lobby campaignId={campaignId} user={user} onCreate={() => setScreen("create")} />
        )}
      </div>
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App />);