# ALURA — ESTADO ATUAL DO PROJETO & BRIEFING TÉCNICO PARA O CHATGPT

> **Instruções para o Usuário:** Copie todo o conteúdo deste arquivo e envie diretamente para o **ChatGPT** (ou Claude/qualquer IA). Este briefing fornece o diagnóstico exato, a arquitetura consolidada e as restrições da sua VPS, evitando que a IA sugira comandos destrutivos ou incompatíveis com o que já está configurado.

---

## 📋 CONTEXTO GERAL DO PROJETO

A **Alura** é uma plataforma de comunicação e comunidades em tempo real inspirada no Discord, porém com arquitetura, UX e identidade visual próprias (Design System Alura).

- **Frontend Web & Desktop:** React 18 + TypeScript + Vite + Tailwind CSS + Electron 29. Executável portátil para Windows já homologado e funcional.
- **Backend Realtime & API:** Elixir (Erlang/OTP) + Phoenix Framework + Phoenix Channels + Phoenix Presence.
- **Mídia (Voz, Vídeo e Compartilhamento de Tela):** WebRTC com sinalização em tempo real via Phoenix Channels.
- **Banco de Dados & Autenticação:** Supabase remoto gerenciado (PostgreSQL, Auth e Storage). Não há banco local rodando no VPS para economizar recursos.

---

## 🖥️ ESPECIFICAÇÕES & ESTADO REAL DA VPS

### 1. Servidor & Hardware
- **Provedor:** LuraHosting VPS Starter (Datacenter em São Paulo)
- **Sistema Operacional:** Ubuntu 24.04.5 LTS
- **Recursos:** 2 vCores / 4 GB RAM / 50 GB NVMe
- **IPv4:** `193.202.85.89` | **Gateway:** `193.202.85.1` | **Máscara:** `255.255.255.0`
- **DNS Host:** `1.1.1.1` / `8.8.8.8`
- **Memória Swap:** 2 GB ativo em `/swapfile` com `vm.swappiness=10` configurado em `/etc/sysctl.d/99-alura-memory.conf`.

### 2. Domínio, DNS e Rede
- **Domínio Principal:** `alura.net.br`
- **Subdomínios Ativos:**
  - `api.alura.net.br` (API REST do Phoenix)
  - `ws.alura.net.br` (WebSockets / Phoenix Channels)
  - `mail.alura.net.br` (Servidor de e-mail)
- **Gerenciador de DNS & SSL:** **Cloudflare** gerenciando os registros e fornecendo terminação SSL/TLS.
- **PTR (Reverse DNS):** Solicitado ao provedor (`193.202.85.89` ➔ `mail.alura.net.br`).

### 3. Painel de Controle: aaPanel (ATENÇÃO CRÍTICA)
O servidor possui o **aaPanel** instalado e operando:
- **Serviços Ativos via aaPanel:**
  - **Nginx** (gerencia as portas `80/tcp` e `443/tcp`)
  - **Mail Server** (contas como `contato@alura.net.br`, `suporte@alura.net.br`)
- **Portas do aaPanel:** `888/tcp` e `30339/tcp`.
- ⚠️ **RESTRIÇÃO ABSOLUTA:** NÃO rodar `apt install nginx` ou `certbot` padrão via terminal. Isso corrompe o Nginx do aaPanel e derruba o servidor de e-mail. Qualquer vhost ou proxy reverso deve ser adicionado respeitando a estrutura do aaPanel ou incluindo arquivos em `/www/server/panel/vhost/nginx/`.

### 4. Firewall (UFW)
Portas abertas atualmente:
- SSH: `22/tcp`
- Web: `80/tcp`, `443/tcp`
- aaPanel: `888/tcp`, `30339/tcp`
- E-mail: `25`, `110`, `143`, `465`, `587`, `993`, `995/tcp`
- *Portas TURN/WebRTC (3478, 5349 e faixa UDP) ainda não foram abertas.*

### 5. Docker & Estrutura de Diretórios
- **Docker Engine:** `29.8.1`
- **Docker Compose:** `5.5.1`
- **Daemon Docker:** `/etc/docker/daemon.json` com rotação de logs (`10m`, max 3 arquivos) e `live-restore: true`.
- **Rede Docker Criada:** `alura-net` (driver: `bridge`).
- **Diretório do Projeto no VPS:**
  ```text
  /opt/alura/
  ├── docker/
  ├── nginx/
  ├── phoenix/       <-- Diretório reservado para o backend Phoenix (atualmente vazio)
  ├── web/
  ├── workers/
  ├── logs/
  └── docker-compose.yml
  ```
- **Arquivo `/opt/alura/docker-compose.yml` atual:**
  ```yaml
  services: {}

  networks:
    alura-net:
      external: true
  ```

---

## 🎯 O QUE PRECISAMOS QUE O CHATGPT FORNEÇA

Atue como nosso **Engenheiro DevOps & Arquiteto de Software Sênior** e nos guie nos seguintes passos específicos:

1. **Configuração dos Vhosts no Nginx do aaPanel:**
   - Configuração exata para `api.alura.net.br` fazendo proxy reverso para o container Phoenix (`http://127.0.0.1:4000` ou via rede Docker).
   - Configuração exata para `ws.alura.net.br` com cabeçalhos de upgrade WebSocket (`Upgrade $http_upgrade`, `Connection "upgrade"`).
   - Compatibilidade com o SSL/TLS gerenciado pelo Cloudflare (modo Full/Strict).

2. **Docker Compose para o Backend Phoenix (`/opt/alura/docker-compose.yml`):**
   - Definição do serviço Phoenix (`alura_phoenix`).
   - Conexão à rede existente `alura-net`.
   - Mapeamento de variáveis de ambiente (`SECRET_KEY_BASE`, `DATABASE_URL` do Supabase, `PHX_HOST=api.alura.net.br`, etc.).
   - Políticas de reinicialização (`restart: unless-stopped`) e limites de memória para respeitar os 4 GB do VPS.

3. **Estratégia para Coturn (STUN/TURN WebRTC):**
   - Avaliar se vale a pena subir o Coturn via container Docker na rede `alura-net` ou diretamente no host.
   - Quais regras exatas do UFW liberar para o Coturn sem expor a VPS desnecessariamente.

4. **Regra de Ouro:**
   - Nunca sugerir reinstalação de pacotes já controlados pelo aaPanel.
   - Fornecer comandos enxutos, seguros e prontos para execução no terminal Ubuntu 24.04.
