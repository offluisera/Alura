# ALURA — GUIA DE SERVIDORES
## Especificação de UI/UX, estrutura, layout, espaçamento e comportamento

> Esta especificação define a guia de **Servidores** da Alura.
> A página deve funcionar como o centro de descoberta, organização e acesso às comunidades do usuário.
>
> A experiência deve ser própria da Alura e não reproduzir a estrutura visual do Discord.

---

# 1. OBJETIVO

A guia de Servidores deve permitir ao usuário:

- visualizar servidores recentes;
- visualizar servidores dos quais participa;
- acessar rapidamente um servidor;
- criar um servidor;
- entrar em um servidor através de convite;
- explorar comunidades;
- pesquisar servidores;
- favoritar servidores;
- organizar servidores;
- visualizar atividade recente;
- receber indicação de novos servidores;
- acessar servidores privados e públicos.

A página deve transmitir a sensação de um **hub de comunidades**.

---

# 2. ESTRUTURA PRINCIPAL

Desktop:

```text
┌──────┬───────────────────────────────────────────────────────────────┐
│      │ Header                                                        │
│      ├───────────────────────────────────────────────────────────────┤
│ RAIL │                                                               │
│      │ Hero / Welcome                                                │
│      │                                                               │
│      │ [ Criar servidor ] [ Entrar por convite ] [ Explorar ]        │
│      │                                                               │
│      │ Servidores recentes                                           │
│      │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                   │
│      │ │ Server │ │ Server │ │ Server │ │ Server │                   │
│      │ └────────┘ └────────┘ └────────┘ └────────┘                   │
│      │                                                               │
│      │ Meus servidores                                                │
│      │                                                               │
│      │ ┌─────────────────────────────────────────────────────────┐   │
│      │ │ Server                                                   │   │
│      │ ├─────────────────────────────────────────────────────────┤   │
│      │ │ Server                                                   │   │
│      │ ├─────────────────────────────────────────────────────────┤   │
│      │ │ Server                                                   │   │
│      │ └─────────────────────────────────────────────────────────┘   │
└──────┴───────────────────────────────────────────────────────────────┘
```

---

# 3. LAYOUT MACRO

## Navigation Rail

```text
width: 72px
```

## Main Content

```text
flex: 1
min-width: 0
```

## Padding

Desktop:

```text
24px 32px
```

Notebook:

```text
20px 24px
```

Tablet:

```text
20px
```

Mobile:

```text
16px
```

---

# 4. HEADER

Altura:

```text
64px
```

Estrutura:

```text
┌──────────────────────────────────────────────────────────────┐
│ Servidores                    [ Buscar ]     [ + ] [ ... ]   │
└──────────────────────────────────────────────────────────────┘
```

Padding:

```text
0 20px
```

Gap:

```text
12px
```

Título:

```text
font-size: 20–24px
font-weight: 700
```

---

# 5. BUSCA

A busca deve permitir encontrar:

- servidores;
- comunidades;
- nomes;
- tags;
- categorias;
- convites.

Desktop:

```text
width: 320–420px
height: 40px
```

Mobile:

```text
width: 100%
height: 44px
```

Input:

```text
background: #001B0B
border: 1px solid #003C19
border-radius: 10px
padding: 0 14px
```

Focus:

```text
border-color: #00C98A
```

---

# 6. HERO

A seção inicial deve apresentar a função da página.

Estrutura:

```text
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  Suas comunidades                                         │
│  Encontre seu espaço, converse e participe.                │
│                                                            │
│  [ + Criar servidor ]  [ Entrar com convite ]              │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

Padding:

```text
24px
```

Border radius:

```text
18px
```

Background:

```text
#00220E
```

Pode utilizar um radial gradient muito discreto.

---

# 7. AÇÕES PRINCIPAIS

## Criar servidor

Primary:

```text
background: #00E6A0
color: #001609
height: 44px
padding: 0 18px
border-radius: 10px
```

## Entrar por convite

Secondary:

```text
background: #002A12
border: 1px solid #005022
height: 44px
padding: 0 18px
border-radius: 10px
```

## Explorar

Pode ser Ghost:

```text
background: transparent
color: #B8CEC2
height: 44px
padding: 0 16px
```

---

# 8. SERVIDORES RECENTES

Objetivo:

Permitir retornar rapidamente às comunidades utilizadas recentemente.

Título:

```text
font-size: 16–18px
margin-bottom: 12px
```

Grid:

Desktop:

```text
repeat(4, minmax(0, 1fr))
```

≥ 1600px:

```text
repeat(5, minmax(0, 1fr))
```

Tablet:

```text
repeat(2, minmax(0, 1fr))
```

Mobile:

```text
1fr
```

Gap:

```text
12px
```

---

# 9. SERVER CARD

Tamanho recomendado:

```text
min-height: 112px
```

Padding:

```text
16px
```

Radius:

```text
14px
```

Estrutura:

```text
┌──────────────────────────────┐
│ [ICON]                       │
│                              │
│ Nome do servidor             │
│ Descrição curta              │
│ ● 128 online                 │
└──────────────────────────────┘
```

Ícone:

```text
48px
```

Nome:

```text
14–16px
font-weight: 600
```

Descrição:

```text
12–13px
color: #789487
```

---

# 10. SERVER CARD — HOVER

Default:

```text
background: #002A12
border: 1px solid #00351A
```

Hover:

```text
background: #003014
border-color: #00421B
```

Transformação:

```text
translateY(-1px)
```

Transition:

```text
150–180ms
```

Não utilizar zoom exagerado.

---

# 11. SERVER CARD — ACTIVE

Quando o servidor estiver selecionado:

```text
background: #003516
border-color: #00C98A
```

Adicionar indicador visual discreto.

Não depender apenas da cor.

Pode utilizar:

```text
barra lateral de 3px
```

ou

```text
ícone/indicador ativo
```

---

# 12. MEUS SERVIDORES

Seção principal da página.

Estrutura:

```text
Meus servidores                         [ Ordenar ]

[ Lista / Grid ]

Servidor A
Servidor B
Servidor C
Servidor D
```

Espaçamento:

```text
section margin-top: 32px
```

---

# 13. ORDENAÇÃO

Opções:

```text
Recentes
Nome
Mais ativos
Favoritos
Criados por mim
```

Controle:

```text
height: 36–40px
padding: 0 12px
radius: 8px
```

---

# 14. VISUALIZAÇÃO

Permitir:

```text
Grid
Lista
```

## Grid

Melhor para:

- descoberta;
- servidores com branding;
- comunidades visuais.

## Lista

Melhor para:

- usuários com muitos servidores;
- produtividade;
- gerenciamento.

Preferência do usuário deve ser persistida localmente.

---

# 15. LIST VIEW

Estrutura:

```text
┌───────────────────────────────────────────────────────────────┐
│ Icon │ Nome        │ Membros │ Atividade       │ Ações        │
├───────────────────────────────────────────────────────────────┤
│ Icon │ Alura Dev   │ 1.2k    │ ● Alta           │ ...          │
├───────────────────────────────────────────────────────────────┤
│ Icon │ Design Lab  │ 480     │ ● Média          │ ...          │
└───────────────────────────────────────────────────────────────┘
```

Altura:

```text
64px
```

Padding:

```text
8px 12px
```

---

# 16. FAVORITOS

Servidores favoritos devem aparecer primeiro ou em uma seção própria.

Visual:

```text
★ Favoritos
```

Ação:

```text
Adicionar aos favoritos
Remover dos favoritos
```

Favorito não deve depender exclusivamente de cor.

Usar ícone de estrela.

---

# 17. CRIAR SERVIDOR

O botão de criar servidor abre um fluxo.

## Modal inicial

```text
Criar seu servidor

Escolha como começar.

[ Criar do zero ]
[ Usar modelo ]
```

Modal:

```text
width: 480–560px
padding: 24px
radius: 18px
```

---

# 18. CRIAÇÃO — SERVIDOR DO ZERO

Etapas:

```text
1. Nome
2. Ícone
3. Descrição
4. Tipo
5. Privacidade
6. Canais iniciais
7. Confirmação
```

Não criar um formulário gigante.

Preferir wizard ou etapas curtas.

---

# 19. ENTRAR POR CONVITE

Modal:

```text
Entrar em um servidor

Cole o código ou link do convite.

[ https://alura/... ]

[ Cancelar ] [ Entrar ]
```

Input:

```text
height: 48px
```

Validar:

```text
convite válido
convite expirado
convite inválido
servidor cheio
usuário banido
servidor indisponível
```

---

# 20. EXPLORAR SERVIDORES

A seção Explorar pode possuir:

```text
Categorias
Comunidades em destaque
Mais populares
Novas comunidades
Recomendados
```

Categorias:

```text
Tecnologia
Games
Design
Música
Educação
Arte
Comunidades
Criadores
Projetos
```

As categorias podem evoluir conforme o produto.

---

# 21. SERVER DISCOVERY CARD

Maior que o card normal.

```text
┌─────────────────────────────────────────────┐
│                 BANNER                      │
│                                             │
│  [ICON]  Nome da comunidade                 │
│          Descrição                          │
│                                             │
│  ● 12.4k membros    ● 1.8k online          │
│                                             │
│  Tecnologia · Programação                   │
│                                             │
│                     [ Entrar ]              │
└─────────────────────────────────────────────┘
```

Padding:

```text
16px
```

Radius:

```text
14–18px
```

---

# 22. ESTADOS

## Loading

Usar skeleton.

```text
┌──────────────────────────────┐
│ ████████                     │
│ █████████████                │
│ ███████                      │
└──────────────────────────────┘
```

Não bloquear toda a página se apenas uma seção estiver carregando.

---

## Empty

Quando não houver servidores:

```text
Você ainda não participa de nenhuma comunidade.

Crie seu próprio servidor ou encontre
uma comunidade para começar.

[ Criar servidor ]
[ Explorar comunidades ]
```

---

## Search Empty

```text
Nenhuma comunidade encontrada.

Tente outro nome, categoria ou termo.
```

---

## Error

```text
Não foi possível carregar os servidores.

[ Tentar novamente ]
```

---

# 23. NOTIFICAÇÕES

Servidor com atividade nova pode possuir indicador:

```text
●
```

ou badge numérico.

Exemplo:

```text
Alura Dev
● 3
```

Nunca depender somente de cor.

---

# 24. CONTEXT MENU

Ao clicar com botão direito ou menu `...`:

```text
Abrir
Marcar como favorito
Marcar como lido
Silenciar
Configurações
Copiar convite
Sair do servidor
```

Ações destrutivas devem ficar separadas.

```text
Sair do servidor
```

deve possuir confirmação.

---

# 25. CONTEXTO DO SERVIDOR

Ao passar o mouse:

```text
Nome
Descrição
Membros
Online
Última atividade
```

Tooltip não deve substituir informação essencial.

---

# 26. SCROLL

A página deve possuir:

```text
Main scroll
```

Não criar múltiplas áreas de scroll sem necessidade.

Se a navegação lateral estiver fixa:

```text
Rail → fixed
Main → scroll
```

---

# 27. RESPONSIVIDADE

## ≥ 1440px

```text
72px Rail
Main
Grid 4–5 cards
```

## 1200–1439px

```text
72px Rail
Main
Grid 3–4 cards
```

## 900–1199px

```text
72px Rail
Main
Grid 2 cards
```

## < 900px

```text
Main
Grid 1–2 cards
```

## Mobile

```text
Header
Search
Actions
Recent
My Servers
Bottom navigation
```

Padding:

```text
16px
```

---

# 28. MOBILE SERVER CARD

Altura:

```text
96–112px
```

Ícone:

```text
44px
```

Padding:

```text
14px
```

Evitar cards excessivamente altos.

---

# 29. ACESSIBILIDADE

Obrigatório:

- navegação por teclado;
- foco visível;
- labels;
- aria-label;
- contraste;
- estados não dependentes somente de cor;
- suporte a screen readers;
- touch target mínimo de 44×44px;
- reduced motion.

Grid e lista devem ser navegáveis pelo teclado.

---

# 30. KEYBOARD SHORTCUTS

Sugestões:

```text
Ctrl/Cmd + K → busca
Ctrl/Cmd + Shift + S → servidores
```

Atalhos devem ser configuráveis futuramente.

Não criar conflitos com atalhos do sistema operacional.

---

# 31. MOTION

Entrada de cards:

```text
150–220ms
```

Hover:

```text
120–180ms
```

Modal:

```text
200–280ms
```

Drawer:

```text
200–280ms
```

Evitar:

- bounce;
- zoom agressivo;
- animações infinitas;
- partículas constantes.

---

# 32. PERFORMANCE

A lista de servidores pode crescer muito.

Preparar a arquitetura para:

- paginação;
- virtualização;
- lazy loading;
- carregamento progressivo;
- cache;
- imagens otimizadas.

Não carregar banners e imagens de todos os servidores simultaneamente se não forem necessários.

---

# 33. IMAGENS

Ícones de servidor:

```text
Preferência: SVG/WebP/AVIF
```

Tamanho visual:

```text
32–64px
```

Banners:

```text
lazy loading
object-fit: cover
```

Não deformar imagens.

---

# 34. SEGURANÇA VISUAL

Não exibir informações privadas de servidores na descoberta pública.

Servidor privado deve possuir:

```text
visibility: private
```

e não deve aparecer em resultados públicos sem autorização.

---

# 35. COMPONENTES REUTILIZÁVEIS

Criar componentes independentes:

```text
ServerCard
ServerListItem
ServerGrid
ServerSearch
ServerFilters
ServerSort
ServerCreateModal
ServerInviteModal
ServerDiscoveryCard
ServerCategory
ServerEmptyState
ServerSkeleton
ServerContextMenu
FavoriteButton
```

Evitar componentes monolíticos.

---

# 36. TOKENS ESPECÍFICOS

```css
:root {
  --server-card-radius: 14px;
  --server-card-padding: 16px;
  --server-card-gap: 12px;

  --server-icon-sm: 32px;
  --server-icon-md: 48px;
  --server-icon-lg: 64px;

  --server-header-height: 64px;

  --server-content-padding: 24px;
  --server-mobile-padding: 16px;
}
```

---

# 37. REGRAS DE IMPLEMENTAÇÃO

1. A guia de servidores não deve copiar o Discord.
2. Servidores são tratados como comunidades, não apenas como ícones.
3. O conteúdo deve ter hierarquia clara.
4. Criar servidor deve ser uma ação evidente.
5. Entrar por convite deve ser simples.
6. Busca deve ser rápida e acessível.
7. Grid e lista devem ser suportados.
8. Favoritos devem ser persistentes.
9. Estados vazios devem possuir ação.
10. Estados de erro devem permitir recuperação.
11. Não utilizar cores arbitrárias.
12. Não utilizar espaçamentos arbitrários.
13. Reutilizar Design Tokens.
14. Reutilizar componentes do Design System.
15. Não implementar visual sem considerar loading, empty e error.
16. Não utilizar hover como único mecanismo de interação.
17. Toda interação deve possuir feedback.
18. A interface deve funcionar com teclado e toque.
19. Servidores privados devem respeitar permissões e visibilidade.
20. A performance deve considerar milhares de servidores.
21. Novos componentes devem ser documentados.
22. Alterações estruturais devem atualizar esta especificação.

---

# 38. FLUXO PRINCIPAL

```text
Servidores
    │
    ├── Pesquisar
    │
    ├── Abrir servidor
    │
    ├── Criar servidor
    │      ├── Do zero
    │      └── Modelo
    │
    ├── Entrar por convite
    │
    ├── Explorar
    │      ├── Categorias
    │      ├── Destaques
    │      ├── Populares
    │      └── Recomendados
    │
    └── Gerenciar
           ├── Favoritar
           ├── Silenciar
           ├── Marcar como lido
           ├── Configurações
           └── Sair
```

---

# 39. RESULTADO ESPERADO

A guia de servidores deve parecer:

```text
                    ALURA
                      │
              ┌───────┴───────┐
              │   SERVIDORES  │
              └───────┬───────┘
                      │
       ┌──────────────┼──────────────┐
       │              │              │
   Descobrir       Participar      Criar
       │              │              │
   Comunidades      Servidores      Comunidade
       │              │              │
       └──────────────┼──────────────┘
                      │
                 Experiência
                  comunitária
```

> **A guia de Servidores deve transformar a Alura em um espaço de comunidades, e não apenas em um aplicativo de mensagens.**
