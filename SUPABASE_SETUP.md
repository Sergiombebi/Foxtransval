# Configuration Supabase pour TRAScolis

Ce guide explique comment configurer la base de données Supabase pour l'application TRAScolis.

## Étapes de configuration

### 1. Créer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project"
4. Choisissez votre organisation
5. Configurez le projet :
   - **Nom du projet**: `trascolis`
   - **Mot de passe de la base de données**: Choisissez un mot de passe sécurisé
   - **Région**: Choisissez la région la plus proche de vos utilisateurs
6. Attendez que le projet soit créé (2-3 minutes)

### 2. Exécuter le script SQL

1. Dans le tableau de bord Supabase, allez dans la section **SQL Editor**
2. Cliquez sur "New query"
3. Copiez-collez le contenu du fichier `supabase/schema.sql`
4. Cliquez sur "Run" pour exécuter le script

### 3. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

Pour trouver ces valeurs :
1. Dans le tableau de bord Supabase, allez dans **Project Settings** (icône d'engrenage)
2. Sous **API**, vous trouverez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Configurer l'authentification

1. Allez dans **Authentication** → **Settings**
2. Configurez les options suivantes :
   - **Site URL**: `http://localhost:3000` (pour le développement)
   - **Redirect URLs**: Ajoutez `http://localhost:3000/login`
3. Activez l'authentification par email si nécessaire

### 5. Compte administrateur par défaut

Le script SQL crée automatiquement un utilisateur admin :
- **Email**: `admin@trascolis.com`
- **Mot de passe**: `admin123`

**Important**: Changez ce mot de passe après la première connexion!

## Structure de la base de données

### Tables créées :

#### `users`
- **id**: UUID (clé primaire)
- **email**: Email unique de l'utilisateur
- **name**: Nom de l'utilisateur
- **password_hash**: Mot de passe hashé
- **role**: 'admin' ou 'user'
- **created_at**: Date de création
- **last_login**: Dernière connexion

#### `packages`
- **id**: UUID (clé primaire)
- **tracking_number**: Numéro de suivi unique
- **client_name**: Nom du client
- **client_phone**: Téléphone du client
- **nature**: Nature du colis (électroniques, vêtements, etc.)
- **quantity**: Poids en kg
- **price_per_kg**: Prix par kilo
- **total_price**: Prix total
- **departure_country**: Pays de départ
- **arrival_country**: Pays d'arrivée
- **arrival_city**: Ville d'arrivée
- **departure_date**: Date de départ
- **arrival_date**: Date d'arrivée
- **status**: Statut du colis
- **package_image**: Image du colis (optionnel)

#### `tracking_updates`
- **id**: UUID (clé primaire)
- **package_id**: Référence au colis
- **status**: Statut de la mise à jour
- **location**: Localisation
- **description**: Description
- **timestamp**: Date de la mise à jour

## Sécurité

Le script configure automatiquement :
- **Row Level Security (RLS)** pour protéger les données
- **Politiques d'accès** :
  - Tout le monde peut voir les colis
  - Seuls les admins peuvent créer/modifier/supprimer des colis
  - Les utilisateurs peuvent voir et modifier leur propre profil

## Dépannage

### Problèmes courants :

1. **Erreur de connexion** : Vérifiez que les variables d'environnement sont correctes
2. **Permission denied** : Assurez-vous que les politiques RLS sont bien configurées
3. **Champ manquant** : Vérifiez que le script SQL a été exécuté complètement

### Réinitialiser la base de données :

Si vous devez réinitialiser :
1. Allez dans **Settings** → **General**
2. Scrollez vers le bas et cliquez sur **Reset project password**
3. Ré-exécutez le script SQL

## Prochaines étapes

Une fois la base de données configurée :

1. Lancez l'application : `npm run dev`
2. Connectez-vous avec le compte admin
3. Commencez à ajouter des colis

Pour plus d'informations sur Supabase, consultez la [documentation officielle](https://supabase.com/docs).
