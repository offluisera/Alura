# Prompt para o Antigravity — Remover a "cara de feito por IA"

Copie e cole o bloco abaixo no Antigravity.

---

## PROBLEMA

O site institucional da Alura está com "cara de site gerado por IA": layout genérico, decisões de design óbvias/repetidas, copy clichê e falta de personalidade. Isso precisa ser eliminado. O objetivo é que o site pareça **feito à mão por um time de design sênior**, com decisões intencionais, imperfeições controladas e uma voz própria — não um template.

## CHECKLIST DE "CHEIRO DE IA" A CAÇAR E ELIMINAR

Revise cada seção do site e corrija tudo que se encaixar abaixo:

### Visual / Layout
- Gradiente roxo/azul genérico (roxo→rosa→azul) usado "porque sim" sem relação com a marca — a Alura usa dark + verde neon, não gradiente arco-íris.
- Cards perfeitamente simétricos, todos do mesmo tamanho, com o mesmo ícone circular colorido em cima do título — quebre a grade, varie tamanhos e composição.
- Ícones genéricos de "pacote de ícones" (ex: check em círculo verde, raio, foguete, engrenagem) usados sem contexto — substitua por ilustrações/screenshots reais da UI da Alura ou ícones customizados coerentes com a marca.
- Blur/glow decorativo aplicado de forma aleatória atrás de tudo, sem hierarquia — use glow apenas para guiar o olhar a elementos-chave (CTA, mockup principal).
- Seções com estrutura idêntica repetida (título centralizado + parágrafo + 3 cards) do topo ao fim da página — varie o ritmo: full-bleed, imagem grande à esquerda/direita, layout assimétrico, blocos de texto largos.
- Espaçamento "perfeito demais" e alinhamento central em tudo — trabalhe alinhamentos à esquerda, quebras de grid propositais, tipografia em escalas não óbvias.
- Bordas com `border-radius` genérico aplicado em tudo igual (ex: 12px em cards, botões, inputs, imagens) — varie conforme o elemento e a intenção.

### Copywriting
- Frases de efeito genéricas tipo "Conecte-se. Converse. Cresça." ou "A melhor forma de [verbo] sua comunidade" — reescreva com voz própria, específica do produto, sem fórmula de slogan de IA.
- Excesso de adjetivos vazios ("incrível", "poderoso", "revolucionário", "next-level", "seamless") sem prova concreta — substitua por benefícios específicos e concretos.
- Bullets começando todos com verbo no imperativo de forma robótica ("Converse com facilidade.", "Crie com liberdade.", "Conecte-se com o mundo.") — varie estrutura de frase.
- CTAs genéricos ("Comece agora", "Saiba mais", "Experimente grátis") repetidos em todo botão — use CTAs específicos ao contexto de cada seção.
- Textos muito simétricos em tamanho (todo parágrafo com exatamente 2 linhas) — deixe respirar naturalmente, tamanhos variados.

### Microinterações / Animações
- Fade-in genérico idêntico em todo elemento ao rolar a página, sem variação de easing/delay — dê personalidade: stagger, direções diferentes, timing variado por seção.
- Hover states padrão de UI kit (só muda opacidade ou escala 1.05) — crie microinterações específicas da marca (ex: glow verde neon reagindo ao cursor, transições combinando com o tema).

### Imagens
- Ilustrações "flat design" genéricas de banco de imagens (pessoas estilizadas, formas abstratas coloridas sem relação com o produto) — usar apenas screenshots/mockups reais da UI da Alura (chat, servidores, perfil).
- Emojis usados como decoração dentro do copy institucional — remover, a menos que façam parte de um recurso real do produto (ex: reações no chat).

## O QUE FAZER

1. Percorrer o projeto inteiro (todas as seções do site institucional) aplicando o checklist acima.
2. Para cada item encontrado, registrar o que foi trocado e por quê.
3. Reforçar decisões de design deliberadas e consistentes com a identidade real da Alura (dark `#0B0D0F`/`#111318` + verde neon `#39FF88`–`#00FF7F`, tipografia definida no projeto) em vez de escolhas "seguras" e genéricas.
4. Reescrever qualquer copy identificado como clichê, mantendo o tom de voz definido para a Alura (confiante, moderno, direto, sem exagero).

## VALIDAÇÃO OBRIGATÓRIA — SKILL SUPERAGENT

Ao final das correções, acione a skill `superagent` para:
- Revisar o site inteiro contra o checklist acima e apontar qualquer item que ainda "cheire a IA";
- Confirmar que layout, copy, ícones e animações têm identidade própria e coerência com a marca Alura;
- Entregar um relatório com antes/depois de cada mudança relevante.

Não finalize a entrega sem esse relatório da skill `superagent`.

## ENTREGÁVEL ESPERADO

Site institucional revisado, sem os padrões genéricos de "gerado por IA" listados acima, com decisões de design e copy intencionais e específicas da marca Alura, acompanhado do relatório de auditoria da skill `superagent`.
