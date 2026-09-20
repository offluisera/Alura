# Guia de Configuração da VPS para Alura (Prompt Pronto para o ChatGPT)

> Este arquivo foi preparado para você **copiar e colar diretamente no ChatGPT** (ou qualquer IA). Ele contém todo o contexto técnico, arquitetura e requisitos da **Alura**, permitindo que o ChatGPT atue como seu Engenheiro DevOps Sênior e guie a configuração da sua VPS passo a passo.

---

## 📋 Como Usar este Guia

1. Abra uma nova conversa no **ChatGPT** (recomendado: GPT-4o ou Claude 3.5 Sonnet).
2. Copie o bloco abaixo (da seção **"PROMPT PARA O CHATGPT"** até o fim do arquivo).
3. Cole no chat e envie.
4. O ChatGPT irá assumir o papel de DevOps e pedirá informações da sua VPS (como IP, domínio e sistema operacional) para fornecer os comandos exatos de terminal.

---

# 🚀 INÍCIO DO PROMPT PARA O CHATGPT (COPIE A PARTIR DAQUI)

```markdown
Olá! Estou desenvolvendo a **Alura**, uma plataforma de comunidades e comunicação em tempo real inspirada no Discord (com identidade visual e arquitetura próprias).

Estou configurando minha própria **VPS** (servidor Linux, preferencialmente Ubuntu 22.04 ou 24.04 LTS) e preciso que você atue como meu **Senior DevOps Engineer & SysAdmin**.

Você irá me guiar passo a passo na preparação da máquina, sem pular etapas e me fornecendo os comandos exatos para rodar no terminal.

---

### 🏗️ Arquitetura da Alura

1. **Frontend Web & Desktop:**
   - Single Page Application (SPA) em **React 18 + TypeScript + Vite**.
   - Desktop empacotado em **Electron 29**.
   - O build estático (`dist/`) deve ser servido pelo **Nginx** com compressão e cache otimizado.

2. **Backend Realtime & API (Elixir / Phoenix):**
   - Linguagem oficial: **Elixir (Erlang/OTP)** com framework **Phoenix**.
   - Responsabilidade: API REST, autenticação, presença e **Phoenix Channels (WebSockets)** para mensageria e sinalização de chamadas em tempo real.
   - Porta padrão da aplicação: `4000`.

3. **Chamadas de Áudio, Vídeo e Tela (WebRTC):**
   - WebRTC P2P e preparação para SFU.
   - Preciso de um servidor **Coturn (STUN/TURN)** rodando na própria VPS para garantir que as ligações funcionem mesmo atrás de firewalls corporativos, roteadores com NAT simétrico ou redes móveis (4G/5G).

4. **Banco de Dados & Auth:**
   - PostgreSQL (atualmente conectado ao Supabase gerenciado, mas com possibilidade de hospedar banco local ou Postgres no Docker).

5. **Proxy Reverso & Segurança:**
   - **Nginx** como reverse proxy na frente do Phoenix e do Coturn.
   - **SSL/TLS gratuito via Let's Encrypt (Certbot)** para fornecer `https://` e `wss://` (requisito obrigatório dos navegadores para liberar o microfone e a câmera via `getUserMedia`).

---

### 🎯 O Que Eu Preciso Que Você Me Ensine e Configure Passo a Passo

Por favor, estruture nosso plano nas seguintes 6 etapas, esperando eu confirmar cada uma antes de avançarmos:

#### Etapa 1: Preparação Inicial da VPS & Firewall (UFW)
- Atualização de pacotes (`apt update && apt upgrade`).
- Criação de um usuário não-root com privilégios `sudo`.
- Configuração do Firewall **UFW** liberando as portas necessárias da Alura:
  - `22/tcp` (SSH)
  - `80/tcp` (HTTP para Let's Encrypt)
  - `443/tcp` (HTTPS / WSS)
  - `4000/tcp` (Backend Phoenix - apenas local via Nginx)
  - `3478/tcp` e `3478/udp` (Coturn STUN/TURN)
  - `5349/tcp` e `5349/udp` (Coturn TURNS seguro com TLS)
  - `49152:65535/udp` (Faixa de portas de mídia WebRTC relay)

#### Etapa 2: Instalação do Nginx e Certificado SSL (Certbot)
- Instalação e configuração do Nginx com suporte a WebSockets (`Upgrade` e `Connection`).
- Geração de certificados SSL gratuitos via `certbot --nginx` para meu domínio e subdomínios (ex: `app.meudominio.com`, `api.meudominio.com` e `turn.meudominio.com`).

#### Etapa 3: Instalação e Configuração do Coturn (STUN / TURN Server)
- Instalação do pacote `coturn`.
- Configuração do arquivo `/etc/turnserver.conf` com:
  - `realm`, `server-name`, autenticação por credenciais ou segredo estático (`static-auth-secret`).
  - Certificados SSL apontando para o Let's Encrypt.
  - Teste da conectividade TURN usando o testador oficial Trickle ICE.

#### Etapa 4: Ambiente Elixir & Erlang / OTP
- Instalação das versões estáveis de Erlang/OTP e Elixir (via pacotes oficiais ou `asdf`).
- Instalação do Hex e do Rebar (`mix local.hex --force && mix local.rebar --force`).
- Estrutura para rodar o backend Phoenix em modo produção (`MIX_ENV=prod`).

#### Etapa 5: Deploy e Gerenciamento do Serviço (Systemd ou Docker)
- Criação do serviço `systemd` para o backend Phoenix reiniciar automaticamente em caso de falha ou reboot da VPS.
- Rotação de logs com `journald` ou `logrotate`.
- (Opcional) Alternativa via `docker-compose` se for mais simples de manter.

#### Etapa 6: Conexão das Variáveis de Ambiente no Frontend Alura
- Quais variáveis devo configurar no `.env` do Vite / Electron para apontar para o servidor Phoenix, WebSockets e o servidor TURN recém-criados.

---

### 💬 Como Começar

Por favor, me responda primeiro confirmando que entendeu o escopo da **Alura** e me faça as perguntas iniciais necessárias (qual distribuição Linux estou usando, se já tenho um domínio apontado para o IP da VPS, etc.), para então iniciarmos a **Etapa 1**.
```

# 🛑 FIM DO PROMPT PARA O CHATGPT

---

## 📌 Checklist Rápido para Você Ter em Mãos Antes de Iniciar

Antes de colar o prompt no ChatGPT, certifique-se de ter:

- [ ] **IP público da VPS** (fornecido pela Hostinger, DigitalOcean, Hetzner, AWS, etc.).
- [ ] **Acesso SSH** (`ssh root@ip-da-vps`).
- [ ] **Domínio próprio** (ex: `meudominio.com` no Registro.br, Cloudflare, Namecheap, etc.).
- [ ] **Registros DNS tipo A** apontando para o IP da sua VPS:
  - `@` (ou `app.meudominio.com`) ➔ `IP_DA_VPS` (Frontend Alura)
  - `api.meudominio.com` ➔ `IP_DA_VPS` (Backend Phoenix / WebSockets)
  - `turn.meudominio.com` ➔ `IP_DA_VPS` (Servidor Coturn STUN/TURN)

---

*Arquivo gerado para o projeto Alura — pronto para uso com o ChatGPT.*
