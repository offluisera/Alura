# ALURA — CONFIGURAÇÃO ATUAL DO VPS

## Servidor
- Ubuntu 24.04.5 LTS
- LuraHosting VPS Starter
- 2 vCore / 4 GB RAM / 50 GB NVMe
- IPv4: `193.202.85.89`
- Gateway: `193.202.85.1`
- Máscara: `255.255.255.0`
- DNS: `1.1.1.1` / `8.8.8.8`
- Datacenter: São Paulo
- Porta: 1 Gbps
- DDoS informado: até 7 Tbps
- Sem backup automático; 3 snapshots

## Domínio e DNS
Domínio: `alura.net.br`

Subdomínios:
- `api.alura.net.br`
- `ws.alura.net.br`
- `mail.alura.net.br`

DNS gerenciado pela Cloudflare. `mail.alura.net.br` aponta para `193.202.85.89`.

### PTR
Planejado: `193.202.85.89 → mail.alura.net.br`

Verificar:
```bash
dig -x 193.202.85.89 +short
```
Status: **pendente de confirmação pelo provedor**.

## aaPanel
Instalado:
- Nginx
- Mail Server

Não instalados:
- PHP
- Apache
- OpenLiteSpeed
- MySQL/MariaDB
- phpMyAdmin
- Pure-FTPd
- DNS Server

Portas do aaPanel: `888/tcp` e `30339/tcp`.

## Nginx
- `80/tcp` ativa
- `443/tcp` disponível para HTTPS

Arquitetura:
```text
Cloudflare → Nginx → Phoenix
                 ├→ api.alura.net.br
                 └→ ws.alura.net.br
```

Phoenix não deve ser exposto diretamente à Internet.

## E-mail
Contas planejadas:
- `contato@alura.net.br`
- `suporte@alura.net.br`
- `seguranca@alura.net.br`
- `postmaster@alura.net.br`
- `no-reply@alura.net.br`

Portas liberadas:
`25`, `110`, `143`, `465`, `587`, `993`, `995/tcp`.

Após validação, revisar a necessidade de `110` e `143`.

## Firewall — UFW
```text
22/tcp
80/tcp
443/tcp
888/tcp
30339/tcp
25/tcp
110/tcp
143/tcp
465/tcp
587/tcp
993/tcp
995/tcp
```

TURN/WebRTC ainda não possui portas abertas.

> Docker pode publicar portas diretamente via iptables. Evitar publicar serviços internos desnecessariamente.

## Swap
Swap de 2 GB configurado:
```text
/swapfile
```

`vm.swappiness=10` em:
```text
/etc/sysctl.d/99-alura-memory.conf
```

## Docker
- Docker Engine `29.8.1`
- Docker Compose `5.5.1`
- containerd e runc instalados
- Docker real validado com `hello-world`

Daemon em `/etc/docker/daemon.json`:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "live-restore": true
}
```

## Rede Docker
Rede criada:
```text
alura-net
```
Tipo: `bridge`.

Comando:
```bash
docker network create --driver bridge alura-net
```

## Estrutura
```text
/opt/alura/
├── docker/
├── nginx/
├── phoenix/
├── web/
├── workers/
└── logs/
```

## Docker Compose
Base atual em `/opt/alura/docker-compose.yml`:
```yaml
services: {}

networks:
  alura-net:
    external: true
```

O Phoenix ainda não foi deployado. Não existe container placeholder.

## Backend Phoenix
`/opt/alura/phoenix` ainda está vazio.

O backend deve ser desenvolvido primeiro localmente com Antigravity e depois enviado ao VPS.

Stack:
- Elixir
- Phoenix
- Ecto
- Phoenix Channels
- Phoenix Presence
- WebSockets
- Supabase/PostgreSQL
- WebRTC para mídia
- Docker

Responsabilidades principais:
- API
- autenticação/autorização
- realtime
- Channels/Presence
- mensagens
- amizades
- comunidades/servidores
- espaços/salas
- permissões
- notificações
- eventos
- sinalização WebRTC
- regras de negócio
- observabilidade

## Supabase
Supabase é o serviço de banco/dados da Alura.

O VPS não precisa hospedar PostgreSQL/MariaDB localmente na arquitetura atual.

Credenciais devem ser fornecidas por variáveis de ambiente; nunca no código.

## WebRTC
```text
Alura Client
   ├── WebSocket/Phoenix → sinalização
   └── WebRTC → áudio/vídeo/tela
```

Phoenix controla salas, presença, permissões, signaling e eventos; mídia não deve passar integralmente pelo Phoenix.

STUN/TURN serão adicionados quando necessário.

## Arquitetura
```text
                    INTERNET
                       │
                   CLOUDFLARE
                       │
                     NGINX
                       │
                   alura-net
                       │
                    PHOENIX
                  /          \
             SUPABASE      Serviços
```

## Stack oficial
### Frontend
React, TypeScript, Vite, Electron

### Backend
Elixir, Phoenix, Ecto

### Dados
Supabase

### IA/ML
Python

### Alta performance
Rust

### Mídia específica
C++

### Realtime
Phoenix Channels, WebSockets, Phoenix Presence

### Mídia
WebRTC

### Infraestrutura
Ubuntu, Docker, Docker Compose, Nginx, Cloudflare, aaPanel

## Próximas etapas
1. Criar Phoenix localmente.
2. Aplicar `ANTIGRAVITY-RULES.md`.
3. Usar `ALURA-PHOENIX-BACKEND-ANTIGRAVITY.md`.
4. Implementar os primeiros domínios.
5. Integrar Supabase.
6. Criar testes.
7. Criar Dockerfile de produção.
8. Validar build local.
9. Enviar para o VPS.
10. Criar Compose real.
11. Conectar à `alura-net`.
12. Configurar Nginx.
13. Configurar `api.alura.net.br` e `ws.alura.net.br`.
14. Configurar HTTPS/Cloudflare.
15. Adicionar health checks e observabilidade.
16. Implementar WebRTC.
17. Adicionar TURN/STUN quando necessário.

## Regra de deploy
```text
Desenvolvimento local
        ↓
Antigravity
        ↓
Phoenix real
        ↓
Testes
        ↓
Docker build
        ↓
Deploy
        ↓
VPS
        ↓
Nginx
        ↓
Cloudflare
```

Não criar Phoenix fictício ou container placeholder no VPS.

## Checklist
### Servidor
- [x] Ubuntu
- [x] VPS
- [x] IPv4
- [x] aaPanel
- [x] Nginx
- [x] Mail Server
- [x] UFW
- [x] Swap
- [x] Docker
- [x] Docker Compose
- [x] `alura-net`

### DNS
- [x] `alura.net.br`
- [x] `api.alura.net.br`
- [x] `ws.alura.net.br`
- [x] `mail.alura.net.br`
- [ ] PTR/reverse DNS confirmado

### Backend
- [ ] Phoenix
- [ ] Supabase
- [ ] API
- [ ] Channels
- [ ] Presence
- [ ] Autenticação
- [ ] Autorização
- [ ] Mensagens
- [ ] Amizades
- [ ] Comunidades
- [ ] WebRTC signaling
- [ ] Dockerfile de produção

### Proxy
- [ ] Nginx API
- [ ] Nginx WebSocket
- [ ] HTTPS
- [ ] Health check

### Comunicação
- [ ] STUN
- [ ] TURN
- [ ] Voz
- [ ] Vídeo
- [ ] Compartilhamento de tela

---

**Status:** infraestrutura base do VPS preparada. Próximo grande componente: desenvolver o backend Phoenix localmente antes do deploy.
