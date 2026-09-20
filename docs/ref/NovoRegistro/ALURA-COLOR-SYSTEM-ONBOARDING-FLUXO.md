# ALURA — COLOR SYSTEM
## Onboarding: Informações Básicas · Perfil · Jogos · Hobbies

**Status:** Sistema oficial de cores para as telas de fluxo de cadastro  
**Fonte principal:** `ALURA-COLOR-SYSTEM-V2.md`  
**Objetivo:** garantir que todas as telas do onboarding utilizem exatamente a mesma linguagem cromática.

---

## 1. Princípio visual

```text
Dark
+ Deep Green
+ Teal
+ Neon Green controlado
+ Superfícies em camadas
+ Bordas verdes discretas
+ Glow sutil
```

> **A Alura é escura por natureza e verde quando está viva.**

O verde representa ação, seleção, progresso, sucesso e interação.

---

## 2. Paleta base

| Token | Hex | Uso |
|---|---|---|
| `--alura-bg` | `#000808` | Fundo principal |
| `--alura-navigation` | `#001210` | Sidebar e navegação |
| `--alura-surface-1` | `#001A14` | Cards, inputs e superfícies |
| `--alura-surface-2` | `#00291A` | Cards elevados |
| `--alura-surface-3` | `#003018` | Elementos destacados |
| `--alura-hover` | `#003820` | Hover |
| `--alura-selected` | `#004028` | Selecionado |
| `--alura-border` | `#00502F` | Bordas padrão |
| `--alura-border-strong` | `#00663A` | Foco/destaque |
| `--alura-accent` | `#00DFA0` | Accent principal |
| `--alura-accent-bright` | `#00F0A8` | Hover/ênfase |

---

## 3. Texto

| Token | Hex | Uso |
|---|---|---|
| `--alura-text-primary` | `#F0FFF8` | Títulos e conteúdo |
| `--alura-text-secondary` | `#B5CEC2` | Descrições |
| `--alura-text-muted` | `#789487` | Placeholder/metadata |
| `--alura-text-disabled` | `#496356` | Disabled |

Hierarquia:

```text
Título      #F0FFF8
Texto       #B5CEC2
Metadata    #789487
Disabled    #496356
```

---

## 4. Cores semânticas

| Token | Hex | Uso |
|---|---|---|
| `--alura-success` | `#00DFA0` | Sucesso/confirmação |
| `--alura-warning` | `#D9B84A` | Atenção |
| `--alura-danger` | `#FF5C6C` | Erro/perigo |
| `--alura-info` | `#58A6FF` | Informação |
| `--alura-voice` | `#7CF7C0` | Voz |
| `--alura-ai` | `#8B7CFF` | IA |

---

## 5. Informações Básicas

```text
Fundo:       #000808
Sidebar:     #001210
Formulário:  #001A14
Border:      #00502F
Focus:       #00663A
Título:      #F0FFF8
Descrição:   #B5CEC2
Placeholder: #789487
```

Botão principal:

```text
Normal: #00DFA0
Hover:  #00F0A8
Texto:  #000808
```

Etapa atual:

```text
Background: #004028
Border:     #00DFA0
Icon:       #00DFA0
```

---

## 6. Perfil

Cards:

```text
Normal:  #001A14
Elevado: #00291A
Hover:   #003820
```

Avatar:

```text
Border: #00502F
Ativo:  #00DFA0
```

Tags normais:

```text
Background: #001A14
Border:     #00502F
Text:       #B5CEC2
```

Tags selecionadas:

```text
Background: #004028
Border:     #00DFA0
Text:       #00DFA0
```

Preview:

```text
Surface: #001A14
Border:  #00502F
```

---

## 7. Jogos

Não pintar excessivamente as capas. A cor Alura deve indicar interação/seleção.

### Card normal

```text
Background: #001A14
Border:     #00502F
```

### Hover

```text
Background: #003820
Border:     #00663A
```

### Selecionado

```text
Background: #00291A
Border:     #00DFA0
Check:      #00DFA0
```

### Filtros

Normal:

```text
Background: #001A14
Text:       #B5CEC2
Border:     #00502F
```

Ativo:

```text
Background: #00DFA0
Text:       #000808
Border:     #00DFA0
```

Contador:

```text
Texto:  #B5CEC2
Número: #00DFA0
```

---

## 8. Hobbies

A tela de Hobbies segue a mesma lógica cromática de Jogos.

### Card normal

```text
Background: #001A14
Border:     #00502F
```

### Hover

```text
Background: #003820
Border:     #00663A
```

### Selecionado

```text
Background: #00291A
Border:     #00DFA0
Check:      #00DFA0
```

### Categorias

Normal:

```text
#001A14
```

Ativa:

```text
Background: #00DFA0
Text:       #000808
```

Fotografias devem permanecer naturais. Pode haver overlay escuro sutil para leitura, mas nunca um filtro verde pesado.

---

## 9. Estados gerais

### Default

```text
Surface: #001A14
Border:  #00502F
Text:    #F0FFF8
```

### Hover

```text
Surface: #003820
Border:  #00663A
```

### Focus

```text
Border: #00663A
```

Glow opcional e discreto:

```css
0 0 0 3px rgba(0, 223, 160, 0.10)
```

### Selected

```text
Surface: #004028
Border:  #00DFA0
Text:    #00DFA0
```

### Disabled

```text
Text:   #496356
Border: #003820
```

### Success

```text
#00DFA0
```

### Error

```text
#FF5C6C
```

### Warning

```text
#D9B84A
```

---

## 10. Botões

### Primary

```text
Background: #00DFA0
Text:       #000808
```

Hover:

```text
#00F0A8
```

Pressed:

```text
#00C98A
```

### Secondary

```text
Background: #001A14
Border:     #00502F
Text:       #F0FFF8
```

Hover:

```text
Background: #003820
Border:     #00663A
```

### Ghost

```text
Background: transparent
Text:       #B5CEC2
```

Hover:

```text
Background: #001A14
Text:       #F0FFF8
```

---

## 11. Inputs

Normal:

```text
background: #001A14
border:     #00502F
color:      #F0FFF8
```

Placeholder:

```text
#789487
```

Focus:

```text
#00663A
```

Error:

```text
#FF5C6C
```

Success:

```text
#00DFA0
```

---

## 12. Bordas

```text
Border:        #00502F
Border Strong: #00663A
Accent Border: #00DFA0
```

Bordas devem ser discretas. Não utilizar accent brilhante em todos os componentes.

---

## 13. Glow

Glow faz parte da identidade, mas deve ser controlado.

Accent:

```text
rgba(0, 223, 160, 0.10)
```

Accent bright:

```text
rgba(0, 240, 168, 0.14)
```

Usar principalmente em:

- foco;
- botão principal;
- seleção;
- sucesso;
- progresso;
- destaques.

Não usar glow em todo card, texto ou borda.

---

## 14. Gradientes

Gradiente de superfície:

```css
linear-gradient(
  135deg,
  #00291A 0%,
  #001A14 55%,
  #000808 100%
);
```

Overlay para fotografias:

```css
linear-gradient(
  180deg,
  transparent 20%,
  rgba(0, 8, 8, 0.82) 100%
);
```

Gradientes devem permanecer discretos.

---

## 15. Hierarquia de superfícies

```text
Nível 0   #000808
↓
Nível 1   #001210
↓
Nível 2   #001A14
↓
Nível 3   #00291A
↓
Nível 4   #003018
↓
Hover     #003820
↓
Selected  #004028
```

A elevação deve ser comunicada principalmente por superfície + borda + sombra sutil.

---

## 16. CSS oficial

```css
:root {
  --alura-bg: #000808;
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

## 17. Regras para Antigravity

O agente deve:

1. usar os tokens deste documento;
2. consultar `ALURA-COLOR-SYSTEM-V2.md` como fonte global;
3. nunca inventar cores;
4. não trocar o accent por azul, roxo ou vermelho;
5. manter o onboarding predominantemente escuro;
6. não exagerar no neon;
7. não aplicar filtro verde pesado nas fotografias;
8. preservar contraste;
9. manter a mesma hierarquia de superfícies nas quatro telas;
10. manter estados visuais consistentes.

---

## 18. Regra de consistência

As telas:

```text
Informações Básicas
Perfil
Jogos
Hobbies
```

devem compartilhar:

```text
mesmo background
mesma sidebar
mesmas superfícies
mesmas bordas
mesmo accent
mesma hierarquia de texto
mesmos estados
mesma linguagem de seleção
```

Somente o conteúdo deve mudar.

---

## 19. Critério final

A implementação está correta quando as quatro telas parecem partes de **uma única experiência de onboarding da Alura**, sem mudança perceptível de identidade cromática.

**Sistema global:** `ALURA-COLOR-SYSTEM-V2.md`  
**Sistema específico do onboarding:** este arquivo.
