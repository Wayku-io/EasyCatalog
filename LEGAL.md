# Mentions Légales, Confidentialité & Avertissement

Dernière mise à jour : 29 Septembre 2026

---

## 1. Mentions Légales

### Éditeur du site
- **Nom du projet** : EasyCatalog
- **Développeur & Auteur** : Wayku
- **Dépôt officiel** : [https://github.com/Wayku-io/EasyCatalog](https://github.com/Wayku-io/EasyCatalog)
- **Nature du projet** : Projet logiciel open-source distribué sous licence MIT, conçu à des fins privées, éducatives et communautaires.

### Hébergement
L'application web et les fonctions d'API sans état (stateless) sont hébergées par :
- **Hébergeur** : Vercel Inc.
- **Adresse** : 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
- **Site web** : [https://vercel.com](https://vercel.com)
- **Contact sécurité / confidentialité** : privacy@vercel.com

---

## 2. Politique de Confidentialité & Conformité RGPD

EasyCatalog respecte scrupuleusement la vie privée de ses utilisateurs et applique le principe de **minimisation des données** (Privacy by Design).

### Aucune collecte ni vente de données personnelles
- **Zéro cookie publicitaire** : L'application n'utilise aucun cookie traceur, aucun outil d'analyse intrusive (pas de Google Analytics, pas de pixel publicitaire).
- **Zéro base de données centrale** : EasyCatalog ne possède aucune base de données utilisateurs. Aucune information d'identification n'est stockée sur nos serveurs.

### Stockage Local (LocalStorage)
Toutes les données de configuration :
- Votre clé d'API TheMovieDatabase (TMDB),
- Votre jeton d'accès GitHub (Token),
- Vos préférences de langue,
- Le nom de votre dépôt de stockage,

sont conservées **exclusivement et localement dans le `localStorage` de votre navigateur**. Ces données ne quittent jamais votre machine vers nos serveurs.

### Authentification OAuth GitHub
La fonction serveur éphémère (`/api/auth`) n'a pour seul but que de transmettre le code d'autorisation temporaire fourni par GitHub en échange d'un jeton d'accès sécurisé. Aucun jeton ni aucune information de compte n'est enregistré sur les serveurs de Vercel.

### Services tiers sollicités
Lors de l'utilisation de l'application, des requêtes directes sont émises vers :
1. **The Movie Database (TMDB)** (`api.themoviedb.org`) : afin de rechercher et récupérer les métadonnées publiques et les affiches des œuvres.
2. **GitHub REST API** (`api.github.com`) : afin de synchroniser vos catalogues avec votre propre compte GitHub.
3. **CDN jsDelivr** (`cdn.jsdelivr.net`) : afin de diffuser publiquement vos fichiers de catalogues compilés.

---

## 3. Avertissement Légal & Non-Responsabilité (Disclaimer)

### Absence totale de contenus protégés ou de flux vidéos
> **IMPORTANT** : EasyCatalog **n'héberge, ne stocke, ne diffuse et ne transmet AUCUN fichier vidéo, aucun film, aucune série, aucun flux de streaming (IPTV ou torrent) ni aucun contenu multimédia protégé par le droit d'auteur.**

EasyCatalog est un **simple générateur de fichiers structurés (JSON)** associant des identifiants et des métadonnées publiques (titres, dates, résumés, images de couverture) issues de l'API publique TMDB.

### Attribution obligatoire The Movie Database (TMDB)
Ce produit utilise l'API TMDB mais n'est ni sponsorisé, ni certifié, ni approuvé par **The Movie Database (TMDB)**. Toutes les images et métadonnées appartiennent à leurs auteurs et détenteurs de droits respectifs.

### Propriété Intellectuelle & Marques
- **Stremio** est une marque déposée de Smart Code OOD.
- **Nuvio**, **AIOStreams**, **GitHub** et **TMDB** sont des marques et des dénominations appartenant à leurs propriétaires respectifs.
- L'utilisation de ces noms a pour seul but d'indiquer la compatibilité technique du format de fichier produit et n'implique aucune affiliation ou partenariat commercial.

### Responsabilité de l'Utilisateur
L'utilisateur final est seul et entièrement responsable du contenu des listes qu'il génère, des dépôts GitHub sur lesquels il les publie, et de l'usage qu'il fait des fichiers de manifestes au sein de ses propres logiciels de lecture multimédia.
