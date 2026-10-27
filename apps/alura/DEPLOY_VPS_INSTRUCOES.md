# Alura — Guia de Deploy do Backend Elixir Phoenix no VPS

Este guia contém o passo a passo exato e seguro para colocar o backend oficial Phoenix em produção no VPS (Ubuntu 24.04 com aaPanel e Docker).

---

## 1. Visão Geral da Arquitetura em Produção

```text
Usuários / Desktop App (Alura.exe)
        │
        ▼ (HTTPS / WSS)
   Cloudflare (SSL Full Strict / DDoS Protection)
        │
        ▼
   Nginx do aaPanel (Portas 80 e 443)
        │
        ├─ api.alura.net.br ──► Proxy Reverso ──► 127.0.0.1:4000 (HTTP / REST)
        └─ ws.alura.net.br  ──► Proxy Reverso ──► 127.0.0.1:4000/socket (WebSockets)
                                                           │
                                                           ▼
                                                Container Docker (alura_phoenix)
                                                (Isolado na rede alura-net)
                                                           │
                                                           ▼
                                                Supabase (PostgreSQL / Auth)
```

---

## 2. Passo a Passo de Instalação no VPS

### Passo 2.1: Enviar os Arquivos do Phoenix para o VPS

No terminal da sua máquina local (ou via File Manager do aaPanel), envie o conteúdo da pasta `apps/alura/` para `/opt/alura/phoenix/`:

```bash
# Executado na sua máquina local (Windows PowerShell com scp ou WSL):
scp -r apps/alura/* root@193.202.85.89:/opt/alura/phoenix/
```

*Alternativa via aaPanel:*
1. Compacte a pasta `apps/alura` em um arquivo `.zip`.
2. Acesse o aaPanel > **Files** > navegue até `/opt/alura/phoenix/`.
3. Faça o upload do `.zip` e descompacte os arquivos diretamente lá.

---

### Passo 2.2: Configurar o Arquivo `.env` de Produção

No VPS, acesse o diretório e crie o `.env`:

```bash
cd /opt/alura/phoenix
cp .env.example .env
nano .env
```

---



#### 📋 Guia Detalhado: Como Obter Cada Chave Secreta

Abaixo está o mapa exato de onde encontrar e como gerar cada valor necessário:

| Variável | Onde Obter / Como Gerar | Finalidade |
| :--- | :--- | :--- |
| **`SECRET_KEY_BASE`** | Gerada via terminal no próprio VPS (comando abaixo) | Assinatura de sessões, cookies e sockets Phoenix |
| **`DATABASE_URL`** | Supabase Dashboard > **Project Settings** > **Database** > **Connection string** | Conexão Ecto / PostgreSQL com pooler |
| **`SUPABASE_URL`** | Supabase Dashboard > **Project Settings** > **API** > **Project URL** | Endpoint base da API Supabase |
| **`SUPABASE_ANON_KEY`** | Supabase Dashboard > **Project Settings** > **API** > **anon public** | Chave pública de cliente Supabase |
| **`SUPABASE_SERVICE_ROLE_KEY`** | Supabase Dashboard > **Project Settings** > **API** > **service_role secret** | Chave administrativa com bypass de RLS |
| **`SUPABASE_JWT_SECRET`** | Supabase Dashboard > **Project Settings** > **API** > **JWT Settings** > **JWT Secret** | Validação nativa de JWTs no UserSocket Phoenix |

---

##### 1. `SECRET_KEY_BASE` (Gerar via Terminal)
Gere uma chave criptográfica aleatória de 64 bytes rodando no terminal do VPS:
```bash
openssl rand -base64 64 | tr -d '\n'
```
*Ou via Node.js em qualquer máquina:*
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copie a sequência longa gerada e cole no `SECRET_KEY_BASE=`.

---

##### 2. `DATABASE_URL` (Supabase Connection String)
Seus parâmetros reais de conexão (fornecidos pelo seu painel Supabase):
- **Host direto:** `db.xtfblkmufvgvsxzydzkl.supabase.co`
- **Porta:** `5432` (direta) ou `6543` (pooler)
- **Database:** `postgres`
- **User:** `postgres`

**Formatos de URL válidos para o Phoenix:**

1. **Conexão Direta (Porta 5432 — Recomendada):**
   ```text
   postgresql://postgres:[SUA-SENHA]@db.xtfblkmufvgvsxzydzkl.supabase.co:5432/postgres?ssl=true
   ```

2. **Conexão via Pooler (Porta 6543):**
   ```text
   postgresql://postgres.xtfblkmufvgvsxzydzkl:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?ssl=true
   ```

> ⚠️ **Atenção com Caracteres Especiais na Senha (Percent-Encoding):**
> Se sua senha contiver caracteres especiais (como `@`, `#`, `$`, `%`, `&`, `!`, `+`, `/`), eles **precisam** ser codificados na URL (Percent-Encoded). Caso contrário, a URL quebra e o Phoenix não conecta.
> - `@` ➔ `%40`
> - `#` ➔ `%23`
> - `$` ➔ `%24`
> - `%` ➔ `%25`
> - `&` ➔ `%26`
> - `+` ➔ `%2B`
> - `/` ➔ `%2F`
> - `:` ➔ `%3A`
> - `?` ➔ `%3F`
>
> *Exemplo:* se a senha for `Minha@Senha#123`, na URL ficará: `Minha%40Senha%23123`.

> 💡 *Se não lembrar da senha:* no Supabase, em **Project Settings** > **Database** > seção **Database password**, clique em **Reset database password** e crie uma nova senha simples (letras e números facilitam e evitam escape de caracteres).

---

##### 3. `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`
1. No menu lateral do Supabase, clique em **Project Settings** (engrenagem) > **API**.
2. **`SUPABASE_URL`**: Copie o valor exibido em **Project URL** (ex: `https://xtfblkmufvgvsxzydzkl.supabase.co`).
3. **`SUPABASE_ANON_KEY`**: Na seção **Project API Keys**, copie a chave da linha identificada como `anon` `public`. *(É a mesma chave que já está no seu frontend em `apps/web/.env.local`).*
4. **`SUPABASE_SERVICE_ROLE_KEY`**: Na mesma seção **Project API Keys**, clique no botão para revelar a chave `service_role` `secret` e copie-a.
   > ⚠️ **Atenção:** A chave `service_role` tem acesso total ao banco e NUNCA deve ser enviada para o Git nem exposta no frontend. Ela deve ficar apenas no `.env` do VPS.

---

##### 4. `SUPABASE_JWT_SECRET`
1. No menu **Project Settings** > **API**.
2. Role a tela até a seção **JWT Settings**.
3. Localize o campo **JWT Secret**, clique no ícone de olho para revelar e copie o valor.
4. O Phoenix usa essa chave para verificar as assinaturas dos tokens de login dos usuários diretamente em memória no handshake do WebSocket (latência < 0.1ms).

---

#### 📝 Exemplo de `.env` Pronto e Preenchido

```env
PORT=4000
PHX_HOST=api.alura.net.br
PHX_SERVER=true
POOL_SIZE=10

SECRET_KEY_BASE=d41d8cd98f00b204e9800998ecf8427e5f993d56a23f1b4c8a9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b
DATABASE_URL=postgresql://postgres:SuaSenhaAqui@db.xtfblkmufvgvsxzydzkl.supabase.co:5432/postgres?ssl=true
SUPABASE_URL=https://xtfblkmufvgvsxzydzkl.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=super-secret-jwt-key-do-supabase
```
Salve o arquivo (`Ctrl + O`, `Enter` e `Ctrl + X` no nano).

### Passo 2.3: Atualizar o `/opt/alura/docker-compose.yml`

Copie o arquivo `apps/alura/docker-compose.yml` para `/opt/alura/docker-compose.yml`:

```bash
cp /opt/alura/phoenix/docker-compose.yml /opt/alura/docker-compose.yml
```

O conteúdo deve ser:
```yaml
version: '3.8'

services:
  phoenix:
    build:
      context: ./phoenix
      dockerfile: Dockerfile
    image: alura-phoenix:latest
    container_name: alura_phoenix
    restart: unless-stopped
    env_file:
      - ./phoenix/.env
    environment:
      - MIX_ENV=prod
      - PORT=4000
      - PHX_SERVER=true
    ports:
      - "127.0.0.1:4000:4000"
    networks:
      - alura-net
    deploy:
      resources:
        limits:
          cpus: '1.5'
          memory: 1024M
        reservations:
          memory: 256M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://127.0.0.1:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  alura-net:
    external: true
```

---

### Passo 2.4: Compilar e Subir o Container Phoenix

No VPS, dentro de `/opt/alura/`:

```bash
cd /opt/alura
docker compose up -d --build
```

Verifique se o container subiu com sucesso e acompanhe os logs:

```bash
# Ver status do container
docker ps

# Ver logs em tempo real
docker logs -f alura_phoenix
```

Aguarde a mensagem:
`[info] Running AluraWeb.Endpoint with Bandit at 0.0.0.0:4000 (http)`

Teste o healthcheck localmente dentro do VPS:
```bash
curl http://127.0.0.1:4000/health
# Resposta esperada: {"app":"alura","database":"connected","status":"ok","version":"0.1.0"}
```

---

### Passo 2.5: Configurar os Domínios no Nginx do aaPanel

No painel do aaPanel:

1. Vá em **Website** > **Add site**:
   - Crie o site: `api.alura.net.br`
   - Crie o site: `ws.alura.net.br`
2. No menu de cada site, clique em **SSL** e ative o certificado (Let's Encrypt ou Cloudflare Origin CA).
3. No site `api.alura.net.br`:
   - Clique em **Config** (ou **Reverse Proxy** > **Add reverse proxy**):
   - Proxy Name: `phoenix-api`
   - Target URL: `http://127.0.0.1:4000`
   - Sent domain: `$host`
4. No site `ws.alura.net.br`:
   - Adicione o proxy reverso para `http://127.0.0.1:4000`
   - **Crucial:** Na aba **Config** do site, certifique-se de que o bloco de `/socket` contenha os cabeçalhos de upgrade:
     ```nginx
     location /socket {
         proxy_pass http://127.0.0.1:4000/socket;
         proxy_http_version 1.1;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection "upgrade";
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
         proxy_set_header X-Forwarded-Proto $scheme;
         proxy_connect_timeout 86400s;
         proxy_read_timeout 86400s;
         proxy_send_timeout 86400s;
         proxy_buffering off;
     }
     ```
   *(Você também pode simplesmente colar as configurações prontas de [`apps/alura/nginx-vhosts-aapanel.conf`](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/alura/nginx-vhosts-aapanel.conf)).*

---

## 3. Validação Final de Produção

Após configurar o Nginx, teste a partir de qualquer computador:

```bash
# 1. Teste de Health Check da API
curl https://api.alura.net.br/health

# 2. Teste de Conexão WebSocket (via wscat ou browser)
npx wscat -c "wss://ws.alura.net.br/socket/websocket?vsn=2.0.0&user_id=test_dev"
# Resposta esperada: Conexão estabelecida!
```

---

## 4. O que o Backend Phoenix Já Entrega Automaticamente

1. **`AluraWeb.UserChannel` (`user:*`)**: Roteamento de ligações e notificações para usuários individuais com latência mínima.
2. **`AluraWeb.CallChannel` (`call:*`)**: Sinalização WebRTC 1:1 e salas coletivas com compartilhamento de tela e indicadores de espectadores (`stream_viewer_join/leave`).
3. **`AluraWeb.ServerVoiceChannel` (`server_voice:*`)**: Salas de voz de servidores com presença em tempo real, VAD (anéis de fala), sinalização Mesh e Soundboard sincronizado.
4. **`AluraWeb.RoomChannel` (`room:*`)**: Mensagens de texto em tempo real, indicador de digitação e reações com emojis.
5. **`AluraWeb.CommunityChannel` (`community:*`)**: Presença global e eventos administrativos da comunidade.
6. **`AluraWeb.Presence`**: Motor OTP distribuído que mantém os estados online/offline/away/busy em memória sem onerar o banco Postgres do Supabase.
