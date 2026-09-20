# Prompt para o Antigravity — Corrigir imagens que se parecem com o Discord

Copie e cole o bloco abaixo no Antigravity.

---

## PROBLEMA

O site institucional da Alura está atualmente usando imagens/mockups/ilustrações que se parecem visualmente com o Discord (paleta, formas, estilo de ícone, composição de tela). Isso precisa ser corrigido: **nenhuma imagem do site pode remeter ao Discord**. Toda imagem usada para ilustrar as features deve vir da **nossa própria interface (UI) real do produto Alura**.

## O QUE VOCÊ DEVE FAZER

1. **Analisar o projeto atual** (código-fonte do app Alura, não só do site institucional): varra os componentes de UI já existentes (telas de chat, sidebar de servidores/canais, perfil, tema dark + verde neon) para entender exatamente como a interface real do produto se parece hoje.
2. **Fazer um inventário de telas/componentes reais** que podem virar screenshot ou mockup para o site institucional, por exemplo:
   - Tela de chat/canal com mensagens
   - Sidebar de servidores e lista de canais
   - Modal ou painel de perfil (avatar, banner, status, hobbies)
   - Tela de configurações ou tema
   - Qualquer preview de voz/vídeo já existente (mesmo como protótipo)
3. **Gerar/capturar essas telas reais** (via storybook, build local, ou renderização dos componentes existentes) para usar como imagem nas seções do site, no lugar de qualquer ilustração genérica ou inspirada no Discord.
4. **Revisar cada seção do site institucional** e substituir qualquer imagem, ícone, mockup ou vídeo que:
   - tenha paleta roxa/azulada típica do Discord;
   - use o mascote Wumpus ou qualquer forma parecida;
   - copie o layout de sidebar/ícones circulares de servidor no estilo Discord;
   - seja um asset genérico de banco de imagens não relacionado à Alura.
5. Sempre que precisar preencher um espaço visual, priorize nesta ordem:
   - Screenshot real de um componente/tela do produto Alura já implementado.
   - Um novo mockup fiel ao design system da Alura (dark `#0B0D0F`/`#111318` + verde neon `#39FF88`–`#00FF7F`, tipografia definida no projeto), criado do zero, sem qualquer referência visual ao Discord.
   - Nunca usar ou adaptar imagens/assets vindos do discord.com.

## VALIDAÇÃO OBRIGATÓRIA — SKILL SUPERAGENT

Depois de trocar as imagens, acione a skill `superagent` para:
- Auditar visualmente cada seção do site e confirmar que nenhuma imagem, ícone ou cor remete ao Discord;
- Confirmar que todas as imagens usadas correspondem à UI real (ou ao design system real) da Alura, e não a mockups genéricos;
- Gerar um relatório listando quais imagens foram trocadas, de onde vieram (componente/tela de origem) e o motivo da substituição.

Não finalize a entrega sem esse relatório da skill `superagent`.

## ENTREGÁVEL ESPERADO

Site institucional com todas as imagens/mockups substituídos por referências reais (ou fielmente derivadas) da UI da Alura, sem qualquer semelhança com o Discord, acompanhado do relatório de auditoria da skill `superagent`.
