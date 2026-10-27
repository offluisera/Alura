# 🚀 Changelog — Alura

Todas as atualizações, novidades e melhorias da plataforma e aplicativo executável Alura.

## [1.0.39] — 2026-10-26

### 🔄 Nova Tela de Atualização & Instalador Desktop ([`alura-atualizacao.html`](file:///c:/xampp/htdocs/AluraProjects/Alura/docs/doc/new-de/alura-atualizacao.html), [`updater.html`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/desktop/updater.html))
- **[Atualização / Modificação] Redesenho da Janela Splash do Electron ([`updater.html`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/desktop/updater.html), [`main.js`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/desktop/main.js))**:
  - Janela sem moldura (*frameless*) redimensionada estritamente para 300×360px com cantos curvos (16px), fundo em card `#161918`, contorno `#232826` e sombra 24px/60px.
  - Orbe animado em SVG com gradiente verde da marca (`#2dff7a` / `#00dfa0`), rotação contínua e pulso suave dos anéis concêntricos.
  - Barra de progresso modernizada com indicador percentual dinâmico, animação de brilho (*shimmer*) contínuo e mensagens contextuais de status ("Buscando atualizações...", "Sincronizando componentes...", "Atualização concluída!").
  - Carrossel dinâmico de dicas da comunidade ("Dica:") com alternância automática e animação fluida de transição a cada 3.8s.
  - Rodapé com identificação da versão do aplicativo (`v1.0.3`), link de suporte e rotina resiliente de reconexão (*retry*) via IPC.
- **[Adição] Compilação do Instalador Oficial Windows ([`setup_alura.exe`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/desktop/dist/setup_alura.exe))**:
  - Compilação dos assets web otimizados e geração do instalador NSIS x64 completo com assistente de instalação e atalhos na Área de Trabalho e Menu Iniciar (~86 MB).

### 🎙️ Redesenho do Palco de Voz & Melhorias de Contraste ([`alura-voz.html`](file:///c:/xampp/htdocs/AluraProjects/Alura/docs/doc/new-de/alura-voz.html), [`ServerWorkspace.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/app/ServerWorkspace.tsx))
- **[Atualização / Modificação] Palco de Participantes e Contraste dos Cards ([`index.css`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/index.css), [`ServerWorkspace.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/app/ServerWorkspace.tsx))**:
  - Substituído o fundo escuro opaco dos retângulos de participantes pela classe `.stage-tile` com gradiente sutil (`linear-gradient(145deg, #1b2921, #131d17)` e borda `#283a30`), garantindo contraste elegante e visual diferenciado em relação ao fundo geral do aplicativo.
  - Destaque ao falar com anel verde em alta definição (`ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[#0d1310]`) e avatar centralizado com badge de status do microfone.
  - Topbar do canal de voz com chip verde de status ("Voz conectada"), latência em ms e contagem de participantes em tempo real.
- **[Correção] Menu de Supressão de Ruído 100% Opaco ([`index.css`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/index.css), [`ServerWorkspace.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/app/ServerWorkspace.tsx))**:
  - Criadas as classes `.noise-filter-menu` e `.noise-filter-item` com cor sólida `#141815 !important` e borda `var(--line)`, eliminando totalmente a transparência e sobreposição indesejada com os elementos da tela.
- **[Atualização / Modificação] Dock Flutuante de Controle de Mídia ([`ServerWorkspace.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/app/ServerWorkspace.tsx))**:
  - Dock flutuante redesenhado com controles táteis de microfone, ensurdecer, câmera de vídeo, compartilhamento de tela e botão de desconectar em vermelho vivo.

### 👥 Nova Central de Solicitações de Amizade ([`solicitacoes.html`](file:///c:/xampp/htdocs/AluraProjects/Alura/docs/doc/new-de/solicitacoes.html), [`Requests.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/app/Requests.tsx))
- **[Atualização / Modificação] Navegação em Abas & Contadores em Tempo Real ([`Requests.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/app/Requests.tsx))**:
  - Estrutura de abas com badges numéricos ("Recebidas", "Enviadas", "Todos os Amigos") e busca instantânea.
  - Cartões de solicitação com layout limpo: avatar com status, nome de exibição, username, data e botões rápidos com confirmação visual (Aceitar / Recusar).
  - Painel lateral para envio rápido de convites com validação inline de tag/usuário e feedback dinâmico.
  - Estados vazios (*empty states*) ilustrados e acolhedores quando não houver solicitações pendentes.

---

## [1.0.38] — 2026-10-25

### 🏠 Redesenho da Página Inicial & Feed Social ([`alura-home.html`](file:///c:/xampp/htdocs/AluraProjects/Alura/docs/doc/new-de/alura-home.html))
- **[Atualização / Modificação] Saudação e Métricas em 4 Colunas ([`PostFeed.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/feed/PostFeed.tsx))**:
  - Bloco de saudação `.hello` com cabeçalho limpo `h1` ("Olá, {nome}") em destaque accent e subtítulo acolhedor ("Que bom ter você por aqui.").
  - Grid de métricas em 4 colunas (`.stats`):
    - **Amigos**: contador em destaque verde (`.stat.on`) com navegação direta para `/friends`.
    - **Pedidos**: solicitações de amizade pendentes com atalho para `/requests`.
    - **Mensagens**: mensagens diretas não lidas com link para `/messages`.
    - **Avisos**: contador de notificações ativas com link para `/notifications`.
- **[Atualização / Modificação] Card de Criação de Postagem ([`PostFeed.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/feed/PostFeed.tsx))**:
  - Layout `.card.composer` com avatar 40x40 (`.av.lg`) à esquerda.
  - Campo de texto integrado sobre fundo escuro (`var(--bg)`), preview visual de anexos (fotos, vídeos, documentos) e barra de ferramentas com botões de mídia, anexos, seletor de emojis e botão proeminente "Publicar".
- **[Atualização / Modificação] Cards de Publicações ([`PostFeed.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/feed/PostFeed.tsx))**:
  - Estrutura `.card.post` com cabeçalho limpo contendo avatar, nome do autor, `@username · tempo` e menu de opções.
  - Download rápido de anexos de imagem convertidos para PNG em alta qualidade.
  - Barra de ações (`.actions`) com curtidas em destaque accent, contador de comentários e atalho para copiar link da publicação.
- **[Atualização / Modificação] Coluna Direita de Descoberta & Presença ([`RightSidebar.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/layout/RightSidebar.tsx))**:
  - **Servidores**: listagem com ícones squircle (`.av.sq`), nome do servidor e contagem de membros ("N membros").
  - **Sugestões para você**: recomendações personalizadas de comunidades com botão rápido `.join` ("Entrar").
  - **Amigos online**: lista de amigos ativos com indicador de status verde (`.st`), nome, `@username` e clique para abrir DM em tempo real.

### 📐 Nova Barra Lateral & Modo Recolhido 72px ([`alura-sidebar.html`](file:///c:/xampp/htdocs/AluraProjects/Alura/docs/doc/new-de/alura-sidebar.html))
- **[Atualização / Modificação] Alternância Fluida entre 268px e 72px ([`Sidebar.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/layout/Sidebar.tsx), [`Dashboard.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/app/Dashboard.tsx))**:
  - Substituído o recolhimento total (`w-0`) pelo padrão oficial de 72px com ícones centralizados e tooltips.
  - Botão de alternância com rotação de 180° (`rotate-180`) integrado no topo ao lado do logo SVG oficial da Alura.
  - Removida a aba flutuante redundante na tela, já que a sidebar recolhida mantém o botão de controle contínuo em tela.
- **[Atualização / Modificação] Navegação e Indicadores Ativos ([`Sidebar.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/layout/Sidebar.tsx))**:
  - Itens padronizados: Início, Amigos, Perfil, Solicitações, Mensagens, Servidores, Administração (STAFF) e Configurações.
  - Barra de destaque ativa na borda esquerda (`::before` em `var(--accent)`) e indicador circular discreto (`.dot`) no modo recolhido para notificações pendentes.
- **[Correção] Badge do Pin nos Servidores Fixados ([`Sidebar.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/layout/Sidebar.tsx))**:
  - Eliminado o corte diagonal no ícone de fixado através da separação do container de imagem (`overflow-hidden`) do badge externo (`z-10`).
  - Badge circular posicionado em `-top-1.5 -right-1.5` com tachinha vertical vetorizada do design oficial (`d="M9 3h6l-1 6 3 3v2H7v-2l3-3zM12 14v7"`).

### 👤 Painel do Usuário Alinhado & Exibição Completa do Nome ([`UserPanel.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/layout/UserPanel.tsx))
- **[Correção] Prevenção de Truncamento do Nome e Status**:
  - Largura expandida para 268px, botões de ação compactados (`w-7 h-7` com `gap-0.5`) e tipografia otimizada (`text-[13.5px] font-bold text-white`), permitindo exibir nomes como "Luis Fernando" por completo sem cortes ou reticências prematuras.
- **[Correção] Isolamento de Dimensões do Avatar**:
  - Travamento estrito do avatar em container `w-9 h-9 rounded-full overflow-hidden`, eliminando bug de expansão de imagens em alta resolução sobre a tela.
  - Indicador circular de status (`.st`) posicionado na camada superior externa (`z-10`) com o ícone correspondente (Online, Ausente, Não Perturbe, Invisível).
- **[Atualização / Modificação] Regra "Sem áudio, sem microfone"**:
  - Ao ativar o botão de ensurdecer (deafen), o microfone é automaticamente silenciado.
- **[Atualização / Modificação] Responsividade do Painel em Modo 72px**:
  - No modo recolhido, o painel do usuário organiza avatar e controles em coluna vertical compacta, mantendo o popover de status acessível e desobstruído.

---

## [1.0.37] — 2026-10-25

### 🔐 Nova Tela de Autenticação & Identidade Visual
- **[Atualização / Modificação] Redesenho no Formato Card Centralizado ([`Login.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/auth/Login.tsx))**:
  - Transição do layout antigo bipartido para card focado e elegante (`max-w-[440px]`, fundo `#181b1a`, borda fina `#2a2f2d` e sombra profunda `0 24px 60px rgba(0,0,0,0.65)`).
  - Background ambiental imersivo com gradientes radiais verde-menta (`rgba(45,255,122,.10)` e `rgba(45,255,122,.06)` sobre `#0c0e0d`).
- **[Adição] Logo Oficial SVG Animada ([`alura-icon-animated.svg`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/public/alura-icon-animated.svg))**:
  - Inserção da logo oficial da Alura em SVG com animação suave de revelação e pulso luminoso no arco central.
- **[Atualização / Modificação] Formulários de Entrada e Validação Instantânea**:
  - Validação inline para e-mail, nome de exibição, nome de usuário (`username`), senha mínima de 8 caracteres e confirmação de senha.
  - Alternador tátil para visualizar/ocultar senha com ícones dedicados de visibilidade.
  - Checkbox nativo "Manter conectado" e fluxo integrado de recuperação de senha ("Esqueceu sua senha?").
  - Preservados os fluxos de segurança para autenticação em duas etapas (2FA via app autenticador / códigos de emergência) e verificação OTP por e-mail.
- **[Remoção] Login Social via Redes Externas**:
  - Removidos botões de login via Google e GitHub e o divisor "ou", garantindo uma experiência de acesso 100% nativa, rápida e focada em credenciais Alura.

### 📐 Navegação Fluida & Painéis Retráteis com Setas
- **[Adição / Atualização] Barra Lateral Principal Retrátil ([`Sidebar.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/layout/Sidebar.tsx), [`Dashboard.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/app/Dashboard.tsx), [`Topbar.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/layout/Topbar.tsx))**:
  - Botão com seta `<` para recolher o menu lateral principal.
  - Aba flutuante com seta `>` fixada na borda para restaurar a barra a qualquer momento.
  - Estado de recolhimento salvo e persistido no `localStorage`.
- **[Atualização / Modificação] Canais do Servidor ([`ServerWorkspace.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/app/ServerWorkspace.tsx))**:
  - Seta `<` no topo da lista de canais para recolher a barra e liberar espaço visual.
  - Seta de expansão `>` adicionada à esquerda do canal ativo (`# canal`) para restaurar a lista com um clique quando recolhida.
  - **[Remoção]** Removido o botão de texto redundante "Recolher Canais" do topo da tela.
- **[Atualização / Modificação] Painel de Membros do Servidor ([`ServerWorkspace.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/app/ServerWorkspace.tsx))**:
  - **[Remoção]** Removido botão duplicado `Membros >` da barra superior quando a lista lateral já está aberta.
  - **[Modificação]** Cabeçalho da barra lateral de membros padronizado (`MEMBROS (N) >`) com seta para fechar o painel.
  - Botão de exibição de membros na topbar agora aparece apenas quando a lista estiver recolhida.
- **[Adição / Atualização] Lista de Conversas em DMs ([`MessagesLayout.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/app/MessagesLayout.tsx))**:
  - Botão de seta `<` para recolher a coluna de conversas e aba retrátil `>` para expandi-la.
- **[Atualização / Modificação] Perfil de Usuário em Mensagens Diretas ([`DirectMessage.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/app/DirectMessage.tsx))**:
  - Painel de perfil lateral configurado para iniciar **fechado por padrão** (`showProfilePanel = false`).
  - Cabeçalho de perfil equipado com seta `>` para fechar e botão responsivo com chevrons dinâmicos na barra superior.

### 📱 Responsividade & Polimento Visual
- **[Correção] Header de Servidores sem Quebra de Linha ([`ServerWorkspace.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/app/ServerWorkspace.tsx))**:
  - Aplicado `whitespace-nowrap shrink-0` nos botões da topbar para impedir que textos quebrem em múltiplas linhas.
- **[Correção] Header de Mensagens Diretas e Divisores ([`DirectMessage.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/app/DirectMessage.tsx))**:
  - Removido divisor visual órfão e aplicado truncamento inteligente (`min-w-0`) no nome do contato, evitando espremer controles de voz/perfil.
- **[Correção] Filtro de Categorias no Hub de Comunidades ([`Servers.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/app/Servers.tsx), [`ServerCategoryFilter.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/servers/ServerCategoryFilter.tsx))**:
  - Resolvido corte horizontal de categorias (`Estudos`, `Criatividade`) através de flex responsivo (`flex-col 2xl:flex-row`) e scroll horizontal suave (`overflow-x-auto min-w-0`).
- **[Correção] Rodapés e Cartões Cortados pela Barra de Tarefas ([`Requests.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/app/Requests.tsx), [`RightSidebar.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/layout/RightSidebar.tsx))**:
  - Adicionado `overflow-hidden` nas raízes dos contêineres e padding inferior `pb-24` nas seções de rolagem, garantindo que cartões como "Sugestões para você" permaneçam 100% visíveis e roláveis.

### 💻 Desktop Executável & Instalação
- **[Atualização / Modificação] Compilação do Instalador NSIS ([`apps/desktop/package.json`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/desktop/package.json))**:
  - Gerado pacote instalador oficial padrão Windows (`setup_alura.exe`) via NSIS com assistente de instalação, em substituição ao executável portable.
- **[Correção] Crash ao Compartilhar Tela (`MonitorOff`) ([`ServerWorkspace.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/app/ServerWorkspace.tsx))**:
  - Corrigido erro de import ausente do ícone `MonitorOff`, eliminando travamento do Error Boundary ao encerrar compartilhamento de tela em chamadas.

---

## [1.0.36] — 2026-10-21

### 📞 Chamadas & Transmissão de Tela (WebRTC & Desktop)
- **Correção Definitiva de Layout e Alinhamento ([`index.css`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/index.css), [`CallOverlay.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/call/CallOverlay.tsx))**:
  - Corrigido seletor `.call-overlay` em `index.css`, fechando comentário de cabeçalho que impedia a aplicação de `position: fixed`.
  - Fixado layout em tela cheia com `fixed inset-0 z-[100] w-screen h-screen`, eliminando qualquer vazamento lateral e impedindo que a tela de DM fosse espremida.
- **Eliminação de Falso Compartilhamento ao Atender ([`useWebRTCCall.ts`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/lib/hooks/useWebRTCCall.ts), [`CallOverlay.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/call/CallOverlay.tsx))**:
  - Transceiver de vídeo inicial pré-alocado como `recvonly` em chamadas de voz, impedindo geração de fluxo de vídeo vazio no navegador remoto.
  - Reset forçado de `isRemoteSharingScreen` e `isSharingScreen` no início de `startCall` e `acceptCall`.
  - Verificação de segurança adicional exigindo `hasRemoteVideo` ativo antes de exibir card de transmissão.
- **Transmissão do PC sem Tela Preta ([`main.js`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/desktop/main.js), [`preload.js`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/desktop/preload.js), [`useWebRTCCall.ts`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/lib/hooks/useWebRTCCall.ts))**:
  - Implementado canal IPC `set-selected-screen-source` para informar a janela/tela escolhida ao processo principal do Electron.
  - Migração para `getDisplayMedia` nativo do Electron com captura de áudio loopback e eliminação de restrições rígidas de resolução que travavam a captura no Windows.
  - Ativação imediata de `videoTransceiver.direction = 'sendrecv'` e listener `onunmute` para desfrisar o `<video>` na reprodução.
- **Sincronização de Recusa**:
  - Envio direto de `call_reject` via canal pessoal e registro imediato de `[call:rejected] Chamada recusada` no chat.

### 🛡️ Painel Staff — Edição de Versões
- **Gerenciador de Releases ([`AdminDashboard.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/admin/AdminDashboard.tsx))**:
  - Adicionado botão "Editar" e modal com suporte a alteração de versão, título, tagline, URL direta, itens categorizados de changelog, markdown completo e toggles de obrigatoriedade/ativação.

---

## [1.0.35] — 2026-10-20

### 📞 Chamada Privada & Compartilhamento de Tela
- **Unificação de Ações e Fim da Triplicação de Controles ([`CallOverlay.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/call/CallOverlay.tsx), [`FloatingIncomingCallBar.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/call/FloatingIncomingCallBar.tsx))**:
  - Removido par redundante de botões "Atender/Recusar" do rodapé e rótulo repetido.
  - Barra superior flutuante ativada exclusivamente quando o overlay de chamada for minimizado pelo usuário.
  - Correção de quebra de layout no texto de chamada recebida com badge "Não Perturbe".
- **Resolução de Tela Preta no Compartilhamento ([`useWebRTCCall.ts`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/lib/hooks/useWebRTCCall.ts), [`CallOverlay.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/call/CallOverlay.tsx))**:
  - Pré-alocação de transceiver de vídeo `addTransceiver('video', { direction: 'sendrecv' })` na criação do PeerConnection WebRTC, evitando freeze de canais negociados inicialmente como voz.
  - Inserção de atributos `muted`, `playsInline` e `autoPlay` no JSX do `<video>`, com callback `ref` síncrono contornando o bloqueio de autoplay do Chromium/Electron.
- **Maximizar Transmissão de Tela**:
  - Adicionado botão de alternância de tela cheia (Maximizar/Restaurar) no topo do overlay e na barra do player de vídeo compartilhado.
- **Edição de Versões no Painel Staff ([`AdminDashboard.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/admin/AdminDashboard.tsx))**:
  - Adicionado botão "Editar" em cada registro do Histórico de Versões do Executável.
  - Modal interativo para edição de número de versão, título, tagline, URL do executável, itens do changelog estruturado, markdown de notas de release e status de obrigatoriedade/ativação.

### 🎨 Persistência em Nuvem de Temas e Preferências
- **Sincronização com o Supabase (`public.profiles`)**:
  - Criadas colunas `theme`, `chat_density` e `reduced_motion` no banco de dados.
  - Sincronização automática no [`Dashboard.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/app/Dashboard.tsx) e persistência imediata em tempo real no [`Settings.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/app/Settings.tsx).
  - O tema selecionado não é mais perdido ao fechar o app desktop, reiniciar ou limpar o cache local.

---

## [1.0.34] — 2026-10-20

### 📞 Chamadas no Privado & UI de Atendimento
- **Card e Modal Universal de Chamada Recebida ([`FloatingIncomingCallBar.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/call/FloatingIncomingCallBar.tsx))**:
  - Removida a restrição que ocultava a barra de atendimento para usuários fora do modo "Não Perturbe".
  - Notificação flutuante de chamada recebida com `z-[99999]`, halo pulsante, exibição do autor, tipo de chamada (voz ou vídeo) e botões táteis destacados de "Atender" (verde Alura `#00E6A0`) e "Recusar" (vermelho).
- **Ações Imediatas no Overlay Central ([`CallOverlay.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/call/CallOverlay.tsx))**:
  - Inserido bloco de botões "Atender" e "Recusar" diretamente no centro da tela sob o avatar do chamador, eliminando dependência do rodapé da janela.
  - Botão de "Cancelar Chamada" centralizado para o chamador.
- **Responsividade e Prevenção de Overflow ([`index.css`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/index.css))**:
  - Adaptação dinâmica para janelas divididas (split screen) e alturas inferiores a 660px (`@media (max-height: 660px)`), garantindo que botões nunca sejam cortados pelo rodapé.
- **Resiliência de Sinalização WebRTC ([`CallContext.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/contexts/CallContext.tsx))**:
  - `acceptIncomingCall` agora conta com fallback instantâneo de metadados do sinal, aceitando a chamada mesmo em carregamentos assíncronos de perfil.

### ⚡ Novo Sistema de Atualização Invisível & Splash Nativo
- **Splash e Auto-Update Silencioso ao Iniciar**:
  - Novo splash screen nativo frameless estilo Discord ([`updater.html`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/desktop/updater.html)) com logo central giratório e barras de progresso duplas: *"Downloading update..."* e *"Installing update..."*.
  - Verificação e aplicação de updates automáticas executadas exclusivamente ao abrir o aplicativo. Durante a sessão, o usuário navega sem interrupções.
  - Download nativo e instalação silenciosa (`/S`) com reinício automático.

### 📋 Modal de Informes da Versão (Changelog One-Time)
- **Substituição da Tela de Download Manual**:
  - Removido o modal de download manual de executável do launcher e da versão web ([`AppUpdateModal.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/common/AppUpdateModal.tsx)).
  - Novo modal informativo moderno ("O que há de novo na Alura") com categorização visual idêntica ao site: Novidades (✦), Melhorias (⚡) e Correções (🔧).
  - Exibido **estritamente uma única vez** após a atualização (`alura_seen_release_version`).

### 🌐 Sincronização Dinâmica do Changelog com o Site
- **Página de Changelog Oficial ([`ChangelogPage.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/site/src/pages/ChangelogPage.tsx))**:
  - Integração em tempo real com o Supabase REST API (`app_versions`), sincronizando lançamentos instantaneamente com `alura.net.br/changelog`.
- **Construtor Estruturado no Painel Admin ([`AdminDashboard.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/admin/AdminDashboard.tsx))**:
  - Aba de auto-updater agora conta com construtor interativo de itens de changelog por categoria (Novidades, Melhorias, Correções), subtítulo (tagline) e publicação imediata para o site e clientes.

---

## [1.0.2] — 2026-10-20

### 🛡️ Painel de Administração & Desktop
- **Acesso no Desktop App**:
  - Sincronização e empacotamento completo do bundle Vite no executável desktop Electron (`apps/desktop/ui`).
  - Verificação de autorização expandida em [`Sidebar.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/layout/Sidebar.tsx) e [`AdminDashboard.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/admin/AdminDashboard.tsx) com suporte a `is_staff`, cargo `admin`, `moderator`, e administradores do ecossistema.
  - Correção de temas: Painel administrativo agora adota 100% dos design tokens do tema ativo do usuário (`Forest`, `Obsidian`, `Contrast`, `Violet Radiance`, `Midnight Blue`, `Crimson Noir`), abandonando cores fixadas.

### 🏆 Sistema de Conquistas & Gestão Administrativa
- **Catálogo Expandido de Conquistas** ([`achievements.ts`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/lib/constants/achievements.ts)):
  - Adicionadas 18 conquistas exclusivas com ícones, cores e badges (`Membro Fundador`, `Beta Tester`, `Voz da Comunidade`, `Socializador`, `Perfil Lendário`, `Transmissor Ao Vivo`, `Mestre do Som`, `Coruja da Madrugada`, `Membro VIP`, `Guardião da Paz`, `Arquiteto de Software`, `Hardcore Gamer`, `Melômano Nato`, `Líder Comunitário`, `Veterano Alura`, `Caçador de Bugs`, `Impulsionador Alura`, `Anfitrião de Eventos`).
- **Atribuição Manual de Conquistas no Painel Admin**:
  - Modal de edição de usuários agora conta com seletor interativo em grade de conquistas.
  - Ações rápidas de "Conceder Todas" e "Remover Todas".
  - Contador de conquistas exibido na tabela de usuários.
  - Migration e função Postgres `admin_set_user_achievements` e política de update RLS para equipe staff ([`20241008000001_user_achievements.sql`](file:///c:/xampp/htdocs/AluraProjects/Alura/supabase/migrations/20241008000001_user_achievements.sql)).

### 🎮 Integração SteamDB Ampliada
- **Catálogo Expandido de Jogos** ([`games.ts`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/lib/constants/games.ts)):
  - Base de dados centralizada com mais de 50 títulos mais jogados na Steam/SteamDB com capas em alta definição do CDN oficial da Valve.
  - Seletor com busca e pré-visualização integrado no Onboarding e nas Configurações de Perfil ([`Settings.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/app/Settings.tsx)).

---

## [1.0.1] — 2026-10-20

### 🛡️ Painel de Administração (Staff Hub)
- **Dashboard de Métricas Globais**:
  - Contadores de total de registros com novos cadastros do dia.
  - Métrica de usuários online agora em tempo real.
  - **Pico Histórico de Usuários Simultâneos**: registro e acompanhamento de recordes de conexões simultâneas na rede Alura.
  - Estatísticas de servidores criados, servidores suspensos e mensagens trocadas.
- **Gestão & Moderação de Usuários**:
  - Busca instantânea por `@username`, nome de exibição ou ID.
  - Filtros rápidos: `Todos`, `Ativos`, `Staff / Admins` e `Banidos`.
  - Edição completa de perfis (Nome, Username, Bio, Cargo/Role e Tag Staff).
  - Banimento de usuários com modal de motivo (`ban_reason`), data e autor do ban.
  - Desbanimento com reabilitação imediata.
  - Tela de bloqueio exclusiva para contas banidas com justificativa e opção de logout.
- **Gestão de Servidores & Comunidades**:
  - Listagem com contagem de membros, dono e data de criação.
  - Edição de nome e descrição.
  - Suspensão preventiva de servidores irregulares e reativação em 1 clique.
- **Controle Central de Auto-Update**:
  - Aba para lançamento de versões do instalador `.exe`.
  - Definição de versionamento semver, URL do executável, changelog e obrigatoriedade.

---

### ⚡ Sistema de Auto-Update do Executável (.exe)
- **Detecção Inteligente**:
  - Verificação automática ao abrir o aplicativo e periodicamente a cada 15 minutos via Supabase.
  - Modal estilizado com paleta Alura Forest, notas de lançamento e tags de versão.
- **Download Integrado**:
  - Download nativo em stream pelo Electron diretamente para a pasta temporária do Windows.
  - Barra de progresso visual com cálculo em tempo real de porcentagem e transferência em MB.
- **Instalação e Reinicialização**:
  - Execução silenciosa (`/S`) ou assistida do instalador NSIS com encerramento e reinício seguro do app.
  - Suporte a atualizações obrigatórias (bloqueia o uso até atualizar) e recomendadas ("Lembrar mais tarde").

---

### 💬 Experiência de Chat & Mensagens
- **Lightbox de Imagens em Tela Cheia**:
  - Clicar em qualquer imagem enviada ou recebida (em servidores ou DMs) abre modal em tela cheia com desfoque escuro de fundo (`backdrop-blur-md`).
  - Controles de zoom (ampliar / reduzir), download em arquivo e abrir original em nova aba.
  - Atalho `Escape` ou clique externo para fechar.
- **Suporte a Quebra de Linha com Shift + Enter**:
  - Chatbox convertida para editor com auto-redimensionamento suave.
  - `Shift + Enter` quebra linha (`\n`) sem disparar o envio.
  - `Enter` envia a mensagem instantaneamente.
- **Teclado Sempre Ativo**:
  - Foco automático no campo de mensagem ao abrir a conversa ou trocar de canal.
  - Refoco garantido imediatamente após enviar cada mensagem.
  - Listener global estilo Discord: digitar qualquer tecla alfanumérica foca na chatbox automaticamente.
- **Colar Imagens Direto com Ctrl + V**:
  - Suporte a colar capturas de tela e imagens copiadas direto na área de transferência com pré-visualização antes do envio.
- **Menu de Contexto de Botão Direito (Estilo Discord)**:
  - Botão direito na mensagem abre menu nativo:
    - *Copiar Texto da Mensagem*
    - *Copiar Link da Mídia*
    - *Responder com citação*
    - *Copiar ID da Mensagem*
    - *Excluir Mensagem* (para o autor ou administradores/moderadores).

---

### 🔧 Correções & Otimizações Técnicas
- **Correção da Desfocagem em Segundo Plano (Electron)**:
  - Desativado o throttling de GPU e oclusão do Chromium (`backgroundThrottling: false`, `disable-backgrounding-occluded-windows`, `disable-renderer-backgrounding`). O aplicativo mantém nitidez e anti-aliasing perfeitos mesmo em segundo plano.
- **Correção de Conexão Spotify OAuth**:
  - Solucionado o erro `redirect_uri: Not matching configuration`.
  - Remoção da porta fixa 5173 e unificação da Redirect URI para `https://alura.net.br/` com interceptação nativa pelo Electron.
  - Adicionada caixa explicativa com botão de copiar a Redirect URI oficial em Configurações.

---

## [1.0.0] — Lançamento Inicial
- Lançamento oficial da plataforma Alura.
- Suporte a comunidades, canais de texto e salas de voz WebRTC Mesh com áudio estereofônico.
- Compartilhamento de tela com captura de áudio interno e escolha de qualidade (720p/1080p a 30/60 FPS).
- Integração com Spotify para exibição de reprodução de música em tempo real.
- Soundboard integrado e filtros DSP de redução de ruído Cleanvoice.
