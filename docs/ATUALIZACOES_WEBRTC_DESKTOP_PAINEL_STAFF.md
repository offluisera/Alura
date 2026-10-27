# 📄 Relatório Técnico de Atualizações — Alura

**Data:** 21 de Outubro de 2026  
**Módulos Afetados:** WebRTC Signaling, Desktop Electron, Design System & Chamadas Privadas, Painel Staff  
**Executável Compilado:** `apps/desktop/dist/setup_alura.exe`  

---

## 1. Resumo Executivo das Implementações

Este documento consolida todas as correções de bugs, melhorias de arquitetura, refatorações visuais e novas funcionalidades desenvolvidas para as chamadas de voz/vídeo, compartilhamento de tela e painel administrativo da Alura.

---

## 2. Detalhamento por Área

### 📞 2.1. Chamadas no Privado (DM) & WebRTC

#### A. Correção da Tela Quebrada / Desalinhada
- **Causa Raiz:** No arquivo `apps/web/src/index.css`, a regra `.call-overlay` estava antecedida por um comentário de cabeçalho com caractere corrompido que não fechava (`/* ...`). Isso fazia com que o navegador ignorasse as propriedades `position: fixed`, `inset: 0` e `z-index: 100`, empurrando o overlay como elemento estático flex dentro de `Dashboard.tsx`, ficando espremido contra a sidebar e mostrando o texto "Nenhuma conversa selecionada" ao fundo.
- **Solução Implementada:** 
  - Sintaxe de comentário corrigida no [`apps/web/src/index.css`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/index.css).
  - Adicionadas classes Tailwind explícitas no container raiz de [`apps/web/src/components/call/CallOverlay.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/call/CallOverlay.tsx): `fixed inset-0 z-[100] w-screen h-screen flex flex-col justify-between items-center bg-[#001408]/96 backdrop-blur-2xl overflow-y-auto overflow-x-hidden`.
  - Impossibilidade de vazamento de layout ou divisão indevida da tela.

#### B. Falso Positivo de Compartilhamento de Tela ao Atender
- **Causa Raiz:**
  1. Durante a inicialização da conexão WebRTC em `createPeerConnection`, estava alocado um transceiver de vídeo com `direction: 'sendrecv'`, fazendo com que ambos os lados negociassem canais de vídeo e disparassem o evento `ontrack` com kind `'video'` mesmo sendo uma chamada estritamente de áudio.
  2. Os métodos `startCall` e `acceptCall` não limpavam o estado anterior `isRemoteSharingScreen` e `isSharingScreen`, gerando retenção de estado de transmissões passadas.
- **Solução Implementada:**
  - Alterada a alocação inicial de transceiver de vídeo para `direction: 'recvonly'` em [`apps/web/src/lib/hooks/useWebRTCCall.ts`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/lib/hooks/useWebRTCCall.ts).
  - `startCall` e `acceptCall` agora executam reset rigoroso de `isRemoteSharingScreen(false)`, `isSharingScreen(false)`, `setStreamViewers([])`, `remoteStreamRef.current = new MediaStream()` e `setRemoteStream(null)`.
  - Condição em [`CallOverlay.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/call/CallOverlay.tsx) ajustada para `isRemoteSharing = !!isRemoteSharingScreen && hasRemoteVideo` (exige track de vídeo com `readyState === 'live'`).

#### C. Recusa Sincronizada e Registro de Chamada no Chat
- Envio direto de `call_reject` e `call_end` direcionado via canal pessoal `user_calls_${toUserId}` e canal WebSocket Phoenix `user:${toUserId}`.
- Ao recusar ou fechar, o chat de DM recebe automaticamente o registro `[call:rejected] Chamada recusada`.

---

### 🖥️ 2.2. Transmissão de Tela & App Desktop Electron

#### A. Resolução de Tela Preta no Desktop
- **Causa Raiz:** O Chromium/Electron moderno descontinuou restrições rígidas no `getUserMedia` legado (`mandatory: { minWidth: 1280, maxWidth: 1920, minHeight: 720, maxHeight: 1080 }`). Em monitores com scaling, resoluções 2K/4K ou janelas de apps menores, o capturador do Windows Desktop Duplication falhava silenciosamente e gerava buffers pretos. Além disso, o sender de vídeo não comutava sua direção para `sendrecv`.
- **Solução Implementada:**
  - **Canal IPC dedicado:** Criado `set-selected-screen-source` em [`apps/desktop/preload.js`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/desktop/preload.js) e [`apps/desktop/main.js`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/desktop/main.js).
  - **Captura Nativa sem distorção:** O hook [`useWebRTCCall.ts`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/lib/hooks/useWebRTCCall.ts) notifica o Electron da fonte escolhida e chama `navigator.mediaDevices.getDisplayMedia(...)`. O Electron intercepta em `session.defaultSession.setDisplayMediaRequestHandler` e entrega a tela/janela exata com áudio loopback.
  - **Fallback Seguro:** Fallback sem constraints de tamanho fixo caso o sistema necessite.
  - **Comutação de Transceiver:** `videoTransceiver.direction = 'sendrecv'` ativado explicitamente antes do `replaceTrack`.
  - **Desbloqueio de Autoplay:** Listener `onunmute` no player `<video>` do receptor para desfrisar o vídeo na chegada dos pacotes RTP.

#### B. Maximizar e Ajuste de Transmissão
- Adicionado botão de Maximizar/Restaurar (`Maximize2` / `Minimize2`) no cabeçalho e na barra de ferramentas do player de vídeo.
- Alternância entre proporção original (`contain`) e preenchimento de tela (`cover`).

---

### 🛡️ 2.3. Painel Staff — Edição de Versões do Executável

- **Arquivo:** [`apps/web/src/pages/admin/AdminDashboard.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/admin/AdminDashboard.tsx)
- **Funcionalidades:**
  - Botão **"Editar"** (`Edit3`) em cada registro da lista de versões.
  - **Modal Completo de Edição:**
    - Número da Versão (ex: `1.0.36`)
    - Título e Tagline
    - URL direta do executável `.exe`
    - Construtor dinâmico de itens de release (tags: `novidade`, `melhoria`, `correcao`)
    - Campo de notas da versão em Markdown
    - Toggle de Atualização Obrigatória
    - Toggle de Versão Ativa/Inativa
  - Persistência direta no Supabase com sincronização em tempo real e toasts de confirmação.

---

## 3. Arquivos Modificados

| Arquivo | Descrição das Modificações |
|---|---|
| [`apps/web/src/index.css`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/index.css) | Fechamento de comentário de cabeçalho e restauração de `.call-overlay` em tela cheia com `z-index: 100`. |
| [`apps/web/src/components/call/CallOverlay.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/components/call/CallOverlay.tsx) | Refatoração de palcos (chamando, recebendo e ativo), remoção de cores azuis, `hasRemoteVideo` seguro, listener `onunmute`. |
| [`apps/web/src/lib/hooks/useWebRTCCall.ts`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/lib/hooks/useWebRTCCall.ts) | Transceiver `recvonly` inicial, reset de estados em `startCall` e `acceptCall`, captura de tela integrada ao Electron. |
| [`apps/desktop/main.js`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/desktop/main.js) | Flags Chromium anti-tela preta, IPC `set-selected-screen-source` e `setDisplayMediaRequestHandler` dinâmico. |
| [`apps/desktop/preload.js`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/desktop/preload.js) | Exposição de `set-selected-screen-source` no array `allowed` de invokes do `contextBridge`. |
| [`apps/web/src/pages/admin/AdminDashboard.tsx`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/pages/admin/AdminDashboard.tsx) | Botão de edição e modal completo de gerenciamento de versões com atualização direta no banco. |
| [`CHANGELOG.md`](file:///c:/xampp/htdocs/AluraProjects/Alura/CHANGELOG.md) | Registro oficial das melhorias e versões da plataforma. |

---

## 4. Status de Compilação

- **Frontend Web (`apps/web`):** `vite build` executado com sucesso (código 0).
- **Desktop Electron (`apps/desktop`):** Sincronização `./ui` e `electron-builder` executados com sucesso (código 0).
- **Binário Gerado:** [`apps/desktop/dist/setup_alura.exe`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/desktop/dist/setup_alura.exe) (87.3 MB).
