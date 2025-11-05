(() => {
  // Use global React and ReactDOM loaded via CDN
  const { useState, useEffect } = React;

  // --------- Hash routing helpers ----------
  function getInitialScreen() {
    const h = location.hash;
    if (h === '#/player') return 'playerHub';
    if (h === '#/gm')     return 'lobby'; // placeholder p/ Mestre por enquanto
    return 'start';
  }
  function goTo(hash, screen, setScreen) {
    if (location.hash !== hash) location.hash = hash;
    setScreen(screen);
  }
  // -----------------------------------------

  // Start screen component
  function Start({ onNext }) {
    return React.createElement(
      'div',
      { style: { display: 'grid', placeItems: 'center', height: '100vh' } },
      React.createElement(
        'div',
        { style: { textAlign: 'center' } },
        [
          React.createElement('img', {
            src: '/assets/img/hub-logo2.png',
            alt: 'Forja Infinita',
            style: { maxWidth: 280, opacity: 0.9 },
            key: 'img',
          }),
          React.createElement('h1', { key: 'h1' }, 'Forja Infinita — Activity'),
          React.createElement(
            'button',
            { onClick: onNext, className: 'btn-primary', key: 'btn' },
            'Iniciar'
          ),
        ],
      ),
    );
  }

  // Role selection screen component
  function RoleSelect({ onPlayer, onGM }) {
    return React.createElement(
      'div',
      { style: { display: 'grid', placeItems: 'center', height: '100vh', gap: 12 } },
      [
        React.createElement('h2', { key: 'h2' }, 'Escolha seu papel'),
        React.createElement(
          'div',
          { style: { display: 'flex', gap: 12 }, key: 'buttons' },
          [
            React.createElement(
              'button',
              { className: 'btn-primary', onClick: onPlayer, key: 'player' },
              'Jogador',
            ),
            React.createElement(
              'button',
              { className: 'btn', onClick: onGM, key: 'gm' },
              'Mestre',
            ),
          ],
        ),
      ],
    );
  }

  // Player hub component
  function PlayerHub({ userId, onCreate, onOpenChar }) {
    const [characters, setCharacters] = useState([]);
    useEffect(() => {
      try {
        const json = localStorage.getItem(`fi:chars:${userId}`) || '[]';
        setCharacters(JSON.parse(json));
      } catch (e) {
        setCharacters([]);
      }
    }, [userId]);
    return React.createElement(
      'div',
      { style: { display: 'grid', placeItems: 'center', minHeight: '100vh' } },
      React.createElement(
        'div',
        { style: { width: 'min(960px, 92vw)' } },
        [
          React.createElement(
            'h2',
            { style: { textAlign: 'center', marginBottom: 24 }, key: 'h2' },
            'Área do Jogador',
          ),
          React.createElement(
            'div',
            { style: { display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }, key: 'actions' },
            [
              React.createElement(
                'button',
                { className: 'btn-primary', onClick: onCreate, key: 'new' },
                'Novo Personagem',
              ),
              React.createElement(
                'button',
                { className: 'btn', onClick: () => setCharacters([...characters]), key: 'refresh' },
                'Atualizar Lista',
              ),
            ],
          ),
          React.createElement(
            'div',
            {
              style: {
                background: 'rgba(255,255,255,.03)',
                border: '1px solid rgba(255,255,255,.06)',
                borderRadius: 12,
                padding: 16,
              },
              key: 'list',
            },
            [
              React.createElement(
                'h3',
                { style: { marginTop: 0 }, key: 'title' },
                'Meus Personagens',
              ),
              characters.length === 0
                ? React.createElement(
                    'p',
                    { style: { opacity: 0.8 }, key: 'empty' },
                    'Você ainda não tem personagens salvos.',
                  )
                : React.createElement(
                    'ul',
                    {
                      style: {
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        display: 'grid',
                        gap: 8,
                      },
                      key: 'listUl',
                    },
                    characters.map((c) =>
                      React.createElement(
                        'li',
                        {
                          key: c.id,
                          style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 12px',
                            background: 'rgba(0,0,0,.25)',
                            borderRadius: 10,
                          },
                        },
                        [
                          React.createElement(
                            'div',
                            { key: 'info' },
                            [
                              React.createElement('strong', { key: 'name' }, c.nome),
                              React.createElement(
                                'div',
                                { style: { opacity: 0.7, fontSize: 12 }, key: 'date' },
                                `atualizado em ${new Date(c.updatedAt).toLocaleString()}`,
                              ),
                            ],
                          ),
                          React.createElement(
                            'button',
                            {
                              className: 'btn-primary',
                              onClick: () => onOpenChar(c.id),
                              key: 'open',
                            },
                            'Abrir',
                          ),
                        ],
                      ),
                    ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  // Lobby screen component (list of characters placeholder)
  function Lobby({ campaignId, user, onCreate }) {
    return React.createElement(
      'div',
      { style: { padding: 24 } },
      [
        React.createElement(
          'h2',
          { key: 'title' },
          [
            'Lobby — Campanha ',
            campaignId,
          ],
        ),
        React.createElement(
          'p',
          { key: 'welcome' },
          [
            'Bem-vindo, ',
            user && user.name ? user.name : 'Jogador',
            '. Em breve listaremos seus personagens.',
          ],
        ),
        React.createElement(
          'button',
          { className: 'btn', onClick: onCreate, key: 'btn' },
          'Novo Personagem',
        ),
      ],
    );
  }

  // CreateCharacter component that redirects immediately to legacy page
  function CreateCharacter() {
    useEffect(() => {
      window.location.href = '/legacy/ficha-criacao/';
    }, []);
    return null;
  }

  // Root application component
  function App() {
    const [screen, setScreen] = useState(getInitialScreen());
    const [user] = useState({ id: 'u_demo', name: 'Jogador Demo' });
    const [campaignId] = useState('camp_demo');

    // Mantém a UI sincronizada quando o hash muda (ex.: vindo da ficha: "/#/player")
    useEffect(() => {
      const onHash = () => setScreen(getInitialScreen());
      window.addEventListener('hashchange', onHash);
      return () => window.removeEventListener('hashchange', onHash);
    }, []);

    return React.createElement(
      'div',
      { className: 'app' },
      [
        screen === 'start' && React.createElement(Start, { onNext: () => setScreen('role'), key: 'start' }),
        screen === 'role' &&
          React.createElement(RoleSelect, {
            onPlayer: () => goTo('#/player', 'playerHub', setScreen),
            onGM:     () => goTo('#/gm',     'lobby',     setScreen),
            key: 'role',
          }),
        screen === 'playerHub' &&
          React.createElement(PlayerHub, {
            userId: user.id,
            onCreate: () => {
              // Abre a ficha de criação legada
              window.location.href = '/legacy/ficha-criacao/';
            },
            onOpenChar: (id) => {
              console.log('abrir personagem', id);
            },
            key: 'playerHub',
          }),
        screen === 'create' &&
          React.createElement(CreateCharacter, { key: 'create' }),
        screen === 'lobby' &&
          React.createElement(Lobby, {
            campaignId: campaignId,
            user: user,
            onCreate: () => setScreen('create'),
            key: 'lobby',
          }),
      ].filter(Boolean),
    );
  }

  // Mount the application
  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
})();
