# ALURA — Tema Crimson Noir

## 1. Objetivo

O **Crimson Noir** é um tema alternativo da Alura baseado na referência enviada, utilizando preto quase absoluto, vermelho carmesim e gradientes profundos.

Nome interno:

```text
crimson-noir
```

A proposta é uma aparência intensa, elegante e noturna, sem transformar toda a interface em vermelho brilhante.

## 2. Identidade visual

Cores principais observadas na referência:
- `#02060E` — preto profundo;
- `#C50337` — vermelho carmesim.

O preto cria a estrutura. O vermelho funciona como destaque, ação e iluminação.

## 3. Tokens

```css
--theme-bg: #02060E;
--theme-bg-deep: #090107;
--theme-surface-1: #18030C;
--theme-surface-2: #350516;
--theme-surface-3: #5A0823;

--theme-primary: #C50337;
--theme-primary-bright: #E20A49;
--theme-primary-soft: #D94A70;

--theme-border: #70203C;
--theme-border-strong: #A92C51;

--theme-text-primary: #FFF7F9;
--theme-text-secondary: #E8D5DA;
--theme-text-muted: #A98D95;
--theme-text-disabled: #6D555D;

--theme-focus: #E20A49;
```

## 4. Gradientes

Principal:

```css
linear-gradient(135deg, #02060E 0%, #C50337 100%);
```

Vertical:

```css
linear-gradient(180deg, #C50337 0%, #02060E 100%);
```

Superfície:

```css
linear-gradient(145deg, #5A0823 0%, #18030C 100%);
```

O vermelho deve parecer uma fonte de luz dentro de uma interface predominantemente escura.

## 5. Fundo

O fundo geral deve utilizar `#02060E` ou variações quase pretas.

Não usar vermelho como background global.

O vermelho deve aparecer principalmente em:
- botão primário;
- seleção;
- borda de destaque;
- cards especiais;
- chamadas ativas;
- hero;
- indicadores de interação.

## 6. Navigation Rail

Normal:
```text
background: #02060E
icon: #E8D5DA
```

Hover:
```text
background: #18030C
```

Ativo:
```text
background: #C50337
icon: #FFFFFF
```

O indicador ativo pode possuir uma pequena sombra vermelha.

## 7. Botões

Primário:

```css
background: #C50337;
color: #FFFFFF;
```

Hover:

```css
background: #E20A49;
```

Secundário:
- fundo `#18030C`;
- borda `#70203C`;
- texto claro.

Ghost:
- fundo transparente;
- hover `rgba(197, 3, 55, 0.12)`.

## 8. Cards

Card normal:

```css
background: #18030C;
border: 1px solid #70203C;
```

Card especial:

```css
background: linear-gradient(145deg, #5A0823, #18030C);
```

A referência usa grandes blocos com transição de vermelho para preto. Essa característica pode aparecer em:
- perfil;
- banners;
- comunidades;
- telas vazias;
- destaque de conteúdo.

## 9. Inputs

Normal:
```text
background: #090107
border: #70203C
text: #FFF7F9
```

Focus:
```text
border: #E20A49
```

O vermelho de foco deve ser visível, porém sem glow exagerado.

## 10. Estados semânticos

O Crimson Noir não deve transformar vermelho em sinônimo de erro.

Isso é obrigatório.

O vermelho do tema é **identidade visual**.

Erro continua utilizando o token semântico global de danger.

Para evitar confusão:
- o vermelho tem diferentes níveis de luminosidade;
- erro deve possuir também ícone, texto ou indicador semântico;
- sucesso e warning permanecem visualmente distintos.

## 11. Voz e compartilhamento de tela

Chamadas ativas podem usar o carmesim para indicar atividade.

Exemplos:
- botão "Entrar na chamada";
- botão "Compartilhar tela";
- indicador de sala ativa;
- seleção de participante.

Porém:
- microfone desligado;
- falha de conexão;
- erro de permissão;
- falha de dispositivo

devem continuar utilizando estados semânticos específicos.

## 12. Glow

Usar vermelho luminoso com extrema moderação.

Exemplo:

```css
box-shadow:
  0 0 24px rgba(197, 3, 55, 0.20);
```

Aplicar somente em elementos importantes.

Não colocar glow em cada botão ou card.

## 13. Tipografia

Manter a tipografia da Alura.

Títulos:
```text
#FFF7F9
```

Texto:
```text
#E8D5DA
```

Texto auxiliar:
```text
#A98D95
```

Evitar texto cinza puro, porque a referência possui atmosfera quente/fria combinada com preto.

## 14. Acessibilidade

Verificar contraste especialmente em:
- vermelho sobre preto;
- branco sobre vermelho;
- texto secundário sobre superfícies vermelhas;
- bordas escuras;
- estados ativos.

Nunca usar apenas vermelho para representar erro.

## 15. Motion

Movimentos devem ser discretos e sofisticados.

Preferir:
- fade;
- scale de 0.98 → 1;
- slide curto;
- mudança suave de luminosidade.

Evitar animações de pulsação vermelha permanentes.

## 16. Persistência

Valor:

```text
theme = "crimson-noir"
```

A preferência deve:
1. ser carregada localmente;
2. aplicar o tema antes da renderização completa;
3. sincronizar com a conta, se permitido;
4. permanecer consistente entre sessões.

## 17. Arquitetura de tokens

Componentes nunca devem depender de:

```css
#C50337
#02060E
```

diretamente.

Devem depender de:

```css
var(--theme-primary)
var(--theme-bg)
var(--theme-surface-1)
var(--theme-border)
```

Assim o mesmo componente funciona no tema verde, Violet Radiance, Midnight Blue e Crimson Noir.

## 18. Regra contra conflito visual

O Crimson Noir não deve modificar:
- estrutura das páginas;
- layout;
- navegação;
- componentes;
- comportamento;
- regras de negócio;
- permissões;
- sistema de mensagens.

Somente a camada visual deve mudar.

## 19. Critério de aceite

O tema estará concluído quando:
- a interface tiver aparência predominantemente preta;
- carmesim for usado como destaque;
- vermelho não for confundido automaticamente com erro;
- cards tiverem profundidade;
- chamadas e compartilhamento de tela tiverem estados claros;
- foco for acessível;
- todos os componentes usarem tokens;
- não existirem hexadecimais temáticos hardcoded nos componentes.
