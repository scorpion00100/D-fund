# D-Fund

Plateforme connectant les entrepreneurs africains à leurs ressources: talents, outils, mentors, accompagnements et investisseurs.

## Architecture

Le projet est structuré en **architecture séparée** :

- **Backend** : NestJS + TypeScript + Prisma + PostgreSQL (Supabase)
- **Frontend** : Next.js 14 + TypeScript + Tailwind CSS

## Stack Technique

### Backend
- **NestJS** - Framework Node.js avec TypeScript
- **Prisma** - ORM pour PostgreSQL
- **PostgreSQL** - Base de données (via Supabase)
- **JWT** - Authentification

### Frontend
- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS
- **React Query** - Gestion des appels API (à venir)

### Infrastructure
- **Supabase** - PostgreSQL managé + Auth + Storage
- **Vercel** - Déploiement frontend (prévu)
- **Railway/Fly.io** - Déploiement backend (prévu)

## Prérequis

- Node.js 18+
- npm ou yarn
- Compte Supabase (gratuit)

## Installation

### 1. Configuration Supabase

Suivez le guide détaillé dans [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

Résumé rapide :
1. Créez un projet sur [supabase.com](https://supabase.com)
2. Récupérez la connection string PostgreSQL
3. Configurez les variables d'environnement

### 2. Backend

```bash
cd backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec vos credentials Supabase

# Générer le client Prisma
npm run prisma:generate

# Créer les migrations
npm run prisma:migrate

# Lancer le serveur de développement
npm run dev
```

Le backend sera accessible sur `http://localhost:3001`

### 3. Frontend

```bash
# À la racine du projet
cd app  # ou rester à la racine si le frontend est ici

# Installer les dépendances
npm install

# Configurer les variables d'environnement
# Créez .env.local avec NEXT_PUBLIC_API_URL=http://localhost:3001

# Lancer le serveur de développement
npm run dev
```

Le frontend sera accessible sur `http://localhost:3000`

## Structure du projet

```
D-fund/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── modules/        # Modules métier
│   │   │   ├── auth/       # Authentification
│   │   │   ├── users/      # Gestion utilisateurs
│   │   │   └── ...
│   │   ├── common/         # Utilitaires partagés
│   │   └── main.ts         # Point d'entrée
│   ├── prisma/
│   │   └── schema.prisma   # Schéma de base de données
│   └── package.json
│
├── app/                     # Frontend Next.js
│   ├── app/                 # Pages et routes
│   ├── components/          # Composants React
│   ├── lib/                 # Utilitaires
│   └── package.json
│
├── prisma/                  # Schéma Prisma principal
│   └── schema.prisma        # Modèle de données complet
│
├── data/                    # Données archivées
│   └── glide/
│       └── raw/             # CSV Glide (ignorés par Git)
│
├── docs/                    # Documentation
│   └── ...
│
└── scripts/                 # Scripts utilitaires
    └── migrate.ts           # Migration Glide → Supabase
```

## Base de données

Le schéma Prisma définit les modèles suivants :

### Entités principales
- **User** - Utilisateurs de la plateforme
- **BtoCProfile** - Profils individuels (talents, entrepreneurs)
- **BtoBProfile** - Profils entreprises
- **Opportunity** - Opportunités (jobs, co-founder, events, etc.)
- **Application** - Candidatures avec workflow
- **Message** - Messages privés et publics
- **Task** - Tâches liées aux opportunités
- **Rating** - Système de notation
- **ReferralCode** - Système de parrainage

### Relations
- **Follow** - Système de suivi
- **SavedOpportunity** - Opportunités sauvegardées
- **LikedOpportunity** - Opportunités likées
- **PrivateDiscussion** / **PublicDiscussion** - Discussions

Voir [prisma/schema.prisma](./prisma/schema.prisma) pour le schéma complet.

## Authentification

L'authentification utilise JWT :

- `POST /api/v1/auth/register` - Inscription
- `POST /api/v1/auth/login` - Connexion

Les tokens JWT sont utilisés pour protéger les routes API.

## Fonctionnalités

### Implémenté
- Architecture backend NestJS
- Schéma Prisma complet basé sur les données Glide
- Authentification JWT de base
- Structure frontend Next.js
- Migration des données Glide vers Supabase

### En cours / À venir
- [ ] Modules backend complets (opportunities, applications, messages)
- [ ] Intégration frontend avec le backend
- [ ] Dashboard utilisateur
- [ ] Système de recherche et filtres
- [ ] Notifications (Resend)
- [ ] Upload de fichiers (Supabase Storage)
- [ ] Real-time (Supabase Realtime)

## Migration des données Glide

- Les CSV exportés de Glide sont **archivés** dans `data/glide/raw/` et **ignorés par Git**.
- La **source de vérité** est la base PostgreSQL Supabase (pas les fichiers CSV).

Un script de migration existe déjà :

```bash
# À la racine du projet
npm run db:migrate:glide
```

Ce script :
1. Lit les CSV principaux (Users, Opportunities, Applications)
2. Nettoie et transforme les données
3. Importe dans PostgreSQL via Prisma

Voir :
- `scripts/migrate.ts`
- `docs/PHASE7_MIGRATION_GLIDE.md`
- `docs/MAPPING_CSV_SCHEMA.md`

## Commandes utiles

### Backend
```bash
cd backend

# Développement
npm run dev

# Build
npm run build

# Production
npm run start:prod

# Prisma
npm run prisma:generate    # Générer le client
npm run prisma:migrate     # Créer une migration
npm run prisma:studio      # Interface graphique
```

### Frontend
```bash
# Développement
npm run dev

# Build
npm run build

# Production
npm start
```

## Développement

### Workflow recommandé

1. **Backend d'abord** : Développer les endpoints API
2. **Frontend ensuite** : Consommer les APIs
3. **Tests** : Tester chaque module indépendamment

### Variables d'environnement

**Backend** (`backend/.env`) :
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

**Frontend** (`.env.local`) :
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## Documentation

- [Rapport Final](./docs/RAPPORT_FINAL.md) - Rapport détaillé de la phase pré-code (travail réalisé)
- [Prochaines Étapes](./docs/PROCHAINES_ETAPES.md) - Plan de développement V1 (prochaines étapes)
- [Structure du projet](./docs/STRUCTURE_PROJET.md) - Explication simple des dossiers
- [Architecture](./ARCHITECTURE.md) - Détails de l'architecture
- [Configuration Supabase](./SUPABASE_SETUP.md) - Guide de setup Supabase
- [Environnement de travail](./docs/ENVIRONNEMENT_DE_TRAVAIL.md) - Guide de développement
- [Documentation complète](./docs/) - Toutes les phases de validation

## Licence

Ce projet est privé.

## Contribution

Pour toute question ou suggestion, contactez l'équipe D-Fund.
