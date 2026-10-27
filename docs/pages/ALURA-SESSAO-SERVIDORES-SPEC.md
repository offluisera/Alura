# ALURA — ESPECIFICAÇÃO TÉCNICA E DESIGN SYSTEM: SESSÃO DE SERVIDORES
## Arquitetura, UX/UI, Modelo de Dados e Guia de Implementação

> **Versão:** 1.0.0  
> **Status:** Aprovado para Desenvolvimento  
> **Stack:** React + TypeScript (Web/Desktop), Phoenix/Elixir (Realtime), Supabase/PostgreSQL (Dados e Auth)  
> **Paleta Base:** `#001609 #001B0B #00220E #002A12 #003014 #003516 #003C19 #00421B #004B1F #005322`

---

## 1. Visão Geral e Análise das Ideias

A sessão de **Servidores** da Alura é o centro gravitacional de comunidades da plataforma. Inspirada no fluxo moderno de descoberta e hubs sociais, ela se diferencia completamente de clones genéricos ao adotar:
1. **Layout Master-Detail com Preview em Tempo Real:** Permite ao usuário inspecionar canais principais, estatísticas e membros online antes de decidir entrar em uma comunidade.
2. **Separação Intencional em Três Dimensões:**
   - **Descobrir Servidores:** Vitrine pública de comunidades classificadas por relevância, membros e atividade.
   - **Meus Servidores:** Painel de gestão para criadores e proprietários de servidores.
   - **Servidores que Faço Parte:** Hub pessoal de comunidades ativas com métricas de notificações e atalhos rápidos.
3. **Sistema de Fixação Dinâmica (Pin System) na Barra Lateral:** Integração nativa com a sidebar esquerda (`SEUS SERVIDORES`), permitindo que servidores favoritos fiquem acessíveis com um clique a partir de qualquer tela.
4. **Filtros por Categoria e Tags Sensíveis:** Navegação fluida por pílulas temáticas (Jogos, Tecnologia, Estudos, etc.) e suporte a tags de classificação indicativa (`+18` / `NSFW`) com salvaguardas de visualização.
5. **Conformidade Estrita com o Sistema de Temas (Multi-Theme):** Todos os componentes da sessão de servidores respeitam dinamicamente o tema ativo configurado pelo usuário (`forest`, `obsidian`, `contrast`, `violet-radiance`, `midnight-blue`, `crimson-noir`). É proibido hardcodear cores fixas (como `#001609` ou `#00E6A0`), utilizando exclusivamente os tokens semânticos do Alura Design System e as variáveis dinâmicas de tema.

---

## 2. Sistema de Temas e Tokens Dinâmicos (Multi-Theme Compliance)

A interface de servidores deve herdar e responder instantaneamente às mudanças de tema do usuário configuradas em `/settings` (atributo `[data-theme]` no elemento raiz `html` e chave `alura_theme` no `localStorage`).

### 2.1 Mapeamento Obrigatório de Tokens Semânticos

| Elemento da UI de Servidores | Token / Variável Obrigatória | Proibição Estrita |
| :--- | :--- | :--- |
| Fundo da Página / Hub | `bg-alura-background` | Proibido `#000808` ou `#001609` hardcoded |
| Fundo dos Cards de Servidor | `bg-alura-surface1` ou `bg-alura-surface2` | Proibido cinzas ou verdes genéricos |
| Borda dos Cards e Divisores | `border-alura-border` / `border-alura-borderStrong` | Proibido bordas com valores HEX arbitrários |
| Hero Banner de Descoberta | `style={{ background: "var(--theme-hero-bg)" }}` | Proibido gradiente fixo verde/roxo/azul |
| Botão Primário ("Entrar") | `bg-alura-accent text-alura-background` | Proibido `#00E6A0` ou `#00C98A` direto |
| Destaque / Servidor Selecionado | `bg-alura-selected border-alura-borderStrong` | Proibido hardcoded highlight |
| Textos e Metadados | `text-alura-textPrimary`, `text-alura-textSecondary`, `text-alura-textMuted` | Proibido `#FFF` ou `#789487` soltos |
| Selo Verificado e Online Dot | `text-alura-accent` / `bg-alura-accent` | Proibido verde fixo que quebre temas (ex: Crimson) |
| Filtros de Categoria Ativos | `bg-alura-selected text-alura-textPrimary border-alura-borderStrong` | Proibido cor fixa de botão |

### 2.2 Temas Suportados e Comportamento Visual
1. **Alura Forest (`forest`):** Verde floresta profundo com acento esmeralda brilhante.
2. **Obsidian Minimal (`obsidian`):** Tons neutros escuros de grafite com acentos nítidos em branco/verde suave.
3. **High Contrast Cyber (`contrast`):** Fundo ultranegro com ciano e verde elétrico de alto contraste.
4. **Violet Radiance (`violet-radiance`):** Base índigo/púrpura com acentos vibrantes em magenta e violeta.
5. **Midnight Blue (`midnight-blue`):** Azul marinho noturno profundo com acentos ciano/safira.
6. **Crimson Noir (`crimson-noir`):** Preto carmim e vinho escuro com acentos escarlate/rubi.


## 3. Estrutura Visual e Layout Macro

### 3.1 Wireframe Conceitual da Guia de Servidores (Desktop)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TOPBAR: [ Logo ]   [ 🔍 Buscar servidores, comunidades, amigos...  / ]                       [ 🔔 3 ] [ Avatar Perfil ]│
├──────────────┬───────────────────────────────────────────────────────────────────────────────┬─────────────────────────┤
│ SIDEBAR      │ ÁREA CENTRAL (LISTA E DESCOBERTA)                                             │ PAINEL DE PREVIEW       │
│              │                                                                               │ (Servidor Selecionado)  │
│ [Início]     │ ┌───────────────────────────────────────────────────────────────────────────┐ │ ┌─────────────────────┐ │
│ [Amigos]     │ │ HERO BANNER: "Servidores"                                                 │ │ │ [BANNER DO SERVER]  │ │
│ [Perfil]     │ │ "Descubra comunidades, conecte-se com pessoas e faça parte..."            │ │ │ [ICON]              │ │
│ [Solicit.]   │ │                                                  [ + Criar servidor ]     │ │ │                     │ │
│ [Mensagens]  │ └───────────────────────────────────────────────────────────────────────────┘ │ │ Alura Dev  [✔]  [...] │ │
│ [Servidores] │                                                                               │ │ 12.4k mem. • 832 on   │ │
│ [Config.]    │ [ Meus Servidores ]  [ Servidores que Faço Parte ]  [ ★ Descobrir Servidores ]│ │ [  ENTRAR / ACESSAR ] │ │
│              │                                                                               │ ├─────────────────────┤ │
│ ───────────  │ [ Todos ] [ 🎮 Jogos ] [ </> Tecnologia ] [ 🎓 Estudos ] [ 🎨 Criatividade ] │ │ SOBRE O SERVIDOR    │ │
│ SEUS         │                                                                               │ │ Comunidade focada em│ │
│ SERVIDORES   │ ┌───────────────────────────────────────────────────────────────────────────┐ │ │ desenvolvimento...  │ │
│              │ │ [ICON]  Alura Dev [✔]                      12.4k mem. • 832 on            │ │ │ #dev #tech #react   │ │
│ [A] Alura    │ │         Comunidade focada em desenvolvimento...     [ ENTRAR ] [ ... ]    │ │ ├─────────────────────┤ │
│ [G] Jogos    │ │         #desenvolvimento  #tecnologia  #programação                       │ │ CANAIS PRINCIPAIS   │ │
│ [T] Tech     │ ├───────────────────────────────────────────────────────────────────────────┤ │ │ # 👋 boas-vindas    │ │
│ [A] Anime    │ │ [ICON]  Gaming Zone [✔]                     8.7k mem. • 567 on            │ │ │ # 💬 geral          │ │
│ [M] Música   │ │         O seu ponto de encontro para games...       [ ENTRAR ] [ ... ]    │ │ │ # ❓ dúvidas        │ │
│              │ │         #jogos  #multiplayer  #gameplays                                  │ │ ├─────────────────────┤ │
│ [ + ]        │ ├───────────────────────────────────────────────────────────────────────────┤ │ MEMBROS ONLINE (832) │ │
│              │ │ [ICON]  Design & UI/UX [✔]                  6.3k mem. • 421 on            │ │ │ [👤][👤][👤][👤] +828 │ │
│ [UserPanel]  │ └───────────────────────────────────────────────────────────────────────────┘ │ └─────────────────────┘ │
└──────────────┴───────────────────────────────────────────────────────────────────────────────┴─────────────────────────┘
```

---

## 4. Especificação das Abas (Navegação Interna)

A rota `/servers` conterá três abas principais gerenciadas por estado (`activeTab`):

### 4.1 Aba: Descobrir Servidores (`discover`)
- **Objetivo:** Vitrine de exploração de comunidades públicas.
- **Ordenação Padrão:** Quantidade de membros (decrescente: `member_count DESC`), com opção secundária de "Mais ativos agora" (`online_count DESC`).
- **Barra de Pesquisa & Filtros:**
  - Input de busca com ícone de lupa e atalho de teclado `/`.
  - Pílulas de categorias: `Todos`, `Jogos`, `Tecnologia`, `Estudos`, `Criatividade`, `Entretenimento`, `Música`, `Comunidade`.
  - Contador de resultados em tempo real.
- **Card de Servidor:**
  - **Banner:** Suporte a PNG, JPG e GIF animado (com efeito hover que inicia a animação do GIF ou aplica zoom suave).
  - **Ícone:** 56x56 squircle com borda sutil, suportando GIF e PNG.
  - **Selo de Verificação:** Ícone de verificado (`CheckCircle` com cor `text-alura-accent`) para comunidades oficiais da Alura e parceiras.
  - **Nome e Descrição:** Tipografia de alto contraste com truncamento elegante em 2 linhas (`line-clamp-2`).
  - **Tags:** Badges temáticos clicáveis (ao clicar em uma tag, ela filtra a lista automaticamente). Tag especial `+18` estilizada em tom de alerta âmbar/vermelho com aviso prévio.
  - **Contadores:** `12.4k membros` e indicador pulsante (`bg-alura-accent`) para `832 online`.
  - **Botão de Ação Primária:**
    - Se **não for membro**: Botão **"Entrar"** (`bg-alura-accent text-alura-background hover:brightness-110`).
    - Se **já for membro**: Botão **"Acessar"** (`bg-alura-surface2 text-alura-accent border border-alura-borderStrong`).
  - **Menu de Ações Rápidas (`...`):**
    - "Fixar na barra lateral" / "Desafixar".
    - "Copiar link de convite".
    - "Compartilhar".
    - "Denunciar servidor".

### 4.2 Aba: Meus Servidores (`owned`)
- **Objetivo:** Área de gestão dos servidores criados pelo próprio usuário (`owner_id = user.id`).
- **Funcionalidades:**
  - Card de destaque com ação rápida: **"+ Criar Novo Servidor"**.
  - Indicadores de saúde da comunidade: total de membros, novos membros na semana, taxa de atividade.
  - Acesso direto ao painel de configurações do servidor (gerenciamento de cargos, salas, webhooks e permissões).
- **Estado Vazio (Empty State):** Ilustração minimalista e mensagem: *"Você ainda não criou nenhum servidor. Crie sua própria comunidade e reúna seus amigos!"*, com CTA proeminente.

### 4.3 Aba: Servidores que Faço Parte (`joined`)
- **Objetivo:** Acesso rápido e organizado a todas as comunidades das quais o usuário é membro.
- **Funcionalidades:**
  - Indicador de status no servidor (cargo do usuário, exemplo: *Moderador*, *Membro*).
  - Indicadores de mensagens não lidas e menções diretas.
  - Botão toggle direto para **Fixar / Desafixar** na barra lateral.
  - Opção contextual de "Sair do Servidor" com modal de confirmação de segurança.

---

## 5. Sistema de Fixação na Barra Lateral (Pin System)

Conforme os anexos e especificações:
- **Origem:** O usuário pode fixar qualquer servidor do qual faça parte ou esteja explorando.
- **Destino:** A seção **"SEUS SERVIDORES"** na `Sidebar.tsx` (anexo 3).
- **Comportamento Visual:**
  - Lista vertical de itens compactos com:
    - Ícone squircle (44x44px) com bordas suaves (`rounded-[12px]`).
    - Nome do servidor com tipografia `14px font-medium`.
    - Ponto pulsante (`bg-alura-accent`) quando o servidor estiver selecionado ou tiver atividade em tempo real.
    - Animação de entrada suave via `framer-motion` (slide-in vertical com spring physics).
  - Botão `+` ao final da lista para navegar diretamente para a aba "Descobrir Servidores" ou abrir o modal de criação.
- **Persistência:**
  - Salvo na tabela `user_pinned_servers` (PostgreSQL/Supabase) para sincronização multiplataforma (Web e Desktop Electron).
  - Cache local imediato no cliente para feedback com latência zero (Optimistic UI).

---

## 6. Painel Lateral de Inspecção / Preview (`ServerPreviewPanel`)

Ao clicar em qualquer card da lista (sem necessariamente entrar de imediato):
1. **Header do Preview:** Banner amplo em gradiente dinâmico (`var(--theme-hero-bg)`) e avatar em alta definição com selo de verificado.
2. **Identificação e Métricas:** Nome, status de verificação, `X membros` e `Y online agora`.
3. **Ação Principal:** Botão em largura total **"Entrar no Servidor"** ou **"Abrir Comunidade"**.
4. **Sobre o Servidor:** Descrição detalhada e lista completa de tags.
5. **Canais Principais:** Amostra dos principais canais de texto e voz com contadores de atividade:
   - `# 👋 boas-vindas`
   - `# 💬 geral`
   - `# ❓ dúvidas`
   - `# </> projetos`
   - `# 💼 vagas`
   - `# 📅 eventos`
6. **Membros Online:** Grid de avatares com fotos de perfil reais e tooltip de nome e atividade atual (jogando, codando, ouvindo Spotify).

---

## 7. Modelo de Dados e Banco de Dados (Supabase / PostgreSQL)

### 7.1 Atualizações na Tabela `servers`

```sql
-- Adiciona campos para o sistema de descoberta, categorias, tags e moderação
ALTER TABLE public.servers
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Geral',
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS is_nsfw BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS online_count INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- Índices de performance para busca rápida e ordenação por membros
CREATE INDEX IF NOT EXISTS idx_servers_member_count ON public.servers(member_count DESC);
CREATE INDEX IF NOT EXISTS idx_servers_category ON public.servers(category);
CREATE INDEX IF NOT EXISTS idx_servers_is_public ON public.servers(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_servers_tags ON public.servers USING GIN(tags);
```

### 7.2 Nova Tabela: `user_pinned_servers` (Sistema de Fixação)

```sql
CREATE TABLE public.user_pinned_servers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    pinned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, server_id)
);

CREATE INDEX IF NOT EXISTS idx_user_pinned_servers_user ON public.user_pinned_servers(user_id, position ASC);

-- Políticas RLS
ALTER TABLE public.user_pinned_servers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar seus próprios servidores fixados"
    ON public.user_pinned_servers
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

### 7.3 Triggers de Atualização Automática de Membros

```sql
-- Função para sincronizar contagem de membros ao entrar ou sair
CREATE OR REPLACE FUNCTION public.update_server_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.servers
        SET member_count = (SELECT COUNT(*) FROM public.server_members WHERE server_id = NEW.server_id),
            updated_at = NOW()
        WHERE id = NEW.server_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.servers
        SET member_count = (SELECT COUNT(*) FROM public.server_members WHERE server_id = OLD.server_id),
            updated_at = NOW()
        WHERE id = OLD.server_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_update_server_member_count
AFTER INSERT OR DELETE ON public.server_members
FOR EACH ROW EXECUTE FUNCTION public.update_server_member_count();
```

---

## 8. Arquitetura de Componentes Frontend (React / TypeScript)

Localização sugerida: `apps/web/src/pages/app/servers/` e componentes compartilhados:

```text
apps/web/src/
├── pages/
│   └── app/
│       ├── Servers.tsx                     # Página principal da sessão de servidores
├── components/
│   ├── servers/
│   │   ├── ServerHeroBanner.tsx            # Banner de topo com busca e botão de criar
│   │   ├── ServerCategoryFilter.tsx        # Pílulas horizontais de categorias
│   │   ├── ServerCard.tsx                  # Card de exibição do servidor (Banner, Icon, Tags, Ação)
│   │   ├── ServerPreviewPanel.tsx          # Painel direito com detalhes e canais em tempo real
│   │   ├── CreateServerModal.tsx           # Modal wizard para criação de novos servidores
│   │   └── ServerContextDropdown.tsx       # Menu de opções (...) com ação de Pin, convite, etc.
│   └── layout/
│       └── Sidebar.tsx                     # Atualizada para renderizar "SEUS SERVIDORES" fixados
```

---

## 9. Guia de Implementação Passo a Passo

### Passo 1: Migração e Banco de Dados
- Executar a migration SQL adicionando as colunas `category`, `tags`, `is_verified`, `is_public`, `member_count`, `online_count` e a tabela `user_pinned_servers`.
- Inserir dados de demonstração (seed) com servidores temáticos da Alura (ex: *Alura Dev*, *Gaming Zone*, *Design & UI/UX*, *Tech & Inovação*, *Anime & Cultura Pop*).

### Passo 2: Atualização da Barra Lateral (`Sidebar.tsx`)
- Criar a seção visual `"SEUS SERVIDORES"` abaixo da navegação principal.
- Buscar servidores fixados via Supabase (`user_pinned_servers` com join em `servers`).
- Renderizar os ícones com hover elegante e indicador verde do servidor ativo.
- Adicionar o botão `+` de atalho rápido.

### Passo 3: Criação da Página `Servers.tsx` e Rota
- Atualizar `App.tsx` para direcionar `/servers` para o novo componente `Servers.tsx`.
- Implementar as 3 abas: *Descobrir*, *Meus Servidores* e *Servidores que Faço Parte*.
- Adicionar a barra de busca e o filtro por categorias com debounce.

### Passo 4: Implementação do Card e Painel de Inspecção
- Desenvolver o `ServerCard.tsx` com suporte a banners/ícones GIF e PNG.
- Desenvolver o `ServerPreviewPanel.tsx` sincronizado com o servidor atualmente selecionado.
- Implementar as ações de "Entrar", "Acessar" e "Fixar na barra lateral".

### Passo 5: Modal de Criação de Servidor (`CreateServerModal.tsx`)
- Fluxo em etapas para o usuário criar seu servidor:
  - Etapa 1: Nome, ícone e banner.
  - Etapa 2: Categoria e tags.
  - Etapa 3: Visibilidade (Público no Descobrir ou Privado).

### Passo 6: Validação e Polimento Estético
- Garantir 60 FPS nas transições com Framer Motion.
- Validar conformidade total com o Alura Design System e a paleta verde floresta profunda.
