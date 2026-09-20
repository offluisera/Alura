# ALURA — PROJECT BASE

## 1. Identidade
**Nome:** Alura
**Categoria:** plataforma de comunidades e comunicação em tempo real.
**Posicionamento:** um ambiente social digital para comunidades, conversas, voz, vídeo, eventos e interação multimodal.

Tagline conceitual:
> Onde sua comunidade acontece.

## 2. Visão
A Alura nasce inspirada pela categoria de produtos de comunicação comunitária, incluindo Discord, mas deve desenvolver uma experiência própria.

A unidade central do produto é:
**Pessoa → Identidade → Amigos → Comunidade/Servidor → Space → Room → Conversa → Voz/Vídeo → Atividade**

## 3. Princípios
### Produto
- comunidade em primeiro lugar;
- realtime como fundamento;
- descoberta e identidade;
- baixa fricção para ações frequentes;
- evolução modular.

### Engenharia
- modularidade por domínio;
- contratos claros entre serviços;
- segurança por padrão;
- observabilidade;
- testes automatizados;
- decisões documentadas.

## 4. Linguagens e responsabilidades
### TypeScript
Frontend web e desktop; componentes; estado de UI; integração client-side; tipos e contratos compartilhados quando fizer sentido.

### Elixir
Backend principal; Phoenix; API; WebSockets; presença; eventos; mensagens; sessões; permissões; lógica de domínio.

### Python
IA/ML, classificação, moderação inteligente, embeddings, recomendação, transcrição, sumarização e serviços de inteligência.

### Rust
Workers e componentes de altíssimo desempenho, processamento paralelo, utilitários especializados e partes críticas de performance.

### C++
Processamento especializado de áudio/vídeo/codec quando houver necessidade real e comprovada. Não é linguagem padrão do backend.

## 5. Infraestrutura base
### Desenvolvimento
O servidor da Alura será executado inicialmente no próprio computador do desenvolvedor.

### Dados
PostgreSQL gerenciado pelo Supabase.

### Serviços Supabase
- PostgreSQL;
- Auth;
- Storage;
- Row Level Security;
- recursos de banco necessários ao produto.

### Realtime
Phoenix/Elixir é a camada principal de realtime da aplicação.

### Comunicação de mídia
WebRTC para voz, vídeo e compartilhamento de tela.

## 6. Arquitetura de alto nível
```text
Clients
  ├─ Web (React/TS)
  └─ Desktop (Electron/React/TS)
          │
          ▼
   API / Realtime
          │
    Phoenix / Elixir
          │
   ┌──────┼────────┐
   │      │        │
Domain  Events  Presence
   │      │        │
   └──────┼────────┘
          │
      Supabase
   ┌──────┼──────────┐
   │      │          │
Postgres Auth     Storage

Especializados:
Python → AI
Rust   → high performance
C++    → specialized media
```

## 7. Domínios principais
- Identity
- Profiles
- Friends
- Direct Messages
- Servers
- Spaces
- Rooms
- Roles & Permissions
- Messaging
- Media
- Voice/Video
- Presence
- Notifications
- Search
- Events
- Moderation
- Audit Logs
- AI
- Discover
- Integrations

## 8. Modelo conceitual
### Profile
Perfil global da pessoa.

### Server
Comunidade independente com membros, regras, cargos, permissões e espaços.

### Space
Agrupamento lógico de salas dentro do servidor.

### Room
Área de interação. Pode ser texto, voz, vídeo, fórum, anúncio, mídia ou outro tipo futuro.

### Message
Objeto de comunicação persistente, capaz de possuir respostas, reações, arquivos, referências e metadados.

## 9. Regras de ambiente
Separar:
- local;
- staging;
- production.

Nunca versionar secrets.
Usar variáveis de ambiente e mecanismos próprios de secret management.

## 10. Desenvolvimento incremental
### Fase 1 — Core
Auth, perfil, presença, amigos, servidores, spaces, rooms e chat.

### Fase 2 — Realtime
WebSockets, eventos, notificações e voz.

### Fase 3 — Mídia
Vídeo e screen share.

### Fase 4 — Plataforma
threads, busca, moderação, auditoria, eventos e descoberta.

### Fase 5 — Inteligência
IA, automações, recomendações e assistência.

## 11. Diretriz de extensão
Toda nova capacidade deve poder ser adicionada sem reescrever os domínios centrais.
Preferir contratos estáveis, eventos e módulos especializados.
