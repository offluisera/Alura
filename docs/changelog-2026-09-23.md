# Changelog — 23 de Setembro de 2026

Resumo de todas as alterações realizadas nesta sessão de desenvolvimento da Alura.

---

## Sessão 1 — Correções de Retorno de Mic, Card de Voz, Menções e Permissões

### 1. Retorno de Microfone (Loopback) e Switch do Design System

**Arquivos:** `apps/web/src/pages/app/Settings.tsx`

- Substituído checkbox HTML nativo pelo componente `<Switch>` do Alura Design System (`components/ui/Switch.tsx`).
- Implementado elemento `<audio ref={loopbackAudioRef} autoPlay playsInline>` conectado ao `filteredStream` via `srcObject`, com `audioCtx.resume()` e `volume = 1.0`.
- O retorno agora toca nos fones de ouvido sem bloqueio de feedback do navegador.

### 2. Card de Conexão de Voz na Sidebar (Estilo Discord)

**Arquivos:**
- `apps/web/src/contexts/CallContext.tsx`
- `apps/web/src/components/layout/VoiceConnectionCard.tsx` *(novo)*
- `apps/web/src/components/layout/Sidebar.tsx`

- Criada interface `ServerVoiceConnection` no `CallContext` com estado global da chamada de voz no servidor.
- Criado componente `VoiceConnectionCard` com:
  - Badge pulsante de status RTC e ping em ms.
  - Nome do canal de voz e servidor.
  - Controles de mute, deafen e desconectar.
- Montado imediatamente acima do `UserPanel` na `Sidebar`.

### 3. Correção de Navegação entre Canais de Voz e Texto

**Arquivo:** `apps/web/src/pages/app/ServerWorkspace.tsx`

- Removido `setIsVoiceChannelsCollapsed(true)` que colapsava a barra lateral ao entrar na voz.
- Clicar no canal de voz ativo agora restaura o palco (`setActiveRoom` + `setIsVoiceMinimized(false)`) sem reiniciar o WebRTC.

### 4. Prévia Principal de Perfil nas Menções `@`

**Arquivo:** `apps/web/src/components/shared/UserProfileHoverCard.tsx`

- Expandido `UserProfileHoverCardProps` com `serverRoles`, `isServerOwner`, `joinedServerAt`, `canKick`, `onKick`, `canBan`, `onBan`.
- Adicionada seção de cargos do servidor (pills coloridas), selo de Proprietário, data de entrada e botões de moderação rápida (Expulsar/Banir).
- `renderFormattedContent` em `ServerWorkspace.tsx` agora envolve `@username` em `<UserProfileHoverCard>` com contexto do membro.

### 5. Correção de Permissões de Cargos

**Arquivos:**
- `apps/web/src/pages/app/ServerWorkspace.tsx`
- `apps/web/src/components/servers/ServerSettingsModal.tsx`

- Algoritmo de consolidação de permissões corrigido para respeitar negações (`false`) e herança de `@everyone`.
- Adicionado modo de simulação "Simulando Membro" / "Visão de Dono" para o proprietário testar restrições em tempo real.
- Bloqueada a exclusão acidental do cargo `@everyone`.

---

## Sessão 2 — GIFs, Spotify, Transmissão de Tela e Áudio Minimizado

### 6. Menu de GIFs Responsivo

**Arquivo:** `apps/web/src/components/chat/GifPickerPopover.tsx`

- Removido container `absolute bottom-full` duplicado em `ServerWorkspace.tsx`.
- Atualizado container do popover: `max-w-[calc(100vw-32px)]`, `w-[320px] sm:w-[380px]`, `max-h-[min(490px,75vh)]`, `origin-bottom-right`.
- O popover agora se adapta corretamente a qualquer tamanho de tela.

### 7. Envio de GIFs Funcional no Chat

**Arquivo:** `apps/web/src/pages/app/ServerWorkspace.tsx`

- **Bug:** `onSelectGif={(gif) => handleSendGif(gif.url)}` enviava `undefined` (a prop já era a URL string).
- **Fix:** `onSelectGif={(url) => { handleSendGif(url); setShowGifPicker(false); }}`.
- Adicionado `onSelectEmoji` para integrar o picker de emojis.
- Regex de renderização expandida: `.webp`, `media*.giphy.com`, URLs com query parameters.

### 8. Integração Spotify — Auto-Renovação de Token e Fallbacks

**Arquivo:** `apps/web/src/lib/services/SpotifyService.ts`

- **`getValidToken()`** *(novo)*: método assíncrono que renova o access token via `refresh_token` se expirado (com margem de 60s).
- **`getStoredToken()`**: agora dispara renovação silenciosa em background quando o token expirou.
- **`isConnected()`**: verifica presença de token no localStorage além do flag `alura_spotify_connected`.
- **`fetchCurrentlyPlaying(token?)`**: 
  - Aceita token opcional (busca internamente se omitido).
  - Trata HTTP 401 com retry automático após renovação.
  - Fallback em cadeia: `/currently-playing` → `/player` → `/recently-played?limit=1`.
  - Retorna `isPlaying: false` para faixas recentes (em vez de `null`).

**Arquivos consumidores atualizados:**
- `apps/web/src/pages/app/Settings.tsx` — `pollSpotify` e `handleRefreshSpotify` usam `getValidToken()`.
- `apps/web/src/components/shared/GlobalRealtimeListener.tsx` — `checkSpotifyNow` usa `getValidToken()`.

### 9. Transmissão de Tela — Limpeza e Saída Automática

**Arquivo:** `apps/web/src/lib/hooks/useWebRTCCall.ts`

- No sinal `screen_share_stop`: remove e para todas as tracks de vídeo do `remoteStreamRef`, recria `MediaStream`, limpa `streamViewers`.
- No `track.onended`: remove a track finalizada do stream remoto e atualiza estado.

**Arquivo:** `apps/web/src/components/call/CallOverlay.tsx`

- Efeito de saída automática: quando `isRemoteSharing` é falso e `watchingStream === 'remote'`, sai de tela cheia e redefine para `null` (volta aos avatares).

### 10. Sistema de Espectadores da Transmissão

**Arquivos:**
- `apps/web/src/lib/services/CallSignalingService.ts` — novos tipos `'stream_viewer_join'` | `'stream_viewer_leave'`.
- `apps/web/src/lib/services/PhoenixCallSignalingService.ts` — idem.
- `apps/web/src/lib/hooks/useWebRTCCall.ts` — estado `streamViewers`, método `sendStreamViewerSignal`, expostos no return.
- `apps/web/src/components/call/CallOverlay.tsx` — badge `👁️ [N]` com tooltip de nomes no header da transmissão local.
- `apps/web/src/pages/app/Dashboard.tsx` — props `streamViewers` e `sendStreamViewerSignal` repassadas ao `CallOverlay`.

### 11. Tela Preta ao Maximizar Transmissão

**Arquivo:** `apps/web/src/components/call/CallOverlay.tsx`

- `isMinimized` adicionado como dependência nos `useEffect` de sincronização de `localStream`, `screenStream` e `remoteStream`.
- Ao maximizar, o `srcObject` é reatribuído imediatamente ao elemento `<video>`.

### 12. Áudio Contínuo ao Minimizar a Chamada

**Arquivo:** `apps/web/src/components/call/CallOverlay.tsx`

- Criado `permanentAudioLayer` — fragmento React (`<>...</>`) com todos os `<audio>` remotos.
- Renderizado tanto no bloco minimizado quanto no return principal, **nunca desmontando**.
- Removidos `<audio>` duplicados que existiam separadamente em cada branch.

---

## Validação

```bash
npm run build
# ✓ built in 4.09s — código de saída 0, zero erros TypeScript.
```

---

---

## Sessão 3 — Correção de Bugs Críticos (Voz, Notificações, Transmissão e Dashboard)

### 13. Erro no Microfone e Toast Indevido (Web e PC)
**Arquivos:**
- `apps/web/src/lib/services/CleanvoiceService.js`
- `apps/web/src/pages/app/ServerWorkspace.tsx`

- **Causa:** `ServerWorkspace.tsx` invocava `CleanvoiceService.applyFilterChain(stream, ...)` mas apenas `createLiveFilter` existia no serviço, disparando `TypeError: applyFilterChain is not a function`. O bloco `catch` capturava a exceção interna e emitia o toast "Microfone Desativado - Permita o acesso ao microfone...".
- **Correção:** Adicionado método estático `applyFilterChain` em `CleanvoiceService.js` como alias resiliente com tratamento de erros e fallback para o stream bruto nativo.

### 14. Retorno de Áudio na Transmissão de Tela no Servidor
**Arquivo:** `apps/web/src/pages/app/ServerWorkspace.tsx`

- **Causa:** O elemento de prévia de transmissão `<video ref={localScreenRef}>` não possuía o atributo `muted`. Ao compartilhar tela com áudio, o áudio do sistema era reproduzido de volta nos alto-falantes do próprio usuário, gerando eco e feedback de áudio em loop.
- **Correção:** Adicionado `muted` no elemento `<video>` da prévia local da tela.

### 15. Seleção de Telas e Qualidade na Transmissão do Servidor
**Arquivos:**
- `apps/web/src/components/call/ScreenShareModal.tsx`
- `apps/web/src/pages/app/ServerWorkspace.tsx`

- **Melhoria:** O `ScreenShareModal` foi expandido para suportar tanto o Electron (com thumbnails de telas e janelas capturadas) quanto navegadores Web convencionais (com seletor de resolução 720p/1080p, taxa de quadros 30/60 FPS e captura de áudio).
- Integrado ao palco de voz e barra minimizada do `ServerWorkspace.tsx`.

### 16. Responsividade e Proporção dos Cards de Chamada (Fim dos Cards Pílula)
**Arquivo:** `apps/web/src/pages/app/ServerWorkspace.tsx`

- **Causa:** O grid de participantes estava configurado em um flex column `h-full items-stretch`, esticando os cards verticalmente e gerando formato de cápsula cilíndrica alongada.
- **Correção:** Reformulado com grid responsivo dinâmico:
  - 1 participante: centralizado com `max-w-xl aspect-[16/10]`.
  - 2 participantes: lado a lado em `grid-cols-2`.
  - 3-4 participantes: `grid-cols-2` 2x2.
  - 5+ participantes: `grid-cols-2 lg:grid-cols-3` adaptativo com `aspect-[16/10]` e altura máxima controlada.

### 17. Minimização de Chamada sem Desconexão Acidental
**Arquivo:** `apps/web/src/pages/app/ServerWorkspace.tsx`

- Ao clicar no botão de recolher/minimizar ("Minimizar Palco"), o estado da sala de voz permanece conectado e o dock flutuante de controles é exibido na parte inferior.
- Clicar em canais de texto enquanto conectado à voz agora recolhe o palco automaticamente mantendo a chamada ativa sem sair da sala.
- Removida chamada indevida a `hangUp()` de DM ao desconectar de um canal de servidor.

### 18. Central de Notificações Completa e Resolução de Redirecionamento para Login
**Arquivos:**
- `apps/web/src/components/notifications/NotificationCenterModal.tsx` *(novo)*
- `apps/web/src/components/layout/Topbar.tsx`
- `apps/web/src/App.tsx`

- **Causa:** Links de notificação de curtida/comentário apontavam para `/app/post/:postId` ou `/post/:postId`. Sem rotas cadastradas, o React Router caía no fallback `*` que forçava redirecionamento para `/login`.
- **Correções:**
  - Criado o modal `NotificationCenterModal` completo: abas de categorias (Todas, Não lidas, Curtidas/Comentários, Amizades, Sistema), contadores, exclusão, marcar como lida e atalho no dropdown de notificações do `Topbar`.
  - No `App.tsx`, adicionadas as rotas `post/:postId` e `app/post/:postId` apontando para `<Home />`.
  - Redirecionamento fallback `*` ajustado para manter a sessão de usuários logados.

### 19. Notificações Toast e Badges de DM Suprimidos quando Ativo na Conversa
**Arquivos:**
- `apps/web/src/components/shared/GlobalRealtimeListener.tsx`
- `apps/web/src/pages/app/DirectMessage.tsx`

- **Causa:** `GlobalRealtimeListener` ouvia mensagens recebidas e sempre disparava toast e `refreshUnreadDMs()` mesmo quando o usuário estava na tela da conversa com a pessoa.
- **Correção:** Adicionada verificação de rota ativa (`useLocation()`). Se o usuário estiver em `/messages/:userId`, a mensagem recebida é marcada imediatamente como `is_read: true` no Supabase, a contagem de não-lidas permanece zerada e o toast/som de notificação é suprimido. No `DirectMessage.tsx`, a subscrição em tempo real também marca a mensagem como lida instantaneamente.

### 20. Dashboard com Dados Reais do Banco de Dados
**Arquivos:**
- `apps/web/src/components/feed/PostFeed.tsx`
- `apps/web/src/components/layout/RightSidebar.tsx`

- No `PostFeed.tsx`, o card de estatísticas de "Mensagens" não utiliza mais valor hardcoded "0", consultando a contagem real na tabela `direct_messages`.
- No `RightSidebar.tsx`, eliminados os `Math.random()`. Os servidores e sugestões agora calculam contagem real de membros com base em `server_members`, oferecendo navegação direta ao clicar no servidor e botão de entrada funcional nas sugestões.

---

## Sessão 4 — Persistência Global de Voz e Presença Real Online / Offline

### 21. Chamada de Servidor Persistente Durante Toda a Navegação (Fim da Desconexão ao Mudar de Aba)
**Arquivos:**
- `apps/web/src/lib/hooks/useServerVoiceRoom.ts` *(novo)*
- `apps/web/src/contexts/CallContext.tsx`
- `apps/web/src/pages/app/ServerWorkspace.tsx`

- **Causa:** Os streams de áudio, microfone, conexões WebRTC mesh e a subscrição de presença da sala de voz residiam internamente em `ServerWorkspace.tsx`. Ao navegar para "Início" (`/`), "Mensagens" (`/messages`) ou "Amigos", o React Router desmontava o componente e derrubava a chamada.
- **Correção:** Criado o hook global `useServerVoiceRoom` instanciado no `CallProvider` (nível superior do `Dashboard`).
  - As tracks de áudio e conexões mesh continuam ativas continuamente em segundo plano.
  - O card `VoiceConnectionCard` na barra lateral esquerda permite silenciar, ensurdecer, desconectar ou clicar para retornar ao palco de voz sem recomeçar a ligação.
  - Ao retornar ao servidor, `ServerWorkspace` reconecta a interface ao estado global pré-existente.

### 22. Status Real dos Usuários e Presença em Tempo Real (Fim dos Falsos Online)
**Arquivos:**
- `apps/web/src/contexts/PresenceContext.tsx` *(novo)*
- `apps/web/src/pages/app/Dashboard.tsx`
- `apps/web/src/pages/app/ServerWorkspace.tsx`
- `apps/web/src/pages/app/MessagesLayout.tsx`
- `apps/web/src/components/layout/Sidebar.tsx`

- **Causa:**
  1. No painel de membros de `ServerWorkspace.tsx`, a tag `<span className="... bg-emerald-400" />` desenhava o dot verde incondicionalmente para todos os membros.
  2. Em `MessagesLayout.tsx`, havia um dot verde estático em todas as conversas diretas.
  3. No `Sidebar.tsx`, a contagem de servidores fazia fallback fixo para `1 online`.
  4. Ausência de canal de presença global para detectar quem fechou a aplicação.
- **Correção:**
  - Criado o `PresenceContext` com canal de presença via WebSockets (`global_online_users`) rastreando ativamente conexões abertas no app.
  - Implementado cálculo dinâmico de status: `online`, `idle`, `dnd` ou `offline` baseado na conexão viva e nas preferências do usuário (`activity_status_visible`).
  - No `ServerWorkspace.tsx`, os membros são agora segregados entre ativos e `Offline — N`, com cores correspondentes e atenuação visual (`opacity-65`) para quem está desconectado.
### 23. Hotfix — Correção de ReferenceError toggleDeafen ao Entrar na Voz
**Arquivo:** `apps/web/src/pages/app/ServerWorkspace.tsx`

- **Causa:** O botão de ensurdecer (`Headphones`) na barra de status da sala de voz conectada referenciava diretamente `onClick={toggleDeafen}` em vez de `onClick={handleToggleDeafen}`, gerando o erro `toggleDeafen is not defined` capturado pelo ErrorBoundary ao entrar no canal.
- **Correção:** Substituído por `onClick={handleToggleDeafen}`, restaurando a funcionalidade do botão e eliminando o erro de renderização.

### 24. Eliminação de Avatares Duplicados e Fantasmas na Chamada de Servidor
**Arquivos:**
- `apps/web/src/lib/hooks/useServerVoiceRoom.ts`
- `apps/web/src/pages/app/ServerWorkspace.tsx`

- **Causa:**
  1. No `useServerVoiceRoom.ts`, o `useEffect` da conexão Supabase Presence incluía `isLocalAudioMuted` e `isDeafened` em seu array de dependências. A cada clique de mutar/desmutar, o canal era sumariamente destruído e recriado, re-rastreando presença enquanto o evento `presence sync` concatenava (`push`) todos os registros recebidos sem deduplicação por ID de usuário.
  2. Ao desconectar (`leaveVoiceRoom`), os participantes em memória local não eram limpos para o usuário local, retendo o avatar prévio no canal.
  3. No `ServerWorkspace.tsx`, a listagem abaixo do canal não aplicava verificação estrita por Map de IDs únicos.
- **Correções:**
  - Desacoplado o ciclo de vida do canal Supabase de estados voláteis (mute, deafen, streams locais). Alterações de mute/deafen agora apenas atualizam o rastreamento in-place via `.track()`, mantendo o canal estável.
  - Implementada deduplicação matemática por `Map<string, VoiceParticipant>` indexada estritamente pelo `user_id`. É impossível um participante constar mais de uma vez.
  - Ao sair da sala (`leaveVoiceRoom`), o usuário é des-rastreado (`untrack()`) e removido de imediato do cache de participantes locais (`setVoiceParticipants`).
### 25. Hotfix — Correção de ReferenceError setLocalScreenStream ao Compartilhar Tela no Electron
**Arquivo:** `apps/web/src/pages/app/ServerWorkspace.tsx`

- **Causa:** Ao selecionar janela/aplicativo no modal de compartilhamento do Desktop (`handleSelectDesktopSource`), o código tentava invocar `setLocalScreenStream(stream)` e `setLocalScreenStream(null)`. Com a migração da lógica de mídia para o hook global `useServerVoiceRoom`, este estado local havia sido substituído por `serverVoice.startScreenShareWithStream` e `serverVoice.stopScreenShare`, gerando o erro `setLocalScreenStream is not defined`.
- **Correção:** Atualizado `handleSelectDesktopSource` para invocar `serverVoice.startScreenShareWithStream(stream)` e ligar o callback `track.onended` a `serverVoice.stopScreenShare()`.

---

## Validação

```bash
npx tsc --noEmit
# Código de saída 0 — zero erros TypeScript.

npm run build
# ✓ built in 4.37s — bundle gerado com sucesso.
```

---

## Resumo Geral de Arquivos Modificados / Criados

| # | Arquivo | Tipo |
|---|---------|------|
| 1 | `apps/web/src/pages/app/Settings.tsx` | Modificado |
| 2 | `apps/web/src/contexts/CallContext.tsx` | Modificado |
| 3 | `apps/web/src/components/layout/VoiceConnectionCard.tsx` | Novo |
| 4 | `apps/web/src/components/layout/Sidebar.tsx` | Modificado |
| 5 | `apps/web/src/components/shared/UserProfileHoverCard.tsx` | Modificado |
| 6 | `apps/web/src/pages/app/ServerWorkspace.tsx` | Modificado |
| 7 | `apps/web/src/components/servers/ServerSettingsModal.tsx` | Modificado |
| 8 | `apps/web/src/components/chat/GifPickerPopover.tsx` | Modificado |
| 9 | `apps/web/src/lib/services/SpotifyService.ts` | Modificado |
| 10 | `apps/web/src/components/shared/GlobalRealtimeListener.tsx` | Modificado |
| 11 | `apps/web/src/lib/services/CallSignalingService.ts` | Modificado |
| 12 | `apps/web/src/lib/services/PhoenixCallSignalingService.ts` | Modificado |
| 13 | `apps/web/src/lib/hooks/useWebRTCCall.ts` | Modificado |
| 14 | `apps/web/src/components/call/CallOverlay.tsx` | Modificado |
| 15 | `apps/web/src/pages/app/Dashboard.tsx` | Modificado |
| 16 | `apps/web/src/lib/services/CleanvoiceService.js` | Modificado |
| 17 | `apps/web/src/components/call/ScreenShareModal.tsx` | Modificado |
| 18 | `apps/web/src/components/notifications/NotificationCenterModal.tsx` | Novo |
| 19 | `apps/web/src/components/layout/Topbar.tsx` | Modificado |
| 20 | `apps/web/src/App.tsx` | Modificado |
| 21 | `apps/web/src/components/feed/PostFeed.tsx` | Modificado |
| 22 | `apps/web/src/components/layout/RightSidebar.tsx` | Modificado |
| 23 | `apps/web/src/pages/app/DirectMessage.tsx` | Modificado |
| 24 | `apps/web/src/contexts/PresenceContext.tsx` | Novo |
| 25 | `apps/web/src/lib/hooks/useServerVoiceRoom.ts` | Novo |
| 26 | `apps/web/src/pages/app/MessagesLayout.tsx` | Modificado |
| 27 | `docs/changelog-2026-09-23.md` | Modificado |


