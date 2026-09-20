# ALURA — Tema Violet Radiance

## 1. Objetivo

O **Violet Radiance** é um tema visual alternativo da Alura baseado na referência enviada, com estética roxo/violeta intensa, elegante e tecnológica.

Ele deve funcionar como um **tema completo da interface**, e não como uma simples troca de cor do fundo. Todos os componentes da Alura precisam reagir aos tokens do tema: navegação, cards, botões, inputs, modais, menus, estados selecionados, bordas, sombras, gradientes, hover, foco e elementos de destaque.

O tema não deve alterar a arquitetura, UX ou identidade estrutural da Alura. Ele apenas cria uma nova atmosfera visual sobre o mesmo Design System.

## 2. Identidade visual

Nome interno: `violet-radiance`

Conceito:
- roxo profundo;
- violeta elétrico;
- magenta vibrante;
- superfícies escuras;
- brilho controlado;
- alto contraste;
- aparência premium e tecnológica.

A referência visual utiliza como cores principais:
- `#0D1E79` — azul-violeta profundo;
- `#D203DD` — magenta/violeta vibrante.

A composição deve produzir uma sensação de profundidade através de gradientes, não através de dezenas de cores diferentes.

## 3. Tokens

```css
--theme-bg: #0D1E79;
--theme-bg-deep: #070D3D;
--theme-surface-1: #12145A;
--theme-surface-2: #24146F;
--theme-surface-3: #42158A;

--theme-primary: #D203DD;
--theme-primary-bright: #F018FF;
--theme-primary-soft: #A94BCE;

--theme-border: #6B35A8;
--theme-border-strong: #B04BD0;

--theme-text-primary: #FFFFFF;
--theme-text-secondary: #E6DFF2;
--theme-text-muted: #B7AFC5;
--theme-text-disabled: #766D82;

--theme-focus: #F018FF;
```

Os valores acima são a base funcional. O sistema pode gerar tonalidades intermediárias por função, mas não deve introduzir cores aleatórias.

## 4. Gradientes

Gradiente principal:

```css
linear-gradient(135deg, #0D1E79 0%, #D203DD 100%);
```

Gradiente de profundidade:

```css
linear-gradient(180deg, #D203DD 0%, #0D1E79 100%);
```

Gradiente de superfície:

```css
linear-gradient(145deg, #24146F 0%, #10144D 100%);
```

O gradiente deve ser usado em:
- hero sections;
- banners;
- cards especiais;
- destaque de perfil;
- telas vazias;
- cabeçalhos;
- elementos promocionais.

Não aplicar gradiente em todos os elementos simultaneamente.

## 5. Fundo

O fundo geral deve ser escuro, profundo e predominantemente violeta.

Evitar:
- branco como fundo;
- cinza neutro dominante;
- roxo claro ocupando grandes áreas;
- brilho neon constante.

A referência possui luminosidade maior nas áreas de destaque e maior profundidade nas bordas.

## 6. Navegação

A Navigation Rail deve utilizar uma superfície escura com influência violeta.

Estado normal:
- ícone em `--theme-text-secondary`;
- fundo transparente ou `--theme-surface-1`.

Hover:
- fundo `--theme-surface-2`;
- leve transição para violeta.

Ativo:
- fundo `--theme-primary`;
- ícone/texto branco;
- borda ou indicador sutil em `--theme-primary-bright`.

Não usar o verde oficial da Alura para indicar seleção quando o tema Violet Radiance estiver ativo.

## 7. Botões

### Primário

```text
background: #D203DD
text: #FFFFFF
```

Hover:
- aumentar levemente a luminosidade;
- aplicar `#F018FF`;
- sombra violeta muito discreta.

### Secundário

- fundo `#24146F`;
- borda `#6B35A8`;
- texto branco.

### Ghost

- fundo transparente;
- texto `#E6DFF2`;
- hover com fundo violeta translúcido.

## 8. Cards

Cards devem parecer superfícies físicas sobre um fundo profundo.

Base:
```css
background: #12145A;
border: 1px solid #6B35A8;
```

Card destacado:
```css
background: linear-gradient(145deg, #42158A, #15134F);
```

Não utilizar sombras pretas exageradas. A profundidade deve vir principalmente de:
- diferença de luminosidade;
- bordas;
- gradientes;
- sombra suave.

## 9. Inputs

Input normal:
- fundo `#070D3D`;
- borda `#6B35A8`;
- texto branco;
- placeholder `#B7AFC5`.

Focus:
- borda `#F018FF`;
- ring violeta de baixa intensidade.

Erro continua sendo semântico e deve usar o token global de erro da Alura, não magenta.

## 10. Estados

O tema visual não deve destruir a semântica dos estados.

- sucesso: token global de sucesso;
- aviso: token global de warning;
- erro: token global de danger;
- informação: token global de info;
- voz: token global de voice;
- IA: token global de AI.

A cor temática deve dominar a interface, mas estados críticos continuam distinguíveis.

## 11. Sombras e glow

Glow permitido apenas em:
- botão primário;
- elemento ativo;
- hero;
- destaque de perfil;
- foco.

Exemplo:

```css
box-shadow:
  0 0 24px rgba(210, 3, 221, 0.18);
```

Evitar neon excessivo.

## 12. Tipografia

Manter a tipografia oficial da Alura.

O tema não deve trocar:
- família tipográfica;
- escala;
- peso;
- hierarquia;
- espaçamento.

Apenas ajustar contraste conforme o fundo.

## 13. Acessibilidade

Garantir contraste suficiente entre:
- texto e fundo;
- ícones e superfícies;
- placeholder e input;
- botão e texto;
- estado ativo e inativo.

Não depender exclusivamente da cor para indicar:
- erro;
- sucesso;
- estado de conexão;
- seleção;
- permissões.

## 14. Motion

Transições:
```text
150–220ms
ease-out
```

Hover pode aumentar discretamente luminosidade ou escala.

Não animar gradientes continuamente em toda a interface.

## 15. Persistência

O tema deve ser armazenado na preferência do usuário.

Exemplo:

```text
theme = "violet-radiance"
```

Ao iniciar o Alura.exe:
1. carregar preferência local;
2. aplicar tema;
3. sincronizar com conta quando disponível;
4. respeitar configuração do usuário.

## 16. Regra de implementação

Nunca escrever:

```css
background: #D203DD;
```

diretamente em componentes quando o valor representa uma função temática.

Preferir:

```css
background: var(--theme-primary);
```

Isso permite trocar o tema inteiro sem alterar componentes.

## 17. Critério de aceite

O Violet Radiance estará concluído quando:
- todas as páginas principais suportarem o tema;
- nenhum componente importante permanecer com a paleta verde hardcoded;
- hover/focus/active forem coerentes;
- dark surfaces preservarem profundidade;
- contraste permanecer acessível;
- o tema puder ser ativado sem recarregar a aplicação;
- a identidade estrutural da Alura continuar intacta.
