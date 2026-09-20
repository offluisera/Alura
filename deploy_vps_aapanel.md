# Hospedagem da Alura em VPS de 4GB com aaPanel

Sim, **com uma VPS Linux de 4GB de RAM e o aaPanel você consegue rodar a aplicação perfeitamente** na fase inicial e até escalar para centenas de usuários ativos. Como a arquitetura da Alura foi desenhada de forma moderna, a carga de processamento é bem distribuída.

Abaixo, detalho como essa infraestrutura se comporta hoje e como ela deve ser preparada para receber as **chamadas de voz, vídeo e tela** no futuro.

---

## 1. O que vai rodar na VPS hoje?

Atualmente, o peso maior da aplicação (Banco de Dados, Autenticação, Storage de Imagens e Mensagens em Tempo Real) está sendo gerenciado pelo **Supabase**. Isso é uma excelente notícia para a sua VPS, pois ela ficará livre de quase todo o processamento pesado.

Com o aaPanel, você precisará hospedar apenas:
- **Frontend Web (React/Vite)**: São apenas arquivos estáticos (HTML, JS, CSS). O Nginx/Apache do aaPanel consome pouquíssima memória (menos de 50MB) para servir esses arquivos.
- **Servidor de Downloads (Desktop App)**: Uma página simples para os usuários baixarem o instalador (`.exe` do Electron) que criamos hoje.

**Consumo estimado atual**: ~600MB de RAM (incluindo os serviços internos do aaPanel e o sistema operacional). Sobram mais de 3GB de RAM livres!

---

## 2. Como preparar o aaPanel para a Aplicação Web?

No seu aaPanel, o processo de deploy do frontend é extremamente simples:

1. Acesse o **Website** > **Add site** no aaPanel.
2. Coloque seu domínio (ex: `app.alura.net.br` ou `alura.net.br`).
3. Crie um banco de dados apenas se for hospedar um backend próprio (hoje não é necessário por causa do Supabase).
4. Aplique o certificado SSL (Let's Encrypt) pelo próprio painel em 1 clique.
5. Na sua máquina local, rode `npm run build` na pasta `apps/web`.
6. Pegue todos os arquivos gerados dentro da pasta `dist` e faça o upload para a pasta raiz do site no aaPanel (via File Manager ou FTP).
7. **Importante**: No Nginx do aaPanel, adicione uma regra de redirecionamento para o React Router (para que links diretos não deem erro 404):
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```

---

## 3. O Futuro: Chamadas de Voz, Vídeo e Compartilhamento de Tela

Para implementar voz e vídeo, usaremos uma tecnologia chamada **WebRTC** (Web Real-Time Communication). O WebRTC permite comunicação "Ponto a Ponto" (Peer-to-Peer), ou seja, o vídeo vai direto do computador do Usuário A para o Usuário B.

No entanto, para que o Usuário A ache o Usuário B na internet, a sua VPS precisará rodar um **Servidor de Sinalização (Signaling Server)**. 

### Opções para rodar na sua VPS de 4GB:

#### Opção A: LiveKit (Recomendado)
O [LiveKit](https://livekit.io/) é um servidor open-source moderno e extremamente otimizado (escrito em Go) para WebRTC.
- **Consumo**: Ele roda muito bem em 4GB de RAM para turmas/salas pequenas e médias (até umas 50~100 pessoas em vídeo simultâneo).
- **Como instalar**: Pode ser instalado via Docker pelo próprio aaPanel.
- **Prós**: Resolve automaticamente a queda de qualidade de internet, tem SDKs prontos para React e facilita muito a criação da interface (parece mágica colocar o vídeo para funcionar com eles).

#### Opção B: Servidor Próprio com Node.js + Socket.io / PeerJS
Você pode criar um servidorzinho em Node.js (hospedado no aaPanel via PM2 Manager).
- **Como funciona**: Ele servirá apenas para trocar os IPs e chaves de segurança entre os usuários. Depois que os usuários se conectam, o vídeo flui direto entre eles sem pesar na VPS (arquitetura pura de P2P - Peer to Peer).
- **Prós**: O consumo na VPS é quase zero, já que o tráfego de vídeo não passa pelo seu servidor.
- **Contras**: Se uma sala de voz/vídeo tiver muitas pessoas (ex: 10 pessoas na mesma sala), o P2P puro começa a travar os computadores dos usuários.

### O Compartilhamento de Tela
O compartilhamento de tela nada mais é do que uma "câmera virtual" capturando o desktop. Se a infraestrutura de vídeo estiver montada com WebRTC, adicionar o botão de compartilhar tela exige literalmente invocar a API nativa do navegador (`navigator.mediaDevices.getDisplayMedia()`) e jogar esse "vídeo" no túnel já aberto.

---

## Resumo e Veredito

Sua VPS de 4GB está **mais do que aprovada**. 

**Próximos passos de infraestrutura quando formos colocar o Vídeo/Voz em prática:**
1. Instalar o Docker no aaPanel (via App Store do painel).
2. Subir um container do **LiveKit Server** ou criar o **Signaling de Node.js**.
3. Adicionar um proxy reverso no Nginx apontando para a porta do WebRTC.
4. Integrar o SDK no nosso código React na aba `/channels` (que é justamente o nosso próximo passo no Backlog).
