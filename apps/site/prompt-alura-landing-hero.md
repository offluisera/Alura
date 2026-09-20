Crie uma landing page com uma seção hero em tela cheia e uma segunda dobra de informações para uma plataforma de comunicação em tempo real chamada "Alura", usando React, TypeScript, Vite e Tailwind CSS. Aqui estão todos os detalhes:

---

**FONTES**

Carregue duas fontes no `index.html` usando as seguintes tags de link (Google Fonts):

* Título: `<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">`
* Corpo: `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" rel="stylesheet">`

No `index.css`, defina as variáveis CSS:

```css
:root {
  --font-heading: 'Space Grotesk', 'Helvetica Neue', Arial, sans-serif;
  --font-body: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  --color-bg: #0B0D0F;
  --color-bg-alt: #111318;
  --color-accent: #39FF88;
}
body {
  font-family: var(--font-body);
  background-color: var(--color-bg);
}
```

Toda a página utiliza `var(--font-body)` em branco/off-white (`#F5F5F5`), exceto o texto do logotipo, que deve usar `var(--font-heading)`. O tema é **dark mode** — fundo escuro (`--color-bg`), texto claro, com o verde neon (`--color-accent`) usado como cor de destaque (hover, sublinhados, cursor do typewriter, bordas ativas). Nunca use fundo branco em nenhuma seção.

---

**VÍDEO DE FUNDO (controlado pelo movimento do mouse)**

* Um elemento `<video>` em tela cheia com `position: fixed; inset: 0; z-index: 0; object-fit: cover; object-position: 70% center;`.
* Aplique um overlay escuro sobre o vídeo (`bg-black/50` ou gradiente `from-black/70 via-black/40 to-black/70`) para garantir contraste do texto claro por cima.
* URL de origem do vídeo: hospedado localmente no projeto. Aponte para `/video/background.mp4` (assumindo que a pasta `video` esteja na pasta `public`). Este vídeo deve mostrar, em loop, a interface do produto Alura em uso (chat rolando, transições entre canais).
* O vídeo deve ter os atributos `muted`, `playsInline`, `preload="auto"`. Ele NÃO deve ter reprodução automática (autoplay).
* O vídeo avança ou retrocede com base no movimento horizontal do mouse. Use um event listener de `mousemove` no `window`. Rastreie o `prevX`, calcule `delta = currentX - prevX`, converta para um deslocamento de tempo: `(delta / window.innerWidth) * SENSITIVITY * video.duration`, onde `SENSITIVITY = 0.8`. Limite (clamp) o `targetTime` entre 0 e `video.duration`. Use `video.currentTime` para navegar pelo vídeo (seek) e um handler `onSeeked` para enfileirar a próxima busca caso o `targetTime` tenha mudado, evitando sobrecarga de eventos (seek-flooding).

---

**BARRA DE NAVEGAÇÃO (fixed, z-index: 10)**

* Fixada no topo, largura total. Padding: `px-5 sm:px-8 py-4 sm:py-5`. Flex row, `justify-between`, `items-center`. Fundo transparente sobre o vídeo, com leve `backdrop-blur-sm` opcional.
* **Logotipo (esquerda):** Flex row com `gap-3`. Texto "Alura" em `text-[21px] sm:text-[26px]`, `tracking-tight`, branco, usando `var(--font-heading)`. Ao lado, um caractere decorativo de asterisco `✳︎` em `text-[25px] sm:text-[30px]`, na cor `var(--color-accent)` (verde neon), `select-none`, `letter-spacing: -0.02em`.
* **Links de navegação desktop (centro, ocultos abaixo de md):** Flex row, `text-[23px]`, branco. Links: "Produto", "Comunidade", "Desenvolvedores", "Suporte" separados por vírgulas, renderizados como `, `. Cada link tem `hover:text-[var(--color-accent)] transition-colors`.
* **CTA desktop (direita, oculto abaixo de md):** Um link "Baixar" em `text-[23px]`, na cor `var(--color-accent)`, `underline underline-offset-2`, `hover:opacity-70 transition-opacity`.
* **Menu hambúrguer mobile (visível abaixo de md):** Um botão com 3 barras horizontais (cada uma com `w-6 h-[2px] bg-white`), separadas por um `gap-[5px]`. Ao clicar, a barra superior gira 45 graus e desce 7px, a barra do meio desaparece (opacity 0), e a barra inferior gira -45 graus e sobe 7px. Todas as transições com `duration-300`.
* **Overlay mobile (z-index: 9):** `fixed inset-0 bg-[#0B0D0F]/95 backdrop-blur-sm`, flex column, centralizado verticalmente e alinhado à esquerda com `px-8 gap-8`. Os mesmos links em `text-[32px] font-medium` cor branca, mais "Baixar" sublinhado em verde neon. Aparece e desaparece alternando `opacity` e `pointerEvents`. Oculto a partir do breakpoint md.

---

**SEÇÃO HERO (z-index: 1)**

* Altura total da tela `h-screen`, flex column. No mobile: `justify-end pb-12`. Em telas `md:`: `justify-center pb-0`. Padding horizontal: `px-5 sm:px-8 md:px-10`. `overflow-hidden`.
* Container de conteúdo: `max-w-xl`, `relative z-10`.

**1. Rótulo de introdução desfocado:**

* `pointer-events-none`, `select-none`, `mb-5 sm:mb-6`.
* Tamanho da fonte: `clamp(18px, 4vw, 26px)`, `line-height: 1.3`, `font-weight: 400`, `color: #FFFFFF`, `filter: blur(4px)`.
* Duas linhas de texto:
  * Linha 1: "Olá, bem-vindo à Alura,"
  * Linha 2: "Onde comunidades ganham vida"
* Separadas por uma tag `<br/>`.

**2. Texto com efeito de máquina de escrever:**

* Texto: `"Que bom que você chegou. Servidores, canais e mensagens em tempo real, com uma interface que você vai querer mostrar pra todo mundo. E então, qual comunidade vamos construir?"`
* Hook customizado `useTypewriter`: recebe `text`, `speed` (padrão 38ms por caractere) e `startDelay` (padrão 600ms). Após o atraso, um intervalo revela um caractere por vez. Retorna `{ displayed, done }`.
* Renderizado em uma tag `<p>`, na cor branca, `mb-5 sm:mb-6`, tamanho da fonte `clamp(18px, 4vw, 26px)`, `line-height: 1.35`, `font-weight: 400`, `min-height: 54px`.
* Enquanto digita, exiba um cursor piscante: `inline-block w-[2px] h-[1.1em] bg-[var(--color-accent)] align-middle ml-[2px]` com a animação CSS `blink 1s step-end infinite` (`opacity: 1 em 0%/100%, 0 em 50%`). O cursor desaparece quando `done` for true.

**3. Botões de ação (Pills):**

* Aparecem com uma animação de fade-in e slide-up (`opacity 0->1`, `translateY(8px)->0`, `transition: opacity 0.4s ease, transform 0.4s ease`). Eles ficam visíveis 400ms após o carregamento da página, independente da animação de digitação (NÃO espere o texto terminar).
* Container: `flex flex-wrap gap-y-1`.
* **4 botões em formato de pílula:** Rótulos: "Chat em Tempo Real", "Servidores e Canais", "Perfis Personalizados", "Web & Desktop". Cada um deve ter `inline-flex items-center justify-center bg-white/5 text-white border border-white/15 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap backdrop-blur-sm`. Efeito hover: `bg-[var(--color-accent)] text-black border-[var(--color-accent)]`, `transition-colors duration-200`.
* **1 botão em formato de pílula com contorno (outline):** Texto "Fale com a gente: contato@alura.app" (o e-mail é sublinhado com `underline-offset-1`), seguido por um pequeno ícone de copiar de 12x12 (SVG inline de dois retângulos sobrepostos). Estilo: `text-[var(--color-accent)] bg-transparent border border-[var(--color-accent)] rounded-full`, com as mesmas dimensões acima, e `gap-2 sm:gap-3` entre texto e ícone. Efeito hover: `bg-[var(--color-accent)] text-black`. Ao clicar, copia o e-mail para a área de transferência usando `navigator.clipboard.writeText()`.

---

**SEGUNDA DOBRA (z-index: 1, Fundo Escuro)**

* Uma nova seção posicionada imediatamente abaixo da Hero Section (após a rolagem).
* **Container Principal:** `bg-[var(--color-bg-alt)] text-white py-20 md:py-32 px-5 sm:px-8 md:px-10 relative z-10 w-full min-h-screen flex flex-col justify-center`.
* **Cabeçalho da Seção:**
  * Título em `var(--font-heading)`: "Uma Plataforma Completa" com tamanho `text-4xl md:text-6xl`, tracking apertado (`tracking-tight`), branco, e `mb-12 md:mb-16`.
* **Grid de Destaques:** Crie um layout usando CSS Grid (`grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8`).
* **Cards do Grid (3 itens):**
  1. **Card 1 - Comunicação Realtime:**
     * Título: "Chat em Tempo Real" (tamanho `text-2xl font-medium mb-4`, branco).
     * Texto: "Mensagens diretas e canais com entrega instantânea via WebSockets, feitos pra conversas que fluem sem travar e sem recarregar a página."
  2. **Card 2 - Servidores e Canais:**
     * Título: "Servidores & Comunidades" (tamanho `text-2xl font-medium mb-4`, branco).
     * Texto: "Espaços dedicados organizados por assunto, com canais de texto pensados para comunidades inteiras se encontrarem, dividirem e crescerem juntas."
  3. **Card 3 - Multiplataforma:**
     * Título: "Web & Desktop" (tamanho `text-2xl font-medium mb-4`, branco).
     * Texto: "Rode direto no navegador ou instale o app nativo no computador. Perfis ricos, avatares e status te acompanham em qualquer lugar que você entrar."
* **Estilo dos Cards:** Cada card deve possuir `p-8 md:p-10 border border-white/10 rounded-3xl flex flex-col justify-start hover:border-[var(--color-accent)] transition-colors duration-300`. O texto descritivo dentro dos cards deve ter `text-[17px] md:text-[19px] text-gray-400 leading-relaxed`.

---

**DEPENDÊNCIAS**

Apenas React, ReactDOM, Tailwind CSS e Vite. Nenhuma outra biblioteca de UI. `lucide-react` pode estar disponível, mas não é necessária para este componente.
