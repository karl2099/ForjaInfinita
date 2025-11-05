// Arquivo modificado para redirecionar à ficha legada com parâmetros do canal
// Original localizado em frontend/src/activity/screens/CreateCharacter.tsx

import { useEffect } from 'react';

interface Props {
  channelId?: string;
  guildId?: string;
  userId?: string;
}

export default function CreateCharacter({ channelId, guildId, userId }: Props) {
  useEffect(() => {
    // monta a query string com channelId, guildId e userId, quando fornecidos
    const params = new URLSearchParams();
    if (channelId) params.append('channelId', channelId);
    if (guildId) params.append('guildId', guildId);
    if (userId) params.append('userId', userId);
    const qs = params.toString();
    const url = qs ? `/legacy/ficha-criacao/?${qs}` : '/legacy/ficha-criacao/';
    window.location.href = url;
  }, [channelId, guildId, userId]);

  // Este componente não precisa renderizar nada; apenas redireciona
  return null;
}