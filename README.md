<div align="center">

  <h1>🎬 EasyCatalog</h1>

  <p>
    <strong>The modern streaming catalog builder for AIO Metadata.</strong>
  </p>

  <p>
    Create, organize, and host custom movie and TV series catalogs in seconds.<br />
    Powered by <strong>TMDB</strong> and delivered worldwide at blazing speed via <strong>jsDelivr CDN</strong>.
  </p>

  <p>
    <a href="https://easycatalog.vercel.app/">
      <img src="https://img.shields.io/badge/🚀_Open_App-easycatalog.vercel.app-10b981?style=for-the-badge" alt="Open EasyCatalog" />
    </a>
  </p>

  <p>
    <a href="https://github.com/Wayku-io/EasyCatalog/stargazers"><img src="https://img.shields.io/github/stars/Wayku-io/EasyCatalog?style=flat-square&color=10b981" alt="Stars" /></a>
    <a href="https://github.com/Wayku-io/EasyCatalog/network/members"><img src="https://img.shields.io/github/forks/Wayku-io/EasyCatalog?style=flat-square&color=10b981" alt="Forks" /></a>
    <a href="https://buymeacoffee.com/wayku"><img src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Wayku-FFDD00?style=flat-square&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" /></a>
  </p>

  <p>
    <sub><a href="README.fr.md">🇫🇷 Lire cette page en Français</a></sub>
  </p>

</div>

---

## 🌟 What is EasyCatalog?

**EasyCatalog** is a free visual studio designed to make creating custom streaming catalogs effortless. 

Previously, creating custom catalogs for **AIO Metadata** required writing complex JSON files by hand, finding IMDb/TMDB IDs individually, and hosting files on servers.

**EasyCatalog automates the entire process into a clean 1-click web interface:**
- 🔍 **Search** movies and TV series by title, poster, and release year.
- 🎨 **Build & Organize** your custom lists with sorting and reordering tools.
- 🚀 **Publish in 1 Click**: Manifests and catalogs are generated directly on your own GitHub account and served via ultra-fast global CDN caching.
- 🔗 **Add to AIO Metadata**: Copy your generated manifest link directly into **AIO Metadata**.

👉 **Launch EasyCatalog now:** [https://easycatalog.vercel.app/](https://easycatalog.vercel.app/)

---

## ✨ Features

| Feature | Description |
| :--- | :--- |
| **🔍 Live TMDB Search** | Search movies and series by title, poster, and release year. Ready to use with zero setup! |
| **🐙 1-Click GitHub Connect** | Connect your GitHub account securely via official OAuth without manual tokens or complex setup. |
| **📁 Dedicated Storage Choice** | Select any of your existing GitHub repositories or create a dedicated one (e.g. `nuvio-catalogs`) in 1 click. |
| **🎛️ Desktop Studio Dashboard** | 3-column layout built for productivity: **My Collections** (left), **TMDB Search** (center), and **Live Editor** (right). |
| **📱 Full Mobile Support** | Responsive interface on iOS & Android with smooth step-by-step navigation. |
| **🔗 Add All in One Link** | Group all your catalogs under a single unified link to import everything into AIO Metadata in one click. |
| **⚡ Global CDN Delivery** | Zero server maintenance: catalogs are served worldwide through jsDelivr's high-speed CDN. |
| **🌍 Multi-language UI** | Available in 🇬🇧 English, 🇫🇷 French, 🇪🇸 Spanish, and 🇵🇹 Portuguese. |
| **🔒 Stremio / Nuvio Standard Compliance** | Strict movie/series type separation ensuring 100% compliance with Stremio and Nuvio player specifications. |

---

## 📖 How to Use

### 1. Connect with GitHub
Open [easycatalog.vercel.app](https://easycatalog.vercel.app/) and click **Connect with GitHub**. Authenticate once to link your account. In the settings (⚙️), you can select an existing repository or create a dedicated one (like `nuvio-catalogs`).

### 2. Search & Compose Your Catalog
- Choose **Movies** or **Series** mode.
- Search for the titles you want and click an item to add it to your list.
- Reorder titles manually or use the quick-sort dropdown (by release year, alphabetical A-Z).
- Enter a clear name for your collection (e.g. *Christopher Nolan Essentials*, *Best Sci-Fi 90s*).

### 3. Publish & Copy Your Link
- Click **Publish**.
- Your catalog and JSON manifest are instantly created and pushed to your repository.
- Click the copy icon to get your manifest URL and paste it into **AIO Metadata**.

---

## 🔄 How it Works

```mermaid
graph LR
    User([User]) -->|1. Search & Build| App[EasyCatalog Web App]
    TMDB[(TMDB Database)] -->|Title, Poster, Year| App
    App -->|2. 1-Click Publish| GitHub[(Your Personal GitHub Repo)]
    GitHub -->|3. Global Edge Cache| jsDelivr[jsDelivr CDN]
    jsDelivr -->|4. Manifest URL| AIO[AIO Metadata]
```

- **Full Data Ownership**: Your catalogs belong entirely to you and live on your personal GitHub account.
- **High Availability**: Thanks to GitHub and the jsDelivr CDN, your catalogs are available 24/7 with 99.9% uptime.
- **Privacy & Security**: Authentication is handled through GitHub OAuth. No access tokens or personal passwords are saved on external servers.

---

## ☕ Support the Project

EasyCatalog is free and open-source. If you enjoy using it, you can support development and maintenance:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Wayku-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/wayku)

---

## 📄 License & Legal

Distributed under the [MIT License](LICENSE).  
This application is an independent community tool and is not officially affiliated with Stremio, Nuvio, or TMDB.
