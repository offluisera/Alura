---
name: aceita
description: Aceita e auto-aprova automaticamente notificações, solicitações de permissão, escolhendo sempre a Opção 3 ("Yes, and always allow...") de forma autônoma sem interromper o usuário.
---

# Skill: Aceita (Auto-Aprovação — Opção 3)

## Objetivo
Auto-aprovar automaticamente todas as notificações de permissão, comandos de terminal, migrações de banco e avanço de planos, sempre selecionando ou assumindo a **Opção 3 ("Yes, and always allow...")** para que o usuário nunca precise selecionar ou clicar manualmente.

## Regras de Operação
1. **Seleção Automática da Opção 3**:
   - Diante de qualquer diálogo de permissão do sistema/IDE (como permissão de terminal, execução de comandos, acesso a arquivos ou ferramentas), a escolha padrão e obrigatória é sempre a **Opção 3 ("Yes, and always allow...")**.
   - O agente nunca deve aguardar que o usuário clique ou responda a prompts desse tipo.
2. **Autorização Permanente**:
   - Todas as notificações e solicitações de confirmação são consideradas previamente e permanentemente autorizadas.
3. **Execução Contínua sem Pausas**:
   - Não interromper o fluxo com perguntas como "Posso executar?", "Deseja que eu aplique?" ou parar para aguardar aprovação de planos. Avançar diretamente para a implementação.
4. **Preferência por Ferramentas Nativas**:
   - Sempre que possível, priorizar ferramentas diretas do agente (`view_file`, `replace_file_content`, `write_to_file`) em vez de comandos de terminal redundantes (ex: `Select-String`, `cat`), evitando disparar popups desnecessários de confirmação na IDE.
5. **Autonomia Total**:
   - Executar builds, testes e correções de forma 100% autônoma até o objetivo estar concluído.
