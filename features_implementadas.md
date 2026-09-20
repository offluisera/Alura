# Relatório de Funcionalidades Implementadas (Alura)

Este documento centraliza todas as áreas do sistema que já foram desenvolvidas, integradas e testadas até o momento.

---

## 1. Presença e Status em Tempo Real
- **Status do Usuário:** Suporte nativo para os status **Online**, **Ausente**, **Não Perturbe** e **Invisível**.
- **UserPanel Flutuante:** Menu interativo no rodapé da Sidebar para troca rápida de status.
- **Sincronização Total (Realtime):** A troca de status atualiza imediatamente para os amigos.
  - Sincronizado na **Lista de Amigos** (`Friends.tsx`).
  - Sincronizado no **Cabeçalho do Chat** de mensagens (`DirectMessage.tsx`).
  - Sincronizado no **Avatar do Topbar** (Canto superior direito).
- **Modo Não Perturbe Funcional:** Se ativado, o sistema ignora notificações visuais em Toast e efeitos sonoros globais.

## 2. Mensagens Diretas (Chat 1x1)
- **Chat em Tempo Real:** Conversas privadas fluídas com Websockets da Supabase.
- **Sistema de Anexos:** Código para upload de mídias/arquivos já implementado via Supabase Storage (`chat_attachments`).
- **Indicadores de Leitura:** Rastreio visual (lida/não lida).
- **Integração de Notificações:** Emissão de notificações globais, que disparam o painel (sino no topo) e o pop-up no canto da tela (quando não está no Não Perturbe).

## 3. Rede de Amigos e Relacionamentos
- **Solicitações de Amizade:** Aba de "Solicitações" para buscar usuários, enviar, aceitar ou rejeitar pedidos.
- **Listagem Otimizada:** Aba "Amigos" divide entre os que estão "Online" e "Todos".
- **Sistema de Bloqueios:**
  - Aba separada de "Bloqueados" para o usuário gerenciar quem ele não quer contato.
  - **Bloqueio no Chat:** Interface proíbe o envio de mensagens para usuários bloqueados (o campo de input vira "Não é possível enviar mensagem para este usuário").
  - **Segurança de Banco:** Triggers e regras de negócio impedem a inserção forçada de mensagens para alguém bloqueado.

## 4. Autenticação e Onboarding
- **Login / Register:** Base de autenticação sólida (Supabase Auth).
- **Setup de Perfil (Onboarding Wizard):** 
  - Fluxo estruturado (Basic Info, Hobbies, Games).
  - Componentização visual refinada.
  - Upload real de foto de perfil (Avatar).

## 5. Estrutura Base e Engenharia
- **Monorepo / Workspace:** Arquitetura usando Turborepo (dividido entre web, ui e desktop).
- **Desktop (Electron):** 
  - Estrutura pronta rodando encapsulada (`npm run start` do desktop rodando as views web compiladas).
  - Script para exportação rápida de executáveis portáveis para Windows (`npm run build:portable`).
- **Design System:** Paleta rica com base escura, accents cianos e verdes, botões refinados, inputs em Glassmorphism, Popovers suaves e microinterações com a biblioteca `lucide-react`.

---

> [!TIP]
> **Próximos Passos Potenciais**
> Vendo que o escopo de Onboarding e DMs já estão maduros, os caminhos naturais para a evolução do produto agora são:
> 
> 1. **Servidores (Comunidades):** Começar a criar a interface de criação de "Servidores", Categorias e Salas (Texto e Voz) — que é a essência do "Discord" mas com o toque Alura.
> 2. **Social Feed (Mural de Postagens):** Implementar a aba "Início", onde amigos ou a plataforma podem realizar postagens públicas e o usuário curte/comenta.
> 3. **Salas de Áudio / Vídeo (WebRTC):** Iniciar a infraestrutura P2P ou via servidor para as calls em tempo real.
