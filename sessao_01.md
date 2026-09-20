# Sessão 01 - Refatoração do Onboarding (Alura)

## Resumo do Chat
Iniciamos esta sessão com o objetivo de recriar e aperfeiçoar o fluxo de **Onboarding** da aplicação Alura, um projeto inspirado em plataformas como Discord, porém com uma direção de arte **muito mais premium e sombria** (Paleta V2, focada em tons de verde e preto profundo).

O usuário forneceu capturas de tela conceituais de extrema qualidade e exigiu que as interfaces em código batessem de forma **pixel-perfect** com as referências, ressaltando:
> *"A Alura é escura por natureza e verde quando está viva."*
> *"NÃO modernize. NÃO simplifique. NÃO altere a estrutura. Preserve proporções."*

Atuamos como um *Design Systems Engineer* / *Art Director*, aplicando rigorosamente as regras do arquivo `regras.md` e a skill global `SuperAgente`.

## O que fizemos
1. **Reestruturação Geral (Layout & UX):**
   - Corrigimos o contêiner central (`OnboardingWizard.tsx`) para emoldurar corretamente as etapas, adicionando sidebars com navegação em passos (1 a 6) e um gradiente de fundo texturizado e cinemático.
   - Reordenamos o fluxo do Onboarding para uma ordem mais coerente (1. Informações Básicas, 2. Jogos, 3. Hobbies, 4. Perfil, 5. Mensagem, 6. Finalização).

2. **Step: Informações Básicas (Pixel-Perfect):**
   - Recriamos o formulário em grid duplo (2 colunas) em fundo `#001A14`.
   - Adicionamos validação e máscaras automáticas nos inputs: Telefone `(xx) xxxxx-xxxx`, Data de nascimento `dd/mm/yyyy` (com auto-cálculo de idade).
   - Validação da restrição etária (idade mínima de 14 anos).
   - Inclusão do `<select>` de idiomas preferidos e tipografia redimensionada e legível.

3. **Step: Perfil (Pixel-Perfect & Modal):**
   - Quebramos o layout em dois painéis: **Formulário de Configuração** à esquerda (70%) e **Prévia do Perfil** flutuante à direita (30%).
   - Implementamos a funcionalidade real de upload de avatar, conectando o `URL.createObjectURL` com o card da direita.
   - Criamos o modal interativo `Adicionar Jogos` diretamente sobre a etapa de perfil, puxando itens reais do banco de dados simulado (`GAMES_DB`).
   - A prévia agora resgata dados autênticos: Username gerado a partir do nome real, contagem exata de Hobbies e Jogos selecionados, e tags atualizadas dinamicamente (`Programador`, `Gamer`, `Sempre aprendendo`).

4. **Compilações e Deploy Local:**
   - Realizamos diversos builds sequenciais utilizando `npm run build` (vite) e empacotamos o binário do Windows com `npm run build:portable` (electron-packager) sem parar, driblando erros de "EBUSY" quando o aplicativo estava sendo testado em paralelo.


## Próximos Passos
- **Upload Avançado:** Suporte para arquivos `.gif` e vídeos (até 10mb) na etapa de personalização, além da inclusão de uploads de `.pdf`, `.rar` e `.doc` pelo chat principal.
- **Integração de Emojis:** Componente real de Emojis dentro das etapas.
- **Passos Finais do Onboarding:** Construção pixel-perfect das etapas "Mensagem" e "Finalização".
- **Realtime Back-end:** Conectar este fluxo lindíssimo ao Elixir/Supabase (quando a UI estiver 100% lapidada).

### Amigos
- Refinar sistema de amigos (ajustar botão de solicitação para aceitar, remover, etc).
- Criar lista de amigos.
- Criar sistema de chat privado entre amigos em tempo real.
- arquitetar como os status de aceitar/remover vão se comportar e criar as viewS

### Perfil
- Criar página/modal de perfil.
- Ajustar para puxar as informações de registro salvas no Supabase.
- Ajustar funcionalidade de fotos no perfil.

### Dashboard / Feed
- Colocar funcionalidades para ocultar publicação e bloquear usuário.

### Funções Globais
- Criar função central de bloquear usuário.
