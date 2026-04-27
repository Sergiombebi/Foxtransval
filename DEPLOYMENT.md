# Déploiement sur Vercel

## 🚀 Instructions pour corriger le déploiement

### 1. Variables d'environnement sur Vercel

Allez dans votre dashboard Vercel :
1. Project Settings → Environment Variables
2. Ajoutez ces variables :

```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

**Important :** Les variables doivent être exactement les mêmes que dans votre `.env.local`

### 2. Configuration de Vercel

Le fichier `vercel.json` est déjà configuré pour :
- Framework Next.js
- Build command: `npm run build`
- Output directory: `.next`

### 3. Déploiement

1. Poussez vos changements sur GitHub
2. Vercel déclenchera automatiquement un nouveau build
3. Le build devrait maintenant réussir

### 4. Vérification

Après déploiement, vérifiez que :
- La page d'accueil fonctionne
- La page de tracking (`/tracking`) fonctionne
- La page de login (`/login`) fonctionne
- Le dashboard admin (`/admin/dashboard`) fonctionne

### 5. Dépannage

Si le build échoue toujours :
1. Vérifiez les logs complets sur Vercel
2. Assurez-vous que les variables d'environnement sont correctement configurées
3. Vérifiez que votre projet Supabase est accessible

### 6. Notes importantes

- L'application gère maintenant le cas où Supabase n'est pas configuré
- Les utilisateurs verront des messages d'erreur clairs si la connexion échoue
- Le build local fonctionne avec `.env.local`
- Le build Vercel fonctionne avec les variables d'environnement Vercel
