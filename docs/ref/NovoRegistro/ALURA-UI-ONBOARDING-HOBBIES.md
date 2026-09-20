# ALURA — UI ONBOARDING: HOBBIES

**Status:** Especificação oficial  
**Referência visual:** tela de hobbies gerada para a Alura  
**Cores:** `ALURA-COLOR-SYSTEM-V2.md`

## Objetivo

Permitir que o usuário selecione hobbies e interesses para representar sua personalidade e facilitar conexões relevantes.

## Header

```text
← Voltar

[ícone]

Hobbies

Conte para a comunidade o que você gosta de fazer
no seu tempo livre. Selecione seus hobbies e interesses.
Você pode escolher vários!
```

Progress:

```text
━━━━━━━━━━━●━━━━━━━━━━
4 de 6
```

## Busca

```text
[ 🔍 Buscar hobbies... ]
```

## Categorias

```text
Todos
Tecnologia
Esportes
Artes
Música
Viagens
Gastronomia
Lifestyle
```

Ativa:

```text
background: #00DFA0
text: #000808
```

## Hobbies de referência

```text
Programação
Academia
Futebol
Música
Viagens
Culinária
Leitura
Fotografia
Pintura
Trilhas
Games
Confeitaria
```

O catálogo deve ser extensível.

## Regra obrigatória de imagens

A imagem principal de cada hobby deve ser **fotografia real**.

Exemplos:

```text
Programação → notebook/código real
Academia → academia/equipamento real
Futebol → bola/campo real
Música → instrumento real
Viagens → paisagem real
Fotografia → câmera real
Culinária → preparo real
Leitura → livro real
```

Não usar como imagem principal:

```text
clipart
arte infantil
ilustração abstrata
ícone gigante
background genérico
```

## Grid

Desktop:

```text
4 colunas
gap: 16px
```

Card:

```text
┌─────────────────────┐
│                     │
│      FOTO REAL      │
│                     │
├─────────────────────┤
│ ◉ Programação       │
│   Tecnologia        │
└─────────────────────┘
```

## Estados

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

## Limite

Sugestão:

```text
mínimo: 3
máximo: 12
```

Contador:

```text
6 hobbies selecionados
```

## Preview

Mostrar no painel lateral:

```text
Prévia do seu perfil

Avatar
@username

Hobbies

◉ Programação
◉ Esportes
◉ Música
◉ Viagens
```

Também manter jogos já selecionados quando fizer sentido.

## Persistência

```text
onboarding.hobbies
```

```ts
interface HobbiesInfo {
  hobbyIds: string[];
}
```

## Performance

- lazy loading;
- thumbnails otimizadas;
- WebP/AVIF quando possível;
- cache;
- busca com debounce;
- virtualização para catálogo grande.

## Navegação

```text
[ ← Voltar ]                    [ Salvar e continuar → ]
```

## Acessibilidade

- cards navegáveis por teclado;
- foco visível;
- seleção anunciada;
- alt text nas fotografias;
- filtros acessíveis;
- busca acessível;
- não depender apenas de cor.

## Motion

Card selecionado:

```text
100–180ms
```

Preview:

```text
150–220ms
```

Transição:

```text
fade + translateX
180–260ms
```

Respeitar `prefers-reduced-motion`.

## Critérios de aceite

- [ ] Busca
- [ ] Categorias
- [ ] Grid responsivo
- [ ] Fotografias reais
- [ ] Seleção
- [ ] Mínimo 3
- [ ] Máximo 12
- [ ] Contador
- [ ] Preview
- [ ] Persistência
- [ ] Lazy loading
- [ ] Acessibilidade
- [ ] Sistema V2
- [ ] Visual consistente com Informações Básicas, Perfil e Jogos
