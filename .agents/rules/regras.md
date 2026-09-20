---
trigger: always_on
---

ANTIGRAVITY — ALURA RULES

0. Autoridade

Este arquivo é obrigatório para qualquer agente, subagente, automação ou fluxo de desenvolvimento da Alura. Em caso de conflito, estas regras têm prioridade sobre preferências locais, improvisações e decisões de implementação.

1. Objetivo

Construir Alura, uma plataforma de comunidades e comunicação em tempo real inspirada em produtos como Discord, porém com identidade, arquitetura, UX e linguagem visual próprias.

A Alura NÃO deve ser desenvolvida como clone visual, estrutural ou comportamental do Discord.

2. Regra de não-desvio

Antes de criar, alterar ou remover qualquer parte relevante do sistema, o agente deve verificar:

ALURA-PROJECT-BASE.md

ALURA-SPECIFICATIONS.md

este arquivo

Não inventar arquitetura concorrente sem registrar a decisão e justificar o impacto.
Não substituir tecnologias definidas sem necessidade técnica comprovável.
Não introduzir dependências pesadas para resolver problemas simples.
Não criar telas isoladas sem integração com o domínio real.

3. Linguagens oficiais

Obrigatórias por camada

TypeScript: linguagem oficial do frontend web, desktop e contratos compartilhados de frontend.

Elixir: linguagem oficial do backend central, domínio, API e realtime.

Python: somente para serviços de IA/ML, processamento inteligente e pipelines de dados de IA.

Rust: somente para componentes de alto desempenho quando existir necessidade comprovada.

C++: somente para processamento especializado de mídia/áudio/vídeo quando WebRTC e bibliotecas existentes não forem suficientes.

Regra de precedência

O projeto começa com TypeScript + Elixir + PostgreSQL/Supabase.
Python, Rust e C++ são extensões especializadas, não linguagens para uso indiscriminado.
Não criar microserviços em outra linguagem.

4. Stack oficial inicial

Frontend: React + TypeScript.
Desktop: Electron + React.
Backend: Elixir + Phoenix.
Banco: PostgreSQL gerenciado pelo Supabase.
Auth/Storage: Supabase.
Realtime principal: Phoenix Channels/WebSockets.
Voz, vídeo e compartilhamento de tela: WebRTC.
Motion: Motion e padrões inspirados em Kinetics.
UI primitives: ReUI/shadcn quando apropriado.
Referências de UX/prompts: VibePrompts.

5. Design System

A identidade da Alura deve usar como base a paleta:
#001609 #001B0B #00220E #002A12 #003014 #003516 #003C19 #00421B #004B1F #005322

Criar e respeitar design tokens para cor, tipografia, espaçamento, radius, sombra, z-index, breakpoints e motion.

Não copiar componentes visualmente do Discord.
ReUI/shadcn são primitivas e referências técnicas; a aparência final pertence ao Alura Design System.
Motion deve ser funcional, consistente e respeitar prefers-reduced-motion.

6. Princípios de produto

Simplicidade para o usuário; complexidade encapsulada no sistema.

Realtime é parte central da arquitetura.

Servidores/comunidades são entidades de primeira classe.

Perfil global e perfil dentro do servidor são conceitos diferentes.

Segurança e permissões devem existir desde a fundação.

Eventos e auditoria devem permitir evolução futura.

A UX deve parecer um ambiente social vivo, não um dashboard SaaS e não um clone do Discord.

7. Arquitetura

Preferir arquitetura modular, orientada a domínio e eventos.
Separar frontend, backend, dados, mídia e IA.
Não colocar regra de negócio dentro do Electron.
Não usar o Supabase como substituto da lógica realtime central.
Não acoplar IA diretamente ao núcleo de mensagens.

8. Qualidade

Toda funcionalidade nova deve considerar:

segurança;

autenticação/autorização;

estados vazios/erro/loading;

acessibilidade;

responsividade;

performance;

observabilidade;

testes apropriados.

Não considerar uma feature concluída somente porque a tela aparece.

9. Skills e agentes

O agente deve utilizar as skills disponíveis no ambiente sempre que forem aplicáveis.
A Superagente é a skill/orquestrador prioritária para tarefas complexas: deve decompor o problema, delegar para especialistas quando disponível, validar resultados e manter aderência aos arquivos de regras.

Não contornar uma skill especializada disponível para realizar manualmente uma tarefa que ela cobre melhor.
Skills de UI/design, arquitetura, segurança, testes, dados, IA, performance e documentação devem ser acionadas quando pertinentes.

10. Processo de mudança

Para mudanças arquiteturais relevantes:

verificar as especificações;

identificar impacto;

manter compatibilidade com o desenho atual;

atualizar documentação antes ou junto da mudança;

implementar de forma incremental;

validar testes e integração.

11. Proibições

Não:

recriar o Discord visualmente;

adicionar frameworks sem necessidade;

mudar a linguagem oficial por conveniência;

espalhar Python/Rust/C++ pelo produto sem justificativa;

colocar secrets no código;

ignorar autorização do servidor;

armazenar credenciais em frontend;

usar dados falsos como solução permanente;

marcar como concluído algo não validado.

12. Regra final

Quando houver dúvida entre uma solução rápida e uma solução alinhada ao desenho da Alura, priorizar a solução alinhada ao desenho da Alura, desde que tecnicamente razoável.