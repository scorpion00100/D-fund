# Architecture D-Fund

## Structure du Projet

```
D-fund/
├── backend/              # API NestJS
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── opportunities/
│   │   │   ├── applications/
│   │   │   ├── messages/
│   │   │   └── ...
│   │   ├── common/
│   │   └── main.ts
│   ├── prisma/
│   └── package.json
│
├── frontend/             # Next.js App
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
│
└── prisma/               # Schéma partagé (optionnel)
    └── schema.prisma
```

## Stack Technique

### Backend
- **NestJS** + TypeScript
- **Prisma** ORM
- **PostgreSQL** (via Supabase)
- **Auth.js** (NextAuth) - intégration via API

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Query** (pour les appels API)

### Infrastructure
- **Supabase** (PostgreSQL + Auth + Storage)
- **Vercel** (Frontend)
- **Railway/Fly.io** (Backend)

## Flux de Données

```
Frontend (Next.js)
    ↓ HTTP Requests
Backend API (NestJS)
    ↓ Prisma Client
PostgreSQL (Supabase)
```

## Modules Backend

1. **Auth Module**
   - JWT tokens
   - Session management
   - OAuth integration (via Supabase)

2. **Users Module**
   - CRUD users
   - Profiles (BtoC/BtoB)
   - Follow system

3. **Opportunities Module**
   - CRUD opportunities
   - Search & filters
   - AI generation

4. **Applications Module**
   - Application workflow
   - Status management
   - Reviews

5. **Messages Module**
   - Private messages
   - Public discussions
   - Real-time (future)

6. **Notifications Module**
   - Email (Resend)
   - In-app notifications

## API Structure

```
/api/v1/
  ├── auth/
  ├── users/
  ├── opportunities/
  ├── applications/
  ├── messages/
  └── ...
```

## Sécurité

- JWT tokens
- Role-based access control (RBAC)
- Input validation (class-validator)
- Rate limiting
- CORS configuration

