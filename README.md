# Agenda Privada

Agenda pessoal segura para organizar **clientes**, **consultas médicas**, **exames** e **compromissos pessoais**.

Stack obrigatória:

- **Next.js** (App Router) + **TypeScript** + **Tailwind CSS** + **shadcn/ui**
- **Firebase Authentication** (e-mail e senha)
- **Cloud Firestore** (banco NoSQL)
- **Firebase Security Rules**
- **Firebase Admin SDK** apenas no servidor
- **Lucide React**
- Hospedagem sugerida: **Vercel**

> Não há Supabase neste projeto. Toda autenticação e persistência usam Firebase.

---

## 1. Criar o projeto no Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com/).
2. **Add project** → escolha um nome (ex.: `agenda-privada`).
3. Desative Analytics se não for usar (opcional).
4. Aguarde a criação do projeto.

## 2. Registrar a aplicação web

1. No projeto, clique no ícone **Web** (`</>`).
2. Apelido: `agenda-web`.
3. Não é obrigatório ativar Firebase Hosting (usaremos a Vercel).
4. Copie o objeto `firebaseConfig` (apiKey, authDomain, projectId, etc.).

## 3. Ativar Authentication (e-mail e senha)

1. Menu **Build → Authentication → Get started**.
2. Aba **Sign-in method**.
3. Ative **Email/Password** (primeiro provedor, sem link mágico necessariamente).
4. Salve.

**Não habilite cadastro público na aplicação.** O app só oferece login e recuperação de senha. Contas novas são criadas manualmente no Console.

## 4. Criar o Cloud Firestore

1. **Build → Firestore Database → Create database**.
2. Escolha modo de produção (as regras restritivas serão publicadas em seguida).
3. Localização sugerida: `southamerica-east1` (São Paulo).
4. Confirme.

## 5. Configurar as regras de segurança

1. Abra `firestore.rules` neste repositório.
2. Substitua `AUTHORIZED_UID_AQUI` pelo UID real da proprietária (passo 7).
3. Publique:

```bash
npm install -g firebase-tools
firebase login
firebase use <seu-project-id>
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### Testar as regras

- Console → Firestore → **Rules** → **Rules Playground**
  - Simule `get/list/create` em `users/{uid}/appointments` com e sem auth.
  - Com UID diferente do autorizado: deve **negar**.
  - Sem autenticação: deve **negar**.
- Nunca use `allow read, write: if true`.

## 6. Criar a conta inicial da proprietária

1. Authentication → **Users** → **Add user**.
2. Informe o e-mail e uma senha forte da sua esposa.
3. Clique em **Add user**.
4. Copie o **User UID** gerado.

Não existe tela de cadastro no app de propósito.

## 7. Autorizar o UID

Você precisa autorizar o mesmo UID em **três lugares**:

1. **Variável de ambiente do frontend**  
   `NEXT_PUBLIC_AUTHORIZED_UID=<UID>`

2. **Variável de ambiente do servidor** (Admin SDK / API)  
   `AUTHORIZED_UID=<UID>`

3. **Firestore Rules**  
   Em `firestore.rules`, troque `AUTHORIZED_UID_AQUI` pelo UID e publique novamente.

Qualquer outra conta autenticada no Firebase será rejeitada no login e bloqueada nas rules.

## 8. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha:

| Variável | Onde obter |
|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | Project settings → Your apps → Web config |
| `NEXT_PUBLIC_AUTHORIZED_UID` | Authentication → Users → UID |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Project settings → Cloud Messaging → Web Push certificates |
| `FIREBASE_ADMIN_PROJECT_ID` | Service account JSON (`project_id`) |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Service account JSON (`client_email`) |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Service account JSON (`private_key`), com `\n` escapados |
| `AUTHORIZED_UID` | Mesmo UID da proprietária |

### Credenciais Admin (somente servidor)

1. Project settings → **Service accounts**.
2. **Generate new private key**.
3. Use os campos no `.env.local` / Vercel Environment Variables.
4. **Nunca** commit o JSON nem exponha `FIREBASE_ADMIN_*` com prefixo `NEXT_PUBLIC_`.

## 9. Executar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000), faça login com o e-mail/senha criados no Console.

Scripts úteis:

```bash
npm run lint
npm run build
```

## 10. Publicar na Vercel

1. Envie o repositório para o GitHub (sem `.env.local`).
2. Importe o projeto na [Vercel](https://vercel.com/).
3. Em **Settings → Environment Variables**, configure todas as variáveis do `.env.example`.
4. Deploy.
5. Em Authentication → Settings → **Authorized domains**, adicione o domínio da Vercel.

---

## Estrutura de dados (Firestore)

```
users/{uid}
  displayName, email, createdAt, preferences

users/{uid}/appointments/{appointmentId}
  title, category, date, startTime, endTime,
  clientId, contactName, phone, address, description,
  reminderMinutes, status, recurrence, createdAt, updatedAt

users/{uid}/clients/{clientId}
  name, phone, notes, createdAt, updatedAt

users/{uid}/notifications/{notificationId}
  appointmentId, title, scheduledAt, status, createdAt

users/{uid}/fcmTokens/{tokenId}
  token, createdAt, updatedAt, userAgent
```

Categorias de compromisso:

- `cliente`
- `consulta_medica`
- `exame_medico`
- `compromisso_pessoal`
- `outros`

Datas (`YYYY-MM-DD`) e horários (`HH:mm`) são tratados no fuso **America/Sao_Paulo**.

---

## Funcionalidades

- Dashboard do dia
- Calendário diário / semanal / mensal
- CRUD de compromissos com alerta de conflito de horário
- Clientes + histórico
- Área de saúde (consultas e exames)
- Pesquisa e filtros por período/categoria/status
- Exportação CSV e ICS
- Configurações pessoais
- Login, logout e recuperação de senha
- Gate de rotas no frontend **e** regras no Firestore

---

## Notificações push (site fechado)

O campo `reminderMinutes` **não envia** notificação sozinho. Ele apenas grava um documento em `notifications` com `scheduledAt`.

### Arquitetura real

1. Ao salvar um compromisso com lembrete, o app cria/atualiza `users/{uid}/notifications`.
2. Na página **Lembretes**, a usuária ativa o push do navegador (permissão + token FCM).
3. A Cloud Function `dispatchReminders` (`functions/`) roda a cada minuto, lê lembretes `pending` com `scheduledAt <= now` e envia FCM via Admin SDK.
4. Alternativa HTTP (manual/cron externo): `POST /api/reminders/dispatch` com `Authorization: Bearer <ID_TOKEN>` — também valida o UID autorizado.

### Requisitos

- **Plano Blaze** do Firebase (Functions agendadas).
- Cloud Messaging habilitado + **Web Push certificate (VAPID)**.
- Permissão de notificação concedida no navegador.
- HTTPS (Vercel já fornece).
- Service Worker em `/firebase-messaging-sw.js`.

### Deploy das Functions

```bash
cd functions
npm install
npm run build
cd ..
# Defina AUTHORIZED_UID no ambiente da Function
firebase functions:config:set agenda.authorized_uid="SEU_UID"
# ou use secrets / variáveis do Functions v2
firebase deploy --only functions
```

Configure `AUTHORIZED_UID` no ambiente da Function (Console → Functions → Environment variables) para que o Admin SDK só processe a agenda da proprietária. **As Firestore Rules não protegem código Admin** — a validação explícita do UID é obrigatória.

---

## Segurança — checklist

- [ ] Cadastro público desabilitado na UI
- [ ] Conta criada só no Console
- [ ] UID autorizado em env + rules
- [ ] Rules publicadas (sem `if true`)
- [ ] Admin credentials só no servidor
- [ ] Domínio da Vercel autorizado no Auth
- [ ] `.env.local` fora do Git

---

## Observação importante

Este repositório **não inclui credenciais reais**. O Firebase só estará operacional depois que você preencher `.env.local` (ou as variáveis na Vercel) e publicar as regras com o UID correto.
