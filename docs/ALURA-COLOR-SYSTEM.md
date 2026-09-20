# ALURA — COLOR SYSTEM

## 1. Objetivo

Este documento define a paleta de cores oficial da Alura e suas regras de aplicação na interface.

A identidade visual deve transmitir:
- profundidade;
- tecnologia;
- sofisticação;
- energia;
- comunidade;
- modernidade.

A interface deve ser predominantemente escura. Os verdes luminosos funcionam como sinais de interação, não como decoração excessiva.

## 2. Princípio visual principal

> **90% da interface deve viver nos tons escuros. Os verdes luminosos são sinais de interação, não decoração.**

A Alura não deve usar verde em todos os elementos. A profundidade visual será construída através de camadas de verde extremamente escuro, enquanto os tons luminosos serão reservados para ações, estados ativos, presença, seleção, progresso, feedback e identidade da marca.

## 3. Paleta estrutural oficial

Baseada na paleta original fornecida:
`https://coolors.co/001609-001b0b-00220e-002a12-003014-003516-003c19-00421b-004b1f-005322`

### Backgrounds

| Token | Hex | Uso |
|---|---|---|
| `--alura-bg-0` | `#001609` | Fundo absoluto da aplicação |
| `--alura-bg-1` | `#001B0B` | Sidebar e navegação |
| `--alura-bg-2` | `#00220E` | Painéis principais |
| `--alura-bg-3` | `#002A12` | Cards e containers |
| `--alura-bg-4` | `#003014` | Hover e elementos elevados |
| `--alura-bg-5` | `#003516` | Elementos selecionados |

Hierarquia:
```text
#001609  Base
#001B0B  Navigation
#00220E  Panels
#002A12  Cards
#003014  Hover
#003516  Selected
```

## 4. Verde de interação

| Token | Hex | Uso |
|---|---|---|
| `--alura-green-1` | `#003C19` | Bordas ativas |
| `--alura-green-2` | `#00421B` | Hover de componentes |
| `--alura-green-3` | `#004B1F` | Destaques |
| `--alura-green-4` | `#005322` | Elementos ativos estruturais |

## 5. Accent oficial

```text
--alura-accent: #00E6A0
--alura-accent-2: #00C98A
```

Uso principal:
- botões primários;
- indicadores online;
- seleção;
- ícones ativos;
- logo;
- progresso;
- indicadores de voz;
- sucesso;
- interações importantes.

Não usar `#00E6A0` como fundo de grandes áreas. O accent deve chamar atenção para o que importa.

## 6. Gradiente principal

```css
linear-gradient(135deg, #003C19 0%, #005322 45%, #00E6A0 100%);
```

Uso recomendado: logo, onboarding, elementos promocionais, banners, estados especiais e pequenos detalhes. Evitar aplicar em toda a interface.

## 7. Tipografia

| Token | Hex | Uso |
|---|---|---|
| `--alura-text-primary` | `#F2FFF8` | Títulos e conteúdo principal |
| `--alura-text-secondary` | `#B8CEC2` | Texto secundário |
| `--alura-text-muted` | `#789487` | Informações auxiliares |
| `--alura-text-disabled` | `#496356` | Elementos desabilitados |

Evitar `#FFFFFF` como texto padrão. Usar `#F2FFF8` para preservar a identidade verde.

## 8. Bordas

| Token | Hex | Uso |
|---|---|---|
| `--alura-border-subtle` | `#00351A` | Separadores e cards discretos |
| `--alura-border-default` | `#005022` | Inputs e componentes |
| `--alura-border-active` | `#00C98A` | Estado ativo/foco |

Bordas devem ser discretas; evitar contornos brilhantes em todos os componentes.

## 9. Estados

| Token | Hex | Uso |
|---|---|---|
| `--alura-success` | `#00E6A0` | Sucesso |
| `--alura-warning` | `#D9B84A` | Atenção |
| `--alura-danger` | `#FF5C6C` | Erro/perigo |
| `--alura-info` | `#58A6FF` | Informação |

## 10. Estados especiais

| Token | Hex | Uso |
|---|---|---|
| `--alura-voice` | `#7CF7C0` | Voz/atividade de áudio |
| `--alura-ai` | `#8B7CFF` | Recursos de Inteligência Artificial |

## 11. Status de usuários

| Status | Hex |
|---|---|
| Online | `#00E6A0` |
| Ausente | `#D9B84A` |
| Ocupado | `#FF5C6C` |
| Invisível | `#6B7A72` |
| Offline | `#40534A` |

## 12. Aplicação na UI

```text
Base       #001609
Sidebar    #001B0B
Panels     #00220E
Cards      #002A12
Hover      #003014
Selected   #003516
Border     #005022
Action     #00E6A0
```

## 13. Chat

### Mensagem recebida
```text
Background: #002A12
Border:     #003C19
Text:       #F2FFF8
```

### Mensagem enviada
```text
Background: #005322
Text:       #F2FFF8
```

### Timestamp
```text
#789487
```

### Avatar online
```text
#00E6A0
```

## 14. Botões

### Primary
```text
Background: #00E6A0
Text:       #001609
```

### Secondary
```text
Background: #002A12
Border:     #005022
Text:       #B8CEC2
```

### Ghost
```text
Background: transparent
Text:       #B8CEC2
```

### Danger
```text
Background: #3A1218
Border:     #7A2632
Text:       #FF7A85
```

## 15. Inputs

```text
Background:  #001B0B
Border:      #003C19
Text:        #F2FFF8
Placeholder: #496356
```

Estado de foco:
```text
Border: #00C98A
```

Glow opcional e discreto:
```css
box-shadow: 0 0 0 1px rgba(0, 230, 160, 0.12);
```

## 16. Glassmorphism

Usar com moderação:
```text
Background: rgba(0, 42, 18, 0.72)
Border: rgba(0, 230, 160, 0.12)
Backdrop blur: 12px–18px
```

Aplicar principalmente em overlays, menus, painéis flutuantes, modais e elementos especiais. A maior parte da interface deve permanecer visualmente sólida.

## 17. Fundos especiais

Para login, onboarding e telas de destaque:
```text
#001609 → #00220E → #003C19
```

Gradiente radial discreto:
```css
background:
  radial-gradient(circle at 50% 20%, rgba(0, 83, 34, 0.35), transparent 55%),
  #001609;
```

## 18. Logo A

O símbolo A pode utilizar:
```text
#00E6A0
#00B87A
#005322
```

Versões:
- Light: `#F2FFF8`
- Emerald: `#00E6A0`
- Dark: `#001609`

O logo deve funcionar também sem sombra e sobre fundo transparente.

## 19. Design Tokens — resumo

```text
BACKGROUND
bg-0       #001609
bg-1       #001B0B
bg-2       #00220E
bg-3       #002A12
bg-4       #003014
bg-5       #003516

GREEN
green-1    #003C19
green-2    #00421B
green-3    #004B1F
green-4    #005322

ACCENT
accent     #00E6A0
accent-2   #00C98A

TEXT
primary    #F2FFF8
secondary  #B8CEC2
muted      #789487
disabled   #496356

STATUS
success    #00E6A0
warning    #D9B84A
danger     #FF5C6C
info       #58A6FF

SPECIAL
voice      #7CF7C0
AI         #8B7CFF
```

## 20. Regras para o Antigravity

1. A paleta estrutural original da Alura não deve ser substituída sem decisão explícita.
2. `#001609` é o fundo base.
3. `#00E6A0` é o accent principal.
4. Accent luminoso deve ser usado com moderação.
5. Não transformar a interface inteira em verde.
6. Não usar branco puro como texto padrão.
7. Não usar glow exagerado.
8. Não aplicar glassmorphism indiscriminadamente.
9. Estados de erro, aviso e informação devem manter cores próprias.
10. Novos componentes devem utilizar Design Tokens, nunca cores arbitrárias.
11. A identidade visual deve permanecer original e não copiar o Discord.
12. Novas cores somente devem ser adicionadas quando houver necessidade funcional ou de acessibilidade documentada.

## 21. Princípio final

```text
DARK
+
DEPTH
+
GREEN ENERGY
+
TECHNOLOGY
+
COMMUNITY
```

A interface deve ser reconhecível mesmo sem o logo.

> **Alura é escura por natureza e verde quando está viva.**
