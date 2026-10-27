# 🏛️ ALURA — PLANO COMPLETO DE IMPLEMENTAÇÃO: SESSÃO DE SERVIDORES
## Arquitetura Master-Detail, Hub de Comunidades, Banco de Dados e Guia de Execução

> **Documento:** `ALURA-PLANO-IMPLEMENTACAO-SERVIDORES.md`  
> **Versão:** 1.0.0  
> **Status:** Pronto para Implementação  
> **Stack:** React 18 + TypeScript (Frontend), Phoenix / Elixir (Realtime), Supabase / PostgreSQL (Banco e RLS), Electron (Desktop)  
> **Design System:** Alura Multi-Theme Compliance (`forest`, `obsidian`, `contrast`, `violet-radiance`, `midnight-blue`, `crimson-noir`)

---

## 1. 🎯 Visão Geral & Filosofia de Produto

A sessão de **Servidores** (`/servers`) é o hub gravitacional de comunidades da Alura. Não é um clone visual nem comportamental do Discord — é um ambiente social vivo, fluido e com direção de arte própria, estruturado em torno de:

1. **Layout Master-Detail com Live Preview**: Inspecione canais principais, regras, estatísticas e membros online antes de decidir entrar em uma comunidade.
2. **Navegação em Três Dimensões**:
   - **Descobrir Servidores (`discover`)**: Vitrine de exploração pública por categorias temáticas e relevância.
   - **Meus Servidores (`owned`)**: Painel de gestão e indicadores para donos e criadores de comunidade.
   - **Servidores que Faço Parte (`joined`)**: Hub pessoal com status de cargos, mensagens não lidas e ações de saída/fixação.
3. **Sistema de Fixação Dinâmica (Pin System)**: Integração nativa na `Sidebar.tsx` principal da plataforma na seção `"SEUS SERVIDORES"`, permitindo atalhos rápidos de qualquer tela.
4. **Conformidade Estrita Multi-Tema**: 100% dos componentes utilizam tokens semânticos (`bg-alura-surface1`, `border-alura-border`, `text-alura-accent`, `var(--theme-hero-bg)`), garantindo coerência visual nos 6 temas do produto.

---

## 2. 🗄️ Modelo de Dados e Banco de Dados (Supabase PostgreSQL)

### 2.1 Migração SQL: `20241002000001_servers_hub_and_pins.sql`

Esta migração adiciona os campos necessários à tabela existente `servers`, cria a tabela de servidores fixados `user_pinned_servers`, ativa RLS com políticas seguras e instala a trigger de sincronização automática de membros.

```sql
-- ==============================================================================
-- 1. ATUALIZAÇÃO DA TABELA SERVERS
-- ==============================================================================

ALTER TABLE public.servers
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Geral',
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS is_nsfw BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS online_count INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- Índices otimizados para busca e ordenação
CREATE INDEX IF NOT EXISTS idx_servers_member_count ON public.servers(member_count DESC);
CREATE INDEX IF NOT EXISTS idx_servers_category ON public.servers(category);
CREATE INDEX IF NOT EXISTS idx_servers_is_public ON public.servers(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_servers_tags ON public.servers USING GIN(tags);

-- ==============================================================================
-- 2. TABELA DE SERVIDORES FIXADOS (PIN SYSTEM NA SIDEBAR)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_pinned_servers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    pinned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, server_id)
);

CREATE INDEX IF NOT EXISTS idx_user_pinned_servers_user ON public.user_pinned_servers(user_id, position ASC);

-- Políticas de Segurança RLS
ALTER TABLE public.user_pinned_servers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem visualizar e gerenciar seus servidores fixados" ON public.user_pinned_servers;
CREATE POLICY "Usuários podem visualizar e gerenciar seus servidores fixados"
    ON public.user_pinned_servers
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 3. TRIGGER AUTOMÁTICA DE CONTAGEM DE MEMBROS
-- ==============================================================================

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

DROP TRIGGER IF EXISTS trigger_update_server_member_count ON public.server_members;
CREATE TRIGGER trigger_update_server_member_count
AFTER INSERT OR DELETE ON public.server_members
FOR EACH ROW EXECUTE FUNCTION public.update_server_member_count();

-- ==============================================================================
-- 4. SEEDS OFICIAIS DE COMUNIDADES ALURA (SE A TABELA ESTIVER VAZIA)
-- ==============================================================================

DO $$
DECLARE
    admin_user_id UUID;
    srv_dev_id UUID := '11111111-1111-4111-a111-111111111111';
    srv_games_id UUID := '22222222-2222-4222-a222-222222222222';
    srv_design_id UUID := '33333333-3333-4333-a333-333333333333';
    srv_tech_id UUID := '44444444-4444-4444-a444-444444444444';
BEGIN
    SELECT id INTO admin_user_id FROM public.profiles LIMIT 1;
    IF admin_user_id IS NOT NULL THEN
        -- Servidor 1: Alura Dev
        INSERT INTO public.servers (id, name, description, category, tags, is_verified, is_public, member_count, online_count, featured, owner_id)
        VALUES (
            srv_dev_id,
            'Alura Dev',
            'Comunidade oficial de desenvolvedores da Alura. Troque ideias sobre TypeScript, Elixir, React, arquitetura e novos projetos.',
            'Tecnologia',
            ARRAY['desenvolvimento', 'react', 'elixir', 'typescript', 'programação'],
            TRUE, TRUE, 12480, 842, TRUE, admin_user_id
        ) ON CONFLICT (id) DO NOTHING;

        -- Servidor 2: Gaming Zone
        INSERT INTO public.servers (id, name, description, category, tags, is_verified, is_public, member_count, online_count, featured, owner_id)
        VALUES (
            srv_games_id,
            'Gaming Zone',
            'O ponto de encontro para jogadores da comunidade. Campeonatos, transmissões ao vivo, canais de voz e grupos de jogo.',
            'Jogos',
            ARRAY['jogos', 'multiplayer', 'stream', 'gameplay', 'discord-free'],
            TRUE, TRUE, 8920, 560, TRUE, admin_user_id
        ) ON CONFLICT (id) DO NOTHING;

        -- Servidor 3: Design & UI/UX
        INSERT INTO public.servers (id, name, description, category, tags, is_verified, is_public, member_count, online_count, featured, owner_id)
        VALUES (
            srv_design_id,
            'Design & UI/UX',
            'Espaço dedicado para entusiastas de design de produtos, design systems, tipografia, Figma e direção de arte.',
            'Criatividade',
            ARRAY['design', 'ui', 'ux', 'figma', 'motion'],
            TRUE, TRUE, 6340, 412, FALSE, admin_user_id
        ) ON CONFLICT (id) DO NOTHING;

        -- Servidor 4: Tech & Inovação
        INSERT INTO public.servers (id, name, description, category, tags, is_verified, is_public, member_count, online_count, featured, owner_id)
        VALUES (
            srv_tech_id,
            'Tech & Inovação',
            'Discussões sobre inteligência artificial, hardware, open-source, novos gadgets e futuro da tecnologia.',
            'Tecnologia',
            ARRAY['ia', 'hardware', 'opensource', 'futuro'],
            FALSE, TRUE, 4120, 289, FALSE, admin_user_id
        ) ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;
```

---

## 3. 🎨 Design System & Multi-Theme Compliance

A interface de servidores deve herdar instantaneamente qualquer um dos 6 temas do sistema Alura sem recarregar a página.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TOKEN SEMÂNTICO            │ USO NA SESSÃO DE SERVIDORES                               │
├────────────────────────────┼───────────────────────────────────────────────────────────┤
│ bg-alura-background        │ Fundo geral da página e containers principais             │
│ bg-alura-surface1          │ Fundo dos cards de servidor e caixas de diálogo           │
│ bg-alura-surface2          │ Hover nos cards, campos de formulário e dropdowns         │
│ border-alura-border        │ Bordas sutis dos cards, divisores e painel de preview     │
│ border-alura-borderStrong  │ Borda do servidor selecionado / ativo                     │
│ text-alura-accent          │ Selo de verificado, ponto online e botões primários       │
│ bg-alura-accent            │ Ação de "Entrar no Servidor", botões de submit e pills    │
│ var(--theme-hero-bg)       │ Gradiente de fundo do Hero Banner e Banner do Preview     │
│ var(--theme-logo-filter)   │ Filtro do ícone do servidor padrão quando sem imagem      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 📐 Arquitetura de Componentes Frontend (React / TypeScript)

Localização: `apps/web/src/pages/app/Servers.tsx` e submódulos em `apps/web/src/components/servers/`.

```
apps/web/src/
├── pages/
│   └── app/
│       └── Servers.tsx                     # Página mestre que orquestra abas, busca e layout
├── components/
│   ├── servers/
│   │   ├── ServerHeroBanner.tsx            # Hero com título, estatísticas, busca e CTA de criação
│   │   ├── ServerCategoryFilter.tsx        # Pílulas temáticas horizontais (Jogos, Tech, Estudos...)
│   │   ├── ServerCard.tsx                  # Card de exibição (Banner, Squircle, Tags, Contadores, Ações)
│   │   ├── ServerPreviewPanel.tsx          # Painel lateral Master-Detail de inspeção profunda
│   │   ├── CreateServerModal.tsx           # Wizard em 3 etapas para criação de servidor
│   │   └── ServerContextDropdown.tsx       # Menu suspenso (...) com ação de Pin, convite e denúncia
│   └── layout/
│       └── Sidebar.tsx                     # Atualizada com a seção vertical "SEUS SERVIDORES"
├── lib/
│   └── hooks/
│       ├── useServers.ts                   # Hook de busca, filtragem e paginação de servidores
│       └── usePinnedServers.ts             # Hook de sincronização de servidores fixados na sidebar
```

### 4.1 Wireframe do Layout Master-Detail (Desktop 1280px+)

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR      │ ÁREA CENTRAL (HUB E LISTAGEM)                                         │ PREVIEW LATERAL      │
│              │                                                                       │ (Servidor Ativo)     │
│ [Início]     │ ┌───────────────────────────────────────────────────────────────────┐ │ ┌──────────────────┐ │
│ [Amigos]     │ │ HERO BANNER: "Servidores"                        [ + Criar Servidor ]│ │ Banner do Servidor│ │
│ [Perfil]     │ │ "Explore comunidades, conecte-se com pessoas e faça amigos..."    │ │ ├──────────────────┤ │
│ [Solicit.]   │ │ 🔍 [ Buscar servidores por nome, tags... (Pressione /) ]          │ │ [Icon]  Alura Dev  │ │
│ [Mensagens]  │ └───────────────────────────────────────────────────────────────────┘ │ 12.4k mem • 842 on │ │
│ [Servidores] │                                                                       │ [ ENTRAR NO SERVIDOR]│
│ [Config.]    │ [ Descobrir Servidores ]  [ Meus Servidores ]  [ Servidores que Faço Parte ] │ ├──────────────────┤ │
│              │                                                                       │ SOBRE A COMUNIDADE │ │
│ ───────────  │ [ Todos ] [ 🎮 Jogos ] [ 💻 Tecnologia ] [ 🎓 Estudos ] [ 🎨 Design ]  │ Comunidade focada  │ │
│ SEUS         │                                                                       │ em desenvolvimento │ │
│ SERVIDORES   │ ┌───────────────────────────────────────────────────────────────────┐ │ #dev #react #elixir│ │
│              │ │ [ICON]  Alura Dev [✔]                      12.4k mem • 842 on     │ ├──────────────────┤ │
│ [A] Alura    │ │         Comunidade oficial de desenvolvimento... [ ENTRAR ] [...] │ │ CANAIS PRINCIPAIS│ │
│ [G] Gaming   │ ├───────────────────────────────────────────────────────────────────┤ │ # 👋 boas-vindas   │ │
│ [D] Design   │ │ [ICON]  Gaming Zone [✔]                     8.9k mem • 560 on     │ │ # 💬 geral         │ │
│ [T] Tech     │ │         O ponto de encontro para gamers...       [ ACESSAR ] [...]│ │ # ❓ dúvidas       │ │
│              │ ├───────────────────────────────────────────────────────────────────┤ │ ├──────────────────┤ │
│ [ + ]        │ │ [ICON]  Design & UI/UX                      6.3k mem • 412 on     │ │ MEMBROS ONLINE   │ │
│              │ └───────────────────────────────────────────────────────────────────┘ │ [👤][👤][👤] +839   │ │
└──────────────┴───────────────────────────────────────────────────────────────────────┴──────────────────────┘
```

---

## 5. 🧩 Detalhamento dos Componentes

### 5.1 `ServerHeroBanner.tsx`
- **Fundo**: Gradiente de tema `var(--theme-hero-bg)` com overlay sutil de textura e partículas CSS leves.
- **Identificação**: Título tipográfico display `"Servidores"`, subtítulo contextual e botão primário `+ Criar Servidor`.
- **Barra de Busca**:
  - Input com atalho de teclado global `/` para focar imediatamente.
  - Ícone de lupa à esquerda e botão de limpar busca (`X`) à direita.
  - Debounce de 250ms para filtragem suave sem engasgos de performance.

### 5.2 `ServerCategoryFilter.tsx`
- Pílulas horizontais com scroll suave (`custom-scrollbar` oculta):
  - `Todos` (com ícone Sparkles).
  - `🎮 Jogos`
  - `💻 Tecnologia`
  - `🎓 Estudos`
  - `🎨 Criatividade`
  - `🎬 Entretenimento`
  - `🎵 Música`
  - `🌐 Comunidade`
- Estado ativo: `bg-alura-selected text-alura-textPrimary border border-alura-borderStrong shadow-sm`.
- Contador de servidores encontrados na categoria selecionada.

### 5.3 `ServerCard.tsx`
- **Visual**: Card retangular com cantos `rounded-2xl`, borda `border-alura-border` e fundo `bg-alura-surface1/80 hover:bg-alura-surface1`.
- **Banner**:
  - Banner superior na proporção 16:6. Suporte a imagens estáticas e GIFs animados com zoom suave ao passar o cursor (`group-hover:scale-105`).
- **Squircle Avatar**:
  - Ícone 52x52px com cantos suaves `rounded-2xl`, sobrepondo a borda inferior do banner.
  - Caso não haja ícone customizado, gera squircle temático com a inicial do nome.
- **Corpo & Tipografia**:
  - Nome do servidor em negrito com selo de verificado `CheckCircle` (`text-alura-accent`).
  - Truncamento em 2 linhas da descrição com legibilidade aprimorada (`line-clamp-2 text-alura-textSecondary`).
  - Badges temáticos clicáveis para filtrar a lista.
  - Indicador pulsante esmeralda com contagem de membros online.
- **Ações**:
  - Se o usuário não for membro: botão **"Entrar"** (`bg-alura-accent text-alura-background font-bold`).
  - Se já for membro: botão **"Acessar"** (`bg-alura-surface2 text-alura-accent border border-alura-borderStrong`).
  - Botão de opções `...` para abrir o menu contextual (`ServerContextDropdown.tsx`).

### 5.4 `ServerPreviewPanel.tsx` (Painel Lateral de Inspeção)
- Abre dinamicamente na lateral direita ao clicar em qualquer card (Master-Detail).
- Exibe:
  1. Banner ampliado com efeito de profundidade.
  2. Identificação completa, tags e proprietário da comunidade.
  3. Botão em largura total: **"Entrar no Servidor"** ou **"Abrir Comunidade"**.
  4. Lista de canais mais ativos (amostra de 4 a 6 canais públicos).
  5. Avatares dos membros online em tempo real com indicador de presença.
  6. Botão de fechar painel no topo direito em telas de notebook/tablet.

### 5.5 `CreateServerModal.tsx` (Wizard de Criação em 3 Etapas)
- **Etapa 1: Identidade da Comunidade**
  - Nome do servidor (obrigatório, mín. 3 caracteres).
  - Upload de Ícone (preview em squircle com crop 1:1).
  - Upload de Banner (preview horizontal 16:6).
  - Descrição da comunidade (até 180 caracteres).
- **Etapa 2: Categoria e Classificação**
  - Seleção de categoria primária (dropdown elegante).
  - Tags temáticas (chips interativos onde o usuário digita e aperta `Enter`).
  - Tag indicativa de conteúdo sensível (`NSFW / +18`).
- **Etapa 3: Visibilidade & Criação**
  - Opções de visibilidade:
    - **Público**: Aparece na aba de "Descobrir Servidores" para toda a Alura.
    - **Privado**: Acessível apenas via link direto de convite.
  - Criação atômica no Supabase: cria servidor, adiciona o usuário logado como `owner` e membro número 1, cria o espaço padrão `"Geral"` e os canais `# boas-vindas` e `# geral`.

### 5.6 `Sidebar.tsx` — Integração com a Seção "SEUS SERVIDORES"
- Abaixo dos links de navegação principal (`Início`, `Amigos`, `Perfil`, `Solicitações`, `Mensagens`, `Servidores`, `Configurações`):
- Divisor sutil e cabeçalho em caixa alta: `SEUS SERVIDORES`.
- Lista vertical compacta de servidores fixados:
  - Ícone squircle (40x40px).
  - Ponto indicador lateral branco quando o servidor estiver selecionado ou com menção não lida.
  - Tooltip com o nome completo do servidor e total de membros online.
- Botão `+` no final da lista para navegar direto para `/servers` ou abrir o modal de criação.

---

## 6. 🚀 Roteiro de Execução Passo a Passo

### Fase 1: Banco de Dados & Infraestrutura (Tempo Estimado: 1h)
- [ ] Criar e aplicar a migração SQL `supabase/migrations/20241002000001_servers_hub_and_pins.sql`.
- [ ] Validar a criação dos campos em `servers`, tabela `user_pinned_servers`, triggers e políticas RLS.
- [ ] Verificar a inserção dos seeds oficiais de demonstração.

### Fase 2: Serviços e Hooks do Frontend (Tempo Estimado: 1h30)
- [ ] Criar `apps/web/src/lib/hooks/useServers.ts`:
  - Carregamento de servidores com paginação e busca.
  - Filtros por categoria, tags e abas (`discover`, `owned`, `joined`).
  - Ações de `joinServer(serverId)` e `leaveServer(serverId)`.
- [ ] Criar `apps/web/src/lib/hooks/usePinnedServers.ts`:
  - Carregamento dos servidores fixados do usuário logado.
  - Toggle de fixação (`pinServer(serverId)` e `unpinServer(serverId)`) com Optimistic UI imediata.

### Fase 3: Componentes Visuais de Servidores (Tempo Estimado: 2h30)
- [ ] Construir `ServerHeroBanner.tsx`.
- [ ] Construir `ServerCategoryFilter.tsx`.
- [ ] Construir `ServerCard.tsx` com hover dinâmico e actions.
- [ ] Construir `ServerPreviewPanel.tsx` sincronizado com o servidor em foco.
- [ ] Construir `ServerContextDropdown.tsx` com ações de Fixar, Link de Convite e Denúncia.

### Fase 4: Modal de Criação e Integração com Sidebar (Tempo Estimado: 2h)
- [ ] Construir `CreateServerModal.tsx` com formulário multi-etapas e upload para Supabase Storage.
- [ ] Atualizar `apps/web/src/components/layout/Sidebar.tsx` para exibir a seção interativa `"SEUS SERVIDORES"` conectada ao `usePinnedServers`.

### Fase 5: Montagem da Página e Rota (Tempo Estimado: 1h)
- [ ] Construir `apps/web/src/pages/app/Servers.tsx` integrando todos os componentes.
- [ ] Atualizar `apps/web/src/App.tsx`:
  - Substituir o placeholder `<Route path="servers" element={<Friends />} />` por `<Route path="servers" element={<Servers />} />`.

### Fase 6: Auditoria de Temas, Testes e Build (Tempo Estimado: 1h)
- [ ] Testar nos 6 temas (`forest`, `obsidian`, `contrast`, `violet-radiance`, `midnight-blue`, `crimson-noir`).
- [ ] Testar em resoluções Desktop (1920x1080, 1440x900, 1280x800) e Notebooks.
- [ ] Compilar build de produção web (`npm run build`).
- [ ] Compilar build portátil desktop (`npm run build:portable`) e testar no Electron.

---

## 7. ✅ Critérios de Aceite e Verificação

1. **Descoberta Instantânea**: A busca com debounce e filtros de categoria atualizam a grade de servidores em menos de 100ms.
2. **Master-Detail Fluido**: Clicar em qualquer card abre instantaneamente o preview lateral direito sem saltos de layout ou piscadas de tela.
3. **Pin System Confiável**: Fixar um servidor adiciona seu ícone imediatamente na Sidebar lateral; o estado persiste após recarregar a página (F5) e sincroniza entre Web e Desktop.
4. **Criação de Servidor Funcional**: Ao concluir o wizard de criação, o servidor é cadastrado no Supabase, o criador é inserido como owner, canais padrão são gerados e o servidor aparece imediatamente na aba "Meus Servidores".
5. **Zero Cores Hardcoded**: Nenhum valor HEX fixo deve quebrar o contraste ou a paleta ao alternar entre os temas do aplicativo.
