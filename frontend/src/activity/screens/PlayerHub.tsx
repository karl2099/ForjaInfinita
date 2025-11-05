// Arquivo modificado para utilizar channelId/guildId na listagem de personagens
// Original localizado em frontend/src/activity/screens/PlayerHub.tsx

import React, { useEffect, useState } from "react";
import { apiGetCharacters } from "../../services/api";

type SavedChar = {
  id: string;
  nome: string;
  updatedAt: number;
};

interface Props {
  userId: string;
  channelId?: string;
  guildId?: string;
  onCreate: () => void;
  onOpenChar: (id: string) => void;
}

export default function PlayerHub({ userId, channelId, guildId, onCreate, onOpenChar }: Props) {
  const [list, setList] = useState<SavedChar[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Busca personagens do servidor (D1) filtrando por usuário e canal, quando fornecido
        const { characters } = await apiGetCharacters({ userId, channelId, guildId });
        const mapped: SavedChar[] = characters.map((c: any) => ({
          id: c.id,
          nome: c.data_json?.nome || c.nome || "Sem nome",
          updatedAt: c.updated_at ? c.updated_at * 1000 : Date.now(),
        }));
        setList(mapped);
      } catch (e) {
        console.error(e);
        // fallback local
        try {
          const raw = localStorage.getItem(`fi:chars:${userId}`) || "[]";
          setList(JSON.parse(raw));
        } catch {
          setList([]);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId, channelId, guildId]);

  const refresh = async () => {
    try {
      setLoading(true);
      const { characters } = await apiGetCharacters({ userId, channelId, guildId });
      const mapped: SavedChar[] = characters.map((c: any) => ({
        id: c.id,
        nome: c.data_json?.nome || c.nome || "Sem nome",
        updatedAt: c.updated_at ? c.updated_at * 1000 : Date.now(),
      }));
      setList(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <div style={{ width: "min(960px, 92vw)" }}>
        <h2 style={{ textAlign: "center", marginBottom: 24 }}>Área do Jogador</h2>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20 }}>
          <button className="btn-primary" onClick={onCreate}>Criar Personagem</button>
          <button className="btn" onClick={refresh} disabled={loading}>
            {loading ? "Atualizando..." : "Atualizar Lista"}
          </button>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,.03)",
            border: "1px solid rgba(255,255,255,.06)",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <h3 style={{ marginTop: 0 }}>Meus Personagens</h3>
          {list.length === 0 ? (
            <p style={{ opacity: 0.8 }}>Você ainda não tem personagens salvos.</p>
          ) : (
            <ul
              style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}
            >
              {list.map((ch) => (
                <li
                  key={ch.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    background: "rgba(0,0,0,.25)",
                    borderRadius: 10,
                  }}
                >
                  <div>
                    <strong>{ch.nome}</strong>
                    <div style={{ opacity: 0.7, fontSize: 12 }}>
                      atualizado em {new Date(ch.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <button className="btn-primary" onClick={() => onOpenChar(ch.id)}>
                    Abrir
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}