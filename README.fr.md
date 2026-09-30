<div align="center">

  <h1>🎬 EasyCatalog</h1>

  <p>
    <strong>Le créateur moderne de catalogues de streaming pour AIOStreams, Nuvio et Stremio.</strong>
  </p>

  <p>
    Créez, organisez et hébergez vos propres catalogues de films et séries en quelques secondes.<br />
    Alimenté par <strong>TMDB</strong> et diffusé dans le monde entier à vitesse maximale via <strong>jsDelivr CDN</strong>.
  </p>

  <p>
    <a href="https://easycatalog.vercel.app/">
      <img src="https://img.shields.io/badge/🚀_Ouvrir_l'application-easycatalog.vercel.app-10b981?style=for-the-badge" alt="Ouvrir EasyCatalog" />
    </a>
  </p>

  <p>
    <a href="https://github.com/Wayku-io/EasyCatalog/stargazers"><img src="https://img.shields.io/github/stars/Wayku-io/EasyCatalog?style=flat-square&color=10b981" alt="Stars" /></a>
    <a href="https://github.com/Wayku-io/EasyCatalog/network/members"><img src="https://img.shields.io/github/forks/Wayku-io/EasyCatalog?style=flat-square&color=10b981" alt="Forks" /></a>
    <a href="https://buymeacoffee.com/wayku"><img src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Wayku-FFDD00?style=flat-square&logo=buy-me-a-coffee&logoColor=black" alt="Offrir un café" /></a>
  </p>

  <p>
    <sub><a href="README.md">🇬🇧 Read this page in English</a></sub>
  </p>

</div>

---

## 🌟 Qu'est-ce qu'EasyCatalog ?

**EasyCatalog** est un studio visuel conçu pour simplifier la création de catalogues de streaming personnalisés.

Auparavant, concevoir des catalogues sur mesure pour **AIO Metadata (AIOStreams)**, **Nuvio** ou **Stremio** exigeait de rédiger manuellement des fichiers JSON complexes, de chercher les identifiants IMDb/TMDB un par un et de configurer soi-même un hébergement.

**EasyCatalog réunit tout ce processus dans une interface web intuitive en 1 clic :**
- 🔍 **Recherchez** n'importe quel film ou série avec affiches HD et métadonnées en direct.
- 🎨 **Composez et organisez** vos listes avec des outils de tri par date, ordre alphabétique ou manuel.
- 🚀 **Publiez en 1 clic** : les manifestes et fichiers de catalogues sont automatiquement enregistrés sur votre propre compte GitHub et mis en cache mondialement via CDN.
- 🔗 **Ajoutez à votre lecteur** : collez simplement votre lien de manifeste dans AIOStreams, Nuvio ou Stremio.

👉 **Accéder au service :** [https://easycatalog.vercel.app/](https://easycatalog.vercel.app/)

---

## ✨ Fonctionnalités principales

| Fonctionnalité | Description |
| :--- | :--- |
| **🔍 Recherche TMDB en direct** | Accès immédiat à des millions de films et séries avec affiches, années de sortie et résumés. Prêt à l'emploi sans rien configurer ! |
| **🐙 Connexion GitHub en 1 clic** | Authentification officielle et sécurisée par OAuth sans manipulation de jetons ni de clés compliquées. |
| **📁 Choix du dépôt de stockage** | Sélectionnez n'importe lequel de vos dépôts GitHub existants ou créez un dépôt dédié (ex: `nuvio-catalogs`) en un clic. |
| **🎛️ Studio Bureau (3 Colonnes)** | Interface pensée pour le confort : **Mes Catalogues** (gauche), **Recherche TMDB** (centre), **Éditeur en direct** (droite). |
| **📱 Interface Mobile Complète** | Navigation fluide et adaptée sur smartphones (iOS et Android) avec étapes guidées. |
| **📦 Pack Complet ("Super Manifest")** | Regroupez tous vos catalogues personnels sous une seule URL pour tout importer d'un coup dans AIOStreams. |
| **⚡ CDN Mondial Gratuit** | Vos manifestes sont servis instantanément à travers le monde par le réseau de diffusion jsDelivr. |
| **🌍 Interface multilingue** | Disponible en 🇫🇷 Français, 🇬🇧 Anglais, 🇪🇸 Espagnol et 🇵🇹 Portugais. |
| **🔒 Respect des normes Stremio** | Verrouillage automatique films / séries pour garantir une conformité totale avec le standard des addons Stremio. |

---

## 📖 Comment l'utiliser ?

### 1. Se connecter avec GitHub
Ouvrez [easycatalog.vercel.app](https://easycatalog.vercel.app/) et cliquez sur **Se connecter avec GitHub**. Validez l'accès une seule fois. Dans les paramètres (⚙️), vous pouvez choisir un dépôt existant ou créer un nouveau dépôt dédié (par exemple `nuvio-catalogs`).

### 2. Composer votre catalogue
- Choisissez le mode **Films** ou **Séries**.
- Recherchez les œuvres qui vous intéressent et cliquez dessus pour les ajouter à votre liste.
- Réorganisez les éléments comme vous le souhaitez grâce au menu de tri (par année, alphabétique A-Z ou manuel).
- Donnez un nom clair à votre collection (ex: *L'univers Star Wars*, *Films Cultes Années 90*).

### 3. Publier et récupérer votre lien
- Cliquez sur **Publier**.
- Votre catalogue et son manifeste JSON sont immédiatement créés et enregistrés sur votre dépôt GitHub.
- Cliquez sur l'icône de copie pour récupérer l'URL de votre manifeste et collez-la dans **AIOStreams** ou **Nuvio**.

---

## 🔄 Fonctionnement technique

```mermaid
graph LR
    User([Utilisateur]) -->|1. Recherche & Composition| App[Application Web EasyCatalog]
    TMDB[(Base TMDB)] -->|Métadonnées & Affiches| App
    App -->|2. Publication 1 Clic| GitHub[(Votre Dépôt GitHub)]
    GitHub -->|3. Cache CDN Global| jsDelivr[CDN jsDelivr]
    jsDelivr -->|4. Lien de Manifeste| Player[AIOStreams / Nuvio / Stremio]
```

- **Propriété totale de vos données** : Vos catalogues vous appartiennent et sont stockés sur votre propre compte GitHub.
- **Disponibilité maximale** : Grâce à GitHub et jsDelivr, vos catalogues sont accessibles en permanence sans interruption de service.
- **Sécurité et vie privée** : L'authentification passe par le protocole sécurisé OAuth GitHub. Aucun mot de passe ni token n'est stocké sur des serveurs externes.

---

## ☕ Soutenir le projet

EasyCatalog est un projet indépendant et gratuit. Si le service vous est utile, vous pouvez soutenir son maintien et ses évolutions :

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Wayku-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/wayku)

---

## 📄 Licence et mentions

Ce projet est sous licence [MIT](LICENSE).  
Cette application est un outil communautaire indépendant et n'est pas affiliée officiellement à Stremio, Nuvio, AIOStreams ou TMDB.
