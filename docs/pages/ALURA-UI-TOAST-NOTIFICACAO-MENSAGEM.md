# ALURA --- PROMPT UI: TOAST DE NOTIFICAÇÃO DE MENSAGEM

## Objetivo

Criar o componente visual de **Toast de nova mensagem da Alura**, usado
no aplicativo desktop `Alura.exe`.

O Toast deve comunicar rapidamente que uma nova mensagem chegou sem
interromper o usuário. A aparência deve seguir rigorosamente a
identidade visual da Alura e não deve parecer uma cópia visual do
Discord, Slack, Teams ou de qualquer outro aplicativo.

## Direção visual

Interface dark-first, premium, minimalista, tecnológica, elegante,
moderna e profunda, com aparência de aplicativo desktop real.

Identidade principal: - Background: `#000808` - Accent: `#00DFA0` -
Texto primário: `#F0FFF8` - Texto secundário: `#B5CEC2` - Texto muted:
`#789487`

O verde deve indicar atividade e interação, sem preencher excessivamente
a interface.

## Composição

Criar um Toast horizontal para desktop com aproximadamente: - Largura:
380--460px - Altura: 90--120px - Border radius: 14--18px - Padding:
16px - Espaçamento baseado em múltiplos de 4px

### Avatar

No lado esquerdo: - Avatar circular do remetente, aproximadamente 48px -
Indicador de presença online - Anel discreto em `#00DFA0` - Sem glow
exagerado

### Conteúdo

Username:

`@luna.dev`

Mensagem:

`Beleza! Te vejo lá então! 🚀`

Horário:

`12:42`

Username com peso médio/semibold. Mensagem com contraste inferior e
limite de uma ou duas linhas. Horário em tamanho menor e muted.

### Fechar

No canto superior direito: - Ícone `X` - Área de clique confortável -
Aparência discreta - Hover sutil

## Superfície

Usar fundo muito escuro com leve tonalidade verde, borda sutil,
highlight em `#00DFA0` de baixa intensidade e sombra suave.

Evitar: - Neon exagerado - Glow forte - Gradientes chamativos -
Transparência excessiva - Bordas muito luminosas - Visual futurista
exagerado

A sensação deve ser sofisticada e integrada ao desktop.

## Posicionamento

Preferencialmente no canto inferior direito do `Alura.exe`, com
aproximadamente 24px das bordas e espaçamento consistente entre
múltiplos Toasts.

## Animação

Entrada:

``` text
opacity: 0 → 1
translateX: 20px → 0
scale: 0.98 → 1
```

Saída:

``` text
opacity: 1 → 0
translateX: 0 → 12px
```

Usar spring ou easing suave. A animação deve ser rápida e discreta.

## Comportamento

O Toast deve: - aparecer quando chegar uma nova mensagem; - mostrar
remetente, avatar, mensagem e horário; - permitir fechamento manual; -
ser clicável para abrir a conversa; - desaparecer automaticamente após
alguns segundos; - respeitar as configurações de notificações do
usuário.

## Múltiplas mensagens

Empilhar verticalmente os Toasts, mantendo cada notificação independente
e sem criar um painel gigante.

## Estados

Suportar: - Nova mensagem - Mensagem de grupo - Imagem - Vídeo -
Arquivo - Mensagem de voz - Menção ao usuário - Mensagem de
servidor/comunidade

Exemplos de mídia: - `📷 Enviou uma imagem` - `🎥 Enviou um vídeo` -
`📎 Enviou um arquivo` - `🎤 Enviou uma mensagem de voz`

## Dados reais

**REGRA OBRIGATÓRIA:** todos os dados apresentados devem vir do sistema
real.

Não hardcodar em produção: - nomes; - usernames; - avatares; -
horários; - mensagens; - servidores; - contadores; - status.

Os exemplos deste documento são apenas referências visuais.

## Acessibilidade

O componente deve: - ter contraste adequado; - ser navegável por
teclado; - possuir `aria-label` nos botões; - permitir fechamento via
`Escape` quando apropriado; - não depender exclusivamente de cor; -
respeitar `prefers-reduced-motion`; - funcionar corretamente com
diferentes escalas do Windows.

## Tecnologia

Implementação prevista: - Electron - React - TypeScript - CSS/Tailwind
conforme o Design System oficial - Motion/Kinetics quando apropriado

Componente reutilizável:

``` tsx
<MessageToast />
```

Fluxo conceitual:

``` text
Realtime Event
      ↓
Notification Service
      ↓
Toast Manager
      ↓
MessageToast
      ↓
Open Conversation
```

O evento realtime deve vir do backend da Alura. O componente visual não
deve conter lógica de negócio complexa.

## Regra de identidade

O resultado deve parecer imediatamente parte da **Alura**.

Não copiar: - layout do Discord; - aparência característica de
notificações de concorrentes; - componentes proprietários; - padrões
visuais reconhecíveis de outros produtos.

A referência serve apenas para entender a função de um Toast.

## Resultado esperado

Criar um Toast de notificação de mensagem com aparência de produto real,
premium e pronto para integrar ao `Alura.exe`.

Princípio visual:

**Alura é escura por natureza e verde quando está viva.**

O `#00DFA0` deve aparecer somente onde comunica atividade ou interação.
