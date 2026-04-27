# Architecture Supabase Professionnelle - Next.js 15 App Router

## 🏗️ Vue d'ensemble

Cette architecture résout les problèmes de build Vercel en séparant proprement les clients Supabase côté client et côté serveur.

## 📁 Structure des fichiers

```
lib/supabase/
├── client.ts      # Client frontend (côté client)
├── server.ts      # Client backend (côté serveur)
├── actions.ts     # Server Actions sécurisées
└── index.ts       # Point d'entrée principal
```

## 🔧 Composants de l'architecture

### 1. Client Frontend (`lib/supabase/client.ts`)

- **Usage**: Composants React côté client
- **Sécurité**: Clé anon uniquement
- **Auth**: PersistSession activé
- **Hook**: `useSupabase()` pour React

```typescript
import { useSupabase } from '@/lib/supabase/client'

function MyComponent() {
  const supabase = useSupabase()
  // Utiliser supabase pour les opérations client
}
```

### 2. Client Backend (`lib/supabase/server.ts`)

- **Usage**: Server Actions, API Routes
- **Sécurité**: Clé service role (privilégiée)
- **Auth**: Pas de persistance
- **Pattern**: Singleton avec cache

```typescript
import { createServerSupabase } from '@/lib/supabase/server'

// Dans un Server Action
export async function myAction() {
  const supabase = createServerSupabase()
  // Opérations privilégiées
}
```

### 3. Server Actions (`lib/supabase/actions.ts`)

- **Usage**: Logique métier sécurisée
- **Sécurité**: Exécutées côté serveur uniquement
- **Type**: `use server` directive
- **Exemples**: getPackages, addPackage, deletePackage

```typescript
'use server'

import { createServerSupabase } from '@/lib/supabase/server'

export async function getPackages() {
  const supabase = createServerSupabase()
  // Logique sécurisée
}
```

## 🚀 Avantages de cette architecture

### ✅ **Build Vercel réussi**
- Plus d'initialisation globale au moment de l'import
- Initialisation paresseuse (lazy loading)
- Gestion des erreurs de variables manquantes

### 🔒 **Sécurité renforcée**
- Séparation claire client/serveur
- Clés appropriées pour chaque contexte
- Server Actions pour les opérations privilégiées

### 🏎️ **Performance optimale**
- Pattern Singleton évite les créations multiples
- Cache des instances client
- Initialisation uniquement quand nécessaire

### 🛠️ **Maintenabilité**
- Code modulaire et organisé
- Types TypeScript forts
- Documentation claire

## 📋 Variables d'environnement requises

```env
# Pour le client frontend
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon

# Pour le serveur backend
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
```

## 🔄 Migration depuis l'ancienne architecture

### Avant (problématique):
```typescript
import { supabase, supabaseAdmin } from '@/lib/supabase'
// Initialisation globale au build ❌
```

### Après (correct):
```typescript
// Client side
import { useSupabase } from '@/lib/supabase/client'

// Server side
import { getPackages } from '@/lib/supabase/actions'
// Pas d'initialisation globale ✅
```

## 🎯 Bonnes pratiques

1. **Toujours utiliser Server Actions** pour les opérations CRUD
2. **Utiliser le client frontend** uniquement pour les lectures publiques
3. **Ne jamais exposer** la clé service role côté client
4. **Gérer les erreurs** dans les Server Actions
5. **Utiliser les types TypeScript** pour la sécurité

## 🚨 Erreurs courantes évitées

- ❌ Initialisation Supabase au build
- ❌ Variables d'environnement undefined
- ❌ Mélange client/serveur inapproprié
- ❌ Clés privilégiées côté client

## ✅ Résultat final

- Build Vercel réussi
- Architecture sécurisée
- Code maintenable
- Performance optimale
