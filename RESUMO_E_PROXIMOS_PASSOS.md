# Alura — Resumo do Projeto, Entregas Concluídas e Próximos Passos

> **Status do Projeto:** Fase de Expansão (Social, Configurações & Chamadas WebRTC Concluídas | Servidores & Canais a Iniciar)  
> **Versão do Cliente:** Alura v0.9.5 Beta  
> **Stack Oficial:** React 18 + TypeScript + Vite (Web) | Electron 29 (Desktop) | Supabase / PostgreSQL (Dados & Auth) | Supabase Realtime Broadcast / Phoenix Channels (WebSockets) | WebRTC P2P (Mídia em Tempo Real)

---

## 1. O Que Foi Feito e Concluído

### 📞 1.1. Chamadas de Áudio, Vídeo e Compartilhamento de Tela (WebRTC) — **NOVO**
- **Infraestrutura WebRTC P2P Completa:**
  - Suporte a chamadas 1:1 de Voz e Vídeo de alta fidelidade diretamente pelas Mensagens Diretas (DMs).
  - Transmissão de tela ao vivo (*Screen Sharing*) integrada na chamada com resolução e taxa de quadros configuráveis.
  - Negociação de conexões com STUN servers públicos do Google (`stun:stun.l.google.com:19302`).
  - Cancelamento acústico de eco (AEC), supressão de ruído e controle automático de ganho (AGC) ativados nativamente no `getUserMedia`.
- **Sinalização em Tempo Real via Supabase Broadcast (WebSockets Puro):**
  - Migração de escrita lenta em banco de dados para **Supabase Realtime Broadcast**: sinalização instantânea (< 20ms) sem necessidade de tabelas, migrações SQL ou replicação de banco.
  - Canais dedicados por usuário (`user_calls_${userId}`) para ofertas de chamada e canais de sala (`call_room_${callId}`) para troca de SDP (Offer/Answer) e candidatos ICE.
  - Função `ensureChannelJoined` garantindo que o canal WebSocket esteja 100% conectado antes do envio do sinal, permitindo ligações bidirecionais (Web ⇄ Desktop).
  - Fallback não-bloqueante no banco de dados para auditoria/histórico sem interromper a chamada caso a tabela não exista.
- **Overlay de Chamada Dinâmico & Temático (`CallOverlay.tsx`):**
  - Interface que segue automaticamente o tema do usuário (Alura Forest, Obsidian, Violet Radiance, etc.) via tokens CSS `var(--alura-*)`.
  - Exibição de avatares com anéis luminosos indicando fala (*speaking*), mudo e surdo (*deafened*).
  - Controles completos de chamada:
    - **Mutar Microfone** (com feedback visual e atalho)
    - **Desativar Áudio / Deafen** (silencia microfone e fone simultaneamente)
    - **Ligar / Desligar Câmera**
    - **Compartilhar Tela** (com preview em picture-in-picture local)
    - **Soundboard in-call**
    - **Encerrar Chamada**
  - Novos botões de ação rápida para chamadas recebidas: **Atender** (verde pulsante) e **Recusar** (vermelho).
- **Eliminação de Áudio Duplicado e Ecos:**
  - `<video>` remoto com atributo `muted` obrigatório (evitando que o `<video>` e o `<audio>` toquem o stream remoto ao mesmo tempo).
  - `pc.ontrack` simplificado para usar `event.streams[0]` diretamente sem duplicar faixas de áudio.
- **Sistema de Ringtone de Chamada (`SoundService`):**
  - Toque de chamada usando o áudio oficial `ligando.mp3`.
  - Controle de repetição contínua em loop único (`loop = true`), eliminando sobreposição de sons a cada 4 segundos.
  - Parada imediata do som assim que a chamada é atendida, recusada ou encerrada.
  - Respeita o volume master e a chave seletora "Sons de chamada recebida" definida nas configurações.
- **Integração com Desktop Electron (`Alura.exe`):**
  - Janela pop-up nativa para chamadas recebidas (`incoming-call.html`) exibindo avatar, nome do chamador e botões nativos de Atender/Rejeitar.
  - Ponte IPC bidirecional segura (`preload.js` e `preload-call.js`) utilizando `contextBridge.exposeInMainWorld('electronIPC')` com `contextIsolation: true`.
  - Permissões automáticas concedidas no Electron para microfone, câmera e captura de tela.

---

### 🎨 1.2. Design System & Temas (Anti-Generic Alura)
- **6 Temas Exclusivos com Paletas e Gradientes Customizados:**
  1. **Alura Forest** (Oficial / Padrão): `#001609`, `#001B0B`, `#005022`, `#00E6A0`.
  2. **Obsidian Darkness** (Dark Minimalista): `#0B0D0F`, `#12151A`, `#262C36`, `#00E6A0`.
  3. **High Contrast Neon** (Preto Puro & Neon): `#000000`, `#050505`, `#1F1F1F`, `#39FF88`.
  4. **Violet Radiance** (Cyberpunk Púrpura): `#0D0714`, `#170D24`, `#3B1D61`, `#A855F7`.
  5. **Midnight Blue** (Tecnológico / Marinho Profundo): `#060B14`, `#0B1324`, `#1B2D54`, `#38BDF8`.
  6. **Crimson Noir** (Gamer / Vermelho Sangue): `#140508`, `#240B10`, `#541B26`, `#F43F5E`.
- **Identidade Visual Refinada:**
  - Banners com gradientes nativos respeitando a paleta de cada tema.
  - Hover cards e modais perfeitamente estilizados com tokens CSS do tema ativo.
  - Substituição de emojis por ícones vetoriais consistentes em todos os filtros e categorias.

---

### 👤 1.3. Identidade do Usuário & Navegação
- Substituição de identificadores UUID pelo `@username` legível do usuário.
- Barra de pesquisa global atualizada para exibir o nome de exibição e o `@username` correto.
- Sincronização entre `profiles`, `auth.users` e armazenamento local.

---

### ⚙️ 1.4. Configurações Globais (Settings — 7 Abas 100% Funcionais)

#### 1. Minha Conta
- Edição completa: Nome de exibição, `@username`, biografia, telefone, cidade, data de nascimento.
- Seleção interativa de tags, jogos favoritos e hobbies.
- Upload de Avatar e Banner para o bucket `avatars` do Supabase com compressão WebP.
- Integração ativa com o Spotify (status de reprodução ao vivo, faixas, capa de álbum e visibilidade).
- Barra Flutuante de Ação (*"Cuidado — você tem alterações não salvas!"*) com botões de *Redefinir* e *Salvar Alterações*.

#### 2. Privacidade & Segurança
- Políticas de solicitação de amizade e mensagens diretas.
- Status de atividade e filtro anti-spam para DMs.
- AutoMod com filtros de mensagens e lista de palavras proibidas personalizadas.
- Autenticação de Dois Fatores (2FA) via TOTP funcional com QR Code e Códigos de Backup.
- Gerenciamento de usuários bloqueados (com busca e desbloqueio imediato).
- LGPD: Exportação de dados pessoais e controle de telemetria.

#### 3. Notificações
- Preferências de notificações sonoras, visuais e de menções com persistência.

#### 4. Aparência
- Seletor interativo dos 6 temas visuais com swatches de cores.
- Densidade do chat (*Confortável* vs. *Compacto*).
- Modo de Movimento Reduzido (*prefers-reduced-motion*).

#### 5. Voz, Vídeo & Áudio (5 Sub-abas Avançadas)
- **Voz:**
  - Enumeração real de dispositivos de entrada e saída via Web Audio API (`enumerateDevices`).
  - Sliders de volume para microfone e fones com persistência local.
  - Teste de microfone com VU Meter responsivo em tempo real e retorno de áudio (*Loopback*).
  - Modos de Entrada: *Ativação por Voz* (sensibilidade automática ou manual) e *Push-to-Talk* (com gravador de tecla física).
- **Transmissão (Screen Share / Vídeo):**
  - Resolução (720p, 1080p, 1440p, Fonte), Taxa de Quadros (15, 30, 60 FPS) e Otimização (*Fluidez* vs. *Nitidez*).
  - Captura de áudio da aplicação e aceleração por hardware.
  - Teste ao vivo de compartilhamento de tela com preview em vídeo e métricas (`getDisplayMedia`).
- **Sons do Sistema:**
  - Volume master e mudo geral.
  - 9 eventos de áudio Alura sintetizados com Web Audio API e switches independentes.
- **Efeitos Sonoros (Soundboard / MyInstants):**
  - Integração com `www.myinstants.com` via API com fallback offline.
  - Catálogo inicial de 20+ memes carregados a 0ms.
  - Busca instantânea com debounce e pré-escuta de áudio.
  - Lista de Favoritos e atalho de teclado global gravável.
  - **Modal Avançado de Adicionar Sons:**
    - 3 abas: *Link MyInstants / Web* (auto-detecção de título e mp3), *Upload do PC* (arrastar e soltar arquivos .mp3, .wav, .ogg, .m4a até 12MB) e *Explorar Catálogo*.
    - Player de teste integrado antes de salvar.
    - Seletor de categorias com ícones vetoriais.
- **Avançado:**
  - Supressão de ruído Alura AI (Krisp).
  - Cancelamento de eco (AEC), controle automático de ganho (AGC), subsistema WebRTC e prioridade QoS.

#### 6. Redes Sociais & Conexões (15 Plataformas)
- **Plataformas suportadas:**
  - *Games:* **Epic Games**, **PlayStation Network (PSN)**, **Xbox Network**, **Steam**, **Riot Games**, **Battle.net**.
  - *Social:* **Discord**, **Twitter / X**, **Instagram**, **Reddit**.
  - *Dev & Mídia:* **GitHub**, **Twitch**, **YouTube**, **Spotify**, **TikTok**.
- **Sistema de Controle de Visibilidade:**
  - Chave seletora individual para cada rede: **Ativa no Perfil** vs. **Oculta**.
  - Ações em massa: *Ativar Todas* e *Ocultar Todas*.
  - Filtros por categoria com ícones vetoriais e busca por nome.
  - Botões de cópia rápida de ID/Gamertag e abertura de links externos.

#### 7. Avançado & Diagnóstico
- Informações sobre engine de realtime, aceleração GPU, Modo Desenvolvedor e encerramento seguro de sessão.

---

### 📇 1.5. Card de Perfil Suspenso (`UserProfileHoverCard`)
- Exibição de banner, avatar sobreposto, indicador de status, tags, sobre mim, atividade Spotify ao vivo, coleção de jogos, hobbies, conexões ativas e input para mensagem rápida.
- Altura máxima restrita dinamicamente ao viewport (`window.innerHeight`), eliminando transbordamento de tela.
- Rolagem interna isolada (`e.stopPropagation()`), impedindo o fechamento acidental.

---

### 🌐 1.6. Página de Perfil do Usuário (`Profile.tsx`)
- Visualização completa do próprio perfil ou do perfil de amigos.
- Abas: *Sobre*, *Jogos*, *Hobbies* e *Conquistas*.
- Seção **Redes Conectadas** totalmente dinâmica, consumindo as redes ativas configuradas pelo usuário com ícones oficiais.

---

### 💬 1.7. Mensagens Diretas (`DirectMessage.tsx`)
- Conversas privadas em tempo real via Supabase WebSockets.
- Envio de mídias, anexos, emojis e gravação de áudio.
- Painel lateral com perfil do amigo e redes sociais ativas sincronizadas.
- Botões de chamada de voz e vídeo no cabeçalho com início instantâneo.

---

### 💻 1.8. Desktop & Build Portátil
- Configuração do Electron 29 sincronizado com o build web.
- Script de empacotamento portátil (`build:portable`) gerando executável standalone pronto para uso:
  - Localização: `apps/desktop/release-builds/Alura-win32-x64/Alura.exe`

---

## 2. Pendências & Próximos Passos

```
                                  MAPA DE PRÓXIMOS PASSOS
                                  
  [ PRIORIDADE 1 ]                 [ PRIORIDADE 2 ]                 [ PRIORIDADE 3 ]
  Servidores & Canais      ───►    Chamadas em Grupo        ───►   Notificações Desktop
  (Coração da Comunidade)          (Salas de Voz / SFU)             & VPS / Deploy
```

### 🔴 Prioridade 1: Servidores e Canais de Comunidade (O Coração da Alura)
*Atualmente temos toda a comunicação privada 1:1 (Amigos, Feed, DMs e Chamadas WebRTC P2P). O próximo passo fundamental é a estrutura coletiva de Servidores.*
1. **Sidebar de Servidores (Extrema Esquerda):**
   - Barra vertical de ícones com tooltips dos servidores que o usuário participa.
   - Botão `+` para criar ou entrar em um servidor.
   - Indicadores visuais de mensagens não lidas e menções.
2. **Criação e Gestão de Servidores:**
   - Modal para criar novo servidor (Nome, Ícone, Descrição, Diretrizes).
   - Configurações do Servidor: Visão Geral, Cargos (Roles/Permissões), Emojis customizados, Membros e Convites.
3. **Estrutura de Categorias e Canais:**
   - Criação de Categorias organizacionais (ex: `#geral`, `#jogos`, `#dev`).
   - Canais de Texto (mensagens em tempo real, threads, anexos).
   - Canais de Voz (salas onde múltiplos usuários entram para conversar).
4. **Painel de Membros do Servidor:**
   - Lista lateral direita agrupada por Cargos (ex: *Fundador*, *Moderador*, *Membros*, *Offline*).

---

### 🟡 Prioridade 2: Chamadas em Grupo e Canais de Voz (WebRTC Mesh / SFU)
*Expandir o WebRTC P2P 1:1 já construído para suportar salas de voz coletivas.*
1. **Conexão em Canais de Voz:**
   - Conexão em salas coletivas com múltiplos participantes.
   - Detecção de quem está falando com anel luminoso verde em tempo real.
2. **Janela Flutuante (Picture-in-Picture / Mini-player):**
   - Manter a chamada ativa em um widget flutuante no canto da tela enquanto o usuário navega por outros canais ou servidores.
3. **Servidor TURN / Coturn na VPS:**
   - Configuração do Coturn na VPS própria para garantir conectividade de chamadas em qualquer rede com NAT simétrico ou firewall corporativo.

---

### 🟢 Prioridade 3: Deploy do Backend Phoenix na VPS & Notificações Desktop
1. **Deploy do Backend Elixir / Phoenix na VPS:**
   - Colocar o backend oficial em produção na VPS para assumir a lógica central de realtime e orquestração de salas.
2. **Notificações Nativas do Windows:**
   - Notificações do sistema operacional para menções, mensagens e chamadas mesmo com o app minimizado.
3. **Bandeja do Sistema (System Tray):**
   - Minimizar para a bandeja ao fechar com menu rápido (Disponível, Mudo, Sair).

---

## 3. Resumo dos Principais Arquivos do Sistema de Chamadas

| Arquivo | Descrição das Alterações |
| :--- | :--- |
| `CallSignalingService.ts` | Serviço de sinalização em tempo real via Supabase Realtime Broadcast (WebSockets) com fallback DB e sincronização de canais com `ensureChannelJoined`. |
| `useWebRTCCall.ts` | Hook de chamadas WebRTC P2P com gerenciamento de estado, cancelamento acústico de eco (AEC), supressão de ruído, streams de áudio/vídeo/tela e resolução de closures obsoletas via `useRef`. |
| `CallOverlay.tsx` | Interface de overlay da chamada com tema dinâmico, `<video>` remoto com `muted` para eliminar áudio duplicado, ringtone em loop sem sobreposição e botões de Atender/Recusar. |
| `DirectMessage.tsx` | Integração dos botões de chamada no chat, despacho de dados do chamador (nome e avatar) e ponte IPC com Electron. |
| `SoundService.ts` | Engine de áudio com `startRingtone()` e `stopRingtone()`, reprodução em loop contínuo e controle de volume master. |
| `apps/desktop/main.js` | Janela nativa de chamada com `contextIsolation: true`, permissões de mídia para Electron e IPC bridge seguro. |
| `build-portable.js` | Empacotador portátil com `@electron/packager` gerando executável standalone. |

---

*Documento atualizado em 19/09/2026 para referência contínua da equipe Alura.*
