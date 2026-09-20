Crie a landing page institucional completa da "Alura" — uma plataforma de comunicação em tempo real e criação de comunidades —, usando React, TypeScript, Vite, Tailwind CSS, GSAP (com o plugin ScrollTrigger) e anime.js para animações, e componentes primitivos do shadcn/ui como base para elementos de UI (dropdown, popover, tabs) antes de estilizá-los com a identidade da Alura. Este é o prompt definitivo e completo: siga a especificação abaixo seção por seção, com o mesmo nível de detalhe técnico em todas elas (classes Tailwind exatas, comportamento, animação).

**Referências de inspiração (usar como benchmark de qualidade, não copiar conteúdo/assets):**
- Kinetic typography e microinterações de texto: `https://kinetics.colorion.co/` — use como referência para o comportamento do texto do marquee, do typewriter do hero e de transições de título entre seções (entrada com leve distorção/stagger de caracteres, não apenas fade simples).
- Biblioteca de prompts e padrões de UI: `https://vibeprompts.dev/`

---

## SOBRE O PRODUTO (base do copy — não invente funcionalidades fora disto)

A Alura conecta pessoas através de **servidores** (comunidades temáticas), **canais de texto** e **mensagens diretas**. Funcionalidades a comunicar:

- **Comunicação Realtime** — chat instantâneo (DMs e canais) via WebSockets.
- **Servidores e Canais** — espaços dedicados por assunto para comunidades inteiras.
- **Identidade Pessoal** — perfis ricos: banners, avatares customizados, hobbies, jogos favoritos, status de atividade.
- **Multiplataforma** — Web (navegador) e Desktop nativo (Electron).
- **Voz e Vídeo (em breve)** — infraestrutura planejada em WebRTC para chamadas de áudio, vídeo e compartilhamento de tela.

Tom de voz: confiante, moderno, gamer/dev, mas elegante — nunca infantilizado, nunca genérico de startup. Público: gamers, devs e comunidades que querem performance com uma interface bonita.

---

## FONTES

Carregue no `index.html`:

* Título: `<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">`
* Corpo: `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" rel="stylesheet">`

No `index.css`:

```css
:root {
  --font-heading: 'Space Grotesk', 'Helvetica Neue', Arial, sans-serif;
  --font-body: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  --color-bg: #0B0D0F;
  --color-bg-alt: #111318;
  --color-bg-soft: #16181D;
  --color-accent: #39FF88;
  --color-accent-2: #00E5FF; /* usado só no fio de gradiente do canto, nunca em texto/CTA */
}
body {
  font-family: var(--font-body);
  background-color: var(--color-bg);
  color: #F5F5F5;
}
```

Toda a página usa `var(--font-body)` em branco/off-white, exceto logotipo e títulos de seção (`var(--font-heading)`). Dark mode obrigatório em 100% da página — nenhuma seção pode ter fundo branco.

---

## VÍDEO DE FUNDO (hero, controlado pelo movimento do mouse)

* `<video>` fixo cobrindo a tela: `position: fixed; inset: 0; z-index: 0;`.
* **Ajuste de enquadramento (importante):** o vídeo deve aparecer mais afastado (zoom out) e deslocado para a esquerda em relação à versão anterior. Use:
  ```css
  video.bg-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 45% center; /* antes era 70%, agora mais à esquerda */
    transform: scale(0.88);      /* zoom out — afasta a cena */
    transform-origin: center center;
  }
  ```
  Como o `scale(0.88)` reduz o vídeo e pode deixar frestas nas bordas, envolva o `<video>` em um container `div.bg-video-wrapper` com `position: fixed; inset: -6%; overflow: hidden; z-index: 0;` para que o vídeo escalado ainda cubra 100% da viewport sem espaços vazios.
* Overlay escuro por cima: `bg-gradient-to-b from-black/70 via-black/45 to-black/80` (mais escuro nas bordas superior/inferior para dar contraste ao texto e à navbar).
* Fonte: `/video/background.mp4`, local. Atributos `muted`, `playsInline`, `preload="auto"`, **sem autoplay**.
* Scrubbing pelo mouse: listener de `mousemove` no `window`, rastreando `prevX`; `delta = currentX - prevX`; deslocamento de tempo `(delta / window.innerWidth) * SENSITIVITY * video.duration`, `SENSITIVITY = 0.8`; `targetTime` sempre clampado entre `0` e `video.duration`; usar `video.currentTime` para seek e um handler `onSeeked` para processar a próxima busca pendente (evitar seek-flooding).

---

## BARRA DE NAVEGAÇÃO — VERSÃO MELHORADA (fixed, z-index: 10)

A navbar anterior estava crua demais (texto solto sem hierarquia). Nova versão:

* Wrapper externo: `fixed top-0 inset-x-0 z-10 px-4 sm:px-6 pt-4`.
* Container interno centralizado, largura máxima e "flutuante": `max-w-6xl mx-auto flex items-center justify-between gap-4 rounded-full border border-white/10 bg-black/40 backdrop-blur-md px-5 sm:px-6 py-3 shadow-[0_0_30px_-10px_rgba(57,255,136,0.15)]`.
* **Logotipo (esquerda):** `flex items-center gap-2`. Texto "Alura" `text-[19px] sm:text-[22px] font-semibold tracking-tight text-white` em `var(--font-heading)`, seguido do asterisco decorativo `✳︎` em `text-[20px] sm:text-[24px] text-[var(--color-accent)]`.
* **Links de navegação desktop (centro, ocultos abaixo de `md`):** `hidden md:flex items-center gap-1 text-[15px] text-white/80`. Cada item é um botão com dropdown: "Produto", "Comunidade", "Desenvolvedores", "Suporte". Cada botão: `flex items-center gap-1 px-3 py-2 rounded-full hover:bg-white/5 hover:text-white transition-colors`, com um `IconChevronDown` de 14px que gira 180° quando o dropdown está aberto (`transition-transform duration-200`).
  * **Dropdown (painel):** construa sobre o primitivo `DropdownMenu` do shadcn/ui (`@/components/ui/dropdown-menu`), removendo o estilo padrão do shadcn e reaplicando as classes da Alura por cima: `min-w-[220px] rounded-2xl border border-white/10 bg-[var(--color-bg-alt)]/95 backdrop-blur-md p-2 shadow-xl`. Anime a entrada/saída com `anime.js` (`opacity: [0,1]`, `translateY: [-4, 0]`, `duration: 150`, `easing: 'easeOutQuad'`) disparado nos handlers `onOpenChange` do componente. Cada item do dropdown: `flex flex-col px-3 py-2 rounded-xl hover:bg-white/5`, com um título `text-sm text-white` e uma descrição `text-xs text-white/50`.
  * Conteúdo sugerido de cada dropdown (2–3 itens cada): "Produto" → Recursos, Baixar, Changelog · "Comunidade" → Servidores em destaque, Guias, Eventos · "Desenvolvedores" → API, Documentação, Bots · "Suporte" → Central de Ajuda, Status, Contato.
* **Área direita:** `flex items-center gap-3`. Um link de texto "Entrar" (`text-[15px] text-white/80 hover:text-white transition-colors hidden sm:inline`) e um **botão CTA sólido** "Baixar" — diferente do link sublinhado anterior: `inline-flex items-center gap-2 bg-[var(--color-accent)] text-black text-[15px] font-medium px-4 sm:px-5 py-2 rounded-full hover:brightness-110 active:scale-95 transition-all`.
* **Menu hambúrguer mobile (abaixo de `md`):** botão `flex flex-col gap-[5px] p-2`, 3 barras `w-6 h-[2px] bg-white rounded-full`. Ao abrir: barra superior gira 45° e desce 7px, barra do meio some (`opacity-0`), barra inferior gira -45° e sobe 7px — todas com `duration-300`.
* **Overlay mobile (z-index: 9):** `fixed inset-0 bg-[#0B0D0F]/97 backdrop-blur-md flex flex-col justify-center px-8 gap-6`. Cada link em `text-[30px] font-medium text-white`, com um sub-texto de 1 linha abaixo em `text-sm text-white/50` (reaproveitando as descrições dos dropdowns). No fim, o botão "Baixar" em largura total, mesmo estilo sólido verde neon do desktop. Transição por `opacity` + `pointerEvents`.

---

## SEÇÃO HERO (z-index: 1)

* `h-screen flex flex-col justify-end pb-12 md:justify-center md:pb-0 px-5 sm:px-8 md:px-10 overflow-hidden`.
* Container de conteúdo: `max-w-xl relative z-10`.

**1. Rótulo de introdução desfocado** — `pointer-events-none select-none mb-5 sm:mb-6`, fonte `clamp(18px, 4vw, 26px)`, `line-height: 1.3`, branco, `filter: blur(4px)`:
  * Linha 1: "Olá, bem-vindo à Alura,"
  * Linha 2: "Onde comunidades ganham vida"

**2. Texto com efeito de máquina de escrever** — texto: `"Que bom que você chegou. Servidores, canais e mensagens em tempo real, com uma interface que você vai querer mostrar pra todo mundo. E então, qual comunidade vamos construir?"`. Hook `useTypewriter(text, speed=38, startDelay=600)` retornando `{ displayed, done }`. `<p>` branco, `mb-5 sm:mb-6`, `clamp(18px, 4vw, 26px)`, `line-height: 1.35`, `min-height: 54px`. Cursor piscante `inline-block w-[2px] h-[1.1em] bg-[var(--color-accent)] align-middle ml-[2px]`, animação `blink 1s step-end infinite`, some quando `done`.

**3. Pills de ação** — anime com `anime.js`: `opacity: [0,1]`, `translateY: [8,0]`, `duration: 400`, `easing: 'easeOutQuad'`, `delay: anime.stagger(40, {start: 400})` (cada pill entra com um leve atraso em cascata em vez de todas ao mesmo tempo), independente do typewriter. Container `flex flex-wrap gap-y-1`.
  * 4 pills: "Chat em Tempo Real", "Servidores e Canais", "Perfis Personalizados", "Web & Desktop" — `inline-flex items-center justify-center bg-white/5 text-white border border-white/15 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap backdrop-blur-sm`, hover `bg-[var(--color-accent)] text-black border-[var(--color-accent)]`.
  * 1 pill outline de contato: "Fale com a gente: contato@alura.app" + ícone de copiar (SVG 12x12), `text-[var(--color-accent)] bg-transparent border border-[var(--color-accent)] rounded-full`, hover `bg-[var(--color-accent)] text-black`, `onClick` copia o e-mail via `navigator.clipboard.writeText()`.

---

## MARQUEE INFINITO (z-index: 1, logo abaixo do Hero)

* `bg-[var(--color-bg)] border-y border-white/10 py-6 overflow-hidden relative`.
* Uma faixa de texto rolando horizontalmente em loop infinito, implementada com `gsap.to()` (`xPercent: -50, duration: 28, ease: 'none', repeat: -1`) em vez de `@keyframes` puro, para permitir pausar suavemente no hover (`gsap.globalTimeline.pause()`/`.resume()` no `mouseenter`/`mouseleave`) e ajustar a velocidade dinamicamente se necessário.
* Inspire o comportamento de entrada de cada palavra na tipografia cinética de `https://kinetics.colorion.co/`: ao entrar no viewport, anime cada palavra do marquee com leve distorção (`scaleY` de 1.4 para 1 + fade) usando GSAP `ScrollTrigger`, em vez de um fade simples.
* Conteúdo repetido 2x lado a lado (para o loop ser contínuo): "conversar · jogar · criar · conectar · construir ·" — em `text-4xl md:text-6xl font-medium text-white/10 whitespace-nowrap` com `var(--font-heading)`, exceto a cada 2ª palavra, que fica em `text-[var(--color-accent)]` sólido para dar ritmo visual (efeito "destaque alternado", diferente do marquee monocromático do Discord).
* Entre cada palavra, um pequeno ✳︎ decorativo em `text-white/20`.

---

## SEGUNDA DOBRA — "Uma Plataforma Completa" (z-index: 1, Fundo `--color-bg-alt`)

* `bg-[var(--color-bg-alt)] text-white py-20 md:py-32 px-5 sm:px-8 md:px-10 relative z-10 w-full min-h-screen flex flex-col justify-center`.
* Título `var(--font-heading)`: "Uma Plataforma Completa", `text-4xl md:text-6xl tracking-tight mb-12 md:mb-16`.
* Grid `grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8`. 3 cards:
  1. **Chat em Tempo Real** — "Mensagens diretas e canais com entrega instantânea via WebSockets, feitos pra conversas que fluem sem travar e sem recarregar a página."
  2. **Servidores & Comunidades** — "Espaços dedicados organizados por assunto, com canais de texto pensados para comunidades inteiras se encontrarem, dividirem e crescerem juntas."
  3. **Web & Desktop** — "Rode direto no navegador ou instale o app nativo no computador. Perfis ricos, avatares e status te acompanham em qualquer lugar que você entrar."
* Estilo de card: `p-8 md:p-10 border border-white/10 rounded-3xl flex flex-col justify-start hover:border-[var(--color-accent)] transition-colors duration-300 relative overflow-hidden`. Título `text-2xl font-medium mb-4 text-white`. Texto `text-[17px] md:text-[19px] text-gray-400 leading-relaxed`.
* Aplique no **Card 2** (o do meio, para quebrar a simetria) o detalhe de assinatura visual: um fio de gradiente de ~2px no canto superior direito (`absolute top-0 right-0 w-24 h-24 rounded-tr-3xl` com `background: conic-gradient(from 180deg at 100% 0%, var(--color-accent), var(--color-accent-2), transparent 60%)`, `opacity-60`, `mask` só na borda de 2px) — não repita esse detalhe nos outros dois cards, para não virar padrão repetitivo.

---

## TERCEIRA SEÇÃO — Showcase do Produto (z-index: 1, Fundo `--color-bg`)

* `bg-[var(--color-bg)] text-white py-24 md:py-36 px-5 sm:px-8 md:px-10 relative z-10 w-full`.
* Título: "Feito para quem vive de comunidade", `text-4xl md:text-6xl tracking-tight mb-6`. Subtítulo: "Um feed pra compartilhar, amigos online em tempo real, e um perfil que mostra quem você é." — `text-gray-400 text-lg md:text-xl max-w-2xl mb-16`.
* Três blocos empilhados (`flex flex-col gap-24 md:gap-32`), cada um `md:grid md:grid-cols-2 md:gap-12 items-center`, alternando texto/imagem:
  1. **Feed Social** — "Publique, curta e comente. Seu feed, sua comunidade reagindo em tempo real." + mockup de post card (avatar com anel verde, nome, handle, texto do post, ícones `IconHeart`/`IconComment`/`IconShare`).
  2. **Amigos & Status** — "Veja quem tá online, gerencie solicitações e organize sua lista de amigos sem fricção." + mockup de item de lista de amigos (avatar, pill de status Online/Offline, cargo).
  3. **Perfil Rico** — "Banner customizado, estatísticas, redes sociais e jogos favoritos — seu cantinho na Alura." + mockup de card de perfil (banner, avatar grande com badge, stats de Amigos/Servidores/Mensagens).
* Cada mockup: `bg-[var(--color-bg-alt)] border border-white/10 rounded-2xl p-6 shadow-lg relative`, com leve `transform: rotate(-1deg)` alternando para `rotate(1deg)` a cada bloco (quebra a rigidez simétrica).

---

## QUARTA SEÇÃO — "Voz e Vídeo, em breve" (z-index: 1, Fundo `--color-bg-alt`)

* `bg-[var(--color-bg-alt)] py-24 md:py-32 px-5 sm:px-8 md:px-10 relative overflow-hidden`.
* Badge no topo: `inline-flex items-center gap-2 border border-[var(--color-accent)]/40 text-[var(--color-accent)] text-xs uppercase tracking-wider rounded-full px-3 py-1 mb-6` com texto "Em breve".
* Título: "Chamadas de voz, vídeo e tela — em desenvolvimento", `text-3xl md:text-5xl tracking-tight max-w-2xl mb-6 text-white`.
* Texto: "Estamos construindo a infraestrutura em WebRTC pra você chamar sua galera com baixa latência, direto de um canal de voz ou de uma DM." — `text-gray-400 text-lg max-w-xl mb-10`.
* Um mockup ilustrativo de "chamada" desfocado/esmaecido (`opacity-40 blur-[1px] grayscale-[30%]`) ao fundo à direita, simbolizando que o recurso ainda não está ativo, com um selo central "Em construção" sobreposto.

---

## CTA FINAL DE CONVERSÃO (z-index: 1, Fundo `--color-bg`)

* `bg-[var(--color-bg)] py-32 md:py-48 px-5 sm:px-8 md:px-10 relative overflow-hidden flex flex-col items-center text-center`.
* Glow de fundo: `absolute inset-0 flex items-center justify-center` com um `div` `w-[500px] h-[500px] rounded-full bg-[var(--color-accent)]/20 blur-[120px]`.
* Título: "Sua comunidade merece um lugar assim.", `text-4xl md:text-7xl tracking-tight text-white relative z-10 max-w-3xl mb-8`.
* Botão CTA: "Criar minha conta grátis" — `bg-[var(--color-accent)] text-black text-lg font-medium px-8 py-4 rounded-full hover:brightness-110 active:scale-95 transition-all relative z-10`.

---

## ÍCONES SVG CUSTOMIZADOS

Crie componentes React de ícone inline (`viewBox="0 0 24 24"`, `stroke="currentColor"`, `stroke-width="1.5"`, sem fill, `stroke-linecap="round"`, `stroke-linejoin="round"`), todos com a mesma espessura e "temperatura" geométrica entre si:

`IconHome`, `IconFriends`, `IconProfile`, `IconUserAdd`, `IconMessage`, `IconServers`, `IconSettings`, `IconSearch`, `IconBell`, `IconLogout`, `IconChevronDown`, `IconHeart`, `IconComment`, `IconShare`, `IconImage`, `IconAttachment`, `IconEmoji`, `IconSend`.

Use-os na navbar (chevron dos dropdowns), no showcase (curtir/comentar/compartilhar) e no footer (redes sociais). Nunca usar pacotes de ícones "fofos"/3D nem qualquer ícone reconhecível do Discord.

---

## FOOTER — WORDMARK GIGANTE + LINKS (z-index: 1, Fundo `--color-bg-alt`)

* **Wordmark:** `<h2>` "ALURA" em `var(--font-heading)`, `text-[18vw] md:text-[14vw] leading-none tracking-tighter text-center py-16 md:py-24 select-none`, `bg-gradient-to-b from-white to-[var(--color-accent)] bg-clip-text text-transparent`.
* **Footer em grid:** `grid grid-cols-2 md:grid-cols-4 gap-8 py-16 px-5 sm:px-8 md:px-10 border-t border-white/10`. Colunas: "Produto" (Recursos, Baixar, Changelog, Status), "Comunidade" (Servidores em destaque, Guias, Eventos), "Desenvolvedores" (API, Documentação, Bots), "Empresa" (Sobre, Carreiras, Imprensa, Contato). Título de coluna `text-white text-sm font-medium mb-4`; link `text-gray-400 text-sm hover:text-[var(--color-accent)] transition-colors`.
* **Linha final:** `flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-white/10 text-gray-500 text-xs px-5 sm:px-8 md:px-10 pb-10`, "© 2025 Alura. Todos os direitos reservados." à esquerda, ícones sociais (GitHub, Discord, Twitch, YouTube, usando o mesmo grid/estilo dos ícones customizados) à direita.

---

## DIRETRIZES ANTI-DISCORD (obrigatório)

- Nunca usar a paleta roxo/azul (`blurple`) do Discord, o mascote Wumpus, nem ícones de servidor em dock vertical circular.
- A cor de marca é sempre o verde neon (`--color-accent`) sobre fundo quase-preto — nunca gradiente arco-íris genérico.
- A assinatura visual própria é o fio de gradiente de canto (usado com moderação, só em 1–2 elementos por seção, nunca em todos os cards ao mesmo tempo).
- Prefira composições assimétricas e alinhamento à esquerda em vez de tudo centralizado.

## DIRETRIZES ANTI-"CARA DE IA" (obrigatório)

- Não repetir a mesma estrutura "título centralizado + parágrafo + 3 cards iguais" em todas as seções — varie o ritmo (full-bleed, imagem grande, blocos assimétricos, rotação leve nos mockups) como especificado acima.
- Não usar ícones genéricos de pacote de UI kit (check verde, raio, foguete) — usar apenas os ícones customizados listados.
- Não usar adjetivos vazios ("incrível", "revolucionário", "seamless") no copy — todo o copy já fornecido acima é específico e deve ser respeitado como está.
- Variar o timing/easing das animações de scroll reveal entre seções (não usar o mesmo fade-in idêntico em tudo) — a marquee, o showcase e o CTA final devem ter comportamentos de entrada diferentes entre si. Use `GSAP ScrollTrigger` para orquestrar essas entradas (`toggleActions: 'play none none reverse'`) e `anime.js` para microinterações pontuais (hover, dropdown, pills) — não misture as duas bibliotecas na mesma animação.
- Variar o `border-radius` conforme o elemento (pills = `rounded-full`, cards = `rounded-2xl`/`rounded-3xl`, mockups = `rounded-2xl`) — nunca aplicar o mesmo raio em tudo por padrão.

---

## DEPENDÊNCIAS

- React, ReactDOM, TypeScript, Vite, Tailwind CSS.
- `gsap` (com o plugin `ScrollTrigger`) — orquestração de scroll reveals entre seções e o loop do marquee.
- `animejs` — microinterações pontuais (dropdown, pills, hovers, cursor do typewriter se necessário).
- `shadcn/ui` — usar apenas os primitivos não estilizados (`dropdown-menu`, `tabs`, `popover`) como base de acessibilidade/comportamento, sempre restilizados por cima com as classes Tailwind da identidade Alura definidas neste documento (nunca deixar a aparência padrão do shadcn visível).
- Não usar `lucide-react` ou qualquer pacote de ícones pronto — usar exclusivamente os ícones SVG customizados especificados.
- Não usar Framer Motion neste projeto — todas as animações ficam a cargo de GSAP + anime.js, para evitar duas libs de animação concorrentes no bundle.

## REFERÊNCIAS DE APOIO (inspiração de padrões, não copiar conteúdo)

- Tipografia cinética e microinterações de texto: `https://kinetics.colorion.co/`
- Biblioteca de prompts e padrões de UI: `https://vibeprompts.dev/`