# ALURA — PROMPT DE UI: GUIA DE MENSAGENS

## Objetivo

Este documento define o prompt oficial para geração da **guia completa de Mensagens da Alura**, utilizando a imagem de referência fornecida como referência visual de composição, proporção, hierarquia, espaçamento e densidade.

A tela deve representar uma aplicação real da Alura, com identidade própria, sem copiar visual, estrutura ou comportamento do Discord.

---

# REGRA ABSOLUTA — DADOS REAIS

**TODAS AS INFORMAÇÕES EXIBIDAS NESTA INTERFACE DEVEM SER INFORMAÇÕES REAIS.**

Isso inclui:

- nomes de usuários;
- usernames/@handles;
- avatares;
- fotos de perfil;
- status online/offline;
- quantidade de membros;
- datas;
- horários;
- mensagens;
- quantidade de mensagens não lidas;
- servidores;
- quantidade de membros dos servidores;
- links;
- GitHub;
- Figma;
- imagens compartilhadas;
- jogos;
- hobbies;
- descrições;
- biografias;
- cargos;
- badges;
- verificações;
- relacionamentos;
- notificações;
- qualquer outra informação apresentada pela interface.

## Proibições

Não utilizar:

- lorem ipsum;
- nomes aleatórios gerados apenas para preencher espaço;
- usernames fictícios apresentados como se fossem reais;
- números inventados;
- estatísticas falsas;
- links inexistentes;
- URLs falsas;
- mensagens genéricas de placeholder;
- avatares gerados artificialmente quando a interface exigir um usuário real;
- imagens inventadas apresentadas como mídia real;
- dados de demonstração misturados com dados reais.

### Regra de origem dos dados

Os dados devem vir de uma fonte real e verificável, quando a funcionalidade exigir dados externos.

Exemplos:

- perfil do usuário → banco de dados da Alura;
- mensagens → banco de dados da Alura;
- presença → sistema realtime;
- membros → banco de dados da comunidade;
- avatar → Supabase Storage ou outra fonte autorizada;
- jogos → API oficial ou fonte autorizada;
- GitHub → URL real fornecida pelo usuário;
- Figma → URL real fornecida pelo usuário;
- mídia compartilhada → arquivos/imagens realmente existentes;
- servidores → comunidades realmente cadastradas;
- horários → timestamps reais das mensagens.

Se um dado ainda não existir no sistema, **não inventar o valor para a interface final**.

Nesse caso, utilizar um estado apropriado:

- carregando;
- vazio;
- indisponível;
- não configurado;
- sem mensagens;
- sem mídia;
- sem links;
- erro de carregamento.

A interface nunca deve transformar ausência de dados em informação falsa.

---

# IDENTIDADE DO PRODUTO

**Produto:** Alura

**Categoria:** plataforma de comunidades realtime.

A Alura deve permitir:

- conversas privadas;
- amizades;
- comunidades;
- servidores;
- salas;
- mensagens;
- presença realtime;
- voz;
- vídeo;
- compartilhamento de tela;
- perfis;
- descoberta de comunidades;
- mídia compartilhada;
- links;
- recursos sociais.

A interface deve parecer um produto próprio e consolidado.

**Não criar um clone do Discord.**

---

# DIREÇÃO VISUAL

Estética:

- dark-first;
- tecnológica;
- premium;
- elegante;
- moderna;
- profunda;
- minimalista;
- orgânica;
- realtime;
- profissional.

A interface deve utilizar profundidade através de:

- diferentes superfícies;
- bordas sutis;
- espaçamento;
- hierarquia tipográfica;
- contraste controlado;
- sombras discretas.

Evitar excesso de:

- neon;
- glow;
- blur;
- glassmorphism;
- gradientes;
- sombras;
- efeitos decorativos.

---

# PALETA OFICIAL

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

O verde deve representar vida, interação, presença e estados importantes.

---

# ESTRUTURA COMPLETA

A tela deve ser organizada em quatro regiões:

```text
Navigation Rail
        +
Conversation Sidebar
        +
Main Conversation
        +
Context/Profile Panel
```

Visualmente:

```text
┌──────────┬────────────────┬──────────────────────────┬─────────────────┐
│          │                │                          │                 │
│   ALURA  │   MENSAGENS    │       CONVERSA           │     PERFIL      │
│          │                │                          │                 │
│  Início  │   Conversas    │       Header             │     Banner      │
│  Amigos  │                │                          │     Avatar      │
│  Solic.  │   @usuario     │       Mensagens          │     Bio         │
│  Mens.   │   @usuario     │                          │     Mídia        │
│  Serv.   │   @usuario     │       Composer           │     Links        │
│  Config. │                │                          │     Servidores  │
│          │                │                          │                 │
└──────────┴────────────────┴──────────────────────────┴─────────────────┘
```

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

No topo, exibir o logotipo oficial da Alura.

Características:

- símbolo A;
- aproximadamente 40–44px;
- sem sombra pesada;
- identidade minimalista;
- alinhamento central.

Não substituir o logo por texto genérico.

## Navegação

Itens:

- Início
- Amigos
- Solicitações
- Mensagens
- Servidores
- Configurações

Cada item deve possuir:

- ícone;
- label;
- estado hover;
- estado ativo;
- área de toque adequada.

### Mensagens selecionado

Utilizar:

```text
background: #004028
border: #00DFA0
text: #00DFA0
```

Badges devem representar números reais vindos do sistema.

Exemplo conceitual:

```text
Amigos       [n]
Solicitações [n]
Mensagens    [n]
```

Não fixar números falsos no frontend.

---

# 2. LISTA DE CONVERSAS

Largura aproximada:

```text
330px
```

## Header

Título:

```text
Mensagens
```

Ação:

```text
Nova conversa
```

O botão deve abrir o fluxo real de criação/início de conversa.

## Busca

Campo:

```text
Buscar conversas...
```

A busca deve funcionar sobre conversas reais.

Não criar resultados fictícios.

---

# CONVERSAS

Cada conversa pode apresentar:

- avatar;
- nome;
- username;
- presença;
- última mensagem;
- timestamp;
- contador de mensagens não lidas.

Essas informações devem ser carregadas dinamicamente.

### Estado selecionado

A conversa ativa deve possuir:

- borda sutil verde;
- superfície diferenciada;
- destaque controlado;
- texto principal com maior contraste.

---

# 3. ÁREA PRINCIPAL DA CONVERSA

A área central é o foco da tela.

## Header

Altura aproximada:

```text
72px
```

Exibir dados reais da conversa atual:

- avatar;
- nome;
- username;
- badge de verificação, somente se realmente existir;
- presença realtime;
- informações de comunidade, somente quando existirem.

Ações:

- chamada de voz;
- chamada de vídeo;
- mais opções.

Essas ações devem estar conectadas a funcionalidades reais ou permanecer desabilitadas quando ainda não estiverem disponíveis.

Não simular uma chamada ativa apenas para fins visuais.

---

# MENSAGENS

As mensagens devem vir do sistema realtime/banco de dados.

Cada mensagem pode possuir:

- autor;
- avatar;
- conteúdo;
- timestamp;
- status de entrega;
- status de leitura;
- respostas;
- reações;
- anexos.

Somente mostrar recursos que realmente existam para aquela mensagem.

## Mensagens recebidas

Visual:

```text
background: #001A14
border: #00502F
```

Alinhamento à esquerda.

## Mensagens enviadas

Visual:

```text
background: #00DFA0
```

Texto escuro e contraste adequado.

Alinhamento à direita.

A aparência deve diferenciar claramente remetente e destinatário sem exagerar no contraste.

---

# TIMESTAMPS

Os horários devem ser gerados a partir do timestamp real da mensagem.

Nunca escrever horários manualmente apenas para parecer uma conversa real.

Utilizar formatação contextual:

- agora;
- minutos atrás;
- horário;
- ontem;
- data;
- etc.

A lógica deve respeitar o timezone do usuário.

---

# STATUS DE MENSAGEM

Quando disponível, exibir:

- enviada;
- entregue;
- lida.

Não mostrar confirmação de leitura se o sistema não possuir essa informação.

---

# COMPOSER

Parte inferior do chat.

Elementos possíveis:

```text
+
Anexar
Emoji
Campo de mensagem
Enviar
```

Placeholder:

```text
Digite sua mensagem...
```

O campo deve realmente aceitar mensagens.

O botão enviar deve possuir comportamento funcional.

---

# 4. PAINEL CONTEXTUAL

Largura aproximada:

```text
320px
```

Esse painel representa informações reais sobre a pessoa/conversa atual.

## Perfil

Exibir, quando disponível:

- banner;
- avatar;
- nome;
- username;
- badge;
- bio;
- status;
- quantidade de membros/seguidores, quando aplicável;
- data de entrada;
- interesses;
- jogos;
- hobbies.

Não criar informações para preencher o card.

---

# RELACIONAMENTO

O botão deve refletir o relacionamento real entre os usuários.

Possíveis estados:

```text
Adicionar amigo
Solicitação enviada
Aceitar solicitação
Amigos
Remover amigo
Bloquear
```

Nunca mostrar “Remover amigo” se os usuários não forem amigos.

Nunca mostrar “Amigos” sem confirmação no banco.

---

# MÍDIA COMPARTILHADA

Card:

```text
Mídia compartilhada
```

Exibir somente arquivos/imagens que realmente foram compartilhados naquela conversa ou contexto.

Se não houver mídia:

```text
Nenhuma mídia compartilhada ainda.
```

Não preencher o espaço com imagens aleatórias.

---

# LINKS

Exibir somente links realmente enviados ou associados ao perfil/conversa.

Exemplos de fontes possíveis:

- GitHub;
- Figma;
- sites;
- portfólios;
- projetos;
- documentos.

O URL precisa existir e ser válido.

Não utilizar:

```text
github.com/example
figma.com/example
site.com
```

como conteúdo final.

Se não houver links:

```text
Nenhum link compartilhado.
```

---

# SERVIDORES EM COMUM

Exibir somente comunidades das quais os dois usuários realmente fazem parte.

Cada item pode mostrar:

- avatar do servidor;
- nome;
- quantidade real de membros;
- indicador de atividade;
- acesso à comunidade.

Se não houver servidores em comum:

```text
Nenhum servidor em comum.
```

---

# AVATARES E IMAGENS

As imagens devem ser reais e possuir origem definida.

Prioridade:

1. imagem fornecida pelo usuário;
2. imagem armazenada no Supabase Storage;
3. imagem proveniente de uma API autorizada;
4. imagem pública com licença adequada.

Não utilizar imagens geradas por IA como se fossem fotos reais de usuários.

Quando uma imagem não existir:

- utilizar placeholder visual;
- estado vazio;
- avatar padrão oficial da Alura.

---

# DADOS E BACKEND

A UI deve ser preparada para consumir dados reais.

Stack prevista:

```text
React
TypeScript
Supabase
Elixir
Phoenix
WebSockets / Phoenix Channels
```

Supabase pode fornecer:

- autenticação;
- PostgreSQL;
- storage;
- dados de usuários;
- dados de amizades;
- metadados.

Elixir/Phoenix deve cuidar da camada realtime e dos eventos necessários.

---

# REALTIME

A tela deve ser pensada para atualização realtime.

Eventos possíveis:

```text
message.created
message.updated
message.deleted

conversation.created
conversation.updated

presence.online
presence.offline

friendship.created
friendship.updated

reaction.created
reaction.deleted

typing.started
typing.stopped
```

A UI não deve depender de refresh manual para atualizar informações realtime.

---

# ESTADOS OBRIGATÓRIOS

Toda seção deve possuir estados reais para:

## Loading

Utilizar skeleton.

## Empty

Mostrar uma mensagem clara.

## Error

Informar que houve erro e permitir tentar novamente quando aplicável.

## Offline

Indicar perda de conexão quando relevante.

## Permission denied

Não mostrar conteúdo que o usuário não possui permissão para visualizar.

## No data

Não fabricar conteúdo.

---

# RESPONSIVIDADE

## Desktop

```text
Rail + Conversas + Chat + Perfil
```

## Tablet

```text
Rail + Conversas + Chat
```

Painel contextual pode virar drawer.

## Mobile

A composição deve ser diferente.

Não simplesmente reduzir quatro colunas.

Fluxo:

```text
Navigation
→ Conversas
→ Conversa
→ Perfil como drawer
```

---

# ACESSIBILIDADE

Garantir:

- contraste adequado;
- foco visível;
- navegação por teclado;
- labels para botões;
- aria-label quando necessário;
- áreas clicáveis adequadas;
- suporte a leitores de tela;
- mensagens com estrutura semântica;
- estados não dependentes apenas de cor.

---

# MOTION

Utilizar microinterações sutis:

- hover;
- seleção de conversa;
- envio de mensagem;
- chegada de mensagem;
- abertura de painel;
- mudança de presença;
- reação.

As animações devem ser rápidas e naturais.

Não utilizar animações decorativas que prejudiquem a leitura.

---

# TIPOGRAFIA

Preferência:

```text
Inter
Geist
Manrope
```

Hierarquia:

```text
Título:       20–22px
Username:     15–16px
Texto:        14px
Secundário:   12–13px
```

Peso predominante:

```text
400
500
600
700
```

---

# ESPAÇAMENTO

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

Manter consistência em toda a interface.

---

# ÍCONES

Preferência:

```text
Lucide Icons
```

Características:

- lineares;
- simples;
- consistentes;
- mesma espessura;
- sem mistura de estilos.

---

# PRINCÍPIO DE IMPLEMENTAÇÃO

A interface deve ser construída como produto real, não como imagem estática.

Todos os componentes devem possuir comportamento coerente.

Exemplos:

```text
Buscar → realmente busca
Enviar → realmente envia
Nova conversa → realmente inicia fluxo
Perfil → realmente abre perfil
Remover amigo → altera relacionamento real
Mídia → mostra mídia real
Links → abre links reais
Servidor → abre servidor real
Presença → reflete presença real
```

---

# REGRA CONTRA MOCK DATA

Mock data somente pode existir em:

- testes automatizados;
- Storybook;
- protótipos explicitamente identificados;
- ambientes de desenvolvimento isolados.

Nunca apresentar mock data como dados reais na aplicação final.

Quando for necessário desenvolver uma tela antes da integração do backend, os dados devem ser claramente tratados como **fixture de desenvolvimento** e removidos/substituídos antes da entrega.

---

# REGRA CONTRA CONTEÚDO INVENTADO

Se não houver informação real disponível, não inventar.

Exemplo:

**Errado:**

```text
8.4k membros
Designer UI/UX
Entrou em 12/2023
github.com/luna-dev
```

se esses dados não existirem realmente.

**Correto:**

```text
Membros: indisponível
Cargo: não informado
Entrada: não informado
Links: nenhum link cadastrado
```

Ou utilizar o estado vazio apropriado.

---

# RESULTADO ESPERADO

A tela final deve transmitir:

```text
ALURA
Comunidades.
Pessoas.
Conversas.
Realtime.
```

Deve possuir:

- identidade visual própria;
- alta qualidade;
- alinhamento rigoroso;
- dados reais;
- integração preparada para Supabase;
- realtime preparado para Elixir/Phoenix;
- acessibilidade;
- responsividade;
- estados completos;
- comportamento funcional.

A imagem fornecida deve ser utilizada como referência de composição visual, mas **não deve transformar a Alura em uma cópia do Discord ou de qualquer outro produto**.

---

# CHECKLIST FINAL

Antes de considerar a tela pronta, validar:

- [ ] Todos os dados exibidos são reais.
- [ ] Nenhum link falso existe.
- [ ] Nenhum número foi inventado.
- [ ] Nenhum usuário fictício é apresentado como real.
- [ ] Nenhuma mensagem fake está presente em produção.
- [ ] Avatares possuem origem real ou placeholder oficial.
- [ ] Mídias possuem origem real.
- [ ] Servidores são reais.
- [ ] Relacionamentos refletem o banco.
- [ ] Presença reflete o realtime.
- [ ] Timestamps vêm dos dados reais.
- [ ] Estados loading/empty/error existem.
- [ ] Não existe lorem ipsum.
- [ ] Não existe conteúdo aleatório para preencher espaço.
- [ ] A interface não copia o Discord.
- [ ] A paleta oficial da Alura foi respeitada.
- [ ] O Design System foi respeitado.
- [ ] Responsividade foi validada.
- [ ] Acessibilidade foi validada.
- [ ] Build foi executado.
- [ ] Erros foram corrigidos.
- [ ] Fluxos principais foram testados.
