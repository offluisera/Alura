# Prompt para o Antigravity — Site Institucional da Alura

Copie e cole o bloco abaixo diretamente no Antigravity.

---

## CONTEXTO

Quero que você construa o **site institucional (landing page) da Alura**, uma plataforma de comunicação em tempo real e criação de comunidades, inspirada na essência do Discord — mas com identidade visual própria, mais sofisticada e premium.

**Referência direta a ser analisada antes de codar:** `https://discord.com/`
Analise a estrutura, hierarquia de seções, copywriting, microinterações, o efeito de "marquee" infinito, as ilustrações flutuantes com paralaxe, os vídeos em loop dentro dos cards de feature, e o footer mega-completo com seletor de idioma. Use isso como benchmark de qualidade e organização de conteúdo — não copie assets, textos ou marca do Discord.

## SOBRE O PRODUTO (usar este texto como base do copy)

A Alura é uma plataforma moderna de comunicação em tempo real e criação de comunidades. Conecta pessoas através de **servidores** (comunidades temáticas), **canais de texto** e **mensagens diretas**, com diferencial de design premium.

Funcionalidades a comunicar no site:
- **Comunicação Realtime** — chat instantâneo (DMs e canais) via WebSockets.
- **Servidores e Canais** — espaços dedicados por assunto para comunidades inteiras.
- **Identidade Pessoal** — perfis ricos: banners, avatares customizados, hobbies, jogos favoritos, status de atividade.
- **Multiplataforma** — Web (navegador) e Desktop nativo (Electron).
- **Voz e Vídeo (em breve)** — infraestrutura planejada em WebRTC para chamadas de áudio, vídeo e compartilhamento de tela com baixa latência.

Tom de voz: confiante, moderno, um pouco "gamer/dev", mas elegante — não infantilizado. Público-alvo: gamers, desenvolvedores e comunidades que quer alta performance com uma interface bonita.

## IDENTIDADE VISUAL

- **Tema:** dark mode como padrão (obrigatório), tons de preto/cinza-chumbo (`#0B0D0F`, `#111318`, `#16181D`) com camadas sutis de profundidade (glassmorphism leve, gradientes radiais).
- **Cor de destaque (accent):** verde neon — algo na faixa de `#39FF88` a `#00FF7F`, usado com moderação (CTAs, glows, bordas ativas, ícones), nunca poluindo o layout.
- **Tipografia:** uma display font geométrica/moderna para títulos (ex: Space Grotesk, Clash Display ou Satoshi) + uma sans-serif limpa para corpo de texto (ex: Inter ou Geist). Hierarquia tipográfica clara, tracking levemente reduzido em títulos grandes.
- **Elementos visuais:** glow/blur verde neon atrás de elementos-chave, grid sutil de fundo, cards com borda de 1px semi-transparente e leve "inner glow" no hover, ilustrações/mockups de interface do app com leve efeito de flutuação (parallax on scroll), microanimações com Framer Motion (fade+slide on scroll, marquee infinito, hover states).
- Evite qualquer semelhança literal com o mascote, ícones ou paleta roxa/azul do Discord — a Alura tem identidade própria (dark + neon green).

## STACK TÉCNICA

- Next.js (App Router) + TypeScript
- TailwindCSS como base de estilos
- Framer Motion para animações e scroll reveals
- Componentização inspirada em padrões do **reui.io** (`https://reui.io/components`) — use esse acervo como referência de componentes (buttons, cards, navbars, accordions) para acelerar a implementação com qualidade de produção
- Ícones: Lucide
- Estrutura de pastas organizada (`/components`, `/sections`, `/lib`), responsivo mobile-first, performance (lazy loading de imagens/vídeos, otimização de fontes)

## ESTRUTURA DE SEÇÕES (baseada na análise do Discord, mas melhorada)

1. **Header fixo** — logo Alura, nav com dropdowns (Produto, Comunidade, Desenvolvedores, Suporte), botão "Entrar" e CTA primário "Baixar" em verde neon. Menu mobile em overlay full-screen.
2. **Hero** — headline forte tipo "Converse. Jogue. Construa sua comunidade." + subheadline com a proposta de valor, dois CTAs (Baixar para Desktop / Abrir no navegador), mockup do app flutuando com glow neon atrás, prova social (estrelas/avaliação ou número de comunidades ativas).
3. **Marquee infinito** — faixa de texto rolando horizontalmente com palavras-chave (ex: "conversar · jogar · criar · conectar"), separadas por um ícone/símbolo da marca, como no Discord.
4. **Seção "Comunicação Realtime"** — texto + vídeo/mockup em loop mostrando chat instantâneo, WebSockets, digitação em tempo real.
5. **Seção "Servidores e Canais"** — mockup da sidebar de servidores/canais, texto explicando organização por comunidades e assuntos.
6. **Seção "Identidade Pessoal"** — showcase de perfil customizado (banner, avatar, status, hobbies, jogos favoritos).
7. **Seção "Multiplataforma"** — ícones/mockups Web + Desktop (Electron), mensagem de continuidade entre dispositivos.
8. **Seção "Voz e Vídeo — em breve"** — comunicar como roadmap/preview, com selo "Em breve" e teaser visual do WebRTC (chamada, compartilhamento de tela).
9. **CTA final de conversão** — bloco de impacto visual forte (glow neon, mockup) com CTA de download.
10. **Footer completo** — colunas (Produto, Empresa, Recursos, Políticas), seletor de idioma, ícones sociais, copyright.

## INSTRUÇÃO OBRIGATÓRIA — SKILL SUPERAGENT

**Antes de considerar a entrega concluída, o site institucional completo deve ser construído E revisado usando a skill `superagent`.**
Ao final da geração de cada seção (ou do site completo), acione explicitamente a skill `superagent` para:
- Auditar a qualidade do código gerado (estrutura, acessibilidade, responsividade, performance);
- Validar consistência visual com o design system descrito acima (cores, tipografia, espaçamentos);
- Revisar copywriting e conferir que nenhum asset/texto/ícone do Discord foi copiado literalmente;
- Sugerir e aplicar correções antes de apresentar o resultado final.

Não finalize a entrega sem passar pela análise da skill `superagent`. Relate no final o que foi verificado/corrigido por ela.

## REFERÊNCIAS DE APOIO (usar como inspiração de padrões, não copiar conteúdo)

- Biblioteca de prompts e snippets Tailwind: https://vibeprompts.dev/
- Prompts de vibe coding: https://www.vibecodesource.com/prompts/
- Biblioteca de componentes: https://reui.io/components

## ENTREGÁVEL ESPERADO

Site institucional completo, responsivo, com dark mode + verde neon, animações suaves, seções acima implementadas, código organizado e revisado pela skill `superagent` antes da entrega final.
