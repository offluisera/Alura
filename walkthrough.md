# Walkthrough: Inicialização do Backend Oficial Phoenix (Fase 1)

A base do backend oficial da **Alura** foi criada em [`apps/alura/`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/alura) seguindo rigorosamente as especificações do documento [`ALURA-PHOENIX-BACKEND-ANTIGRAVITY.md`](file:///c:/xampp/htdocs/AluraProjects/Alura/ALURA-PHOENIX-BACKEND-ANTIGRAVITY.md) e as regras do projeto.

---

## 📦 Arquivos e Módulos Criados

### 1. Configuração do Projeto e Dependências
- [`apps/alura/mix.exs`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/alura/mix.exs): Aplicação OTP `:alura`, dependências do Phoenix 1.7, Ecto SQL, Postgrex, Jason, CORSPlug e Telemetry.

### 2. Configurações por Ambiente
- [`apps/alura/config/config.exs`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/alura/config/config.exs): Configuração base do Endpoint, PubSub e JSON parser.
- [`apps/alura/config/dev.exs`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/alura/config/dev.exs): Configurações de desenvolvimento local.
- [`apps/alura/config/prod.exs`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/alura/config/prod.exs): Configurações para ambiente de produção.
- [`apps/alura/config/test.exs`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/alura/config/test.exs): Ambiente para testes ExUnit com sandbox Ecto.
- [`apps/alura/config/runtime.exs`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/alura/config/runtime.exs): Configuração dinâmica em runtime (lê `DATABASE_URL`, `SECRET_KEY_BASE`, `PHX_HOST` e `PORT`).

### 3. Núcleo da Aplicação (Core)
- [`apps/alura/lib/alura/application.ex`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/alura/lib/alura/application.ex): Supervision Tree contendo:
  - `Alura.Repo` (comunicação com Supabase)
  - `Alura.PubSub` (mensageria interna)
  - `AluraWeb.Presence` (rastreamento de status online/ausente/invisível)
  - `AluraWeb.Endpoint` (servidor HTTP e WebSocket)
- [`apps/alura/lib/alura/repo.ex`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/alura/lib/alura/repo.ex): Adaptador Ecto Postgres.

### 4. Camada Web & Realtime
- [`apps/alura/lib/alura_web.ex`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/alura/lib/alura_web.ex): Definições de macros para Controllers, Channels e Router.
- [`apps/alura/lib/alura_web/endpoint.ex`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/alura/lib/alura_web/endpoint.ex): Socket `/socket` com suporte a WebSockets e plug de CORS.
- [`apps/alura/lib/alura_web/router.ex`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/alura/lib/alura_web/router.ex): Rota pública `/health` e escopo `/api/v1`.
- [`apps/alura/lib/alura_web/controllers/health_controller.ex`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/alura/lib/alura_web/controllers/health_controller.ex): Health check com status do app e verificação ativa do banco.
- [`apps/alura/lib/alura_web/controllers/error_json.ex`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/alura/lib/alura_web/controllers/error_json.ex): Renderizador JSON de erros.
- [`apps/alura/lib/alura_web/channels/user_socket.ex`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/alura/lib/alura_web/channels/user_socket.ex): Roteamento de canais WebSockets.
- [`apps/alura/lib/alura_web/channels/presence.ex`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/alura/lib/alura_web/channels/presence.ex): Módulo Phoenix Presence.
- [`apps/alura/lib/alura_web/channels/call_channel.ex`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/alura/lib/alura_web/channels/call_channel.ex): Sinalização WebRTC para chamadas (`offer`, `answer`, `ice_candidate`, `screen_share_start`, `screen_share_stop`).

### 5. Empacotamento para Docker & VPS
- [`apps/alura/Dockerfile`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/alura/Dockerfile): Build multi-stage (compilação OTP release em imagem Debian Slim mínima).
- [`apps/alura/.dockerignore`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/alura/.dockerignore): Exclusão de arquivos temporários e dependências locais.
- [`apps/alura/.env.example`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/alura/.env.example): Template de variáveis de ambiente de produção.

---

## 🚀 Como Executar no VPS

1. Copiar a pasta `apps/alura` para `/opt/alura/phoenix` no VPS.
2. Criar o arquivo `.env` baseado em `.env.example` preenchendo as credenciais do Supabase.
3. No arquivo `/opt/alura/docker-compose.yml`, adicionar o serviço:
   ```yaml
   services:
     phoenix:
       build: ./phoenix
       restart: unless-stopped
       env_file: ./phoenix/.env
       networks:
         - alura-net
       ports:
         - "127.0.0.1:4000:4000"

   networks:
     alura-net:
       external: true
   ```
4. Subir com `docker compose up -d --build`.
