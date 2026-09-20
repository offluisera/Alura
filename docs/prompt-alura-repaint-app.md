# Prompt — Trocar a Paleta de Cores do App da Alura (sem alterar funcionalidades)

Copie e cole o bloco abaixo na ferramenta/agente que está no código do app.

---

## CONTEXTO

O app da Alura está com a paleta de cores muito carregada de verde — os fundos de sidebar, cards, banner e header estão usando tons verde/oliva escuros como cor de base, o que deixa a interface pesada e cansativa. O site institucional da Alura já usa uma paleta correta e mais equilibrada (fundo neutro quase-preto + verde neon só como acento pontual). O objetivo é **replicar a paleta do site em todo o app**.

## REGRA MAIS IMPORTANTE DESTA TAREFA

**Esta é uma tarefa exclusivamente visual/estilística.** Você deve alterar **apenas cores** (backgrounds, bordas, texto, sombras, estados de hover/active) em CSS, classes Tailwind, tokens de tema ou variáveis de estilo.

**NÃO FAÇA, em hipótese alguma:**
- Não altere lógica de componentes, estado (`useState`, `useEffect`, stores, contexts), chamadas de API, rotas, formulários ou validações.
- Não remova, renomeie ou reestruture componentes, props ou arquivos.
- Não altere textos, ícones (a forma/geometria deles), layout (posições, tamanhos, grid, flex), espaçamentos ou breakpoints — a menos que a mudança seja estritamente decorrente da cor (ex: trocar `bg-green-800` por `bg-[#111318]` é válido; mudar `flex` para `grid` não é).
- Não adicione, remova ou troque nenhuma funcionalidade, biblioteca ou dependência.
- Não quebre nenhum estado visual funcional já existente (ex: badge de "Online"/"Offline", contadores, indicadores de notificação, seleção de item ativo no menu) — eles devem continuar existindo e informando a mesma coisa, só que com as novas cores.

Ao final, o app deve **se comportar exatamente igual** a antes da mudança — só a aparência de cor muda.

## NOVA PALETA DE CORES (a mesma usada no site institucional)

Defina/atualize estes tokens centralizados (variáveis CSS, arquivo de tema do Tailwind, ou onde o projeto já centraliza cores — reutilize a estrutura existente, não crie um sistema de tema paralelo):

```css
:root {
  --color-bg: #0B0D0F;        /* fundo principal da aplicação */
  --color-bg-alt: #111318;    /* fundo de painéis/seções secundárias (sidebar, header) */
  --color-bg-soft: #16181D;   /* fundo de cards, inputs, elementos "elevados" */
  --color-accent: #39FF88;    /* verde neon — SOMENTE para destaque pontual */
  --color-accent-2: #00E5FF;  /* ciano — uso decorativo raro (ex: detalhe de gradiente), nunca em texto/fundo grande */
  --color-text: #F5F5F5;      /* texto principal */
  --color-text-muted: #9CA3AF; /* texto secundário (Tailwind gray-400) */
  --color-text-faint: #6B7280; /* texto terciário/metadados (Tailwind gray-500) */
  --color-border: rgba(255,255,255,0.10); /* bordas padrão */
  --color-border-strong: rgba(255,255,255,0.15); /* bordas em hover/foco */
}
```

## MAPEAMENTO — ONDE CADA COR ENTRA (baseado na tela atual do app)

Revise todos os componentes visuais e aplique esta lógica de substituição:

| Elemento atual (verde carregado) | Trocar para |
|---|---|
| Fundo geral da aplicação | `--color-bg` |
| Fundo da sidebar esquerda | `--color-bg` ou `--color-bg-alt` (mantenha a mesma usada hoje como referência de "camada 1") |
| Item ativo do menu lateral (ex: "Início" selecionado) | Fundo transparente ou `--color-bg-soft` sutil, com **texto e ícone em `--color-accent`**, sem preencher o item inteiro de verde sólido. Pode manter uma borda esquerda fina de 2-3px em `--color-accent` como indicador de seleção. |
| Barra de busca do topo | `--color-bg-soft` com borda `--color-border`, texto placeholder em `--color-text-muted` |
| Header/topo da página (ícones de sino, sair, avatar) | Fundo `--color-bg`, ícones em `--color-text` (branco), sem fundo verde atrás dos ícones |
| Banner/hero do "Início" (área "Olá, usuário!") | Fundo `--color-bg-alt`, ilustrações decorativas podem manter um leve glow em `--color-accent` só como detalhe (não como preenchimento total) |
| Cards de estatística (Amigos, Solicitações, Mensagens, Notificações) | Fundo `--color-bg-soft`, borda `--color-border`, ícone e número em destaque com `--color-accent` só no ícone ou no número — não no fundo inteiro do card |
| Card de "Conecte-se. Compartilhe. Evolua." (banner lateral) | Fundo `--color-bg-alt` ou `--color-bg-soft`, texto branco, ícone/seta em `--color-accent` |
| Caixa de criar post ("No que você está pensando?") | Fundo `--color-bg-soft`, borda `--color-border`, borda vira `--color-accent` apenas no estado `:focus` |
| Botão "Publicar" | Fundo `--color-accent`, texto preto (`#0B0D0F`), mantendo o mesmo comportamento de clique |
| Avatar do usuário (anel ao redor) | Anel fino em `--color-accent` (2px), fundo do avatar em `--color-bg-soft` |
| Indicador de status online (bolinha verde) | Mantém verde, mas usar exatamente `--color-accent` para consistência (não um verde diferente) |
| Cards de post no feed | Fundo `--color-bg-soft` ou transparente com borda `--color-border`, hover com borda `--color-border-strong` ou `--color-accent` |
| Ícones de curtir/comentar/compartilhar | `--color-text-muted` no estado normal; ao interagir (curtido), o ícone de curtir pode assumir `--color-accent` |
| Textos de nome de usuário / títulos | `--color-text` (branco) |
| Textos de handle (@usuario), timestamps, legendas | `--color-text-muted` ou `--color-text-faint` |
| Painel direito "Servidores" / "Sugestões para você" | Mesmo tratamento dos cards: fundo `--color-bg-soft`, texto branco/cinza, sem fundo verde |

## REGRA GERAL PARA QUALQUER ELEMENTO NÃO LISTADO ACIMA

Se encontrar outro componente na aplicação (modais, configurações, perfil, mensagens, servidores, etc.) que hoje usa um verde escuro/oliva como cor de fundo principal, aplique a mesma lógica:
1. Fundo escuro neutro (`--color-bg`, `--color-bg-alt` ou `--color-bg-soft`, dependendo da hierarquia/camada do elemento).
2. Verde neon (`--color-accent`) reservado para: estado ativo/selecionado, hover de call-to-action, ícones de destaque, bordas de foco, indicadores de status positivo (online, sucesso).
3. Nunca preencher um bloco grande (sidebar inteira, card inteiro, banner inteiro) com verde sólido — o verde deve ocupar no máximo bordas, ícones, textos de destaque ou pequenos indicadores.

## PROCESSO DE EXECUÇÃO RECOMENDADO

1. Localize onde as cores estão centralizadas hoje no projeto (arquivo de tema Tailwind, variáveis CSS globais, tokens de design system, ou classes hardcoded espalhadas pelos componentes).
2. Se já existem tokens centralizados: apenas atualize os valores dos tokens existentes para os novos valores acima, mantendo os mesmos nomes de variável sempre que possível, para não quebrar nenhuma referência.
3. Se as cores estão hardcoded (`bg-green-900`, `bg-emerald-800`, hex verdes soltos pelo código): faça uma varredura e substitua cada ocorrência pela variável/token correspondente da tabela acima, sem tocar em nenhuma outra classe/propriedade da mesma linha de código.
4. Após a troca, percorra visualmente cada tela do app (Início, Amigos, Perfil, Solicitações, Mensagens, Servidores, Configurações) e confirme que:
   - Todos os textos continuam legíveis (contraste adequado sobre o novo fundo escuro).
   - Nenhum estado funcional (badges, contadores, seleção ativa, status online/offline) sumiu ou ficou confuso visualmente.
   - Nenhuma funcionalidade, clique, navegação ou dado exibido mudou de comportamento.

## ENTREGÁVEL ESPERADO

O app inteiro com a nova paleta neutra + verde neon pontual aplicada de forma consistente em todas as telas, com 100% das funcionalidades, estados e comportamentos existentes preservados exatamente como estavam antes da mudança.
