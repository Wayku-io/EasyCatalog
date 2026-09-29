# EasyCatalog 🎬

EasyCatalog est une application web moderne pour créer, gérer et héberger facilement des catalogues personnalisés pour **Stremio**, **Nuvio** et **AIO Metadata** (AIOStreams), alimentés par TMDB et synchronisés automatiquement sur GitHub via jsDelivr.

## ✨ Fonctionnalités

- 🔍 **Recherche TMDB en direct** : Recherche instantanée de films et séries avec affiches, notes, synopsis et dates.
- ⚡ **Connexion GitHub en 1 Clic** : OAuth GitHub officiel pour héberger vos catalogues gratuitement et automatiquement.
- 📦 **Génération de Manifestes Stremio / Nuvio** : Création instantanée des manifestes et catalogues JSON compatibles Stremio.
- 🚀 **Hébergement CDN jsDelivr** : Distribution mondiale ultra-rapide sans serveur payant.
- 🎛️ **Dashboard Studio 3 Panneaux** : Mes Catalogues, Recherche TMDB et Éditeur en direct sur PC.
- 📱 **Interface Mobile Responsive** : Entièrement optimisée pour smartphones avec QR code de test.
- 🌍 **Multi-langues** : Support natif du Français, Anglais, Espagnol et Portugais.

## 🛠️ Déploiement sur Vercel

1. Importez ce dépôt GitHub sur [Vercel](https://vercel.com).
2. Configurez les variables d'environnement suivantes dans les paramètres de votre projet Vercel :
   - `VITE_GITHUB_CLIENT_ID` : L'identifiant Client ID de votre application GitHub OAuth.
   - `GITHUB_CLIENT_SECRET` : Le secret de votre application GitHub OAuth.
3. Déployez ! L'application fonctionne immédiatement.

## 💻 Développement local

```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement
npm run dev

# Build de production
npm run build
```
