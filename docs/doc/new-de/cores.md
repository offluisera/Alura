# Alura · Migração da paleta de cores

Instruções para o agente (Antigravity) aplicar a nova paleta no app inteiro.

## 1. Objetivo

Trocar todas as cores do app pela paleta abaixo, usando **variáveis CSS (tokens)** em um único lugar. Nenhuma cor deve ficar escrita direto nos componentes no fim da tarefa.

Esta é uma mudança **visual**. Não altere lógica, rotas, textos, dados nem a estrutura dos componentes, a menos que uma regra deste documento peça.

Os arquivos `alura-*.html` enviados junto são a **referência visual**. Em caso de dúvida sobre como algo deve parecer, abra o HTML correspondente.

## 2. Paleta

```css
:root {
  /* Fundos (do mais escuro ao mais claro) */
  --bg: #0c0e0d;        /* fundo do app */
  --field: #0f1211;     /* campos de entrada */
  --side: #101312;      /* lateral, colunas de canais e membros */
  --card: #161918;      /* cards, busca, barras */
  --card-2: #1d2120;    /* hover, campos sobre cards */
  --line: #232826;      /* divisórias e bordas */

  /* Texto */
  --text: #f2f5f3;      /* principal */
  --muted: #8f9a95;     /* secundário */

  /* Verde da marca */
  --accent: #2dff7a;                    /* botões, links, item ativo */
  --accent-soft: rgba(45,255,122,.12);  /* fundo do item ativo, chips */
  --on-accent: #04130a;                 /* texto sobre fundo verde */

  /* Status */
  --online: #3ddc84;
  --away: #f5c451;
  --dnd: #ff6b6b;       /* não perturbe, erros, "Sair" */
  --off: #555d59;       /* offline */
}
```

Logo (degradês, só para o SVG do logo):

- Braço esquerdo: `#00DFA0` → `#39FF88` → `#7EFFBD`
- Braço direito: `#00DFA0` → `#00B377` → `#004B1F`
- Arco inferior: `#007A40` → `#003516` → `#001609`

## 3. Passo a passo

### Passo 1 · Descobrir como o projeto estiliza

Antes de editar, identifique e **me diga em 3 linhas**:

1. O framework e a forma de estilização (CSS global, CSS Modules, Tailwind, styled-components etc.).
2. Onde ficam os estilos globais e o arquivo de entrada.
3. Se já existe algum arquivo de tema, variáveis ou `tailwind.config`.

### Passo 2 · Levantar as cores atuais

Procure em todo o projeto (exceto `node_modules` e `dist`):

- Hex (`#fff`, `#0a0a0a`…), `rgb()`, `rgba()`, `hsl()`.
- Nomes de cor (`white`, `black`, `green`…).
- Classes utilitárias de cor, se usar Tailwind (`bg-neutral-900`, `text-green-400`…).
- Cores dentro de `style={{ }}` e de objetos de tema em JS/TS.
- Sombras e brilhos (`box-shadow`, `filter: drop-shadow`, `text-shadow`).

Gere uma lista com as cores encontradas e onde são usadas. **Não substitua nada ainda.**

### Passo 3 · Criar os tokens

1. Crie (ou edite) o arquivo global de estilos e coloque o bloco `:root` da seção 2.
2. Se o projeto usa Tailwind, mapeie os tokens em `theme.extend.colors`, apontando para as variáveis. Exemplo:

```js
colors: {
  bg: 'var(--bg)', field: 'var(--field)', side: 'var(--side)',
  card: 'var(--card)', 'card-2': 'var(--card-2)', line: 'var(--line)',
  text: 'var(--text)', muted: 'var(--muted)',
  accent: 'var(--accent)', 'accent-soft': 'var(--accent-soft)', 'on-accent': 'var(--on-accent)',
  online: 'var(--online)', away: 'var(--away)', dnd: 'var(--dnd)', off: 'var(--off)',
}
```

3. Adicione `color-scheme: dark;` em `:root` e defina `body { background: var(--bg); color: var(--text); }`.

### Passo 4 · Substituir por **função**, não por valor parecido

Troque cada cor antiga pelo token que corresponde ao **papel** dela na interface. Use a tabela:

| Onde aparece | Token |
|---|---|
| Fundo da página | `--bg` |
| Fundo da lateral, coluna de canais, painel de membros, painel direito | `--side` |
| Cards, campo de busca do topo, barras flutuantes, painéis de menu | `--card` |
| Hover de itens, campos dentro de cards, botões secundários | `--card-2` |
| Inputs de formulário (login, configurações) | `--field` |
| Divisórias, bordas finas | `--line` |
| Texto principal | `--text` |
| Texto secundário, ícones inativos, placeholders | `--muted` |
| Botão principal, links, ícone e barra do item ativo | `--accent` |
| Fundo do item ativo, chips, selos suaves | `--accent-soft` |
| Texto/ícone sobre fundo `--accent` | `--on-accent` |
| Bolinha online | `--online` |
| Ausente | `--away` |
| Não perturbe, erro, validação, "Sair da conta", excluir | `--dnd` |
| Offline | `--off` |

Se encontrar uma cor que não encaixa em nenhum papel, **não invente um token novo**. Liste-a no relatório final e proponha a qual token ela deveria ir.

### Passo 5 · Regras visuais (importante)

A paleta só fica certa se estas regras forem seguidas. O app atual usa contornos e brilhos que **devem ser removidos**:

1. **Sem contornos brancos ou verdes ao redor de itens.** Botões, abas, linhas de lista, cards e campos usam **fundo preenchido** (`--card` ou `--card-2`), não borda clara. Bordas só em divisões grandes (`1px solid var(--line)`).
2. **Sem brilho (`box-shadow` ou `drop-shadow` colorido).** Permitido só: sombra preta suave em menus e janelas flutuantes (`0 20px 50px rgba(0,0,0,.55)`) e o anel de foco.
3. **Um único estado ativo em todo o app** (menu lateral, canais, abas, configurações):
   - Fundo `--accent-soft`.
   - Ícone em `--accent`.
   - Texto em `--text`.
   - Barrinha vertical de 3px em `--accent` na borda esquerda (menu lateral e canais) **ou** sublinhado de 2px em `--accent` (abas).
4. **Hover:** só muda o fundo para `--card-2` (e o texto para `--text`). Não use verde no hover de itens de navegação.
5. **O verde cheio (`--accent`) é escasso:** botão principal da tela, links e itens ativos. Em áreas grandes, use sempre `--accent-soft`.
6. **Botão principal:** fundo `--accent`, texto `--on-accent`, sem borda. Hover: `filter: brightness(.92)`.
7. **Botão secundário:** fundo `--card-2`, texto `--text`, sem borda.
8. **Inputs:** fundo `--field`, borda `1px solid var(--line)`. Foco: borda `--accent` e `box-shadow: 0 0 0 3px var(--accent-soft)`. Erro: borda `--dnd`.
9. **Foco de teclado em geral:** `outline: 2px solid var(--accent); outline-offset: 2px;`.
10. **Fundos "azulados" do autofill do navegador** devem ser neutralizados:
    ```css
    input:-webkit-autofill {
      -webkit-text-fill-color: var(--text);
      box-shadow: 0 0 0 100px var(--field) inset;
    }
    ```
11. **Gradientes de fundo decorativos** (verdes nos cards, no cabeçalho de servidores, no card promocional) devem ser removidos. O único gradiente permitido de fundo é o brilho sutil da tela de login e da tela de atualização.
12. **Texto em tamanhos pequenos (≤ 12px)** nunca usa `--off`. Use `--muted` ou `--text`.

### Passo 6 · Cor de destaque personalizável (Configurações → Aparência)

Se o app já tem seletor de cor de destaque, ele deve **escrever em `--accent` e `--accent-soft`** (e mais nada):

```js
const hex = '#38bdf8'; // cor escolhida
const n = parseInt(hex.slice(1), 16);
document.documentElement.style.setProperty('--accent', hex);
document.documentElement.style.setProperty('--accent-soft',
  `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, .14)`);
```

Para isso funcionar, **nenhum componente pode ter o verde escrito direto**.

### Passo 7 · Verificar

1. Procure de novo por hex, `rgb(`, `hsl(` e classes de cor fora do arquivo de tokens. O resultado esperado é **zero** (exceto o SVG do logo e comentários).
2. Rode o build e o lint do projeto e corrija os erros que forem causados pela mudança.
3. Abra cada tela e compare com a referência `alura-*.html`:
   - Login e cadastro
   - Início
   - Amigos
   - Solicitações
   - Mensagens
   - Perfil
   - Servidores
   - Chat do servidor
   - Canal de voz
   - Configurações
   - Menu do avatar e notificações (popovers do topo)
   - Tela de atualização
4. Confira o contraste de texto (mínimo 4.5:1 para texto normal) com `--muted` sobre `--bg`, `--side` e `--card`.

## 4. O que NÃO fazer

- Não use preto puro (`#000`) nem branco puro (`#fff`) em lugar nenhum.
- Não crie tokens, tons ou opacidades novas além das listadas.
- Não troque fontes, tamanhos, espaçamentos, ícones ou layout.
- Não mexa em lógica, rotas, chamadas de API ou textos.
- Não altere o SVG do logo, só use-o.
- Não deixe cores "antigas" comentadas no código.

## 5. Entrega esperada

Ao terminar, responda com:

1. **Resumo** do que foi alterado (arquivos e quantidade).
2. **Lista de cores sem token equivalente** (se houver) e a sugestão para cada uma.
3. **Pontos que exigem decisão minha** (por exemplo, telas com muitos gradientes ou imagens de fundo).
4. **Como validei** (comandos executados e telas conferidas).

## 6. Critérios de aceite

- [ ] Todas as cores vêm de variáveis definidas em um único arquivo.
- [ ] Nenhum item de navegação, botão, aba ou card tem contorno branco ou verde.
- [ ] Nenhum brilho colorido (glow) restou.
- [ ] O estado ativo é igual em menu, canais, abas e configurações.
- [ ] Trocar `--accent` no navegador muda todos os verdes do app.
- [ ] O build passa sem erros.
- [ ] Nenhuma tela foi alterada além das cores e dos contornos descritos.