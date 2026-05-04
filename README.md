<div align="center">

# SmartLine

**Gestion dynamique et intelligente des voies de circulation**

*Olympiades des Sciences de l'Ingénieur — 2025/2026*
*Lycée LaSalle Passy Buzenval — Rueil-Malmaison*

---

</div>

## Le projet

SmartLine est un module routier intelligent qui remplace les terre-pleins centraux fixes par des **blocs mobiles motorisés** capables d'ajouter ou de supprimer une voie en temps réel, selon la densité du trafic.

Le projet répond à la problématique : **"L'ingénierie au service de la ville de demain"**.

## Problème

Les routes à plusieurs voies ont un nombre de voies fixe, alors que les besoins varient du simple au double selon l'heure. Cela provoque des embouteillages, une perte de temps et une augmentation des émissions de CO₂.

## Solution

- Déplacement latéral automatique des blocs de séparation
- Détection d'obstacles par capteurs ultrason (arrêt d'urgence si obstacle < 50 cm)
- Signalisation LED rouge/vert pour les conducteurs
- Alimentation par panneaux solaires — énergie 100 % renouvelable
- Pilotage via Arduino Mega + affichage OLED en temps réel

## Composants

| Composant | Rôle |
|---|---|
| Arduino Mega | Contrôleur principal |
| Moteur pas à pas + vis sans fin | Déplacement latéral précis |
| 2× Moteurs DC + roues | Mobilité du module |
| 4× Capteurs ultrason HC-SR04 | Sécurité active |
| 2× Bandes LED WS2812 RGB | Signalisation |
| 2× Écrans OLED SH1106 | Affichage état |
| 2× Panneaux solaires 8W | Alimentation |
| Caméra ESP-CAM | Surveillance en direct |

## Structure du dépôt

```
SmartLine/
├── Code/
│   ├── capteurs/        # Code Arduino Mega (moteurs, LEDs, capteurs, écrans)
│   └── app_mobile/      # Application de supervision
├── Documentation/
│   └── SmartLine_Cahier_des_Charges_2025-2026.pdf
├── CAO/                 # Fichiers de conception (plans, modèles 3D)
├── Presentation/        # Supports de présentation
├── Soutien/
│   ├── entreprises/     # Contacts partenaires
│   └── mairies/         # Contacts collectivités
└── assets/              # Images, logos, médias
```

## Équipe

| Membre | Rôle |
|---|---|
| **Samuel Caquelin** | Mécanique, prototype, étude d'impact CO₂ |
| **Manech Blossier** | Code Arduino, branchements, écrans |
| **Yvan Dabrowski** | Diagrammes techniques, sécurité, cohérence |
| **Edouard Baradat** | Code Arduino, application, communication |

---

<div align="center">

*SmartLine — Lycée LaSalle Passy Buzenval — Rueil-Malmaison*

</div>
