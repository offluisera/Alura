# Próximos Passos (Roadmap Alura)

Analisando tudo o que construímos até aqui, concluímos com sucesso quase todas as pendências da `sessão03.md`. 
Temos um sistema de mensagens (DMs) sólido, um feed funcional com filtros avançados, presença em tempo real (Status) e gerenciamento de amigos (bloqueios, silenciar, etc).

Para não perdermos o foco e continuarmos evoluindo a arquitetura para o nível que o projeto exige (uma plataforma premium inspirada no Discord), aqui estão os 3 grandes caminhos que podemos seguir agora. **Qual você prefere priorizar?**

---

## Opção 1: O Coração da Plataforma — Servidores e Comunidades
Até agora fizemos a parte social "privada" (Amigos, Feed Pessoal e DMs). Mas a Alura precisa de Servidores.
- **Criação de Servidor:** Modal para criar um novo servidor, dar um nome e subir um ícone.
- **Estrutura do Servidor:** Cada servidor precisa ter **Categorias** e **Canais de Texto**.
- **Navegação (Sidebar Esquerda):** Uma nova barra lateral fina (como a do Discord) só com os ícones dos servidores em que você está.
- **Painel do Canal:** Onde as mensagens da comunidade rolam em tempo real (parecido com as DMs, mas para múltiplos usuários).

## [CONCLUÍDO] Opção 2: Refinamento de Perfil e Configurações (User Settings)
- **Modal/Página de Configurações:** 7 abas funcionais (Conta, Privacidade, Notificações, Aparência, Som e Voz com VU meter, Conexões e Avançado) com atalho ESC e salvamento direto no Supabase.
- **Upload de Banner & Avatar:** Suporte a presets temáticos Alura e uploads customizados para o bucket `avatars`.
- **Perfil Completo:** 4 abas ativas (Sobre, Jogos, Hobbies, Conquistas dinâmicas) e suporte a perfis de terceiros.
- **Onboarding 100% Sincronizado:** Banner salvo no perfil e mensagem de boas-vindas publicada no feed.

## Opção 3: Chamadas de Áudio e Vídeo (WebRTC) nas DMs
- **Infraestrutura de Mídia:** Começar a arquitetar a conexão P2P (ou via servidor SFU) para chamadas.
- **Interface de Call:** Criar a tela (overlay) que aparece quando você liga para um amigo na DM.
- **Controles Básicos:** Ligar/desligar microfone, ligar/desligar câmera.

---

> [!TIP]
> **Recomendação da IA:**
> A **Opção 1 (Servidores)** é o que vai transformar o projeto de fato em uma "Comunidade". Como já temos o motor de mensagens e de realtime funcionando perfeitamente para as DMs, criar os Servidores será um processo muito prazeroso e vai dar a "cara" real do produto. 

Qual dessas frentes te empolga mais para começarmos?
