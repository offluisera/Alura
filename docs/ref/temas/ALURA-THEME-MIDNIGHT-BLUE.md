# ALURA — Tema Midnight Blue

## 1. Objetivo

O **Midnight Blue** é um tema alternativo da Alura inspirado diretamente na referência enviada: fundo quase preto/azul-marinho, azul profundo e azul elétrico.

Nome interno:

```text
midnight-blue
```

A proposta é criar uma experiência mais sóbria e noturna que o tema principal, mantendo uma aparência tecnológica.

## 2. Identidade visual

Cores principais observadas na referência:
- `#02060E` — preto azul profundo;
- `#0356C5` — azul vibrante.

A interface deve parecer predominantemente noturna. O azul deve funcionar como luz e interação, não como preenchimento absoluto de toda a tela.

## 3. Tokens

```css
--theme-bg: #02060E;
--theme-bg-deep: #010309;
--theme-surface-1: #061329;
--theme-surface-2: #082650;
--theme-surface-3: #0B3870;

--theme-primary: #0356C5;
--theme-primary-bright: #1475FF;
--theme-primary-soft: #3D8BE8;

--theme-border: #174A82;
--theme-border-strong: #286DB7;

--theme-text-primary: #F7FAFF;
--theme-text-secondary: #C8D5E6;
--theme-text-muted: #8192A8;
--theme-text-disabled: #566477;

--theme-focus: #1475FF;
```

## 4. Gradientes

Gradiente principal:

```css
linear-gradient(135deg, #02060E 0%, #0356C5 100%);
```

Gradiente de destaque:

```css
linear-gradient(180deg, #0356C5 0%, #02060E 100%);
```

Gradiente de superfície:

```css
linear-gradient(145deg, #0B3870 0%, #061329 100%);
```

Os gradientes devem reproduzir a profundidade da referência.

## 5. Fundo

O fundo principal deve ser próximo de `#02060E`.

A maior parte da interface deve permanecer escura.

O azul aparece principalmente em:
- seleção;
- botões;
- bordas;
- cards especiais;
- cabeçalhos;
- foco;
- indicadores de interação.

## 6. Navigation Rail

Estado normal:
- fundo `#02060E`;
- ícones `#C8D5E6`.

Hover:
- `#061329`.

Ativo:
- `#0356C5`;
- ícone branco;
- indicador luminoso discreto.

A barra lateral não deve virar um bloco azul sólido.

## 7. Botões

Primário:

```css
background: #0356C5;
color: #FFFFFF;
```

Hover:

```css
background: #1475FF;
```

Secundário:
- fundo `#061329`;
- borda `#174A82`;
- texto branco.

Ghost:
- transparente;
- hover azul-marinho.

## 8. Cards

Card padrão:

```css
background: #061329;
border: 1px solid #174A82;
```

Card especial:

```css
background: linear-gradient(145deg, #0B3870, #061329);
```

A referência possui forte contraste entre o fundo quase preto e os blocos azuis. Esse contraste deve ser mantido.

## 9. Inputs

Normal:
```text
background: #010309
border: #174A82
text: #F7FAFF
```

Focus:
```text
border: #1475FF
```

O focus deve ser visível mesmo para usuários com baixa percepção de cor.

## 10. Estados semânticos

O azul é a cor do tema, não a cor universal de todos os estados.

Continuar usando os tokens semânticos globais da Alura para:
- success;
- warning;
- danger;
- info;
- voice;
- AI.

Isso evita confundir "azul do tema" com "estado de informação".

## 11. Voz e compartilhamento de tela

Quando uma chamada estiver ativa:
- destacar controles com o azul do tema;
- usar `--theme-primary` para ações;
- manter indicadores de microfone/câmera claramente diferenciados;
- preservar as cores semânticas para mute, erro e conexão.

A tela compartilhada deve ocupar o maior espaço disponível e receber uma borda azul muito discreta.

## 12. Sombras

Utilizar sombras frias e discretas.

Exemplo:

```css
box-shadow:
  0 16px 40px rgba(0, 0, 0, 0.35);
```

Glow azul apenas para:
- foco;
- ação primária;
- elemento selecionado;
- status de compartilhamento.

## 13. Tipografia

Manter o sistema tipográfico oficial da Alura.

O fundo muito escuro exige:
- títulos em branco;
- textos secundários em azul-cinza claro;
- textos auxiliares em azul-cinza médio.

Evitar texto cinza muito escuro.

## 14. Acessibilidade

O contraste deve ser validado principalmente em:
- `#02060E` + texto;
- `#061329` + texto;
- `#0356C5` + texto;
- bordas azuis em superfícies escuras.

Não comunicar estados apenas por azul.

## 15. Motion

O Midnight Blue deve ter movimento mais discreto que o Violet Radiance.

Usar:
- fade;
- slide pequeno;
- hover;
- microinterações.

Evitar animações luminosas permanentes.

## 16. Persistência

Valor salvo:

```text
theme = "midnight-blue"
```

A seleção deve ser aplicada globalmente ao Alura.exe e, quando sincronizada, ficar associada à conta do usuário.

## 17. Implementação

Usar tokens:

```css
background: var(--theme-bg);
color: var(--theme-text-primary);
border-color: var(--theme-border);
```

Não colocar hex diretamente em componentes.

## 18. Critério de aceite

O tema estará pronto quando:
- a interface parecer predominantemente noturna;
- azul aparecer como luz/interação;
- cards tiverem profundidade;
- todas as páginas respeitarem os tokens;
- chamadas e compartilhamento de tela funcionarem visualmente sem sair da paleta;
- foco e acessibilidade forem preservados;
- não houver mistura involuntária com a paleta verde oficial.
