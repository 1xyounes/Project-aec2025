# 🔥 Project AEGIS — Wildfire Drone Simulation

> Simulation temps-réel de gestion de feux de forêt par essaim de drones, avec prise de décision IA via Google Gemini.

Projet réalisé dans le cadre du concours **AEC 2025** — 🏆 **1ère place (30 équipes)** par l'équipe Robobo, Université Paul Sabatier Toulouse.

---

## 🎯 Fonctionnalités

- **Carte interactive** : grille dynamique simulant une forêt avec propagation de feux
- **Essaim de drones** : dispatch automatique, patrouilles, retour dépôt, gestion batterie
- **IA Gemini** :
  - Sélection optimale du drone à envoyer sur une alerte (raisonnement LLM)
  - Vérification visuelle de feu via vision multimodale (image drone simulée)
  - Chatbot assistant opérateur
- **Zones interdites** : contraintes de vol configurables
- **Optimiseur forêt** : configuration de la densité et zones à risque

---

## 🚀 Lancer le projet en local

### Prérequis
- Node.js ≥ 18
- Une clé API Gemini ([obtenir ici](https://aistudio.google.com/app/apikey))

### Installation

```bash
# 1. Cloner le repo
git clone https://github.com/<your-username>/project-aegis.git
cd project-aegis

# 2. Installer les dépendances
npm install

# 3. Configurer la clé API
cp .env.example .env.local
# Ouvrir .env.local et remplacer "your_gemini_api_key_here" par votre clé

# 4. Lancer
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173) dans le navigateur.

---

## ⚙️ Configuration

| Fichier | Rôle |
|---|---|
| `.env.local` | Clé API Gemini **(ne pas commit)** |
| `.env.example` | Template à copier pour démarrer |
| `vite.config.ts` | Expose `GEMINI_API_KEY` → `process.env.API_KEY` |

---

## 🏗️ Architecture

```
project-aegis/
├── components/          # UI React (carte, panneaux, modales)
│   ├── MapDisplay.tsx
│   ├── ControlPanel.tsx
│   ├── ForestOptimizerSetup.tsx
│   └── ...
├── services/
│   └── geminiService.ts  # Appels API Gemini (dispatch, vision, chat)
├── state/
│   └── AppContext.tsx    # État global + logique simulation
├── types.ts             # Types TypeScript
├── constants.ts         # Constantes (modèles Gemini, config)
└── vite.config.ts       # Config Vite + env vars
```

---

## 🤖 Stack technique

- **React 19** + **TypeScript**
- **Vite 6**
- **Google Gemini API** (`@google/genai`) — gemini-2.0-flash (texte + vision)
- **Recharts** — visualisation données drones

---

## 🔑 Variables d'environnement

```env
GEMINI_API_KEY=your_key_here
```

> ⚠️ Ne jamais commit `.env.local` — il est dans le `.gitignore`.

---

## 📄 Licence

Projet académique — Université Paul Sabatier Toulouse, 2025.
