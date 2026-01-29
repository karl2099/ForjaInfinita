// Arquivo modificado para redirecionar à ficha legada com parâmetros do canal
// Original localizado em frontend/src/activity/screens/CreateCharacter.tsx

import { useEffect } from 'react';

interface Props {
  channelId?: string;
  guildId?: string;
  userId?: string;
  /** Quando definido, abre a ficha legada já no contexto de um personagem salvo. */
  characterId?: string;
}

export default function CreateCharacter({ channelId, guildId, userId, characterId }: Props) {
  useEffect(() => {
    // monta a query string com channelId, guildId e userId, quando fornecidos
    const params = new URLSearchParams();
    if (channelId) params.append('channelId', channelId);
    if (guildId) params.append('guildId', guildId);
    if (userId) params.append('userId', userId);
    if (characterId) params.append('characterId', characterId);
    const qs = params.toString();
    const url = qs ? `/legacy/ficha-criacao/?${qs}` : '/legacy/ficha-criacao/';
    window.location.href = url;
  }, [channelId, guildId, userId, characterId]);

  // Este componente não precisa renderizar nada; apenas redireciona
  return null;
}