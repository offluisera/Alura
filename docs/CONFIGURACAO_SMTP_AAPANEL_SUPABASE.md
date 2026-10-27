# Configuração do SMTP da Alura: aaPanel Mail Server + Supabase

Guia prático para configurar o envio de e-mails transacionais (confirmação de conta, recuperação de senha e código OTP) usando a conta **`no-reply@alura.net.br`** no **Mail Server do aaPanel** conectado ao **Supabase**.

---

## 1. Passo a Passo no aaPanel (Mail Server)

### 1.1 Criar o Domínio e a Conta
1. No painel do **aaPanel**, acesse a aba **App Store** e abra o **Mail Server** (ou **Linux Mail Server**).
2. Na aba **Domain list**, clique em **Add domain**:
   * **Domain name**: `alura.net.br`
   * **A record**: `mail.alura.net.br` (apontando para o IP da sua VPS)
3. Na aba **User list**, clique em **Add user**:
   * **User**: `no-reply`
   * **Domain**: `alura.net.br` (o endereço final será `no-reply@alura.net.br`)
   * **Password**: Defina uma senha forte (guarde esta senha para usar no Supabase)

### 1.2 Ativar Certificado SSL
1. Ainda na aba **Domain list** do Mail Server, clique no botão **SSL** ao lado de `alura.net.br`.
2. Emita o certificado Let's Encrypt para `mail.alura.net.br`. Isso garante criptografia segura nas portas **465 (SSL/TLS)** e **587 (STARTTLS)**.

---

## 2. Configuração de DNS (Evitar Caixa de Spam)

No seu gerenciador de DNS (ex: Cloudflare ou Registro.br), adicione os seguintes apontamentos com a nuvem **cinza (DNS Only / Desativada)**:

| Tipo | Nome / Host | Conteúdo / Valor | Prioridade | Observação |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `mail` | `IP_DA_SUA_VPS` | — | IP público da VPS |
| **MX** | `@` | `mail.alura.net.br` | `10` | Servidor de e-mail |
| **TXT** | `@` | `v=spf1 a mx ip4:IP_DA_SUA_VPS ~all` | — | Autorização SPF |
| **TXT** | `default._domainkey` | `(Copie a chave DKIM gerada no aaPanel)` | — | Chave de assinatura DKIM |
| **TXT** | `_dmarc` | `v=DMARC1; p=none; rua=mailto:no-reply@alura.net.br` | — | Política DMARC |

> **Dica de Portas no Firewall**: Certifique-se de que as portas **25**, **465** e **587** estejam liberadas no firewall do aaPanel e no provedor da VPS.

---

## 3. Configuração no Painel do Supabase

Acesse o painel do Supabase em [supabase.com/dashboard](https://supabase.com/dashboard):

1. Vá em **Project Settings** > **Authentication** (ou menu lateral **Authentication** > **Providers** / **Email**).
2. Role até a seção **SMTP Settings** (ou **Custom SMTP**):
3. Ative a chave **Enable Custom SMTP**: `ON`
4. Preencha os campos exatamente assim:

| Campo | Valor a preencher |
| :--- | :--- |
| **Sender Email** | `no-reply@alura.net.br` |
| **Sender Name** | `Alura` |
| **Host** | `mail.alura.net.br` (ou o IP da sua VPS) |
| **Port** | `465` (ou `587`) |
| **Encryption** | `SSL/TLS` (porta 465) ou `STARTTLS` (porta 587) |
| **Username** | `no-reply@alura.net.br` |
| **Password** | *(A senha que você cadastrou para o usuário no aaPanel)* |

5. Clique em **Save** no rodapé.
6. **Como testar:** O Supabase não possui botão direto de "Send test email". Para testar:
   * Vá em **Authentication** > **Users** no Supabase.
   * Clique em **Add user** > **Invite user**.
   * Insira seu e-mail pessoal e envie o convite.
   * Se o SMTP estiver correto, o e-mail chegará em instantes. Se houver erro de senha ou porta, o Supabase exibirá o aviso vermelho com o erro exato na tela.

---

## 4. Template de E-mail com a Identidade Visual Alura

Para aplicar o design com o tema Forest Dark da Alura aos e-mails automáticos:

1. No Supabase, vá em **Authentication** > **Email Templates**.
2. No template desejado (ex: **Confirm signup**, **Reset password** ou **Magic Link**):
3. Cole o código HTML personalizado disponível em [`docs/smtp.html`](file:///c:/xampp/htdocs/AluraProjects/Alura/docs/smtp.html).
4. Principais variáveis do Supabase para usar no HTML:
   * Confirmação / Link mágico: `{{ .ConfirmationURL }}`
   * Código de 6 dígitos OTP: `{{ .Token }}`
   * Nome do site: `{{ .SiteURL }}`
