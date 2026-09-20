# ALURA — SPECIFICATIONS

## 1. Objetivo do produto
Criar uma plataforma moderna de comunicação e comunidades em tempo real com:
- chat;
- mensagens diretas;
- amizades;
- perfis;
- servidores/comunidades;
- salas de texto;
- voz;
- vídeo;
- compartilhamento de tela;
- presença;
- notificações;
- mídia;
- moderação;
- futura camada de IA.

## 2. Identidade visual
Paleta base:
`#001609 #001B0B #00220E #002A12 #003014 #003516 #003C19 #00421B #004B1F #005322`

Direção visual:
- dark-first;
- profunda;
- tecnológica;
- elegante;
- orgânica;
- camadas de profundidade;
- bordas suaves;
- uso pontual de glass;
- tipografia forte;
- motion discreto e expressivo.

Evitar:
- estética neon gamer;
- estética genérica de dashboard;
- copiar layout do Discord;
- excesso de glassmorphism;
- animações decorativas sem função.

## 3. Layout proprietário
A navegação deve usar um modelo próprio baseado em identidade, contexto e espaço ativo.

Estrutura conceitual:
```text
Identity / Navigation | Active Space | Context
```

A interface deve permitir que o usuário entenda:
1. quem ele é;
2. em qual comunidade está;
3. em qual space/room está;
4. o que está acontecendo agora;
5. quais ações contextuais estão disponíveis.

## 4. Referências de design e skills
### VibePrompts
Usar como fonte de padrões de UX, prompts e ideias de interface; nunca copiar diretamente a identidade.

### ReUI
Usar componentes como primitives quando apropriado. A camada final deve ser o **Alura Design System**.

### Kinetics
Usar como referência para movimento, física, springs e transições com personalidade.

### Motion
Usar para animações declarativas e consistentes.

### Superagente
Usar como orquestrador de tarefas complexas, planejamento, delegação e validação quando a skill estiver disponível.

## 5. Alura Design System
Criar tokens para:
- colors;
- typography;
- spacing;
- radius;
- border;
- shadow;
- motion;
- duration;
- easing;
- breakpoints;
- layers/z-index.

Todo componente novo deve usar tokens. Não espalhar valores visuais arbitrários.

## 6. Identidade e perfis
### Perfil global
- avatar;
- banner;
- display name;
- username;
- bio;
- status;
- presença;
- atividades;
- badges;
- links.

### Perfil no servidor
Pode sobrescrever parcialmente:
- display name;
- avatar;
- descrição;
- cargos;
- cor/tema autorizado.

## 7. Amigos
Estados mínimos:
`NONE`, `PENDING_OUTGOING`, `PENDING_INCOMING`, `FRIENDS`, `BLOCKED`, `MUTED`, `REMOVED`.

Ações:
- enviar convite;
- aceitar;
- recusar;
- cancelar;
- remover;
- bloquear/desbloquear;
- silenciar;
- abrir DM;
- iniciar chamada.

## 8. Servidores
Cada servidor possui:
- identidade;
- proprietário;
- membros;
- cargos;
- permissões;
- spaces;
- rooms;
- convites;
- eventos;
- configurações;
- auditoria.

Tipos de Room previstos:
- text;
- voice;
- video;
- forum;
- announcements;
- media.

## 9. Permissões
Modelo inicial:
```text
VIEW_SERVER
MANAGE_SERVER
VIEW_ROOM
SEND_MESSAGE
EDIT_MESSAGE
DELETE_MESSAGE
CONNECT_VOICE
SPEAK
VIDEO
SCREEN_SHARE
MANAGE_MEMBERS
BAN_MEMBER
TIMEOUT_MEMBER
MANAGE_ROLES
MANAGE_ROOMS
MANAGE_EVENTS
MANAGE_WEBHOOKS
USE_AI
CREATE_BOT
CREATE_INTEGRATION
CREATE_AUTOMATION
```

Permissões devem ser verificadas no backend.

## 10. Mensagens
Suportar:
- texto;
- markdown controlado;
- emoji;
- reações;
- replies;
- threads;
- citações;
- arquivos;
- imagens;
- áudio;
- vídeo;
- links/embeds;
- menções;
- edição;
- exclusão;
- favoritos;
- pesquisa.

## 11. Threads
Threads são objetos de conversação ligados a uma mensagem inicial e devem permitir leitura sem quebrar o contexto do room.

## 12. Presença
Estados:
`Online`, `Away`, `Busy`, `Invisible`, `Offline`.

Atividades podem representar:
- jogando;
- ouvindo;
- trabalhando;
- em chamada;
- transmitindo;
- atividade personalizada.

## 13. Voz, vídeo e screen share
Usar WebRTC como base.

Requisitos:
- sala de voz;
- vídeo;
- mute/unmute;
- câmera;
- screen share;
- detecção de atividade de voz;
- controle de participantes;
- permissões por sala.

C++/Rust somente para processamento especializado quando necessário.

## 14. Busca
Busca unificada para:
- mensagens;
- pessoas;
- servidores;
- rooms;
- arquivos;
- mídia;
- threads.

Filtros futuros:
`from:`, `in:`, `before:`, `after:`, `has:`, `type:`.

## 15. Command Palette
Criar um ponto de entrada rápido, conceitualmente `Ctrl/Cmd + K`, para:
- pesquisar;
- navegar;
- mudar status;
- iniciar chamada;
- criar servidor;
- abrir configurações;
- executar ações frequentes.

## 16. Notificações
Tipos:
- DM;
- mention;
- reply;
- friend request;
- server event;
- moderation;
- system;
- AI.

Configuração por categoria e por servidor/room.

## 17. Media
Tratar mídia como entidade própria com:
- id;
- owner;
- tipo;
- tamanho;
- mime;
- duração quando aplicável;
- thumbnail/preview;
- storage key;
- timestamps;
- metadados seguros.

## 18. Segurança
Obrigatório:
- autenticação;
- autorização server-side;
- RLS no Supabase quando apropriado;
- proteção de secrets;
- validação de input;
- rate limiting;
- audit logs para ações administrativas;
- separação entre ambiente local/staging/produção.

## 19. IA
A camada de IA é separada do core.
Casos previstos:
- moderação;
- sumarização;
- busca semântica;
- transcrição;
- tradução;
- recomendações;
- assistente da comunidade;
- automações inteligentes.

Python é o padrão para essa camada.

## 20. Descoberta
Futuro módulo Discover com:
- servidores públicos;
- categorias;
- populares;
- novos;
- recomendados;
- pesquisa.

## 21. Eventos e auditoria
Eventos de domínio devem permitir futura integração com:
- notificações;
- analytics;
- moderação;
- IA;
- automações;
- auditoria.

Exemplos:
`UserJoinedServer`, `MessageCreated`, `MessageEdited`, `MessageDeleted`, `FriendRequestCreated`, `FriendRequestAccepted`, `UserJoinedVoice`, `ScreenShareStarted`.

## 22. Desktop
Electron deve fornecer integração com o sistema operacional.
Regra: lógica de negócio permanece em camadas compartilhadas e backend, nunca presa ao processo do Electron.

## 23. MVP obrigatório
A primeira versão funcional deve priorizar:
1. Auth;
2. Perfil;
3. Amigos;
4. DM;
5. Servidores;
6. Spaces/Rooms;
7. Chat;
8. Presença;
9. Voz;
10. Screen share.

Vídeo avançado, Discover, IA, marketplace e integrações entram depois do core estar estável.

## 24. Critério de conclusão
Uma feature só está concluída quando tiver, conforme aplicável:
- integração real;
- estados loading/empty/error;
- permissões;
- persistência;
- tratamento de falhas;
- testes;
- acessibilidade;
- documentação técnica suficiente.
