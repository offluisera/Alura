# ALURA — UI ONBOARDING: INFORMAÇÕES BÁSICAS

**Status:** Especificação oficial  
**Referência visual:** telas de onboarding da Alura  
**Cores:** `ALURA-COLOR-SYSTEM-V2.md`

## Objetivo

Criar a primeira etapa do cadastro pós-confirmação do código. A tela deve coletar informações essenciais sem parecer um formulário SaaS genérico.

## Fluxo

```text
Código confirmado
↓
Continuar cadastro
↓
Informações Básicas
↓
Perfil
```

## Shell

Desktop:

```text
Sidebar de etapas (~296px)
+
Workspace principal
+
Preview opcional (~390–410px)
```

Mobile:

```text
Progress no topo
↓
Formulário
↓
Navegação
```

A identidade visual deve permanecer idêntica às demais etapas.

## Header

```text
← Voltar

[ícone]

Informações Básicas

Vamos começar com algumas informações essenciais
para que possamos te conhecer melhor. Não se preocupe,
você pode alterar depois.
```

Progress:

```text
●━━━━━━━━━━━━━━━━━━━━
1 de 6
```

## Sidebar

```text
✓ / 1  Informações Básicas
      Dados pessoais e contato

○ / 2  Perfil
      Foto, bio e preferências

○ / 3  Jogos
      Seus jogos favoritos

○ / 4  Hobbies
      Interesses e atividades

○ / 5  Mensagem
      Uma mensagem para a comunidade

○ / 6  Finalização
      Tudo pronto!
```

## Campos

Desktop em duas colunas:

```text
Nome completo *        Idade *
Data de nascimento *   Telefone *
Cidade *               Estado *
Idioma preferido
```

Campos obrigatórios:

- Nome completo
- Idade
- Data de nascimento
- Telefone
- Cidade
- Estado

## Inputs

```text
height: 48px
radius: 10–12px
background: #001A14
border: #00502F
text: #F0FFF8
placeholder: #789487
```

Focus:

```text
border: #00663A
```

Ícones sugeridos:

```text
Nome → user
Idade → calendar
Nascimento → calendar
Telefone → phone
Cidade → location
Estado → map
Idioma → globe
```

## Aviso de privacidade

```text
ⓘ Essas informações são apenas para melhorar sua
  experiência na plataforma.

  Elas não serão compartilhadas com terceiros.
```

Usar superfície discreta, borda fina e texto secundário.

## Navegação

```text
[ ← Voltar ]                    [ Salvar e continuar → ]
```

Botão principal:

```text
background: #00DFA0
text: #000808
hover: #00F0A8
```

## Validação

Erros devem aparecer próximos ao campo e não depender somente de cor.

Exemplos:

```text
Informe seu nome completo.
Digite uma idade válida.
Informe uma data de nascimento válida.
Digite um telefone válido.
```

## Estados

Implementar:

```text
default
focus
filled
error
disabled
loading
success
```

Salvar:

```text
Salvando...
↓
Salvo
```

## Persistência

Dados:

```text
onboarding.basic_info
```

Modelo:

```ts
interface BasicInfo {
  fullName: string;
  age: number;
  birthDate: string;
  phone: string;
  city: string;
  state: string;
  language?: string;
}
```

Se o usuário abandonar o fluxo, os dados já salvos devem ser recuperáveis.

## Acessibilidade

- labels reais;
- navegação por teclado;
- foco visível;
- contraste adequado;
- mensagens de erro associadas aos campos;
- targets ≥ 44px;
- não depender apenas de cor.

## Responsividade

Desktop:

```text
Formulário centralizado
2 colunas
```

Mobile:

```text
1 coluna
campos full-width
footer persistente
```

## Motion

Transição da etapa:

```text
fade + translateX
180–260ms
```

Respeitar `prefers-reduced-motion`.

## Critérios de aceite

- [ ] Visual compatível com o sistema Alura
- [ ] Sistema V2 aplicado
- [ ] Campos implementados
- [ ] Validação
- [ ] Persistência
- [ ] Loading/error/success
- [ ] Responsive
- [ ] Acessibilidade
- [ ] Navegação para Perfil
- [ ] Sem cores arbitrárias
