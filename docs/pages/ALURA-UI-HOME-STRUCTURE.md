# ALURA — UI INICIAL / PÁGINA PRINCIPAL
## Estrutura, Grid, Padding, Spacing e Regras de Composição

> Documento de referência para implementação da UI inicial da Alura.
> O objetivo é garantir consistência estrutural entre Web e Desktop e impedir que cada tela crie seus próprios espaçamentos.

---

# 1. Objetivo da página principal

A página principal é o **hub central da Alura**.

Ela deve permitir que o usuário tenha acesso rápido a:

- servidores;
- amigos;
- solicitações;
- mensagens;
- atividades recentes;
- notificações;
- busca;
- perfil;
- configurações.

A página não deve parecer uma cópia do Discord.

A composição deve utilizar uma estrutura própria baseada em:

```text
Navigation Rail
        +
Context Sidebar
        +
Main Workspace
        +
Optional Information Panel
```

---

# 2. Estrutura macro

Desktop:

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         TOP / SEARCH                                │
├──────┬──────────────────────┬───────────────────────────────────────┤
│      │                      │                                       │
│      │                      │                                       │
│ RAIL │   CONTEXT SIDEBAR    │           MAIN WORKSPACE              │
│      │                      │                                       │
│      │                      │                                       │
│      │                      │                                       │
│      │                      │                                       │
│      │                      │                                       │
├──────┴──────────────────────┴───────────────────────────────────────┤
│                         USER / STATUS                               │
└─────────────────────────────────────────────────────────────────────┘
```

Quando existir um painel complementar:

```text
┌──────┬──────────────┬────────────────────────────┬───────────────┐
│ RAIL │   SIDEBAR    │       MAIN WORKSPACE       │    PANEL      │
└──────┴──────────────┴────────────────────────────┴───────────────┘
```

O painel direito é opcional e deve aparecer somente quando houver informação útil.

---

# 3. Grid principal

A aplicação deve utilizar um sistema de grid fluido.

## Desktop ≥ 1440px

```text
Rail:            72px
Sidebar:         280px
Gap:             16px
Main:            flex: 1
Right Panel:     280–320px
```

Estrutura:

```text
72px | 280px | 16px | FLEX | 16px | 300px
```

O painel direito pode desaparecer em resoluções menores.

---

# 4. Navigation Rail

## Largura

```text
72px
```

## Padding horizontal

```text
12px
```

## Conteúdo

Cada item:

```text
48px × 48px
```

Gap entre itens:

```text
8px
```

Separação entre grupos:

```text
16px
```

Exemplo:

```text
┌────────┐
│        │
│   A    │  48
│        │
├────────┤
│   ◉    │
│   ◉    │
│   ◉    │
│   ◉    │
│        │
├────────┤
│   +    │
│        │
└────────┘
  72px
```

---

# 5. Logo

Área do logo:

```text
48px × 48px
```

Margem superior:

```text
16px
```

Margem inferior:

```text
20px
```

O símbolo deve ter área visual interna aproximada de:

```text
32px × 32px
```

Não encostar o logo nas bordas.

---

# 6. Context Sidebar

Largura padrão:

```text
280px
```

Padding:

```text
16px
```

Header interno:

```text
padding: 8px 8px 16px
```

Seção:

```text
margin-bottom: 20px
```

Título de categoria:

```text
font-size: 11–12px
letter-spacing: 0.08em
```

Itens:

```text
height: 40px
padding: 0 12px
border-radius: 10px
```

Gap entre itens:

```text
4px
```

---

# 7. Main Workspace

A área principal deve possuir:

```text
padding: 20px
```

Em telas grandes:

```text
padding: 24px
```

Em telas muito largas:

```text
padding: 24px 32px
```

Nunca criar conteúdo colado diretamente na borda da viewport.

---

# 8. Header principal

Altura recomendada:

```text
64px
```

Padding horizontal:

```text
16px
```

Padding vertical:

```text
8px
```

Estrutura:

```text
┌──────────────────────────────────────────────────────┐
│  Título / contexto       Busca       Ações / Avatar │
└──────────────────────────────────────────────────────┘
```

Gap entre elementos:

```text
12px
```

---

# 9. Barra de busca

Altura:

```text
40px
```

Desktop:

```text
width: 320–480px
```

Border radius:

```text
10px
```

Padding:

```text
0 14px
```

Ícone:

```text
18px
```

Texto:

```text
14px
```

A busca deve ser um elemento importante, mas não dominar a tela.

---

# 10. Sistema de espaçamento

Usar escala baseada em 4px.

```text
4px   = 1x
8px   = 2x
12px  = 3x
16px  = 4x
20px  = 5x
24px  = 6x
32px  = 8x
40px  = 10x
48px  = 12x
64px  = 16x
80px  = 20x
```

## Regra

Preferir múltiplos de 4.

Evitar valores arbitrários como:

```text
13px
17px
19px
23px
27px
```

quando não houver justificativa visual ou técnica.

---

# 11. Padding dos componentes

## Card

```text
padding: 20px
```

Card compacto:

```text
padding: 16px
```

Card destacado:

```text
padding: 24px
```

## Button

Small:

```text
height: 32px
padding: 0 12px
```

Medium:

```text
height: 40px
padding: 0 16px
```

Large:

```text
height: 48px
padding: 0 20px
```

## Input

```text
height: 40px
padding: 0 14px
```

Textarea:

```text
padding: 12px 14px
```

---

# 12. Border Radius

Sistema:

```text
radius-xs: 6px
radius-sm: 8px
radius-md: 10px
radius-lg: 14px
radius-xl: 18px
radius-2xl: 24px
radius-full: 9999px
```

Uso:

```text
Inputs       → 10px
Buttons      → 10px
Cards        → 14px
Panels       → 14–18px
Avatars      → 9999px
Badges       → 9999px
Modals       → 18px
```

---

# 13. Hierarquia de superfícies

A UI deve utilizar camadas.

```text
Background
   ↓
Navigation
   ↓
Panel
   ↓
Card
   ↓
Hover
   ↓
Active
```

Tokens:

```text
Background → #001609
Navigation → #001B0B
Panel      → #00220E
Card       → #002A12
Hover      → #003014
Active     → #003516
```

Não utilizar sombras pesadas para criar toda a hierarquia.

A diferença de superfície deve fazer grande parte do trabalho.

---

# 14. Cards

Card padrão:

```text
background: #002A12
border: 1px solid #00351A
border-radius: 14px
padding: 20px
```

Hover:

```text
background: #003014
border-color: #00421B
```

Active:

```text
background: #003516
border-color: #00C98A
```

---

# 15. Sidebar inferior / usuário

A área do usuário deve permanecer separada da navegação principal.

Altura:

```text
64px
```

Padding:

```text
8px
```

Avatar:

```text
40px
```

Estrutura:

```text
┌──────────────────────────────┐
│  ●  Avatar  Nome             │
│            @usuario    ⚙     │
└──────────────────────────────┘
```

---

# 16. Avatar

Tamanhos:

```text
xs → 24px
sm → 32px
md → 40px
lg → 48px
xl → 64px
2xl → 96px
```

Avatar de lista:

```text
40px
```

Avatar de mensagem:

```text
40px
```

Avatar de perfil:

```text
80–96px
```

Status deve ficar sobreposto ao avatar.

---

# 17. Página inicial — conteúdo recomendado

A Home deve possuir uma hierarquia clara.

## Primeira camada

```text
Header
    ↓
Mensagem de boas-vindas
    ↓
Ações rápidas
```

## Segunda camada

```text
Servidores recentes
Amigos online
Mensagens recentes
```

## Terceira camada

```text
Atividade
Eventos
Descoberta
```

Não colocar todos os módulos na tela ao mesmo tempo.

A Home deve priorizar o que o usuário precisa agora.

---

# 18. Welcome Section

Margem inferior:

```text
24px
```

Título:

```text
font-size: 28–32px
font-weight: 700
```

Descrição:

```text
font-size: 14–16px
```

Exemplo estrutural:

```text
Olá, usuário 👋
O que vamos fazer hoje?

[ Criar servidor ] [ Adicionar amigo ]
```

---

# 19. Quick Actions

Grid:

```text
repeat(2, minmax(0, 1fr))
```

ou em telas maiores:

```text
repeat(4, minmax(0, 1fr))
```

Gap:

```text
12px
```

Card:

```text
padding: 16px
min-height: 96px
```

Não usar cards gigantes.

---

# 20. Seções

Cada seção deve seguir:

```text
Título
Descrição opcional
Conteúdo
```

Espaçamento:

```text
Título → conteúdo: 12px
Seção → seção: 24–32px
```

Exemplo:

```text
Servidores recentes

[ Card ] [ Card ] [ Card ]


Amigos online

[ User ] [ User ] [ User ]


Atividade recente

[ Activity list ]
```

---

# 21. Lista de servidores

Item:

```text
height: 48px
padding: 0 10px
border-radius: 10px
```

Avatar/ícone:

```text
32px
```

Gap:

```text
10px
```

Estado ativo:

```text
background: #003516
border: 1px solid #00C98A
```

---

# 22. Lista de amigos

Item:

```text
min-height: 64px
padding: 10px 12px
```

Avatar:

```text
40px
```

Gap:

```text
12px
```

Informações:

```text
Nome
@username
Status
```

Ações devem aparecer no hover para reduzir ruído visual.

---

# 23. Mensagens recentes

Card:

```text
padding: 12px 16px
```

Avatar:

```text
40px
```

Conteúdo:

```text
Nome
Canal/servidor
Mensagem
Timestamp
```

Preview de mensagem deve ser limitado a aproximadamente:

```text
1–2 linhas
```

---

# 24. Right Panel

O painel direito é contextual.

Não deve existir obrigatoriamente em todas as páginas.

Largura:

```text
280–320px
```

Padding:

```text
16px
```

Pode conter:

- perfil;
- atividade;
- eventos;
- membros online;
- informações do servidor;
- atalhos.

Em largura menor:

```text
< 1200px
```

ocultar ou transformar em drawer.

---

# 25. Responsividade

## ≥ 1440px

```text
Rail
+
Sidebar
+
Main
+
Right Panel opcional
```

## 1200–1439px

```text
Rail
+
Sidebar
+
Main
```

Right Panel vira drawer ou desaparece.

## 900–1199px

```text
Rail
+
Main
```

Sidebar vira drawer.

## < 900px

Usar navegação adaptada:

```text
Top Bar
+
Main
+
Bottom Navigation / Drawer
```

## Mobile

Não tentar manter o layout desktop reduzido.

Criar composição mobile própria.

---

# 26. Safe Areas

Em Desktop:

```text
min 16px
```

Em Mobile:

```text
padding-inline: 16px
```

Considerar:

```text
env(safe-area-inset-top)
env(safe-area-inset-bottom)
```

quando necessário.

---

# 27. Scroll

A aplicação deve evitar scroll global desnecessário.

Preferir áreas independentes:

```text
Navigation → scroll próprio
Sidebar    → scroll próprio
Main       → scroll próprio
Right      → scroll próprio
```

O header pode permanecer fixo enquanto o conteúdo rola.

---

# 28. Overflow

Mensagens, nomes e títulos não devem quebrar o layout.

Usar:

```css
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
```

quando apropriado.

Conteúdo longo deve possuir estratégia explícita de quebra.

---

# 29. Motion

As animações devem ser sutis.

Entrada:

```text
150–220ms
```

Interação:

```text
120–180ms
```

Modal/painel:

```text
200–280ms
```

Usar easing suave.

Evitar:

- bounce excessivo;
- zoom agressivo;
- glow pulsante constante;
- animações que dificultem leitura.

Respeitar:

```css
prefers-reduced-motion
```

---

# 30. Hierarquia visual

Prioridade:

```text
1. Contexto
2. Ação principal
3. Conteúdo
4. Estado
5. Informações secundárias
6. Decoração
```

A decoração nunca deve competir com o conteúdo.

---

# 31. Densidade

A Alura deve ter densidade moderada.

Não criar:

```text
elemento + elemento + elemento + elemento
```

sem espaço.

Usar:

```text
4px → micro
8px → relacionado
12px → componente
16px → bloco
24px → seção
32px → mudança de contexto
```

---

# 32. Acessibilidade

Todos os elementos interativos devem possuir:

- foco visível;
- contraste adequado;
- área clicável adequada;
- label ou aria-label quando necessário;
- navegação por teclado;
- estados de hover/focus/active;
- feedback de erro;
- suporte a reduced motion.

Área mínima recomendada para controles:

```text
40×40px
```

Preferível:

```text
44×44px
```

---

# 33. Estados obrigatórios

Cada página/componente deve considerar:

```text
Default
Hover
Focus
Active
Disabled
Loading
Empty
Error
Success
```

Não implementar somente o estado visual de sucesso.

---

# 34. Loading

Preferir skeletons em conteúdo estrutural.

Exemplo:

```text
┌──────────────────────────┐
│ █████████████            │
│ ███████                  │
│ █████████████████        │
└──────────────────────────┘
```

Evitar spinner central para toda a página quando somente uma seção está carregando.

---

# 35. Empty State

Todo módulo vazio deve explicar:

```text
O que está vazio
Por que está vazio
O que o usuário pode fazer
```

Exemplo:

```text
Nenhum amigo online

Quando seus amigos estiverem online,
eles aparecerão aqui.

[ Adicionar amigo ]
```

---

# 36. Regra de implementação

Nenhum componente deve definir espaçamentos arbitrários diretamente se existir um token correspondente.

Preferir:

```text
space-1
space-2
space-3
space-4
space-5
space-6
space-8
```

Em vez de:

```text
margin: 17px;
padding: 13px;
gap: 19px;
```

---

# 37. CSS / Design Tokens sugeridos

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  --radius-xs: 6px;
  --radius-sm: 8px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  --rail-width: 72px;
  --sidebar-width: 280px;
  --right-panel-width: 300px;

  --header-height: 64px;
}
```

---

# 38. Regra de ouro da composição

Sempre construir a interface nesta ordem:

```text
1. Viewport
      ↓
2. Layout principal
      ↓
3. Navigation
      ↓
4. Sidebars
      ↓
5. Workspace
      ↓
6. Sections
      ↓
7. Components
      ↓
8. Content
      ↓
9. Decoration
```

Nunca começar pelo componente e depois tentar descobrir onde ele deve ficar.

---

# 39. Regra de identidade

A UI deve continuar reconhecível como Alura mesmo sem o logo.

Características obrigatórias:

```text
Dark-first
+
Deep green surfaces
+
Emerald interaction
+
Soft borders
+
Controlled glow
+
Moderate radius
+
Clean typography
+
Subtle motion
```

A interface deve ser inspirada no ecossistema moderno de aplicações em tempo real, mas não deve copiar a estrutura visual do Discord.

---

# 40. Checklist de implementação

Antes de considerar a Home pronta:

- [ ] Grid responsivo implementado
- [ ] Rail com 72px
- [ ] Sidebar com 280px
- [ ] Header com 64px
- [ ] Espaçamento baseado em 4px
- [ ] Design Tokens utilizados
- [ ] Cards com hierarquia correta
- [ ] Estados de interação
- [ ] Loading
- [ ] Empty State
- [ ] Error State
- [ ] Acessibilidade
- [ ] Keyboard navigation
- [ ] Reduced motion
- [ ] Responsive desktop
- [ ] Responsive tablet
- [ ] Responsive mobile
- [ ] Scroll independente
- [ ] Overflow tratado
- [ ] Nenhuma cor arbitrária
- [ ] Nenhum espaçamento arbitrário
- [ ] Nenhum componente visual copiado do Discord

---

# 41. Resultado esperado

A página principal deve transmitir:

```text
ALURA
│
├── Navegação rápida
├── Contexto claro
├── Conteúdo central
├── Ações óbvias
├── Pouco ruído
├── Profundidade visual
└── Sensação de aplicação viva
```

> **A interface da Alura deve parecer um sistema operacional de comunidades, não apenas um aplicativo de chat.**
