# 🥖🎬🌮 Cinecito con Baguette y Taquito

Notre petit site de soirées ciné à deux (🇲🇽 espagnol par défaut, 🇫🇷 français en option).

- **Por ver / À voir** : recherche de films avec autocomplétion (TMDB) : affiche, synopsis, année
- **Calendario / Calendrier** : un calendrier mensuel. On clique sur un jour, on choisit un film et une heure. Ensuite « ✓ Vu » (note en tacos) ou « ↩ Pas vu » (le film retourne dans la liste)
- **Vistas / Vus** : l'historique des films vus ensemble
- Connexion par un seul mot de passe partagé, synchro en temps réel entre vos deux appareils

## Configuration (une seule fois)

### 1. Supabase
1. Créer un projet sur https://supabase.com
2. **SQL Editor** → coller et exécuter `supabase/schema.sql`
3. **Authentication → Users → Add user → Create new user** : un seul compte partagé
   - Email : `cinecito@cinecito.app` (le même que `VITE_LOGIN_EMAIL` dans `.env`)
   - Password : le mot de passe secret 🍈
   - Cocher **« Auto Confirm User »**
4. **Authentication → Sign In / Providers** : désactiver **« Allow new users to sign up »** pour que personne d'autre ne puisse créer de compte
5. **Project Settings → API** : récupérer l'URL et la clé `anon`

### 2. TMDB (affiches + synopsis)
1. Créer un compte sur https://www.themoviedb.org
2. https://www.themoviedb.org/settings/api → demander une clé (usage personnel) → copier le **« API Read Access Token »**

### 3. Variables d'environnement
```sh
cp .env.example .env   # puis remplir les valeurs
```

## Lancer

```sh
npm install
npm run dev
```

Stack : Svelte 5 + TypeScript + Tailwind CSS v4 (Vite) + Supabase.
