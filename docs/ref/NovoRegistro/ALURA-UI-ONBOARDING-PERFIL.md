# ALURA — UI ONBOARDING: PERFIL

**Status:** Especificação oficial  
**Referência visual:** telas de onboarding da Alura  
**Cores:** `ALURA-COLOR-SYSTEM-V2.md`

## Objetivo

Permitir que o usuário personalize sua identidade dentro da Alura com foto, bio e interesses.

## Header

```text
← Voltar

[ícone]

Perfil

Agora vamos personalizar seu perfil! Adicione uma foto,
conte um pouco sobre você e escolha o que te representa.
```

Progress:

```text
━━━━●━━━━━━━━━━━━━━━
2 de 6
```

## Estrutura

Desktop:

```text
Sidebar ~296px
+
Perfil / formulário
+
Prévia do seu perfil ~390–410px
```

## Foto de perfil

Título:

```text
Foto de perfil
```

Descrição:

```text
Adicione uma foto que te represente.
Pode ser uma foto real ou seu avatar.
```

Componente:

```text
Avatar grande
+
Editar
```

Botão:

```text
Alterar foto
```

Formatos:

```text
JPG / PNG / WEBP
Máximo recomendado: 5 MB
```

Estados:

```text
upload
uploading
success
error
remove
```

## Biografia

Textarea:

```text
Ex: Sou apaixonado por tecnologia, jogos e boa companhia.
Sempre em busca de novos desafios!
```

Limite:

```text
200 caracteres
```

Contador:

```text
0/200
```

## Tags

Sugestões:

```text
Programador
Gamer
Criativo
Músico
Empreendedor
Estudante
Sempre aprendendo
```

Selecionada:

```text
background: #004028
border: #00DFA0
text: #00DFA0
```

## Jogos no perfil

Mostrar pequenas capas reais dos jogos selecionados:

```text
Minecraft
GTA V
Valorant
League of Legends
```

As imagens devem ser reais/oficiais, sem ilustrações genéricas.

## Preview

Título:

```text
Prévia do seu perfil
```

Estrutura:

```text
┌────────────────────────────┐
│           BANNER           │
│                            │
│        ◯ Avatar            │
│        @username           │
│        ● Online            │
│                            │
│ [Programador] [Gamer]      │
│                            │
│ Jogos favoritos            │
│ [capa] [capa] [capa]       │
│                            │
│ Hobbies                    │
└────────────────────────────┘
```

Atualizar em tempo real.

## Navegação

```text
[ ← Voltar ]                    [ Salvar e continuar → ]
```

## Persistência

```text
onboarding.profile
```

```ts
interface ProfileInfo {
  avatarUrl?: string;
  bio?: string;
  tags: string[];
}
```

## Motion

- preview: 150–220ms;
- avatar: microinterações sutis;
- troca de conteúdo: fade;
- respeitar `prefers-reduced-motion`.

## Acessibilidade

- label no upload;
- teclado;
- foco visível;
- feedback de upload;
- contador acessível;
- contraste;
- targets ≥ 44px.

## Critérios de aceite

- [ ] Upload de avatar
- [ ] Preview em tempo real
- [ ] Bio
- [ ] Contador 200 caracteres
- [ ] Tags
- [ ] Jogos selecionados
- [ ] Persistência
- [ ] Loading/error
- [ ] Responsive
- [ ] Sistema V2
- [ ] Visual consistente com as outras etapas
