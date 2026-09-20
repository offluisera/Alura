# ALURA — UI / GUIA DE SOLICITAÇÕES DE AMIZADE

## Objetivo

Este documento define a especificação visual, estrutural e funcional da **guia completa de Solicitações de Amizade da Alura**, baseada na tela de referência fornecida.

A composição deve seguir a lógica visual apresentada na referência, preservando a identidade própria da Alura.

**A Alura não deve ser visualmente ou estruturalmente tratada como um clone do Discord.**

---

# REGRA ABSOLUTA — TODAS AS INFORMAÇÕES DEVEM SER REAIS

**Toda informação exibida nesta tela deve representar dados reais do sistema.**

Isso inclui:

- usuários;
- usernames;
- nomes;
- avatares;
- status online/offline;
- tempo desde o envio da solicitação;
- quantidade de amigos em comum;
- mensagens enviadas junto da solicitação;
- contadores;
- sugestões de usuários;
- cargos;
- atividades;
- estatísticas sociais;
- relacionamentos;
- notificações;
- qualquer outro dado apresentado.

## Nunca utilizar como informação real

- lorem ipsum;
- usuários fictícios;
- usernames inventados;
- números fixos de demonstração;
- mensagens inventadas;
- links falsos;
- estatísticas falsas;
- atividades falsas;
- quantidades inventadas;
- imagens aleatórias como avatar de usuário real.

Os dados devem ser carregados do backend e/ou de fontes externas autorizadas.

## Se não houver dados

Não inventar.

Utilizar estados como:

```text
Nenhuma solicitação recebida.
Nenhuma solicitação enviada.
Nenhuma sugestão disponível.
Nenhum amigo em comum.
Atividade não informada.
Cargo não informado.
```

Também utilizar:

```text
Loading
Empty
Error
Unavailable
```

quando apropriado.

Mock data somente pode existir em:

- testes;
- Storybook;
- fixtures;
- ambiente de desenvolvimento;
- protótipos explicitamente identificados.

Nunca apresentar mock data como dado real em produção.

---

# IDENTIDADE DO PRODUTO

**Produto:** Alura

**Categoria:** plataforma de comunidades realtime.

A área de Solicitações deve permitir:

- receber solicitações;
- aceitar solicitações;
- recusar solicitações;
- visualizar solicitações enviadas;
- cancelar solicitações enviadas;
- visualizar informações públicas do solicitante;
- visualizar amigos em comum;
- descobrir pessoas;
- acompanhar indicadores sociais;
- iniciar interação com usuários quando permitido.

---

# DIREÇÃO VISUAL

Características:

- dark-first;
- tecnológica;
- elegante;
- moderna;
- premium;
- profunda;
- minimalista;
- social;
- realtime.

A tela deve utilizar o espaço vazio de maneira intencional.

O conteúdo deve ser organizado sem excesso de cards decorativos.

Evitar:

- neon exagerado;
- glow excessivo;
- glassmorphism exagerado;
- blur pesado;
- gradientes agressivos;
- sombras fortes;
- elementos sem função.

---

# PALETA OFICIAL ALURA

## Base

```text
Background:       #000808
Navigation:       #001210
Surface 1:        #001A14
Surface 2:        #00291A
Surface 3:        #003018
Hover:            #003820
Selected:         #004028
Border:           #00502F
Border Strong:    #00663A
```

## Accent

```text
Accent:           #00DFA0
Accent Bright:    #00F0A8
```

## Texto

```text
Primary:          #F0FFF8
Secondary:        #B5CEC2
Muted:            #789487
Disabled:         #496356
```

O verde deve ser utilizado para:

- ações positivas;
- seleção;
- presença;
- indicadores;
- botões principais;
- estados realtime.

---

# ESTRUTURA GERAL

A composição desktop deve seguir:

```text
┌──────────────┬──────────────────────────────────┬───────────────────────┐
│              │                                  │                       │
│ Navigation   │ Header / Busca                   │                       │
│ Rail         ├──────────────────────────────────┤ Sidebar               │
│              │                                  │                       │
│              │ Solicitações                     │ Card institucional   │
│              │                                  │                       │
│              │ Tabs                             │ Progresso social      │
│              │                                  │                       │
│              │ Request Card                     │ Sugestões             │
│              │ Request Card                     │                       │
│              │ Request Card                     │                       │
│              │                                  │                       │
└──────────────┴──────────────────────────────────┴───────────────────────┘
```

Regiões:

1. Navigation Rail;
2. Header Global;
3. Área Principal;
4. Sidebar Social.

---

# 1. NAVIGATION RAIL

Largura aproximada:

```text
72px
```

Background:

```text
#000808
```

A rail permanece fixa no lado esquerdo no desktop.

## Logo

No topo:

- logo oficial da Alura;
- símbolo A;
- aproximadamente 40–44px;
- alinhamento central;
- sem sombra pesada.

Não substituir por logotipo textual genérico.

---

# NAVEGAÇÃO

Itens:

```text
Início
Amigos
Solicitações
Mensagens
Servidores
Configurações
```

Cada item deve possuir:

- ícone;
- label;
- área clicável;
- hover;
- active state;
- contador quando aplicável.

## Solicitações selecionado

Utilizar:

```text
background: #004028
border: #00DFA0
text: #00DFA0
```

O contador deve representar a quantidade real de solicitações recebidas.

Não fixar um valor no frontend.

---

# PERFIL DO USUÁRIO LOGADO

Na parte inferior:

- avatar real;
- username real;
- status real;
- logout.

Estrutura:

```text
[avatar]
@username
● Online
             [logout]
```

O status deve refletir a presença realtime.

---

# 2. HEADER GLOBAL

O header ocupa a região superior do conteúdo.

Altura aproximada:

```text
80px
```

## Busca global

Campo horizontal:

```text
Buscar amigos, usuários, servidores...
```

A busca deve pesquisar informações reais e autorizadas.

Pode procurar:

- usuários;
- amigos;
- servidores;
- comunidades.

Adicionar indicador visual:

```text
/
```

caso o atalho esteja implementado.

O resultado da busca deve respeitar:

- privacidade;
- bloqueios;
- permissões;
- configurações de descoberta;
- regras de visibilidade.

---

# ÁREA DIREITA DO HEADER

Exibir:

- notificações;
- avatar do usuário.

O contador de notificações deve ser real.

Não mostrar badge se não houver notificações.

---

# 3. ÁREA PRINCIPAL

Padding desktop:

```text
24–32px
```

No topo:

## Ícone da seção

Utilizar um ícone grande relacionado a:

```text
Solicitações de amizade
```

Estilo linear.

Cor:

```text
#00DFA0
```

## Título

```text
Solicitações
```

Tamanho aproximado:

```text
36–40px
```

Peso:

```text
600–700
```

## Descrição

```text
Pessoas que querem adicionar você como amigo.
```

---

# 4. TABS

Abaixo do título:

```text
Novas (N)
Enviadas (N)
```

Os números devem ser calculados a partir do banco.

## Novas

Mostra solicitações recebidas pendentes.

## Enviadas

Mostra solicitações que o usuário enviou e ainda estão pendentes.

Estado ativo:

```text
background: #00DFA0
text: #000808
```

Estado inativo:

```text
background: transparente / #001A14
border: #00502F
text: #B5CEC2
```

A troca de tab deve ser funcional.

---

# 5. CARD DE SOLICITAÇÃO RECEBIDA

Cada solicitação deve aparecer em um card horizontal.

Altura aproximada:

```text
132px
```

Padding:

```text
16–18px
```

Radius:

```text
12–14px
```

Border:

```text
1px solid #00502F
```

Estrutura:

```text
[Avatar] [Usuário / Status / Cargo / Amigos em comum / Mensagem]

                                             [Tempo]
                                      [Aceitar] [Recusar]
```

---

# AVATAR

Tamanho aproximado:

```text
68px
```

Circular.

Deve ser:

- avatar real do usuário;
- imagem armazenada no Supabase;
- imagem pública autorizada;
- ou avatar padrão oficial da Alura.

Não utilizar rosto gerado artificialmente como se fosse um usuário real.

---

# IDENTIDADE DO SOLICITANTE

Exibir:

```text
@username
● Online
```

ou:

```text
● Offline
```

O status deve vir do sistema realtime.

## Cargo

Exibir o cargo real cadastrado no perfil.

Se não houver:

```text
Cargo não informado
```

---

# AMIGOS EM COMUM

Exibir somente quando houver informação real.

Exemplo estrutural:

```text
5 amigos em comum
```

O número deve ser calculado pelo backend.

Se não houver amigos em comum:

```text
Nenhum amigo em comum
```

Não esconder informação para criar aparência de dados.

---

# MENSAGEM DA SOLICITAÇÃO

Se o usuário enviou uma mensagem junto com o pedido, mostrar a mensagem real.

Exemplo de estrutura:

```text
"Olá! Adorei seu perfil e gostaria de te adicionar!"
```

Essa mensagem só deve aparecer se tiver sido realmente enviada.

Se não houver mensagem:

```text
Sem mensagem
```

ou simplesmente omitir o bloco, dependendo do design final.

---

# TEMPO DA SOLICITAÇÃO

Mostrar o tempo com base no timestamp real:

```text
há 12 min
há 25 min
há 1 h
ontem
```

A aplicação deve calcular isso automaticamente.

Nunca colocar horários ou tempos fixos no frontend.

---

# 6. BOTÃO ACEITAR

Botão principal:

```text
✓ Aceitar
```

Visual:

```text
background: #00DFA0
text: #000808
```

Ao clicar:

1. validar solicitação;
2. atualizar relacionamento;
3. criar amizade;
4. atualizar lista;
5. atualizar contador;
6. atualizar sidebar;
7. emitir evento realtime;
8. mostrar feedback de sucesso.

O botão não deve apenas alterar a aparência da tela.

---

# 7. BOTÃO RECUSAR

Botão:

```text
× Recusar
```

Visual:

```text
background: transparente;
border: #00502F;
text: #F0FFF8;
```

Ao clicar:

1. validar solicitação;
2. remover/rejeitar solicitação;
3. atualizar contador;
4. atualizar interface;
5. atualizar realtime.

---

# 8. TAB — ENVIADAS

Ao selecionar:

```text
Enviadas
```

mostrar solicitações que o usuário enviou e que continuam pendentes.

Cada item pode apresentar:

- avatar;
- username;
- presença;
- cargo;
- data/tempo;
- mensagem enviada;
- botão cancelar solicitação.

Ação:

```text
Cancelar solicitação
```

Não mostrar “Aceitar” ou “Recusar” em solicitações enviadas.

---

# 9. SIDEBAR — CARD INSTITUCIONAL

Primeiro card da sidebar.

Visual com logo da Alura e elementos orgânicos.

Mensagem:

```text
Conecte-se.
Compartilhe. Evolua.
```

Descrição:

```text
Adicione amigos para trocar ideias,
participar de comunidades e crescer
juntos.
```

Esse texto é conteúdo institucional da interface.

A decoração deve utilizar formas/ondas verdes sutis.

Não preencher o card com dados fictícios.

---

# 10. SIDEBAR — PROGRESSO SOCIAL

Card:

```text
Seu progresso social
```

Mostrar métricas reais do usuário:

```text
[N] Amigos
[N] Solicitações
[N] Mensagens
```

Os números devem ser obtidos do backend.

Nunca utilizar:

```text
12
3
5
```

como valores fixos apenas porque aparecem na imagem de referência.

O layout pode ser mantido, mas os valores precisam ser dinâmicos.

---

# MÉTRICAS

As métricas devem possuir definição clara.

## Amigos

Quantidade real de amizades ativas.

## Solicitações

Quantidade real de solicitações pendentes relevantes ao usuário.

## Mensagens

A métrica deve ter uma definição técnica documentada.

Pode representar, por exemplo:

- mensagens não lidas;

ou

- quantidade de mensagens pendentes;

ou

- outra métrica definida pelo produto.

**A UI não deve criar uma definição implícita.**

---

# 11. SIDEBAR — SUGESTÕES PARA VOCÊ

Card:

```text
Sugestões para você
```

Ação:

```text
Ver todos
```

As sugestões devem ser calculadas a partir de dados reais e regras documentadas.

Possíveis sinais:

- amigos em comum;
- servidores em comum;
- interesses em comum;
- jogos em comum;
- hobbies em comum;
- atividade;
- conexões da comunidade.

Não inventar sugestões.

---

# CARD DE SUGESTÃO

Cada item pode mostrar:

```text
[Avatar] @username
         Cargo real
                         [Adicionar]
```

O botão:

```text
Adicionar
```

deve criar uma solicitação real.

Depois do envio, o estado deve mudar para algo como:

```text
Solicitação enviada
```

O estado deve persistir mesmo após atualizar a página.

---

# 12. SISTEMA DE RELACIONAMENTO

A interface deve respeitar estados reais.

Estados:

```text
Desconhecido
Solicitação recebida
Solicitação enviada
Amigos
Bloqueado
```

Ações devem mudar conforme o estado.

Exemplo:

```text
Solicitação recebida
→ Aceitar / Recusar

Solicitação enviada
→ Cancelar

Amigos
→ Abrir conversa / Gerenciar amizade

Bloqueado
→ nenhuma ação incompatível
```

---

# 13. REALTIME

A tela deve ser atualizada em tempo real.

Eventos:

```text
friend_request.created
friend_request.accepted
friend_request.rejected
friend_request.cancelled

friendship.created
friendship.deleted

presence.online
presence.offline
presence.updated

profile.updated
activity.updated
```

Exemplo:

Se outro usuário enviar uma solicitação:

- contador deve atualizar;
- tab “Novas” deve atualizar;
- card deve aparecer;
- notificação pode ser atualizada;
- sidebar deve refletir a nova quantidade.

Sem necessidade de refresh manual.

---

# 14. BACKEND

Stack prevista:

```text
React
TypeScript
Supabase
Elixir
Phoenix
WebSockets / Phoenix Channels
```

Supabase:

- autenticação;
- PostgreSQL;
- Storage;
- perfis;
- amizades;
- solicitações;
- dados sociais.

Elixir/Phoenix:

- realtime;
- eventos;
- presença;
- sincronização;
- lógica de comunicação realtime.

---

# 15. SEGURANÇA

Aplicar:

- autenticação;
- autorização;
- RLS;
- validação server-side;
- controle de permissões;
- privacidade;
- proteção contra enumeração de usuários;
- proteção contra abuso de solicitações;
- rate limiting quando necessário.

O frontend nunca deve ser responsável sozinho pela segurança.

---

# 16. PRIVACIDADE

Respeitar configurações do usuário.

O sistema deve permitir regras como:

- quem pode enviar solicitação;
- quem pode encontrar o usuário;
- quem pode visualizar informações;
- quem pode ver amigos em comum;
- quem pode visualizar atividade.

Não exibir informações privadas apenas porque existem no banco.

---

# 17. ESTADOS OBRIGATÓRIOS

## Loading

Skeleton dos cards.

## Nenhuma solicitação recebida

```text
Nenhuma nova solicitação.
```

Ação:

```text
Encontrar pessoas
```

## Nenhuma solicitação enviada

```text
Você não possui solicitações enviadas pendentes.
```

## Nenhuma sugestão

```text
Nenhuma sugestão disponível no momento.
```

## Erro

```text
Não foi possível carregar as solicitações.
Tente novamente.
```

## Offline

Indicar perda de conexão realtime quando necessário.

---

# 18. BUSCA

A busca deve ser funcional.

Suportar, conforme as regras do produto:

```text
username
nome
servidor
comunidade
```

Utilizar debounce.

Não consultar todos os usuários de uma vez.

---

# 19. RESPONSIVIDADE

## Desktop

```text
Rail + Main + Sidebar
```

## Tablet

```text
Rail + Main
```

Sidebar vira drawer.

## Mobile

Composição própria:

```text
Header
Título
Tabs
Solicitações
Acesso às informações sociais via drawer
```

Não comprimir a interface desktop para caber no mobile.

---

# 20. ACESSIBILIDADE

Garantir:

- contraste adequado;
- foco visível;
- navegação por teclado;
- aria-label;
- labels nos botões;
- leitura adequada por screen readers;
- feedback acessível após aceitar/recusar;
- estados não dependentes exclusivamente de cor.

Os botões:

```text
Aceitar
Recusar
Adicionar
Cancelar
```

devem possuir nomes acessíveis.

---

# 21. MOTION

Utilizar microinterações:

- entrada de solicitação;
- aceite;
- recusa;
- cancelamento;
- mudança de tab;
- atualização de contador;
- abertura de perfil;
- adição de usuário.

Animações devem ser:

- rápidas;
- suaves;
- discretas;
- funcionais.

Respeitar:

```text
prefers-reduced-motion
```

---

# 22. TIPOGRAFIA

Preferências:

```text
Inter
Geist
Manrope
```

Hierarquia:

```text
Título:       36–40px
Seção:        18–20px
Username:     15–16px
Texto:        14px
Meta:         12–13px
```

Pesos:

```text
400
500
600
700
```

---

# 23. ÍCONES

Preferência:

```text
Lucide Icons
```

Estilo:

- linear;
- moderno;
- consistente;
- mesma espessura;
- sem mistura de bibliotecas visuais incompatíveis.

---

# 24. ESPAÇAMENTO

Utilizar escala baseada em 4px:

```text
4
8
12
16
20
24
32
```

Cards devem possuir respiro suficiente.

Evitar elementos encostados.

---

# 25. PERFORMANCE

A tela deve suportar crescimento de usuários.

Considerar:

- paginação;
- cursor pagination;
- debounce;
- cache;
- carregamento incremental;
- atualização seletiva;
- virtualização quando necessário;
- imagens otimizadas;
- consultas indexadas.

Sugestões devem ser paginadas.

Não carregar todos os usuários da plataforma.

---

# 26. COMPONENTES REUTILIZÁVEIS

Estruturar componentes:

```text
AppNavigationRail
GlobalSearch
FriendRequestsHeader
FriendRequestTabs
FriendRequestList
FriendRequestCard
FriendRequestAvatar
FriendRequestActions
FriendRequestContextMenu

SentRequestCard
CancelRequestButton

SocialProgressCard
FriendSuggestionsCard
FriendSuggestionItem
InstitutionalDiscoveryCard

EmptyState
LoadingSkeleton
ErrorState
```

Todos devem consumir dados reais.

---

# 27. REGRA DE DADOS DINÂMICOS

Nenhum contador deve ficar hardcoded.

Errado:

```text
Novas (3)
Enviadas (2)

Amigos 12
Solicitações 3
Mensagens 5
```

como valores permanentes.

Correto:

```text
Novas ({pendingReceivedCount})
Enviadas ({pendingSentCount})

Amigos {friendsCount}
Solicitações {pendingRequestsCount}
Mensagens {messageMetric}
```

Os valores devem ser calculados a partir do estado real.

---

# 28. REGRA DE CONTEÚDO DA REFERÊNCIA

A imagem de referência serve para:

- composição;
- layout;
- proporções;
- hierarquia;
- espaçamento;
- organização;
- densidade visual.

Os textos, usuários, números, imagens e dados mostrados na referência **não devem ser considerados dados reais do produto**.

Eles só podem aparecer na implementação se forem efetivamente dados existentes no sistema.

---

# 29. REGRA CONTRA CONTEÚDO INVENTADO

Se o sistema não possui uma informação:

**não inventar.**

Exemplo:

```text
@lucasdev
Desenvolvedor Frontend
5 amigos em comum
há 12 min
```

só deve ser mostrado dessa forma se todos esses dados existirem realmente.

Caso contrário:

```text
@username_real
Cargo não informado
Nenhum amigo em comum
```

ou utilizar o estado apropriado.

---

# 30. CHECKLIST FINAL

Antes de considerar a guia de Solicitações pronta:

- [ ] Todos os usuários são reais.
- [ ] Todos os usernames são reais.
- [ ] Avatares possuem origem real.
- [ ] Status é realtime.
- [ ] Contadores são dinâmicos.
- [ ] Solicitações são reais.
- [ ] Amigos em comum são calculados.
- [ ] Mensagens das solicitações são reais.
- [ ] Timestamps são derivados de dados reais.
- [ ] Sugestões utilizam dados reais.
- [ ] Atividades são reais.
- [ ] Cargos são reais.
- [ ] Nenhum link falso existe.
- [ ] Nenhuma estatística foi inventada.
- [ ] Nenhum usuário fake aparece em produção.
- [ ] Nenhuma mensagem fake aparece em produção.
- [ ] Aceitar funciona.
- [ ] Recusar funciona.
- [ ] Cancelar funciona.
- [ ] Adicionar amigo funciona.
- [ ] Tabs funcionam.
- [ ] Busca funciona.
- [ ] Realtime funciona.
- [ ] Privacidade é respeitada.
- [ ] RLS/autorização foi validado.
- [ ] Loading existe.
- [ ] Empty state existe.
- [ ] Error state existe.
- [ ] Responsividade foi validada.
- [ ] Acessibilidade foi validada.
- [ ] Motion foi validado.
- [ ] Build foi executado.
- [ ] Erros foram corrigidos.
- [ ] A interface não copia o Discord.
- [ ] O Design System da Alura foi respeitado.

---

# RESULTADO ESPERADO

A guia deve representar uma área social real da Alura, onde o usuário consegue gerenciar solicitações de amizade com clareza.

A experiência deve transmitir:

```text
ALURA

Conecte-se.
Compartilhe.
Evolua.
```

O resultado final deve ser:

- original;
- funcional;
- realtime;
- seguro;
- acessível;
- responsivo;
- baseado em dados reais;
- consistente com o Design System da Alura.

## REGRA FINAL

**Se o dado não existir de verdade, não apresentar o dado como se existisse.**

A interface deve refletir o estado real da aplicação em todos os momentos.
