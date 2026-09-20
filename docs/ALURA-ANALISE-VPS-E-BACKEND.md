# ALURA — ANÁLISE COMPARATIVA VPS & BRIEFING TÉCNICO PARA O CHATGPT

> **Para enviar ao ChatGPT (ou Claude/qualquer IA):** Copie todo o conteúdo deste arquivo. Ele contém o diagnóstico técnico completo da VPS, o estado atual da aplicação e as restrições arquiteturais para que a IA atue como Engenheiro DevOps Sênior sem sugerir comandos que quebrem o servidor.

---

## 1. Contexto Geral do Projeto Alura

A **Alura** é uma plataforma de comunicação e comunidades em tempo real inspirada no Discord, porém com arquitetura, UX e identidade visual próprias (Design System Alura).

- **Frontend Web & Desktop:** React 18 + TypeScript + Vite + Tailwind CSS + Electron 29. Executável portátil para Windows homologado e funcional (`build:portable`).
- **Backend Realtime & API:** Elixir (Erlang/OTP) + Phoenix Framework + Phoenix Channels + Phoenix Presence.
- **Mídia (Voz, Vídeo e Compartilhamento de Tela):** WebRTC com sinalização em tempo real via Phoenix Channels. Mídia P2P inicial, com previsão de Coturn (STUN/TURN).
- **Banco de Dados & Autenticação:** Supabase remoto gerenciado (PostgreSQL, Auth e Storage). Sem banco local na VPS para poupar recursos.

---

## 2. Especificações e Estado Real da VPS

### 2.1. Hardware e Sistema Operacional
- **Provedor:** LuraHosting VPS Starter (Datacenter em São Paulo)
- **Sistema Operacional:** Ubuntu 24.04.5 LTS
- **Recursos:** 2 vCores / 4 GB RAM / 50 GB NVMe
- **IPv4:** `193.202.85.89` | **Gateway:** `193.202.85.1` | **Máscara:** `255.255.255.0`
- **DNS Host:** `1.1.1.1` / `8.8.8.8`
- **Swap:** 2 GB ativo em `/swapfile` com `vm.swappiness=10` configurado em `/etc/sysctl.d/99-alura-memory.conf`.

### 2.2. Domínio, DNS e SSL/TLS
- **Domínio Principal:** `alura.net.br`
- **Subdomínios Ativos:**
  - `api.alura.net.br` ➔ API REST Phoenix
  - `ws.alura.net.br` ➔ WebSockets / Phoenix Channels
  - `mail.alura.net.br` ➔ Servidor de e-mail
- **Gerenciador de DNS & SSL:** **Cloudflare** gerenciando os registros e fornecendo terminação SSL/TLS (modo Full/Strict).
- **PTR (Reverse DNS):** Solicitado ao provedor (`193.202.85.89` ➔ `mail.alura.net.br`).

### 2.3. Painel de Controle: aaPanel (ATENÇÃO CRÍTICA)
O servidor possui o **aaPanel** instalado e operando:
- **Serviços Ativos via aaPanel:**
  - **Nginx** (gerencia portas `80/tcp` e `443/tcp`)
  - **Mail Server** (contas como `contato@alura.net.br`, `suporte@alura.net.br`)
- **Portas do aaPanel:** `888/tcp` e `30339/tcp`.
- ⚠️ **RESTRIÇÃO ABSOLUTA:** NÃO instalar Nginx avulso via `apt install nginx` ou `certbot` padrão via terminal. Isso corrompe o Nginx do aaPanel e derruba o servidor de e-mail. Qualquer vhost ou proxy reverso deve ser adicionado respeitando a estrutura do aaPanel ou incluindo arquivos em `/www/server/panel/vhost/nginx/`.

### 2.4. Firewall (UFW)
Portas abertas atualmente:
- SSH: `22/tcp`
- Web: `80/tcp`, `443/tcp`
- aaPanel: `888/tcp`, `30339/tcp`
- E-mail: `25`, `110`, `143`, `465`, `587`, `993`, `995/tcp`
- *Portas TURN/WebRTC (3478, 5349 e faixa UDP relay) ainda não foram abertas.*

### 2.5. Docker e Estrutura de Diretórios
- **Docker Engine:** `29.8.1` | **Docker Compose:** `5.5.1`
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

## 3. Matriz Comparativa: Realidade da VPS vs Guias

| Componente | Configuração Atual no VPS (`ALURA-VPS-CONFIGURACAO-ATUAL.md`) | Guia Externo (`GUIA_VPS_CHATGPT.md`) | Arquitetura Oficial (`ALURA-PHOENIX-BACKEND-ANTIGRAVITY.md`) | Veredito Técnico |
|---|---|---|---|---|
| **Sistema Operacional** | Ubuntu 24.04.5 LTS (2 vCore, 4 GB RAM, 2 GB Swap) | Sugere Ubuntu 22.04 / 24.04 LTS | Especificado para 2 vCPU / ~4 GB RAM | **Alinhado.** Máquina pronta com swap. |
| **Webserver / Proxy** | aaPanel gerenciando Nginx e Mail Server | Pede instalação de Nginx nativo via `apt` + Certbot | Nginx atuando como proxy reverso para a rede `alura-net` | **Não usar `apt install nginx`.** Usar o Nginx já integrado ao aaPanel. |
| **Ambiente Phoenix** | Docker Engine 29.8.1 + Compose + rede `alura-net` | Sugere `asdf`, Erlang/OTP e Elixir nativos com Systemd | Container Docker multi-stage, isolado na rede `alura-net` (porta 4000 não exposta publicamente) | **Deploy via Docker Compose.** Mantém o host limpo e economiza memória da VPS. |
| **Banco de Dados** | Supabase externo (gerenciado) | Sugere Postgres local/Docker | Supabase (PostgreSQL + Auth + Storage) | **Sem banco local.** Supabase remoto economiza CPU e RAM essenciais para o Phoenix. |
| **DNS & SSL/TLS** | Domínio e subdomínios no Cloudflare | Let's Encrypt manual (Certbot) | Cloudflare → Nginx → Phoenix | Cloudflare já realiza a terminação e proteção SSL/TLS. |
| **Mídia & WebRTC** | P2P inicial. Sem Coturn instalado. Portas TURN fechadas | Coturn local (portas `3478`, `5349`, UDP `49152:65535`) | Phoenix para signaling; Coturn/TURN adicionado sob demanda | Inicialmente P2P com STUN público. Coturn será avaliado se houver falhas em NAT simétrico. |

---

## 4. O Que Precisamos Que o ChatGPT Forneça

Atue como nosso **Engenheiro DevOps Sênior & Arquiteto de Software** e forneça:

1. **Configuração dos Vhosts no Nginx do aaPanel:**
   - Configuração exata para `api.alura.net.br` fazendo proxy reverso para o container Phoenix (`http://127.0.0.1:4000` ou via rede Docker).
   - Configuração exata para `ws.alura.net.br` com cabeçalhos de upgrade WebSocket:
     ```nginx
     proxy_http_version 1.1;
     proxy_set_header Upgrade $http_upgrade;
     proxy_set_header Connection "upgrade";
     ```
   - Compatibilidade com a terminação SSL/TLS gerenciada pelo Cloudflare.

2. **Docker Compose para o Backend Phoenix (`/opt/alura/docker-compose.yml`):**
   - Definição do serviço Phoenix (`alura_phoenix`).
   - Conexão à rede externa existente `alura-net`.
   - Mapeamento de variáveis de ambiente (`SECRET_KEY_BASE`, `DATABASE_URL` do Supabase, `PHX_HOST=api.alura.net.br`, etc.).
   - Políticas de reinicialização (`restart: unless-stopped`) e limites de memória adequados para os 4 GB de RAM da VPS.

3. **Estratégia para Coturn (STUN/TURN WebRTC):**
   - Recomendar se o Coturn deve rodar em container Docker na rede `alura-net` ou no host.
   - Quais regras exatas do UFW liberar sem expor a VPS desnecessariamente.

4. **Diretrizes de Execução:**
   - Nunca sugerir reinstalação de pacotes já controlados pelo aaPanel.
   - Fornecer comandos enxutos, seguros e prontos para execução no terminal Ubuntu 24.04.
