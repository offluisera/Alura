# ALURA — COLOR SYSTEM V2
## Sistema oficial de cores da Alura

**Status:** OFICIAL  
**Versão:** 2.0  
**Uso:** Web, Desktop, Mobile, componentes, estados e materiais de produto  
**Base visual:** Alura Dark Teal  
**Princípio:** Alura é escura por natureza e verde quando está viva.

---

# 1. Objetivo

Este documento define o sistema oficial de cores da Alura.

A versão V2 consolida a direção visual observada na interface principal da Alura: uma base quase preta, superfícies profundas em verde-teal e um verde luminoso utilizado de forma controlada para interação, estado e identidade.

Este arquivo deve ser considerado a **fonte oficial de verdade para cores**.

Nenhum agente, componente ou página deve criar uma paleta paralela sem justificativa arquitetural e aprovação.

---

# 2. Identidade cromática

A Alura não deve parecer:

- um aplicativo roxo;
- uma interface neon;
- uma interface totalmente preta sem profundidade;
- uma aplicação genérica de SaaS;
- uma cópia visual de Discord.

A identidade deve resultar da combinação:

```text
Preto profundo
+
Verde-teal estrutural
+
Verde vivo de interação
+
Texto quase branco
+
Contraste controlado
```

A cor deve comunicar estado e hierarquia.

---

# 3. Princípio central

> **Alura é escura por natureza e verde quando está viva.**

O verde não deve preencher toda a interface.

Ele aparece quando algo:

- está ativo;
- está selecionado;
- pode ser acionado;
- está disponível;
- está conectado;
- representa a identidade da Alura;
- precisa chamar atenção.

---

# 4. Palette Core

## 4.1 Background

### `#000808` — Background

Uso principal:

- fundo global;
- áreas sem conteúdo;
- shell principal;
- espaços entre superfícies.

É a cor mais profunda do sistema.

```css
--alura-background: #000808;
```

---

## 4.2 Navigation

### `#001210` — Navigation

Uso:

- Navigation Rail;
- navegação principal;
- áreas estruturais;
- barras laterais profundas.

```css
--alura-navigation: #001210;
```

---

## 4.3 Surface 1

### `#001A14` — Panel

Uso:

- painéis;
- sidebars;
- áreas de contexto;
- containers principais.

```css
--alura-surface-1: #001A14;
```

---

## 4.4 Surface 2

### `#00291A` — Card

Uso:

- cards;
- inputs;
- blocos de conteúdo;
- áreas agrupadas.

```css
--alura-surface-2: #00291A;
```

---

## 4.5 Surface 3

### `#003018` — Elevated

Uso:

- menus;
- dropdowns;
- cards elevados;
- popovers;
- elementos temporariamente destacados.

```css
--alura-surface-3: #003018;
```

---

# 5. Interactive Surfaces

## 5.1 Hover

### `#003820`

Uso:

- hover de cards;
- hover de botões secundários;
- hover de linhas;
- navegação.

```css
--alura-hover: #003820;
```

---

## 5.2 Selected

### `#004028`

Uso:

- item selecionado;
- navegação ativa;
- filtro ativo;
- canal/sala ativa;
- estado selecionado.

```css
--alura-selected: #004028;
```

---

# 6. Borders

## 6.1 Border

### `#00502F`

Uso:

- bordas de cards;
- inputs;
- divisores importantes;
- componentes interativos.

```css
--alura-border: #00502F;
```

---

## 6.2 Border Strong

### `#00663A`

Uso:

- foco;
- seleção forte;
- componentes ativos;
- elementos que precisam de maior separação.

```css
--alura-border-strong: #00663A;
```

Não utilizar como borda padrão em toda a interface.

---

# 7. Accent

## 7.1 Accent

### `#00DFA0`

Esta é a **cor principal da marca em interface**.

Uso:

- CTA primário;
- links importantes;
- estados ativos;
- indicadores de disponibilidade;
- elementos de interação;
- destaques;
- identidade visual.

```css
--alura-accent: #00DFA0;
```

---

## 7.2 Accent Bright

### `#00F0A8`

Uso restrito:

- hover de CTA;
- estados de destaque;
- texto/acento que precisa de máximo contraste;
- momentos de feedback positivo;
- pequenos elementos de marca.

```css
--alura-accent-bright: #00F0A8;
```

Evitar usar esta cor em grandes áreas.

---

# 8. Green Supporting

## 8.1 Green Muted

### `#1B4837`

Uso:

- elementos decorativos;
- backgrounds de ícones;
- áreas secundárias;
- elementos de suporte visual.

```css
--alura-green-muted: #1B4837;
```

---

## 8.2 Green Soft

### `#478F6F`

Uso:

- estados secundários;
- indicadores;
- texto de suporte;
- elementos gráficos discretos.

```css
--alura-green-soft: #478F6F;
```

---

# 9. Typography Colors

## 9.1 Primary Text

### `#F0FFF8`

Uso:

- títulos;
- nomes;
- texto principal;
- elementos de alta prioridade.

```css
--alura-text-primary: #F0FFF8;
```

---

## 9.2 Secondary Text

### `#B5CEC2`

Uso:

- descrições;
- subtítulos;
- textos secundários;
- labels.

```css
--alura-text-secondary: #B5CEC2;
```

---

## 9.3 Muted Text

### `#789487`

Uso:

- timestamps;
- metadata;
- placeholders;
- informações auxiliares.

```css
--alura-text-muted: #789487;
```

---

## 9.4 Disabled Text

### `#496356`

Uso:

- controles desabilitados;
- texto inativo;
- elementos indisponíveis.

```css
--alura-text-disabled: #496356;
```

---

# 10. Estados Semânticos

As cores semânticas continuam separadas da identidade principal.

Elas devem comunicar significado e não decoração.

## Success

```text
#00DFA0
```

Usar para:

- concluído;
- disponível;
- sucesso;
- conexão ativa.

---

## Warning

```text
#D9B84A
```

Usar para:

- atenção;
- estado parcial;
- aviso.

```css
--alura-warning: #D9B84A;
```

---

## Danger

```text
#FF5C6C
```

Usar para:

- erro;
- exclusão;
- bloqueio;
- ações destrutivas.

```css
--alura-danger: #FF5C6C;
```

---

## Info

```text
#58A6FF
```

Usar para:

- informação;
- ajuda;
- notificações informativas.

```css
--alura-info: #58A6FF;
```

---

## Voice

```text
#7CF7C0
```

Usar para:

- voz conectada;
- participante falando;
- estado de áudio;
- comunicação em tempo real.

```css
--alura-voice: #7CF7C0;
```

---

## AI

```text
#8B7CFF
```

Usar exclusivamente para:

- recursos de IA;
- agentes;
- automações de IA;
- respostas geradas por IA.

A cor AI não deve substituir o verde principal da marca.

```css
--alura-ai: #8B7CFF;
```

---

# 11. Tabela Oficial

| Token | Hex | Função |
|---|---|---|
| `background` | `#000808` | Fundo global |
| `navigation` | `#001210` | Navegação |
| `surface-1` | `#001A14` | Painéis |
| `surface-2` | `#00291A` | Cards |
| `surface-3` | `#003018` | Elevados |
| `hover` | `#003820` | Hover |
| `selected` | `#004028` | Selecionado |
| `border` | `#00502F` | Bordas |
| `border-strong` | `#00663A` | Foco/ativo |
| `accent` | `#00DFA0` | Principal |
| `accent-bright` | `#00F0A8` | Destaque |
| `green-muted` | `#1B4837` | Verde auxiliar |
| `green-soft` | `#478F6F` | Verde secundário |
| `text-primary` | `#F0FFF8` | Texto principal |
| `text-secondary` | `#B5CEC2` | Texto secundário |
| `text-muted` | `#789487` | Metadata |
| `text-disabled` | `#496356` | Disabled |
| `success` | `#00DFA0` | Sucesso |
| `warning` | `#D9B84A` | Aviso |
| `danger` | `#FF5C6C` | Erro/perigo |
| `info` | `#58A6FF` | Informação |
| `voice` | `#7CF7C0` | Voz |
| `ai` | `#8B7CFF` | IA |

---

# 12. Hierarquia de superfícies

A interface deve seguir esta profundidade:

```text
LEVEL 0
#000808
Background

LEVEL 1
#001210
Navigation

LEVEL 2
#001A14
Panel

LEVEL 3
#00291A
Card

LEVEL 4
#003018
Elevated

LEVEL 5
#003820
Hover

LEVEL 6
#004028
Selected
```

Não utilizar superfícies aleatórias entre esses níveis sem necessidade.

---

# 13. Uso do Accent

Regra recomendada:

```text
90%+
Dark / Teal / Neutral
```

```text
<10%
Accent / Green
```

O verde deve ter valor semântico.

Exemplos corretos:

```text
[ Publicar ]
[ Adicionar amigo ]
● Online
Item ativo
CTA principal
```

Exemplos incorretos:

```text
Página inteira verde
Cards inteiros neon
Texto inteiro verde
Glow permanente
Todos os ícones verdes
```

---

# 14. Botões

## Primary

Background:

```text
#00DFA0
```

Texto:

```text
#000808
```

Hover:

```text
#00F0A8
```

---

## Secondary

Background:

```text
#00291A
```

Border:

```text
#00502F
```

Texto:

```text
#F0FFF8
```

Hover:

```text
#003820
```

---

## Ghost

Background:

```text
transparent
```

Texto:

```text
#B5CEC2
```

Hover:

```text
#003820
```

---

## Danger

Background:

```text
#FF5C6C
```

Usar somente em ações destrutivas.

---

# 15. Inputs

Estado normal:

```text
Background: #001A14
Border: #00502F
Text: #F0FFF8
Placeholder: #789487
```

Focus:

```text
Border: #00663A
```

Focus forte, quando necessário:

```text
Accent: #00DFA0
```

Não utilizar glow forte.

---

# 16. Cards

Padrão:

```text
Background: #00291A
Border: #00502F
```

Hover:

```text
Background: #003820
```

Selected:

```text
Background: #004028
```

Cards não devem depender de sombras pesadas.

A profundidade deve vir principalmente da diferença entre superfícies.

---

# 17. Navigation

Normal:

```text
#001210
```

Hover:

```text
#003820
```

Active:

```text
#004028
```

Indicador ativo:

```text
#00DFA0
```

Texto ativo:

```text
#F0FFF8
```

Texto normal:

```text
#B5CEC2
```

---

# 18. Divisores

Divisores discretos:

```text
#00502F
```

Quando a separação precisar ser extremamente sutil:

```text
rgba(0, 80, 47, 0.45)
```

Não transformar todos os elementos em caixas delimitadas.

---

# 19. Gradientes

Gradientes são permitidos, mas não fazem parte da base estrutural.

Uso recomendado:

- hero;
- backgrounds especiais;
- páginas de descoberta;
- banners;
- identidade visual;
- estados especiais.

Exemplo:

```css
linear-gradient(
  135deg,
  #000808 0%,
  #00291A 55%,
  #003820 100%
);
```

Nunca utilizar gradiente para substituir hierarquia de superfície.

---

# 20. Glow

Glow deve ser raro.

Permitido:

- CTA importante;
- elemento AI;
- evento especial;
- feedback de conexão;
- branding.

Evitar:

```text
glow em todos os cards
glow em todos os botões
glow permanente em avatars
glow em toda a navegação
```

---

# 21. Transparência

Glassmorphism é permitido somente como detalhe.

Preferência:

```text
solid surfaces
```

em vez de:

```text
excessive transparency
```

Quando transparência for utilizada:

```css
background: rgba(0, 26, 20, 0.78);
```

Deve preservar legibilidade e contraste.

---

# 22. Avatars

Avatar padrão:

```text
Background: #00291A
Border: #00502F
```

Online:

```text
Indicator: #00DFA0
```

Voice:

```text
Indicator: #7CF7C0
```

Não utilizar cores aleatórias para status.

---

# 23. Status de presença

| Estado | Cor |
|---|---|
| Online | `#00DFA0` |
| Ausente | `#D9B84A` |
| Ocupado | `#FF5C6C` |
| Invisível | `#789487` |
| Offline | `#496356` |

A cor nunca deve ser o único indicador.

Usar também:

- texto;
- ícone;
- tooltip;
- aria-label.

---

# 24. Acessibilidade

Todos os pares de texto e fundo devem ser validados quanto ao contraste.

Prioridade:

```text
Text Primary
Text Secondary
Interactive Text
Buttons
Status
Focus
```

Nunca utilizar:

```text
#496356
```

como texto principal sobre superfícies muito escuras.

Essa cor é destinada a metadata e estados desabilitados.

---

# 25. Focus

Todo elemento interativo deve possuir estado de foco perceptível.

Preferência:

```text
Border Strong
+
Accent controlado
```

Exemplo:

```css
outline: 2px solid #00DFA0;
outline-offset: 2px;
```

O foco nunca deve ser removido apenas para estética.

---

# 26. Dark First

A Alura é **dark-first**.

A interface principal não deve possuir modo claro como requisito estrutural deste sistema.

Se um futuro tema claro for criado, deverá possuir:

- tokens próprios;
- revisão de contraste;
- revisão de hierarquia;
- aprovação visual;
- nenhum reaproveitamento cego destes valores.

---

# 27. Design Tokens — CSS

```css
:root {
  --alura-background: #000808;
  --alura-navigation: #001210;

  --alura-surface-1: #001A14;
  --alura-surface-2: #00291A;
  --alura-surface-3: #003018;

  --alura-hover: #003820;
  --alura-selected: #004028;

  --alura-border: #00502F;
  --alura-border-strong: #00663A;

  --alura-accent: #00DFA0;
  --alura-accent-bright: #00F0A8;

  --alura-green-muted: #1B4837;
  --alura-green-soft: #478F6F;

  --alura-text-primary: #F0FFF8;
  --alura-text-secondary: #B5CEC2;
  --alura-text-muted: #789487;
  --alura-text-disabled: #496356;

  --alura-success: #00DFA0;
  --alura-warning: #D9B84A;
  --alura-danger: #FF5C6C;
  --alura-info: #58A6FF;
  --alura-voice: #7CF7C0;
  --alura-ai: #8B7CFF;
}
```

---

# 28. Design Token Naming

Prefer:

```text
--alura-background
--alura-surface-1
--alura-surface-2
--alura-accent
--alura-text-primary
```

Evitar:

```text
--green1
--darkgreen
--myGreen
--customBackground
--cardColor2
```

Tokens devem representar função, não apenas aparência.

---

# 29. TypeScript Tokens

A camada frontend pode expor os mesmos conceitos:

```ts
export const aluraColors = {
  background: "#000808",
  navigation: "#001210",

  surface1: "#001A14",
  surface2: "#00291A",
  surface3: "#003018",

  hover: "#003820",
  selected: "#004028",

  border: "#00502F",
  borderStrong: "#00663A",

  accent: "#00DFA0",
  accentBright: "#00F0A8",

  greenMuted: "#1B4837",
  greenSoft: "#478F6F",

  textPrimary: "#F0FFF8",
  textSecondary: "#B5CEC2",
  textMuted: "#789487",
  textDisabled: "#496356",

  success: "#00DFA0",
  warning: "#D9B84A",
  danger: "#FF5C6C",
  info: "#58A6FF",
  voice: "#7CF7C0",
  ai: "#8B7CFF",
} as const;
```

---

# 30. Regras para Agentes Antigravity

Todo agente que criar UI para Alura deve:

- utilizar este sistema;
- utilizar tokens;
- evitar valores hex locais;
- evitar cores arbitrárias;
- respeitar estados semânticos;
- preservar contraste;
- não criar uma nova paleta sem autorização;
- não substituir o accent por outra cor;
- não transformar a interface em neon;
- não usar roxo como cor principal;
- não copiar a identidade visual de outro produto.

Antes de criar uma nova cor, o agente deve verificar se um token existente já resolve o problema.

---

# 31. Regra de exceção

Uma nova cor somente pode ser adicionada quando:

1. possui função semântica clara;
2. não existe token adequado;
3. melhora acessibilidade ou comunicação;
4. não conflita com a identidade;
5. é documentada;
6. passa por revisão visual.

Nunca adicionar uma cor apenas porque “fica bonito”.

---

# 32. Componentes obrigados a usar o sistema

Este sistema é obrigatório para:

```text
Login
Cadastro
Home
Amigos
Solicitações
Mensagens
Servidores
Dentro do servidor
Configurações
Perfil
Notificações
Busca
Modais
Drawers
Menus
Cards
Inputs
Buttons
Toasts
Tooltips
Voice
Video
Screen Share
AI
```

---

# 33. Regra de consistência

A mesma ação deve possuir a mesma linguagem cromática em toda a aplicação.

Exemplo:

```text
Primary Action → Accent
Danger → Danger
Warning → Warning
AI → AI
Voice → Voice
Selected → Selected
Hover → Hover
```

Não alterar a cor de acordo com a página.

---

# 34. Filosofia visual

A paleta V2 foi construída para permitir que a interface tenha profundidade sem depender de efeitos exagerados.

A hierarquia deve surgir de:

```text
Cor
+
Contraste
+
Espaçamento
+
Tipografia
+
Superfícies
+
Movimento
```

Não de:

```text
Glow
+
Sombras pesadas
+
Neon
+
Gradientes excessivos
```

---

# 35. Critérios de aceite

Uma implementação baseada neste sistema só deve ser considerada correta quando:

- [ ] utiliza os tokens oficiais;
- [ ] mantém o background profundo;
- [ ] preserva a hierarquia de superfícies;
- [ ] utiliza verde como acento controlado;
- [ ] mantém texto primário legível;
- [ ] diferencia hover e selected;
- [ ] possui estados semânticos;
- [ ] possui foco acessível;
- [ ] não contém cores arbitrárias;
- [ ] não possui glow excessivo;
- [ ] não utiliza roxo como identidade principal;
- [ ] não parece uma cópia visual de outro produto;
- [ ] mantém consistência entre Web, Desktop e Mobile.

---

# 36. Status oficial

A partir da versão 2.0:

> **`ALURA-COLOR-SYSTEM-V2.md` é o sistema oficial de cores da Alura.**

Todos os novos documentos de UI/UX, componentes e agentes devem referenciar este arquivo.

Documentos antigos que utilizarem a paleta anterior devem ser gradualmente atualizados para os tokens V2.

---

## Alura Dark Teal

```text
#000808
#001210
#001A14
#00291A
#003018
#003820
#004028
#00502F
#00663A

#00DFA0
#00F0A8

#F0FFF8
#B5CEC2
#789487
#496356
```

**Identidade oficial: profunda, verde, tecnológica, viva e própria da Alura.**
