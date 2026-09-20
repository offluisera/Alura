# Alura — Progresso e Próximas Etapas (proxima.md)

*Data de Atualização: 18 de Setembro de 2026*  
*Versão do Produto: Alura v1.0.0 (Web & Desktop Portable)*

---

## 📌 1. Resumo do Progresso Concluído

### 1.1. Submenu Vertical "Minha Conta" (Design Anexo 2)
- **Visual**: Linha guia vertical contínua cinza (`border-l-2 border-white/10`) com indicador pill vertical branco ativo sobreposto (`w-[3px] h-4 bg-white rounded-full`).
- **Navegação Modular**:
  - **Perfil & Identidade**: Banner personalizável, avatar com presets temáticos da Alura, nome de exibição, username, bio, tags de personalidade, jogos favoritos, hobbies e prévia do perfil em tempo real.
  - **Spotify & Conexões**: Painel dedicado de status, conexão com Client ID, toggle de visibilidade para amigos, player em tempo real e simulador com faixas de teste.
  - **Dados da Conta**: E-mail verificado, nome de usuário, ID único (UUID) com botão de cópia rápida, data de ingresso, atalhos diretos para Senha/2FA e ações de encerramento de sessão.

### 1.2. Integração com Spotify (PKCE OAuth & Presença Musical)
- **Client ID Oficial**: `454201e9bd3f45f1a93d3d5b87be4fe9`.
- **Arquitetura OAuth 2.0 PKCE**:
  - Implementado fluxo `response_type=code` com criptografia `S256` (`code_verifier` aleatório de 64 caracteres e hash SHA-256 `code_challenge` em Base64URL).
  - Troca automática de código de autorização (`code`) por `access_token` e `refresh_token` via chamada POST à API do Spotify.
  - Renovação automática de sessão em background quando o token expira.
- **Leitura em Tempo Real**:
  - Polling e consulta à API `https://api.spotify.com/v1/me/player/currently-playing`.
  - Persistência das faixas no Supabase (`profiles.spotify_activity`, `profiles.spotify_connected`, `profiles.show_spotify_activity`).
- **Simulador Instantâneo**:
  - Botões de faixas de amostra (The Weeknd - *Starboy*, *Blinding Lights*, M83 - *Midnight City*) para testes imediatos sem dependência de aplicativo aberto.

### 1.3. Experiência Visual e Social da Música (Alura Design System)
- **No Perfil (`Profile.tsx`)**:
  - Componente `SpotifyActivityCard` em destaque na barra lateral do perfil.
  - Exibição de: capa do álbum em alta resolução, equalizador de ondas sonoras verdes animadas, título da música com link direto, artistas, nome do álbum, barra de progresso com contador dinâmico (MM:SS) e escuta via Supabase Realtime para visitantes.
- **Na Lista de Amigos (`FriendCard.tsx` e `Friends.tsx`)**:
  - Badge em tempo real `🎵 Ouvindo: {faixa} - {artista}` visível para todos os amigos na listagem social.
- **No Painel Inferior do Usuário (`UserPanel.tsx`)**:
  - Status dinâmico alternado mostrando a faixa em reprodução com ícone verde do Spotify.

### 1.4. Autenticação de Dois Fatores (2FA/MFA)
- TOTP funcional com QR Code para Google Authenticator / Authy.
- Chave secreta de contingência e 10 códigos de backup descartáveis.
- Modal de verificação de segundo fator integrado no fluxo de login (`Login.tsx`).

### 1.5. Compilação e Build
- **Web App**: `npm run build` validado com **código 0** (sem erros de compilação ou TypeScript).
- **Desktop Portable**: `npm run build:portable` gerou o executável executável independente em:
  `apps/desktop/release-builds/Alura-win32-x64/Alura.exe`.

---

## 🚀 2. Próximas Etapas e Roadmap Imediato

### Etapa 1: O Coração da Comunidade — Servidores e Canais (Prioridade Alta)
1. **Barra Lateral de Servidores (Server Sidebar)**:
   - Sidebar vertical fina à extrema esquerda com ícones dos servidores em formato arredondado/squircle com animação ao passar o mouse.
   - Botão `+` para criação/entrada em novos servidores.
   - Badges de notificações e mensagens não lidas.
2. **Criação e Gestão de Servidores**:
   - Modal de criação com nome do servidor, upload de ícone e categoria temática.
   - Armazenamento no banco de dados (`servers`, `server_members`, `server_channels`).
3. **Estrutura de Categorias e Canais de Texto**:
   - Lista hierárquica de canais (ex: `#geral`, `#bate-papo`, `#novidades`, `#suporte`).
   - Feed de mensagens do canal em tempo real com envio de anexos, imagens e menções `@usuario`.
4. **Cargos e Permissões Básicas**:
   - Níveis de acesso: Dono do Servidor, Administrador, Moderador e Membro.

---

### Etapa 2: Canais de Voz e Transmissão em Tempo Real (WebRTC)
1. **Canais de Voz no Servidor**:
   - Entrada e saída em canais de áudio com um clique.
   - Painel inferior de conexão de voz ativa (com ping/ms e botão de desconectar).
   - Indicador de fala verde em volta do avatar quando o microfone detecta áudio.
2. **Controles de Áudio**:
   - Mutar/Desmutar microfone e Ensurdecer áudio com atalhos de teclado.
   - Ajuste de volume individual por usuário na sala.
3. **Chamadas Diretas em DMs**:
   - Botão de ligar para amigos diretamente na tela de mensagens diretas (`DirectMessage.tsx`).

---

### Etapa 3: Rich Presence & Integrações Adicionais
1. **Detecção de Jogos no Desktop**:
   - Detectar processos em execução no Electron para exibir status "Jogando CS2", "Jogando Valorant", etc.
2. **Mais Conexões na Aba "Spotify & Conexões"**:
   - Conexão com Steam, GitHub e Twitch para exibição de perfil expandido.

---

## 🛠️ Como Executar o Projeto Atualmente

### Desenvolvimento Web:
```bash
cd apps/web
npm run dev
# Acesso: http://localhost:5173
```

### Compilar e Rodar Desktop Portable:
```bash
cd apps/desktop
npm run build:portable
# Executável gerado em: apps/desktop/release-builds/Alura-win32-x64/Alura.exe
```
