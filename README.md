# 🔥 Project AEGIS — Optimization of Aerial Firefighting Using AI

> **🏆 1ère place — AEC 2025 (Algerian Engineering Competition) — 30 équipes**  
> Team Robobo — ENSTA , Alger 


---

## 📁 Contenu

```
Project AEGIS
├── README.md                        ← Ce fichier
├── rapport_AEC_2025.pdf             ← Rapport technique complet (27 pages)
├── presentation_team_robobo.pdf     ← Présentation finale (15 slides)
├── viewer_interactif.html           ← Viewer tout-en-un (ouvrir dans le navigateur)
├── demo_yolo_live.mp4               ← Démo YOLOv8 en inférence temps réel
└── simulation/                      ← Code source React/Vite (localhost)
    ├── .env.example                 ← Template clé Gemini API
    ├── App.tsx
    ├── components/
    ├── services/geminiService.ts
    ├── state/AppContext.tsx
    └── ...
```

---

## 🚀 Lancer la simulation en local

### Prérequis
- Node.js ≥ 18
- Une clé API Gemini → [obtenir ici](https://aistudio.google.com/app/apikey)

### Installation

```bash
cd simulation
npm install
cp .env.example .env.local
# Ouvrir .env.local et remplacer "your_gemini_api_key_here" par ta clé
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173) dans le navigateur.

---

## 🧠 Présentation du projet

Project AEGIS est un système intelligent à deux niveaux conçu pour réduire le temps de détection-vérification d'un feu de forêt à **moins de 10 minutes**.

### "The Tripwire" — Capteurs IoT au sol
Réseau de capteurs basse consommation (thermique, fumée, gaz) déployés en zones à risque. Surveillance 7j/7 24h/24 via LoRaWAN. Dès qu'une anomalie est détectée, une **alerte Level 1** est envoyée au serveur central avec les coordonnées GPS.

### "Eyes in the Sky" — Drones autonomes
Une flotte de drones hybrides VTOL stationnés en dépôts fixes. À chaque alerte, l'IA (Google Gemini) sélectionne le drone optimal (proximité, batterie, statut) et le dispatche automatiquement.

### Boucle autonome complète

```
Capteur IoT → Alerte Level 1
      ↓
Serveur central → Dispatch IA (Gemini) → Drone optimal
      ↓
Drone → Zone alerte (BFS pathfinding, évitement obstacles)
      ↓
YOLOv8 analyse flux vidéo (fire / smoke)
      ↓
  ┌─────────────────────────┐
  │ Confirmé → Alerte L2   │ → Pompiers + GPS + vidéo live
  │ Fausse alarme           │ → Drone retourne au dépôt
  └─────────────────────────┘
```

---

## 🤖 Modèle YOLOv8 — Détection feu & fumée

- **Architecture** : YOLOv8n (nano) — optimisé embarqué
- **Dataset** : 1 000+ images (fire, smoke, backgrounds) — Roboflow
- **Entraînement** : 20 epochs, imgsz=640, Google Colab
- **Performance** : mAP@0.5 = **0.58**, inférence **~90ms/frame** CPU
- **Déploiement** : Jetson Nano / Raspberry Pi 4 (embarqué sur drone)
- **Classes** : `fire` 🔥 et `smoke` 💨

---

## 🛠 Stack technique

| Composant | Technologie |
|---|---|
| Simulation UI | React 19 + TypeScript + Vite |
| IA dispatch & vérification | Google Gemini API (`gemini-2.5-flash`) |
| Détection feu/fumée | YOLOv8 (Ultralytics) |
| Navigation drone | GPS + Visual SLAM (ORB-SLAM3) |
| Pathfinding | BFS (obstacles + zones interdites) |
| Plateforme drone | Hybrid VTOL quadcopter — carbone 550mm |
| Calculateur embarqué | NVIDIA Jetson Nano ou Raspberry Pi 4 |
| Capteurs | FLIR Lepton 3.5 (thermique) + RPi HQ Camera |
| Communication | LoRaWAN (capteurs) + 4G/WiFi (drones) |
| Flight controller | Pixhawk 6C / Matek F765 |

---

## 📊 Résultats clés

| Métrique | Valeur |
|---|---|
| mAP@0.5 (YOLOv8) | **0.58** |
| Inférence CPU | **~90 ms/frame** |
| Détection → vérification | **< 10 minutes** |
| Autonomie drone | **90–120 min** |
| Vitesse max (fixed-wing) | **120 km/h** |
| Résistance vent | **60 km/h** |
| Budget prototype | **1 110–1 250 USD** |
| Classement AEC 2025 | **🏆 1er / 30 équipes** |

---

## 📄 Documents

| Fichier | Description |
|---|---|
| `rapport_AEC_2025.pdf` | Rapport technique complet — 27 pages |
| `presentation_team_robobo.pdf` | Présentation jury — 15 slides |
| `viewer_interactif.html` | Viewer navigateur : slides + rapport + frames YOLO |
| `demo_yolo_live.mp4` | Vidéo démonstration inférence YOLOv8 temps réel |

---

## 👥 Équipe

**Team Robobo** — AEC 2025, 2ème Phase Problématique  
ENSTA , Alger 
Commanditaire : Tassili Travail Aérien

---

## 📄 Licence

Projet académique — AEC 2025. Tous droits réservés à l'équipe Robobo.
