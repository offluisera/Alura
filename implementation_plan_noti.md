# Implementação de Notificações Customizadas no Electron

Para que a notificação fora do aplicativo seja visualmente **idêntica** à notificação de dentro do app (fundo escuro, bordas, ícones, bolinha verde), não podemos usar as notificações nativas padrão do Windows. Em vez disso, precisamos orquestrar janelas flutuantes invisíveis (*frameless windows*) através do Electron, técnica utilizada por aplicativos como Discord e Slack.

## User Review Required
> [!IMPORTANT]
> - O novo sistema criará pequenas janelas do Electron no canto inferior direito da tela. 
> - Estas janelas flutuarão acima de todas as outras (`alwaysOnTop`).
> - Você concorda com essa arquitetura?

## Proposed Changes

---

### Desktop App (`apps/desktop/main.js`)
#### [MODIFY] [main.js](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/desktop/main.js)
- Importar `ipcMain` e `screen`.
- Criar um gerenciador de array de janelas de notificação (para empilhar múltiplas notificações caso cheguem juntas).
- Ouvir o evento `show-custom-notification` via IPC.
- Ao receber o evento, spawnar um novo `BrowserWindow` com `frame: false, transparent: true, alwaysOnTop: true, skipTaskbar: true`.
- Passar os dados da mensagem (username, avatar, texto, hora) via IPC para essa nova janela assim que ela carregar.
- Fechar a janela e reposicionar as outras após 5 segundos, ou se o usuário clicar nela (encaminhando o foco para a janela principal).

### Desktop App UI (`apps/desktop/notification.html`)
#### [NEW] [notification.html](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/desktop/notification.html)
- Arquivo HTML estático exclusivo para o Electron renderizar o balão flutuante.
- Inclusão do CSS inline ou via style tag que replica **exatamente** o Anexo 1 (fundo `#00100C`, fonte Inter, avatar, ícone verde de status).
- Script JS interno que recebe os dados de `ipcRenderer.on('notification-data', ...)` e preenche o HTML.
- Botão "X" funcional e clique no corpo para abrir o app principal.

### Web App (`apps/web/src/contexts/NotificationContext.tsx`)
#### [MODIFY] [NotificationContext.tsx](file:///c:/xampp/htdocs/AluraProjects/Alura/apps/web/src/contexts/NotificationContext.tsx)
- No `notifyMessage`, verificar se `window.require('electron')` está disponível (ou seja, se estamos rodando no Desktop App).
- Se estiver no desktop, disparar `ipcRenderer.send('show-custom-notification', {...dados})` ao invés de usar `new Notification(...)`.
- O app web puro (via Browser) continuará usando o fallback da notificação nativa HTML5, mas o app desktop terá a janela super customizada.

## Verification Plan

### Manual Verification
1. Compilar o frontend web (`npm run build`).
2. Abrir o Electron em modo dev (`npm start` na pasta desktop) para validar a posição e estética da janela popup.
3. Garantir que as janelas se empilham corretamente.
4. Compilar o portable final.
