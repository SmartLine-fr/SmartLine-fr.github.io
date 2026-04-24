# SmartLine — Terre-Pleins Modulables Intelligents

[![OSI 2026](https://img.shields.io/badge/Projet-Olympiades%20SI%202026-4361EE?style=flat-square)](https://smartline.website)
[![Plateforme](https://img.shields.io/badge/Plateforme-Arduino%20Mega-00979D?style=flat-square)](https://arduino.cc)
[![Site web](https://img.shields.io/badge/Site-smartline.website-4361EE?style=flat-square)](https://smartline.website)

> Projet réalisé dans le cadre des **Olympiades des Sciences de l'Ingénieur 2026** — Lycée LaSalle Passy Buzenval, Rueil-Malmaison.

---

## Le projet

**SmartLine** remplace les terre-pleins centraux fixes par des **modules motorisés autonomes** capables de se repositionner en temps réel pour créer une voie supplémentaire selon le trafic.

**Problématique :** *Dans quelle mesure la transformation des terre-pleins centraux en infrastructures connectées permet-elle de réduire la congestion, d'augmenter le débit et d'améliorer la sécurité routière ?*

```
SITUATION NORMALE          →→  Voie A1
                           →→  Voie A2
                           ▓▓▓▓▓▓  ← SmartLine
                           ←←  Voie B1
                           ←←  Voie B2

HEURE DE POINTE            →→  Voie A1
                           →→  Voie A2
                           →→  Voie A3  ← nouvelle voie
                           ▓▓▓
                           ←←  Voie B1
```

---

## Prototype — 2 modules

Chaque module embarque :

| Composant | Détail |
|---|---|
| Microcontrôleur | Arduino Mega |
| Motorisation | 2 moteurs DC (4 roues, 2 motorisées) |
| Descente plateau | Moteur pas-à-pas + vis sans fin |
| Driver moteur | L298N |
| Capteurs | 4 ultrasons par module |
| Signalisation | 2 LEDs par module |
| Alimentation | Panneau solaire intégré |
| Vision IA | Caméra + IA — détection perturbation trafic |

---

## Structure

```
SmartLine/
├── index.html          ← Accueil
├── conception.html     ← Architecture système
├── vision.html         ← Objectifs & impact
├── equipe.html         ← L'équipe
├── soutien.html        ← Partenaires
├── style.css
├── nav.js
├── assets/
│   ├── logo.png
│   ├── icon.png
│   ├── prototype.jpg
│   └── brinect.png
├── Code/
│   ├── capteurs/       ← Arduino capteurs ultrasons
│   ├── app_mobile/     ← Application mobile
│   └── trackeur/       ← Trackeur solaire
├── CAO/                ← Fichiers Fusion 360 / STL
├── Documentation/
│   ├── sysml/          ← Diagrammes SysML
│   └── excel/          ← Suivi budget & composants
├── Presentation/
│   └── powerpoint/
└── Soutien/
    ├── entreprises/    ← Brinect, Transdev
    └── mairies/
```

---

## Équipe

| Membre | Rôle | Missions |
|---|---|---|
| **Samuel Caquelin** | Responsable prototypage | Maquette, mécanique, bilan CO₂ |
| **Manech Blossier** | Responsable électronique | Arduino, câblage, LCD/LED, L298N |
| **Yvan Dabrowski** | Responsable ingénierie | SysML, caméra IA, cohérence système |
| **Edouard Baradat** | Chef de projet | Code Arduino, app mobile, communication |

---

## Partenaires

| Partenaire | Type |
|---|---|
| **Brinect SAS** | Partenaire officiel — autorisation logo signée (Annabella Stankovic, Présidente) |
| **Transdev Group** | Soutien institutionnel — Direction Innovation |

---

**Lycée LaSalle Passy Buzenval — Rueil-Malmaison, Île-de-France**
Olympiades des Sciences de l'Ingénieur 2026 · Thème : *L'ingénierie au service de la ville de demain*
