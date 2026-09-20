# ALURA — UI ONBOARDING: JOGOS

**Status:** Especificação oficial  
**Referência visual:** tela de seleção de jogos gerada para a Alura  
**Cores:** `ALURA-COLOR-SYSTEM-V2.md`

## Objetivo

Permitir que o usuário selecione seus jogos favoritos para personalizar o perfil e melhorar futuras conexões por interesse.

## Header

```text
← Voltar

[ícone]

Jogos Favoritos

Selecione os jogos que você mais gosta de jogar.
Isso nos ajuda a conectar você com pessoas que
têm os mesmos interesses!
```

Progress:

```text
━━━━━━━━●━━━━━━━━━━━━━━
3 de 6
```

## Busca

```text
[ 🔍 Buscar jogos... ]
```

```text
height: 48px
radius: 10–12px
background: #001A14
border: #00502F
```

## Filtros

```text
Todos
Ação
Aventura
FPS
RPG
MOBA
Esportes
Indie
Estratégia
```

Ativo:

```text
background: #00DFA0
text: #000808
```

## Grid

Desktop:

```text
4 colunas
gap: 16px
```

Card:

```text
┌───────────────────┐
│                   │
│     CAPA REAL     │
│                   │
├───────────────────┤
│ Minecraft         │
│ Sandbox           │
└───────────────────┘
```

Card deve conter:

- capa/arte real;
- nome;
- gênero;
- estado selecionado.

## Jogos iniciais de referência

```text
Minecraft
Grand Theft Auto V
Valorant
League of Legends
Fortnite
Call of Duty
Red Dead Redemption 2
The Witcher 3
Counter-Strike 2
EA Sports FC
Baldur's Gate 3
Elden Ring
```

O catálogo deve ser extensível.

## Seleção

Normal:

```text
border: #00502F
```

Hover:

```text
background: #003820
```

Selecionado:

```text
border: #00DFA0
```

Indicador:

```text
✓
```

Adicionar overlay discreto para indicar seleção sem esconder a capa.

## Limite

```text
mínimo: 3
máximo: 6
```

Mostrar:

```text
3 de 6 selecionados
```

Enquanto abaixo do mínimo:

```text
Selecione de 3 a 6 jogos
```

## Painel lateral

```text
Jogos selecionados    4 de 6

[imagem] Minecraft      ×
[imagem] GTA V           ×
[imagem] Valorant        ×
[imagem] LoL             ×
```

Permitir remover rapidamente.

## Imagens

Prioridade:

```text
arte/capa real do jogo
```

Não usar:

```text
placeholders permanentes
ilustrações genéricas
cards sem imagem
```

O catálogo deve fornecer imagens otimizadas.

## Performance

Obrigatório:

- lazy loading;
- thumbnails;
- WebP/AVIF quando possível;
- cache;
- busca com debounce;
- virtualização quando o catálogo crescer.

## Persistência

```text
onboarding.games
```

```ts
interface GamesInfo {
  gameIds: string[];
}
```

## Navegação

```text
[ ← Voltar ]                    [ Salvar e continuar → ]
```

## Acessibilidade

- cards navegáveis por teclado;
- estado `selected` acessível;
- foco visível;
- imagens com alt;
- busca acessível;
- filtros acessíveis;
- não depender somente de cor.

## Motion

Seleção:

```text
100–180ms
```

Troca de filtros:

```text
fade curto
```

Respeitar `prefers-reduced-motion`.

## Critérios de aceite

- [ ] Busca
- [ ] Filtros
- [ ] Grid responsivo
- [ ] Capas reais
- [ ] Seleção
- [ ] Mínimo 3
- [ ] Máximo 6
- [ ] Lista lateral
- [ ] Contador
- [ ] Remoção
- [ ] Persistência
- [ ] Lazy loading
- [ ] Acessibilidade
- [ ] Sistema V2
