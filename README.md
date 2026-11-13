# API Manager Application

A web app for storing and managing API keys, passwords and notes in one place. Each user can only ever see their own credentials.

**Personal project (Feb–Mar 2026).**

---

## Purpose

While working on projects I was collecting API keys in text files and notes, which is insecure and easy to lose. I wanted one place to store them, protected by a login, so that no user can read another user's data.

## Features

- **Sign-up and login** with Supabase Auth.
- **Add, edit and delete** credentials of three types: API key, password or note, with optional username, URL and description.
- **Hidden by default:** values are masked until you click the eye icon.
- **One-click copy** to the clipboard.
- **Search** across your saved credentials.

## Security design

| Control | How it works |
|---|---|
| **Authentication** | Every user has an account through Supabase Auth |
| **Row-level security (RLS)** | Enabled on the `credentials` table, with separate policies for **select, insert, update and delete** that only allow `auth.uid() = user_id`. Even if someone called the API directly, they couldn't read another user's rows. See [`supabase/migrations/`](supabase/migrations/) |
| **No secrets in the repo** | The Supabase URL and key are read from environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), and `.env` is git-ignored |
| **Masked values** | Secrets aren't shown on screen unless the user chooses to reveal them |

**Known limitation:** values are protected by access control but are **not encrypted** inside the database. The next improvement would be client-side encryption, so that even the database admin couldn't read stored keys.

## Technologies

React · TypeScript · Vite · Tailwind CSS · Supabase (PostgreSQL, Auth, row-level security) · Lucide icons · Bolt (AI-assisted development platform) · Git and GitHub

## My contribution

I built this with **Bolt, an AI-assisted development platform**, working from my own requirements. I chose the features and the security model (login plus per-user row-level security), set up the Supabase database, tested that users can't see each other's data, and published and documented the project on GitHub.

## Project structure

```
src/
├── components/Auth/            # Login and SignUp screens
├── components/Dashboard/       # Credential list, search, add/edit form
├── contexts/AuthContext.tsx    # Login state across the app
└── lib/supabase.ts             # Supabase client and Credential type
supabase/migrations/            # Table definition and RLS policies
```

## Run it locally

```bash
npm install
# create .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from your Supabase project
npm run dev
```

---

[← Back to my portfolio](https://github.com/Dani-Kunda)
