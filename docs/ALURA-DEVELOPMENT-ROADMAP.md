# ALURA — LINHA DE DESENVOLVIMENTO ATÉ O PRODUTO FINAL

## 0. Objetivo

Este documento define a sequência oficial de desenvolvimento da Alura, desde a preparação do ambiente local até uma versão de produção escalável.

A regra principal é:

> Construir primeiro o núcleo estável da plataforma; depois adicionar capacidades multimídia, inteligência e ecossistema.

Não antecipar tecnologias ou funcionalidades sem necessidade arquitetural comprovada.

---

# 1. Visão do produto final

A Alura será uma plataforma de comunicação e comunidades em tempo real, com:

- contas e identidade digital;
- perfis globais e perfis por servidor;
- amizades e mensagens diretas;
- servidores e espaços;
- chat em tempo real;
- threads, reações e mídia;
- presença e notificações;
- voz, vídeo e compartilhamento de tela;
- permissões e moderação;
- busca;
- eventos;
- descoberta de comunidades;
- IA;
- bots, integrações e automações;
- aplicações Web e Desktop.

Arquitetura-alvo:

```text
Web / Desktop
      ↓
TypeScript / React
      ↓
API + Realtime
      ↓
Elixir / Phoenix
      ↓
Domínio + Eventos + Presença
      ↓
Supabase / PostgreSQL / Storage / Auth

Serviços especializados:
Python → IA/ML
Rust   → alto desempenho
C++    → processamento multimídia especializado
WebRTC → voz / vídeo / screen share
```

---

# 2. FASE 00 — Governança e contrato do projeto

### Objetivo
Estabelecer as regras que impedem desvios durante todo o desenvolvimento.

### Entregas
- `ANTIGRAVITY-RULES.md`
- `ALURA-PROJECT-BASE.md`
- `ALURA-SPECIFICATIONS.md`
- regras de branch e commits;
- convenções de código;
- política de dependências;
- política de segurança;
- definição das linguagens;
- definição do Design System;
- critérios de aprovação de cada fase.

### Linguagens oficiais

**TypeScript**
- Web;
- Desktop;
- UI;
- estado de aplicação;
- integração com APIs.

**Elixir/Phoenix**
- backend principal;
- domínio;
- API;
- WebSockets/Channels;
- realtime;
- presença;
- eventos.

**Python**
- IA;
- machine learning;
- classificação;
- transcrição;
- recomendações;
- processamento inteligente.

**Rust**
- serviços de altíssimo desempenho;
- processamento especializado;
- workers de performance crítica.

**C++**
- processamento multimídia especializado;
- codecs/processamento de áudio e vídeo quando necessário.

**SQL**
- modelagem, consultas, índices, funções e migrações do PostgreSQL.

### Critério de conclusão
Nenhuma equipe/agente inicia uma nova fase sem respeitar esta arquitetura.

---

# 3. FASE 01 — Fundação do repositório

### Objetivo
Criar o esqueleto técnico e o ambiente de desenvolvimento local.

### Entregas
- monorepo;
- estrutura de diretórios;
- configuração Git;
- lint;
- formatter;
- type checking;
- testes;
- variáveis de ambiente;
- Docker quando necessário;
- scripts de desenvolvimento;
- documentação inicial;
- CI básica.

### Estrutura conceitual

```text
alura/
├── apps/
│   ├── web/
│   └── desktop/
├── services/
│   └── realtime/
├── packages/
│   ├── ui/
│   ├── types/
│   ├── config/
│   └── api-client/
├── ai/
├── native/
├── database/
├── docs/
└── tools/
```

### Critério de conclusão
O projeto deve iniciar localmente com um comando/documentação única e reproduzível.

---

# 4. FASE 02 — Alura Design System

### Objetivo
Criar a identidade visual antes da construção massiva das telas.

### Referências
- ReUI;
- VibePrompts;
- Kinetics;
- Motion;
- paleta Coolors fornecida.

### Entregas
- tokens de cor;
- tipografia;
- espaçamento;
- radius;
- sombras;
- elevação;
- estados;
- motion tokens;
- ícones;
- componentes;
- responsividade;
- acessibilidade;
- dark-first experience.

### Regra visual
A interface deve ser original e não reproduzir o layout do Discord.

### Critério de conclusão
Componentes fundamentais prontos e documentados:
Button, Input, Dialog, Dropdown, Tooltip, Avatar, Badge, Card, Tabs, Navigation, Context Menu, Toast, Modal, Scroll Area, Command Palette e Message primitives.

---

# 5. FASE 03 — Supabase e modelo de dados

### Objetivo
Criar a fundação persistente da plataforma.

### Entidades iniciais

```text
users
profiles
sessions
friend_requests
friendships
blocks
servers
server_members
roles
role_permissions
spaces
rooms
messages
message_reactions
message_attachments
threads
notifications
invites
audit_logs
```

### Entregas
- PostgreSQL;
- migrations;
- índices;
- constraints;
- RLS;
- Auth;
- Storage;
- seeds;
- estratégia de backup;
- estratégia de retenção.

### Critério de conclusão
Os dados críticos podem ser criados, consultados e protegidos de forma consistente.

---

# 6. FASE 04 — Backend Core com Elixir/Phoenix

### Objetivo
Criar o núcleo da Alura.

### Módulos

```text
Accounts
Profiles
Friends
Servers
Members
Roles
Permissions
Spaces
Rooms
Messages
Notifications
Presence
Audit
```

### Entregas
- API;
- autenticação/autorização;
- domínio;
- validações;
- eventos;
- WebSockets;
- Presence;
- tratamento de erros;
- observabilidade inicial.

### Critério de conclusão
O backend consegue sustentar o fluxo completo de autenticação, servidores, mensagens e presença.

---

# 7. FASE 05 — Web App

### Objetivo
Construir a experiência principal da Alura.

### Ordem

1. Login/registro
2. Onboarding
3. Perfil
4. Lista de amigos
5. Mensagens diretas
6. Servidores
7. Spaces/Rooms
8. Chat
9. Pesquisa local
10. Notificações
11. Configurações

### Critério de conclusão
Um usuário novo consegue:

```text
Criar conta
→ configurar perfil
→ adicionar amigo
→ criar servidor
→ criar room
→ enviar mensagem
→ receber mensagem em tempo real
→ configurar servidor
```

---

# 8. FASE 06 — Realtime e presença avançada

### Objetivo
Tornar a plataforma realmente viva.

### Recursos
- online/offline;
- ausente;
- ocupado;
- invisível;
- typing indicators;
- mensagem entregue;
- mensagem lida;
- eventos em tempo real;
- reconexão;
- sincronização após desconexão;
- presença por servidor/room.

### Critério de conclusão
A experiência continua consistente após quedas e reconexões de rede.

---

# 9. FASE 07 — Chat avançado e mídia

### Objetivo
Transformar mensagens em uma plataforma multimídia.

### Recursos
- markdown;
- respostas;
- threads;
- reações;
- edição;
- exclusão;
- anexos;
- imagens;
- vídeo;
- áudio;
- previews;
- upload progress;
- drag and drop;
- galerias;
- pesquisa de mídia.

### Critério de conclusão
O usuário consegue comunicar e compartilhar conteúdo rico sem comprometer estabilidade ou segurança.

---

# 10. FASE 08 — Desktop com Electron

### Objetivo
Levar a mesma experiência para Desktop.

### Entregas
- shell Electron;
- integração com sistema operacional;
- notificações desktop;
- tray;
- atalhos;
- deep links;
- abertura automática de links Alura;
- gerenciamento de múltiplas janelas quando necessário.

### Regra
A lógica de negócio continua compartilhada com Web/API; Electron não deve virar um segundo backend.

### Critério de conclusão
Web e Desktop têm comportamento funcional equivalente.

---

# 11. FASE 09 — Voz, vídeo e compartilhamento de tela

### Objetivo
Introduzir comunicação audiovisual.

### Base
**WebRTC**

### Recursos
- voice rooms;
- chamadas privadas;
- vídeo;
- screen share;
- mute;
- deaf;
- câmera;
- troca de dispositivo;
- teste de microfone;
- volume por usuário;
- reconexão;
- indicadores de fala;
- controles de chamada.

### Uso de Rust/C++
Somente quando existir necessidade técnica real para processamento de mídia.

### Critério de conclusão
Chamadas funcionais e estáveis em Web e Desktop.

---

# 12. FASE 10 — Sistema de moderação e segurança

### Objetivo
Preparar a Alura para comunidades reais.

### Recursos
- cargos;
- permissões granulares;
- timeout;
- kick;
- ban;
- bloqueio;
- filtros;
- denúncias;
- auditoria;
- logs;
- rate limiting;
- anti-spam;
- proteção de arquivos;
- segurança de sessões;
- proteção contra abuso.

### Critério de conclusão
Administradores conseguem controlar uma comunidade sem intervenção manual no banco.

---

# 13. FASE 11 — Busca global

### Objetivo
Tornar o conteúdo encontrável.

### Pesquisar
- mensagens;
- pessoas;
- servidores;
- rooms;
- arquivos;
- threads;
- eventos.

### Recursos
- filtros;
- paginação;
- relevância;
- ordenação;
- pesquisa rápida;
- Command Palette.

### Critério de conclusão
A busca funciona como ferramenta central, não apenas como filtro de uma tela.

---

# 14. FASE 12 — Notificações e experiência avançada

### Objetivo
Criar retenção e continuidade de uso.

### Entregas
- notificações in-app;
- desktop;
- preferências;
- menções;
- replies;
- convites;
- eventos;
- configurações por servidor/room;
- estados vazios;
- onboarding contextual.

### Critério de conclusão
O usuário consegue controlar completamente o que recebe e quando recebe.

---

# 15. FASE 13 — IA / Alura Intelligence

### Objetivo
Adicionar inteligência sem contaminar o Core.

### Python
Criar serviços independentes para:

- moderação inteligente;
- classificação;
- resumo de conversas;
- resumo de threads;
- transcrição;
- tradução;
- busca semântica;
- recomendações;
- assistente;
- automações inteligentes.

### Regra
IA é serviço complementar. O Core da Alura deve continuar funcional sem depender de IA.

### Critério de conclusão
Recursos de IA possuem limites, observabilidade, fallback e isolamento.

---

# 16. FASE 14 — Descoberta e comunidades públicas

### Objetivo
Transformar servidores em ecossistema.

### Recursos
- Discover;
- categorias;
- servidores públicos;
- busca;
- trending;
- novos servidores;
- recomendações;
- páginas públicas;
- convites.

### Critério de conclusão
Um usuário consegue descobrir e ingressar em comunidades sem convite direto.

---

# 17. FASE 15 — Eventos e atividades

### Objetivo
Expandir o conceito de comunidade.

### Recursos
- eventos;
- agenda;
- salas temporárias;
- transmissões;
- lembretes;
- atividades;
- presença rica;
- integrações futuras.

### Critério de conclusão
Servidores podem organizar atividades sem depender de ferramentas externas.

---

# 18. FASE 16 — Bots, integrações e automações

### Objetivo
Criar ecossistema extensível.

### Recursos
- bot accounts;
- webhooks;
- API pública controlada;
- OAuth;
- eventos;
- comandos;
- permissões de integração;
- automações.

### Critério de conclusão
Terceiros conseguem integrar funcionalidades sem acessar diretamente o banco da Alura.

---

# 19. FASE 17 — Performance e escala

### Objetivo
Preparar a plataforma para grandes comunidades.

### Ações
- profiling;
- índices;
- caching;
- filas;
- workers;
- otimização WebSocket;
- particionamento quando necessário;
- CDN;
- storage optimization;
- media optimization;
- observabilidade;
- load tests;
- stress tests.

### Rust
Introduzir somente nos pontos medidos como gargalos reais.

### C++
Introduzir somente em componentes multimídia que justifiquem sua complexidade.

### Critério de conclusão
As decisões de performance devem ser baseadas em métricas, não em suposições.

---

# 20. FASE 18 — Produção

### Objetivo
Preparar o lançamento público.

### Ambientes

```text
Local
  ↓
Development
  ↓
Staging
  ↓
Production
```

### Entregas
- secrets;
- domínio;
- TLS;
- CI/CD;
- logs;
- métricas;
- alertas;
- backups;
- recuperação de desastre;
- rate limits;
- monitoramento;
- política de segurança;
- páginas de erro;
- health checks.

### Critério de conclusão
A plataforma pode ser implantada, monitorada, atualizada e recuperada sem intervenção manual improvisada.

---

# 21. FASE 19 — Beta fechado

### Objetivo
Validar o produto com usuários reais.

### Avaliar
- estabilidade;
- onboarding;
- chat;
- voz;
- servidores;
- performance;
- erros;
- acessibilidade;
- retenção;
- experiência de uso.

### Regra
Feedback deve virar problema reproduzível, métrica ou requisito. Evitar alterações impulsivas.

---

# 22. FASE 20 — Beta público

### Objetivo
Validar escala e comunidade.

### Ações
- abertura gradual;
- monitoramento;
- suporte;
- moderação;
- análise de carga;
- correção de bugs;
- documentação;
- política de abuso;
- melhoria de onboarding.

---

# 23. FASE 21 — Release 1.0

A versão 1.0 somente deve acontecer quando:

- Core está estável;
- autenticação está segura;
- chat está confiável;
- realtime está estável;
- presença está consistente;
- servidores estão funcionais;
- permissões estão corretas;
- mídia está segura;
- voz/screen share são utilizáveis;
- observabilidade existe;
- backups existem;
- recuperação foi testada;
- Web e Desktop estão coerentes;
- documentação está atualizada.

---

# 24. FASE 22 — Pós-1.0

Depois do lançamento:

```text
Produto
  ↓
Métricas
  ↓
Feedback
  ↓
Priorização
  ↓
Experimentos
  ↓
Implementação
  ↓
Medição
```

Possíveis evoluções:

- monetização;
- servidores premium;
- creators;
- marketplace;
- temas;
- badges;
- plugins;
- automações avançadas;
- IA avançada;
- mobile;
- transmissão avançada;
- ferramentas para comunidades profissionais.

---

# 25. Ordem tecnológica oficial

A ordem recomendada de adoção é:

```text
1. TypeScript
2. React
3. Design System
4. Elixir/Phoenix
5. PostgreSQL/Supabase
6. WebSockets/Presence
7. WebRTC
8. Electron
9. Python
10. Rust
11. C++
```

Essa ordem pode ser alterada apenas quando uma necessidade técnica real for documentada.

---

# 26. Regra de não-desvio

O Antigravity deve sempre perguntar internamente:

```text
Isso é necessário para o estágio atual?
Isso respeita a arquitetura?
Isso pertence à linguagem correta?
Isso aumenta ou reduz a complexidade?
Isso preserva a identidade da Alura?
Isso pode ser testado?
Isso pode ser observado?
Isso é seguro?
```

Não implementar tecnologia apenas porque é interessante.

Não adicionar dependência sem justificativa.

Não criar microserviço sem necessidade.

Não antecipar otimização.

Não copiar interfaces externas.

Não quebrar contratos existentes para acelerar uma tarefa isolada.

---

# 27. Marcos do produto

## Marco A — Foundation

```text
Repositório
Design System
Auth
Supabase
Elixir
API
```

## Marco B — Core

```text
Profiles
Friends
Servers
Spaces
Rooms
Chat
Realtime
Presence
```

## Marco C — Communication

```text
DM
Media
Threads
Voice
Video
Screen Share
```

## Marco D — Community

```text
Roles
Permissions
Moderation
Search
Notifications
Events
Discover
```

## Marco E — Intelligence

```text
AI
Semantic Search
Moderation AI
Transcription
Assistant
```

## Marco F — Ecosystem

```text
Bots
API
Webhooks
OAuth
Automations
Integrations
```

## Marco G — Production

```text
Security
Performance
Observability
Staging
Production
Beta
1.0
```

---

# 28. Definição de pronto

Uma funcionalidade só está pronta quando:

1. funciona;
2. possui tratamento de erro;
3. possui estados de loading/empty/error quando aplicável;
4. é responsiva;
5. é acessível;
6. possui testes adequados;
7. respeita segurança;
8. possui observabilidade quando necessária;
9. não quebra funcionalidades existentes;
10. está documentada quando altera arquitetura ou comportamento.

---

# 29. Princípio final

A Alura deve ser desenvolvida em camadas:

```text
FUNDAÇÃO
   ↓
IDENTIDADE
   ↓
COMUNICAÇÃO
   ↓
COMUNIDADE
   ↓
MÍDIA
   ↓
INTELIGÊNCIA
   ↓
ECOSSISTEMA
   ↓
ESCALA
```

O objetivo não é chegar rapidamente a muitas funcionalidades.

O objetivo é construir um núcleo sólido que permita que cada nova camada seja adicionada sem destruir as anteriores.

> **Alura deve nascer simples por fora, sólida por dentro e preparada para crescer.**
