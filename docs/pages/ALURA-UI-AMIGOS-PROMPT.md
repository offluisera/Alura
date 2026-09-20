# ALURA — UI / GUIA DE AMIGOS

## Objetivo

Este documento define a especificação visual, estrutural e funcional da **guia completa de Amigos da Alura**, tomando a imagem de referência fornecida como base de composição.

A tela deve preservar a ideia de organização da referência, mas seguir integralmente a identidade visual própria da Alura.

**A Alura não deve ser visualmente ou estruturalmente tratada como um clone do Discord.**

---

# REGRA ABSOLUTA — INFORMAÇÕES REAIS

**Todas as informações exibidas na tela devem representar dados reais.**

Isso inclui:

- nomes;
- usernames;
- fotos de perfil;
- status online/offline;
- quantidade de amigos;
- solicitações;
- atividades;
- jogos;
- cargos;
- descrições;
- servidores;
- quantidade de membros;
- links;
- horários;
- notificações;
- qualquer contador ou estatística.

Não utilizar dados fictícios como se fossem dados reais.

Não utilizar:

- lorem ipsum;
- nomes aleatórios;
- usernames inventados;
- números fixos falsos;
- links falsos;
- atividades falsas;
- jogos inventados;
- estatísticas inventadas;
- imagens aleatórias como mídia real;
- usuários fictícios apresentados como usuários existentes.

## Ausência de dados

Se determinada informação ainda não existir, utilizar um estado real da aplicação:

- Não informado;
- Nenhum resultado;
- Nenhum amigo;
- Nenhuma solicitação;
- Offline;
- Sem atividade;
- Sem dados;
- Carregando;
- Erro ao carregar.

**Nunca preencher espaços vazios inventando informações.**

Mock data só pode existir em testes, Storybook, fixtures de desenvolvimento ou protótipos explicitamente identificados.

---

# IDENTIDADE

**Produto:** Alura

**Tipo:** plataforma de comunidades realtime.

A guia Amigos deve permitir que o usuário:

- visualize seus amigos;
- filtre amigos;
- encontre pessoas;
- veja presença;
- visualize atividade;
- envie mensagens;
- abra perfis;
- gerencie amizades;
- aceite solicitações;
- recuse solicitações;
- descubra pessoas relacionadas aos seus interesses.

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

A interface deve transmitir uma plataforma viva, mas sem exagero visual.

Utilizar profundidade por meio de:

- superfícies;
- bordas;
- espaçamento;
- contraste;
- tipografia;
- pequenos efeitos de interação.

Evitar excesso de:

- neon;
- glow;
- glassmorphism;
- blur;
- gradientes;
- sombras pesadas;
- elementos decorativos sem função.

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

O verde deve ser reservado para:

- seleção;
- presença;
- ações principais;
- estados positivos;
- indicadores realtime;
- elementos de destaque.

---

# ESTRUTURA GERAL

Desktop:

```text
┌──────────────┬─────────────────────────────────────┬─────────────────────┐
│              │                                     │                     │
│ Navigation   │            Main Content             │   Context Sidebar   │
│ Rail         │                                     │                     │
│              │ Search                              │ Solicitações        │
│              │                                     │                     │
│              │ Amigos                              │ Amigos online       │
│              │                                     │                     │
│              │ Filtros                             │ Descoberta          │
│              │                                     │                     │
│              │ Lista de amigos                     │                     │
│              │                                     │                     │
└──────────────┴─────────────────────────────────────┴─────────────────────┘
```

A composição deve ter:

1. Navigation Rail;
2. Header global com busca;
3. Área principal de amigos;
4. Sidebar contextual.

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

## Logo

No topo:

- logo oficial da Alura;
- símbolo A;
- aproximadamente 40–44px;
- alinhamento central;
- sem sombra pesada.

## Navegação

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
- estado hover;
- estado ativo;
- área clicável adequada.

### Amigos selecionado

Utilizar:

```text
background: #004028
border: #00DFA0
text: #00DFA0
```

O contador deve vir do estado real do usuário.

Exemplo conceitual:

```text
Amigos [contador real]
```

Não fixar `12` no frontend se esse número não vier do backend.

---

# PERFIL DO USUÁRIO LOGADO

Na parte inferior da rail:

- avatar real do usuário;
- username real;
- status real;
- ação de logout.

Exemplo estrutural:

```text
[avatar]
@username
● Online
             [logout]
```

O status deve refletir o sistema de presença.

---

# 2. HEADER GLOBAL

Na parte superior do conteúdo principal.

Altura aproximada:

```text
80px
```

Possuir:

## Busca global

Campo horizontal.

Placeholder:

```text
Buscar amigos, usuários, servidores...
```

A busca deve poder procurar dados reais e autorizados dentro da plataforma.

Pode incluir:

- amigos;
- usuários;
- servidores;
- comunidades.

Adicionar indicador visual de atalho de teclado:

```text
/
```

O atalho deve funcionar caso implementado.

## Área direita

Exibir:

- notificações;
- avatar do usuário atual.

O contador de notificações deve ser real.

---

# 3. CONTEÚDO PRINCIPAL

Área central.

Largura flexível.

Padding aproximado:

```text
24–32px
```

No topo:

## Título

```text
Amigos
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
Conecte-se, converse e construa grandes histórias juntos.
```

Esse texto é parte da identidade da interface e pode permanecer como texto institucional.

## Ação principal

Botão:

```text
+ Adicionar amigo
```

O botão deve abrir o fluxo real de adicionar amigo.

Visual:

```text
background: #00DFA0
text: #000808
```

---

# 4. FILTROS

Card horizontal abaixo do cabeçalho.

Possíveis filtros:

```text
Todos
Online
Offline
```

Os filtros devem funcionar sobre a lista real.

## Todos

Estado ativo inicialmente quando aplicável.

## Online

Mostrar somente amigos cuja presença esteja online.

## Offline

Mostrar somente amigos offline.

### Contadores

Os contadores devem ser calculados a partir dos dados reais.

Não usar números estáticos.

Exemplo:

```text
Todos      [N]
Online     [N]
Offline    [N]
```

---

# 5. LISTA DE AMIGOS

A lista ocupa a maior parte da área principal.

Cada amigo deve ser representado por um card horizontal.

Altura aproximada:

```text
76px
```

Padding:

```text
16px
```

Radius:

```text
14px
```

Border:

```text
1px solid #00502F
```

---

# CARD DE AMIGO

Estrutura:

```text
[Avatar] [Identidade + presença + profissão]       [Mensagem] [...]
```

## Avatar

Avatar circular.

Tamanho aproximado:

```text
56px
```

Possuir indicador de presença.

O avatar deve vir de uma fonte real:

- Supabase Storage;
- avatar oficial;
- imagem fornecida pelo usuário.

Não usar foto artificial apresentada como pessoa real.

---

# IDENTIDADE

Mostrar:

```text
@username
● Online
```

ou:

```text
● Offline
```

A presença deve ser realtime.

Não mostrar “Online” baseado apenas em dado estático.

## Cargo / descrição

Exibir o cargo real informado pelo usuário.

Exemplos:

```text
Desenvolvedor Full Stack
Designer UI/UX
Dev Ops
Product Manager
Frontend Developer
Desenvolvedor Mobile
Designer Gráfica
Full Stack Developer
```

Esses textos são apenas exemplos de estrutura.

**Na aplicação, utilizar o valor real cadastrado no perfil.**

Se não houver cargo:

```text
Cargo não informado
```

---

# AÇÕES DO CARD

No lado direito:

## Mensagem

Botão com ícone de mensagem.

Ao clicar:

- abrir conversa existente;
- ou iniciar uma nova conversa, conforme o estado real.

## Mais opções

Botão `...`.

Menu contextual pode possuir:

```text
Abrir perfil
Enviar mensagem
Remover amigo
Bloquear
Silenciar
```

Somente exibir ações compatíveis com as permissões e estado real do relacionamento.

---

# RELACIONAMENTO

A interface deve refletir o estado real da amizade.

Estados possíveis:

```text
Não conectado
Solicitação enviada
Solicitação recebida
Amigos
Bloqueado
```

Não mostrar ações incompatíveis com o estado.

Exemplo:

Se já são amigos:

```text
Remover amigo
```

Se não são amigos:

```text
Adicionar amigo
```

---

# 6. SIDEBAR — SOLICITAÇÕES DE AMIZADE

Largura aproximada:

```text
360px
```

Card:

```text
Solicitações de amizade
```

Mostrar contador real.

Ação:

```text
Ver todas
```

Cada solicitação deve mostrar:

- avatar;
- username;
- nome, quando disponível;
- informação complementar real;
- botão aceitar;
- botão recusar.

## Aceitar

Botão principal:

```text
Aceitar
```

Ao aceitar:

- atualizar relacionamento;
- atualizar contador;
- atualizar lista de amigos;
- atualizar realtime.

## Recusar

Ao recusar:

- remover solicitação;
- atualizar contador;
- atualizar interface.

Não simular a alteração apenas visualmente.

---

# 7. SIDEBAR — AMIGOS ONLINE

Card:

```text
Amigos online
```

Contador real.

Ação:

```text
Ver todos
```

Mostrar lista compacta dos amigos online.

Cada item pode conter:

- avatar;
- username;
- presença;
- atividade atual;
- ícone de contexto.

---

# ATIVIDADE

A atividade exibida deve ser real.

Exemplos de estados:

```text
Jogando Valorant
No canal de voz
Jogando Minecraft
Codando
Disponível
Ocupado
```

Esses valores só devem aparecer quando realmente forem fornecidos pelo sistema.

Se não houver atividade:

```text
Sem atividade
```

Não inventar o jogo ou aplicativo.

---

# 8. CARD DE DESCOBERTA

Na parte inferior da sidebar:

Card institucional da Alura.

Mensagem:

```text
Amizade torna tudo melhor.
Encontre pessoas que compartilham
dos mesmos interesses que você.
```

Esse conteúdo é institucional.

Pode apresentar:

- logo da Alura;
- ilustração oficial;
- elemento visual orgânico;
- ação de descoberta.

Botão:

```text
→
```

O botão deve abrir uma funcionalidade real de descoberta.

---

# 9. BUSCA E FILTROS FUNCIONAIS

A busca deve trabalhar com dados reais.

Possibilidades:

```text
Buscar por username
Buscar por nome
Buscar por comunidade
Buscar por servidor
```

O resultado deve respeitar:

- permissões;
- privacidade;
- bloqueios;
- configurações do usuário.

Não exibir pessoas que não podem ser encontradas.

---

# 10. ESTADOS OBRIGATÓRIOS

## Loading

Usar skeletons que respeitem o layout final.

## Nenhum amigo

Mostrar:

```text
Você ainda não adicionou nenhum amigo.
```

Ação:

```text
Adicionar amigo
```

## Nenhuma solicitação

Mostrar:

```text
Você não possui novas solicitações de amizade.
```

## Nenhum amigo online

Mostrar:

```text
Nenhum amigo está online agora.
```

## Nenhum resultado

Mostrar:

```text
Nenhum resultado encontrado.
```

## Erro

Mostrar:

```text
Não foi possível carregar seus amigos.
Tente novamente.
```

## Offline

Quando a conexão realtime for perdida, indicar o estado adequadamente.

---

# 11. REALTIME

A guia deve ser preparada para atualização em tempo real.

Eventos relevantes:

```text
friend_request.created
friend_request.accepted
friend_request.rejected

friendship.created
friendship.deleted

presence.online
presence.offline
presence.updated

activity.updated

profile.updated
```

Quando um amigo ficar online:

- indicador deve atualizar;
- filtro Online deve atualizar;
- contador deve atualizar;
- sidebar deve atualizar.

Quando alguém ficar offline:

- realizar o processo inverso.

---

# 12. BACKEND E DADOS

Stack prevista:

```text
React
TypeScript
Supabase
Elixir
Phoenix
WebSockets / Phoenix Channels
```

Supabase pode armazenar:

- usuários;
- perfis;
- amizades;
- solicitações;
- preferências;
- avatares;
- comunidades;
- relações.

Elixir/Phoenix deve atuar na camada realtime e nos eventos necessários.

---

# 13. SEGURANÇA

Nenhuma informação privada deve ser exposta somente porque existe no banco.

Aplicar:

- autenticação;
- autorização;
- RLS quando aplicável;
- validação server-side;
- permissões;
- regras de privacidade;
- proteção contra enumeração indevida de usuários;
- proteção de endpoints.

O frontend nunca deve ser a única camada de segurança.

---

# 14. ACESSIBILIDADE

Garantir:

- contraste;
- foco visível;
- navegação por teclado;
- labels acessíveis;
- aria-label nos botões sem texto;
- tooltips quando necessário;
- áreas clicáveis adequadas;
- sem depender exclusivamente de cor para indicar status.

Exemplo:

Online deve possuir:

- indicador visual;
- texto “Online” quando houver espaço.

---

# 15. RESPONSIVIDADE

## Desktop

```text
Rail + Main + Sidebar
```

## Tablet

```text
Rail + Main
```

A sidebar pode se tornar drawer.

## Mobile

A tela deve utilizar uma composição própria:

```text
Header
Lista
Filtros
Drawer de solicitações
Drawer de amigos online
```

Não simplesmente reduzir a versão desktop.

---

# 16. MOTION

Microinterações:

- hover nos cards;
- seleção de filtros;
- entrada/remoção de amigo;
- aceitação de solicitação;
- mudança de presença;
- abertura de perfil;
- abertura do menu contextual;
- atualização da lista.

As animações devem ser:

- rápidas;
- suaves;
- funcionais;
- discretas.

Respeitar `prefers-reduced-motion`.

---

# 17. TIPOGRAFIA

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
Descrição:    14px
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

# 18. ÍCONES

Preferência:

```text
Lucide Icons
```

Características:

- lineares;
- modernos;
- consistentes;
- mesma espessura;
- sem mistura de famílias.

---

# 19. ESPAÇAMENTO

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

Manter alinhamento consistente entre:

- títulos;
- filtros;
- cards;
- avatares;
- botões;
- sidebar;
- header.

---

# 20. PERFORMANCE

A lista deve suportar crescimento significativo.

Considerar:

- paginação;
- carregamento incremental;
- cache;
- debounce na busca;
- atualização seletiva;
- virtualização para listas muito grandes;
- carregamento otimizado de avatares;
- compressão/responsividade das imagens.

Não carregar todos os usuários da plataforma para montar a tela de amigos.

---

# 21. COMPONENTES REUTILIZÁVEIS

Estruturar a UI em componentes como:

```text
AppNavigationRail
GlobalSearch
FriendsHeader
FriendFilters
FriendList
FriendCard
FriendAvatar
PresenceIndicator
FriendActions
FriendContextMenu

FriendRequestsCard
FriendRequestItem

OnlineFriendsCard
OnlineFriendItem

FriendDiscoveryCard

EmptyState
LoadingSkeleton
ErrorState
```

Os componentes devem consumir dados reais.

---

# 22. PRINCÍPIO DE IMPLEMENTAÇÃO

A tela não deve ser apenas visual.

As ações devem possuir comportamento real:

```text
Adicionar amigo
→ cria solicitação real

Aceitar
→ cria relacionamento real

Recusar
→ remove solicitação real

Mensagem
→ abre/inicia conversa real

Remover amigo
→ altera relacionamento real

Bloquear
→ altera estado real

Buscar
→ pesquisa dados reais

Filtro Online
→ usa presença real

Atividade
→ usa atividade real
```

---

# 23. REGRA CONTRA MOCK DATA EM PRODUÇÃO

Nenhum dado de demonstração pode chegar à produção.

Antes da entrega:

- remover fixtures;
- remover arrays hardcoded;
- remover números fixos;
- remover usuários fictícios;
- remover links de exemplo;
- remover mensagens de demonstração;
- remover imagens de preenchimento;
- verificar queries reais;
- verificar estados vazios.

---

# 24. REGRA CONTRA INFORMAÇÃO INVENTADA

Se não existe no banco/API:

**não existe na interface.**

Exemplo incorreto:

```text
@usuario123
12 amigos
Jogando Valorant
8.4k membros
github.com/usuario123
```

se esses dados não forem reais.

Exemplo correto:

```text
@usuario_real
Sem atividade
```

ou, caso não exista:

```text
Atividade não informada
```

---

# 25. CHECKLIST FINAL

Antes de considerar a guia de Amigos pronta:

- [ ] Todos os usuários são reais.
- [ ] Todos os usernames são reais.
- [ ] Avatares possuem origem real.
- [ ] Status online/offline é realtime.
- [ ] Contadores são calculados pelos dados reais.
- [ ] Solicitações são reais.
- [ ] Amizades refletem o banco.
- [ ] Atividades são reais.
- [ ] Jogos são reais quando exibidos.
- [ ] Nenhum link falso existe.
- [ ] Nenhuma estatística foi inventada.
- [ ] Nenhum conteúdo fake aparece em produção.
- [ ] Busca funciona.
- [ ] Filtros funcionam.
- [ ] Adicionar amigo funciona.
- [ ] Aceitar solicitação funciona.
- [ ] Recusar solicitação funciona.
- [ ] Remover amigo funciona.
- [ ] Mensagem abre conversa real.
- [ ] Estados loading/empty/error existem.
- [ ] Permissões e privacidade são respeitadas.
- [ ] RLS/autorização foi validado.
- [ ] Realtime foi validado.
- [ ] Responsividade foi validada.
- [ ] Acessibilidade foi validada.
- [ ] Build foi executado.
- [ ] Erros foram corrigidos.
- [ ] A interface não copia o Discord.
- [ ] A identidade visual oficial da Alura foi respeitada.

---

# RESULTADO ESPERADO

A guia de Amigos deve parecer uma parte nativa de um produto real:

**ALURA**

Uma plataforma onde pessoas encontram outras pessoas, constroem amizades e compartilham interesses.

A interface deve ser:

- original;
- funcional;
- realtime;
- consistente;
- segura;
- acessível;
- responsiva;
- baseada em dados reais;
- visualmente alinhada ao Design System da Alura.

**Regra final: se a informação não for real, ela não deve ser apresentada como real.**
