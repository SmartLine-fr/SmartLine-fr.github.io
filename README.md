# SmartLine — Terre-Pleins Modulables Intelligents

[![OSI 2026](https://img.shields.io/badge/Projet-Olympiades%20SI%202026-4361EE?style=flat-square)](https://github.com/SmartLine-fr/SmartLine)
[![Plateforme](https://img.shields.io/badge/Plateforme-Arduino-00979D?style=flat-square)](https://arduino.cc)
[![Statut](https://img.shields.io/badge/Statut-En%20développement-orange?style=flat-square)](https://github.com/SmartLine-fr/SmartLine)
[![Lycée](https://img.shields.io/badge/Lycée-LaSalle%20Passy%20Buzenval-4361EE?style=flat-square)](https://github.com/SmartLine-fr/SmartLine)

---

> **SmartLine** est un projet développé dans le cadre des **Olympiades des Sciences de l'Ingénieur 2026** au lycée LaSalle Passy Buzenval, Rueil-Malmaison.
>
> L'objectif : concevoir un système de **terre-pleins centraux modulables et connectés**, capables d'ajouter ou de supprimer une voie de circulation en temps réel selon le trafic.

---

## Sommaire

- [Le concept](#le-concept)
- [Comment ça fonctionne](#comment-ça-fonctionne)
- [Architecture système](#architecture-système)
- [Prototype](#prototype)
- [Structure du projet](#structure-du-projet)
- [Équipe](#équipe)
- [Soutiens & Partenaires](#soutiens--partenaires)

---

## Le concept

**Problématique :** *Dans quelle mesure la transformation des terre-pleins centraux en infrastructures connectées permet-elle de réduire la congestion, d'augmenter le débit et d'améliorer la sécurité routière ?*

Les terre-pleins centraux fixes occupent de l'espace sans s'adapter au trafic. SmartLine les remplace par des **blocs motorisés autonomes** qui se repositionnent automatiquement pour créer une voie supplémentaire dans le sens le plus chargé.

**Objectifs :**
- Réduire la congestion aux heures de pointe
- Créer des voies réservées aux transports en commun
- Améliorer la régularité des bus
- Réduire les émissions de CO₂ liées aux embouteillages

---

## Comment ça fonctionne

```
SITUATION NORMALE

  Sens A  →→  [ Voie A1 ]
          →→  [ Voie A2 ]
              ▓▓▓▓▓▓▓▓▓▓▓▓  ← Terre-plein SmartLine
  Sens B  ←←  [ Voie B1 ]
          ←←  [ Voie B2 ]


HEURE DE POINTE — Reconfiguration automatique

  Sens A  →→  [ Voie A1 ]
          →→  [ Voie A2 ]
          →→  [ Voie A3 ]  ← Voie gagnée
              ▓▓▓▓▓▓
  Sens B  ←←  [ Voie B1 ]
```

Les capteurs détectent le déséquilibre → l'Arduino décide → les blocs se déplacent → la voie est créée.

---

## Architecture système

### Chaîne d'information

```
Capteurs ultrasons
       │
       ▼
Microcontrôleur Arduino ──► Moteurs (déplacement blocs)
       │
       ├──► Écrans LCD / Bandeaux LED (signalisation)
       │
       └──► Application mobile (suivi temps réel)
```

### Chaîne d'énergie

```
Panneau solaire ──► Batterie ──► Régulateur ──► Arduino + Moteurs
```

---

## Prototype

Le projet comprend **2 modules prototypes** identiques, chacun intégrant :

| Composant | Détail |
|---|---|
| Microcontrôleur | Arduino Mega |
| Motorisation principale | 2 moteurs DC — propulsion 4 roues (2 motorisées) |
| Système de descente | Moteur pas-à-pas + vis sans fin → abaissement du plateau |
| Capteurs trafic | 4 capteurs ultrason par module |
| Signalisation | 2 LEDs par module |
| Driver moteur | L298N (commande moteurs DC + pas-à-pas) |
| Alimentation | Panneau solaire intégré au-dessus du module |
| Vision IA | Caméra + traitement IA — détection perturbation du trafic |

### Fonctionnement mécanique

Chaque module repose sur **4 roues**, dont 2 motorisées par des moteurs DC pour assurer le déplacement latéral sur la chaussée. Un **moteur pas-à-pas** actionne une **vis sans fin** reliée à un plateau : ce mécanisme permet d'abaisser le module au niveau de la route pour le faire rouler, puis de le remonter une fois en position.

### Vision IA

Une caméra équipée d'un modèle d'intelligence artificielle analyse le trafic en temps réel des deux côtés de l'axe routier. Elle notifie le système dès qu'une perturbation ou un déséquilibre de trafic est détecté, déclenchant la procédure de reconfiguration.

---

## Structure du projet

```
SmartLine/
│
├── README.md
├── index.html              ← Site web principal
├── conception.html
├── vision.html
├── equipe.html
├── soutien.html            ← Partenaires
├── style.css
│
├── assets/
│   ├── logo.png
│   ├── icon.png
│   ├── prototype.jpg
│   └── brinect.png
│
├── Code/
│   ├── capteurs/           ← Arduino Mega, ESP8266, ESP32-CAM
│   └── app_mobile/         ← Application mobile React Native
│
├── Documentation/
│   ├── SmartLine_Cahier_des_Charges_2025-2026.pdf
│   ├── sysml/              ← Diagrammes SysML
│   └── excel/
│
├── Presentation/
│   └── powerpoint/         ← Slides de présentation
│
└── Soutien/
    ├── entreprises/        ← Partenaires entreprises
    └── mairies/            ← Contacts collectivités
```

---

## Équipe

Projet réalisé par 4 élèves de Terminale au lycée **LaSalle Passy Buzenval**, Rueil-Malmaison :

| Membre | Rôle | Missions |
|---|---|---|
| **Samuel Caquelin** | Responsable prototypage | Conception maquette, mécanique des blocs, étude impact CO₂ |
| **Manech Blossier** | Responsable électronique | Arduino, câblage, écrans LCD et bandeaux LED |
| **Yvan Dabrowski** | Responsable ingénierie | Diagrammes SysML, code de la route & signalisation, supervision caméra |
| **Edouard Baradat** | Chef de projet | Code Arduino, application mobile, communication |

---

**Olympiades des Sciences de l'Ingénieur 2026**  
Thème : *L'ingénierie au service de la ville de demain*  
Lycée LaSalle Passy Buzenval — Rueil-Malmaison, Île-de-France

---

*Projet académique réalisé à des fins éducatives — OSI 2026*

---

## Soutiens & Partenaires

| Partenaire | Type | Représentant |
|---|---|---|
| **Brinect SAS** | Partenaire officiel — autorisation logo signée | Annabella Stankovic, Présidente |
| **Transdev Group** | Soutien institutionnel — Direction Innovation | Endorsement moral |

