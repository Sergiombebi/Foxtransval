# Configuration Vercel - Guide Étape par Étape

## 🚨 Problème Actuel
```
Environment Variable "NEXT_PUBLIC_SUPABASE_URL" references Secret "supabase_url", which does not exist.
```

## ✅ Solution : Configuration Directe des Variables

### Étape 1 : Trouver vos clés Supabase

1. Allez dans votre dashboard Supabase : https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Settings** → **API**
4. Copiez ces 3 valeurs :
   - **Project URL** → `https://xxxxx.supabase.co`
   - **anon public** → `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role** → `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Étape 2 : Configurer Vercel

1. Allez dans votre dashboard Vercel : https://vercel.com/dashboard
2. Sélectionnez votre projet `Foxtransval`
3. Allez dans **Settings** → **Environment Variables**
4. **Supprimez** d'abord les variables existantes qui référencent des secrets
5. **Ajoutez** ces 3 nouvelles variables :

#### Variable 1 :
- **Name** : `NEXT_PUBLIC_SUPABASE_URL`
- **Value** : `https://votre-projet.supabase.co` (remplacez par votre vraie URL)
- **Environment** : All (Production, Preview, Development)

#### Variable 2 :
- **Name** : `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value** : `votre_cle_anon_complete` (remplacez par votre vraie clé)
- **Environment** : All (Production, Preview, Development)

#### Variable 3 :
- **Name** : `SUPABASE_SERVICE_ROLE_KEY`
- **Value** : `votre_cle_service_role_complete` (remplacez par votre vraie clé)
- **Environment** : All (Production, Preview, Development)

### Étape 3 : Vérification

Après avoir ajouté les 3 variables, vous devriez voir :

```
NEXT_PUBLIC_SUPABASE_URL        https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY       eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Étape 4 : Redéploiement

1. Allez dans l'onglet **Deployments**
2. Cliquez sur **Redeploy** ou poussez un nouveau commit
3. Le build devrait maintenant réussir

## 🔍 Exemple Concret

Si votre projet Supabase est `https://abc123.supabase.co`, vos variables seront :

```
NEXT_PUBLIC_SUPABASE_URL        https://abc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiYzEyMyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjMxOTk5NjAwLCJleHAiOjE5NDc1NzU2MDB9.example
SUPABASE_SERVICE_ROLE_KEY       eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiYzEyMyIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2MzE5OTk2MDAsImV4cCI6MTk0NzU3NTYwMH0.example
```

## ⚠️ Important

- **N'utilisez PAS** la syntaxe `@secret_name` pour ce projet
- **Copiez-collez directement** les valeurs complètes
- **Assurez-vous** que les noms de variables sont exactement ceux ci-dessus
- Les clés sont longues, assurez-vous de les copier entièrement

## 🚀 Résultat Attendu

Après cette configuration :
- ✅ Plus d'erreur de secret manquant
- ✅ Build Vercel réussi
- ✅ Application fonctionnelle en production
