# ALURA — PHOENIX BACKEND / ANTIGRAVITY

## Objetivo
Criar o backend oficial da Alura com Elixir + Phoenix, preparado para produção, realtime e Supabase.

Arquitetura:
Alura.exe → Cloudflare → Nginx → Phoenix → Supabase

Phoenix é responsável por API, realtime, presença, autorização, eventos e sinalização WebRTC. WebRTC transporta áudio/vídeo/tela; Phoenix não transporta mídia pesada.

## Regras obrigatórias
1. Ler `ANTIGRAVITY-RULES.md`, `ALURA-PROJECT-BASE.md`, `ALURA-SPECIFICATIONS.md` antes de implementar.
2. Usar SuperAgente/Skills em tarefas multidomínio.
3. Não criar arquitetura genérica de tutorial.
4. Não colocar lógica crítica no Electron.
5. Não colocar secrets no código ou Git.
6. Não expor portas internas do Phoenix diretamente à Internet.
7. Não criar microserviços prematuramente.
8. Não usar dados fake como solução permanente.
9. Toda feature relevante deve ter testes.
10. Não duplicar responsabilidades do Supabase sem necessidade.
11. Não copiar a arquitetura interna do Discord.
12. Antes de adicionar dependências, justificar necessidade.

## Stack
- Elixir
- Phoenix
- Phoenix Channels
- Phoenix.Presence
- Ecto
- PostgreSQL/Supabase
- Jason
- ExUnit
- Docker

## Estrutura
```text
apps/
  alura/
    lib/
      alura/
        accounts/
        profiles/
        friendships/
        direct_messages/
        communities/
        spaces/
        rooms/
        roles/
        permissions/
        messages/
        notifications/
        presence/
        search/
        moderation/
        audit/
        calls/
        integrations/
        events/
      alura_web/
        controllers/
        channels/
        plugs/
        components/
        endpoint.ex
        router.ex
    test/
      alura/
      alura_web/
config/
priv/repo/
docker/
docs/
```

Se umbrella não for necessária, usar uma aplicação Phoenix simples com os mesmos limites de domínio. Não criar umbrella apenas por estética.

## Domínios

### Accounts
Identidade, integração com Supabase Auth, sessão/token, estado da conta e acesso. Não duplicar senhas do Supabase.

### Profiles
Perfil global: username, display name, avatar, bio, jogos, hobbies e preferências públicas. Separar perfil global de perfil em comunidade.

### Friendships
Solicitar, aceitar, recusar, cancelar, remover, bloquear e listar amizades. Estados explícitos e validados.

### Direct Messages
Modelo:
`User → Conversation → ConversationMember → Message`
Suportar inicialmente conversas individuais, membros, mensagens, edição, exclusão lógica quando aplicável e realtime.

### Communities
Modelo:
`Community → Membership / Roles / Spaces`
Não copiar Discord.

### Spaces / Rooms
Espaços organizacionais e salas de texto, anúncio e voz. Tipos devem ser modelados no domínio, não como strings espalhadas.

### Roles / Permissions
Autorização centralizada. Nunca confiar em permissões vindas do cliente. Validar no backend operações sobre comunidade, espaço, sala, mensagem, membros, moderação e chamadas.

### Messaging
Mensagem deve possuir ID, conversa/sala, autor, conteúdo, timestamps e estado. Preparar índices para conversa/sala + data e autor. Paginar.

## Realtime
Usar Phoenix Channels e PubSub.

Canais conceituais:
```text
room:{id}
conversation:{id}
community:{id}
user:{id}
call:{id}
```

Eventos:
```text
message.created
message.updated
message.deleted
friend_request.created
friend_request.accepted
presence.updated
call.created
call.joined
call.left
call.signal
```

Validar autorização antes do `join`. Não enviar dados que o usuário não pode conhecer.

## Presence
Usar Phoenix.Presence. Estados:
`online`, `away`, `busy`, `invisible`, `offline`.

`invisible` não deve revelar presença online indevidamente. Presença efêmera não deve usar PostgreSQL como fonte primária.

## WebRTC
Phoenix cuida de criação de chamada, entrada/saída, presença, permissões e signaling.
WebRTC cuida de áudio, vídeo e compartilhamento de tela.

Não implementar SFU agora. Preparar interfaces para futura infraestrutura de mídia.

## Supabase
Usar PostgreSQL, Auth e Storage. Criar camada de integração, por exemplo:
`Alura.Integrations.Supabase`

Não espalhar chamadas Supabase pelo domínio. Secrets somente por environment variables/secrets.

## Banco
Usar Ecto e migrations. Aplicar foreign keys, unique constraints, índices, timestamps e constraints de banco quando aplicável.

## API
Versionar:
`/api/v1/...`

Categorias iniciais:
```text
/api/v1/me
/api/v1/profile
/api/v1/friends
/api/v1/conversations
/api/v1/messages
/api/v1/communities
/api/v1/spaces
/api/v1/rooms
/api/v1/notifications
/api/v1/calls
```

Criar somente endpoints necessários a casos de uso reais.

## Autenticação
Fluxo:
`token → authentication plug → current_user → authorization → context/domain`

Nunca confiar em `user_id` enviado pelo cliente para definir identidade.

Separar Authentication, Authorization e Business Logic.

## Segurança
Implementar validação de entrada, autorização server-side, rate limiting quando necessário, proteção contra abuso, logs de segurança, audit logs administrativos, secrets fora do Git, CORS restritivo quando aplicável e TLS em produção.

Nunca logar senha, tokens, refresh tokens ou chaves sensíveis.

## Observabilidade
Preparar Logger, métricas, health check, readiness e erros estruturados.

Criar:
`GET /health`

Preparar `/health/live` e `/health/ready` quando necessário.

## Performance
Considerar recursos do VPS: 2 vCPU / ~4 GB RAM.
Priorizar queries indexadas, evitar N+1, paginação, backpressure, timeouts e limites de payload. Otimizar com base em medição.

## Supervision Tree
Conceito:
```text
Alura.Application
 ├── Ecto Repo
 ├── Phoenix.PubSub
 ├── Phoenix.Presence
 ├── RateLimiter
 ├── Background Workers
 └── Endpoint
```

## Jobs
Não executar tarefas pesadas dentro de requests. Preparar para notificações, sincronizações e manutenção. Adicionar biblioteca de jobs somente quando houver necessidade real.

## Docker
Criar Dockerfile multi-stage, imagem enxuta, build reproduzível, healthcheck e configuração por environment.

Produção:
`Cloudflare → Nginx → Phoenix container`

Não publicar `4000:4000` para a Internet. Usar a rede Docker `alura-net`.

## Variáveis
Criar `.env.example`, nunca versionar `.env`.

Exemplos:
```text
PHX_HOST=
PORT=4000
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SECRET_KEY_BASE=
ERLANG_COOKIE=
PHX_SERVER=true
```

Service role key só onde realmente for necessária.

## Nginx
Domínios:
`alura.net.br`
`api.alura.net.br`
`ws.alura.net.br`

Encaminhar API para Phoenix e WebSocket com upgrade correto. Phoenix não fica diretamente exposto.

## Desenvolvimento
O backend deve funcionar localmente sem depender do VPS:
`Developer → Phoenix local → Supabase`

Deploy:
`Git → Docker build → VPS → Nginx → Phoenix`

## Ordem de implementação
### Fase 1
Phoenix, Ecto, ambiente, `/health`, supervision tree, Dockerfile, `.dockerignore`, `.env.example`.

### Fase 2
Accounts, Profiles, autenticação e autorização.

### Fase 3
Friends e Notifications.

### Fase 4
Communities, Spaces, Rooms, Roles e Permissions.

### Fase 5
Conversations, Messages, Channels e Presence.

### Fase 6
Calls e WebRTC signaling.

### Fase 7
Search, Moderation, Audit e jobs.

### Fase 8
Observabilidade, performance, hardening e produção.

## Testes
Obrigatórios:
- unitários de contextos e regras
- integração de API/autenticação/banco
- segurança e isolamento entre usuários/comunidades
- Channels
- Presence
- realtime
- migrations

Nenhuma feature importante está concluída sem testes.

## Critérios de aceite
- Phoenix inicia sem erros
- Ecto conecta
- `/health` funciona
- Docker build funciona
- container inicia
- testes passam
- autenticação funciona
- autorização é server-side
- Channels funcionam
- Presence funciona
- mensagens realtime funcionam
- nenhuma porta interna é exposta publicamente
- secrets não estão no Git
- logs não expõem credenciais
- migrations funcionam
- documentação de setup existe

## Instrução final para o Antigravity
Não implementar tudo de uma vez.

Para cada fase:
`analisar → planejar → implementar → testar → build → validar → corrigir → documentar`

Antes de alterar arquitetura existente, verificar o repositório.

Quando houver decisão não definida, escolher a solução mais simples que preserve segurança, modularidade, realtime, escalabilidade futura, manutenção, Supabase, Docker e Electron.

Não inventar funcionalidades. Não copiar Discord.

**Objetivo imediato:** entregar uma base Phoenix funcional, testável, containerizável e preparada para evoluir para o realtime da Alura.
