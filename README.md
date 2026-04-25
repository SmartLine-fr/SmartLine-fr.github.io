# 🚗 ParkEase - Application de Réservation de Parking

## 🎨 Design Simple et Professionnel

Design vert et blanc, épuré et naturel.
- Interface claire et fonctionnelle
- Pas d'effets inutiles
- Design qui semble fait par un humain

## ✨ Nouveautés

### 300+ Parkings en France
- Paris et Île-de-France : 40 parkings
- Marseille : 20 parkings
- Lyon : 20 parkings
- Toulouse : 20 parkings
- Nice, Nantes, Strasbourg : 15 parkings chacune
- Montpellier, Bordeaux, Lille : 15 parkings chacune
- Rennes, Reims, Le Havre : 10 parkings chacune
- + 150 autres parkings dans toutes les grandes villes françaises

### Fonctionnalités Principales

#### Carte Interactive
- Filtres par taille de place (Petite, Moyenne, Grande)
- Marqueurs verts (disponibles) ou rouges (complets)
- Géolocalisation en temps réel
- Vue de toute la France

#### Réservation Simplifiée
- Sélection de parking sur la carte
- Vue des places disponibles
- Réservation en un clic
- QR code généré instantanément

#### Gestion des Réservations
- Liste des réservations actives
- Historique complet
- Annulation possible
- Timer en temps réel
- Accès direct au QR code

#### QR Code
- Code scannable pour l'accès
- Informations de la réservation
- Temps restant affiché
- Design simple et clair

## 🎨 Palette de Couleurs

- **Vert principal** : #10B981
- **Vert foncé** : #059669
- **Vert clair** : #34D399
- **Blanc** : #FFFFFF
- **Gris foncé** : #1F2937
- **Gris moyen** : #6B7280
- **Bordures** : #E5E7EB

## 📁 Structure

```
parking/
├── data/
│   └── parkings.js           ✨ 300+ parkings
├── screens/
│   ├── SplashScreen.js       ✅ Simple
│   ├── AuthScreen.js         ✅ Simple
│   ├── MapScreen.js          ✅ Carte + Filtres
│   ├── ParkingScreen.js      ✅ Liste places
│   ├── QRScreen.js           ✅ Code QR
│   └── ReservationsScreen.js ✅ Gestion
├── constants/
│   └── theme.js              ✅ Vert et blanc
└── context/
    └── ReservationContext.js ✅ État global
```

## 🚀 Installation

### 1. Remplacer les fichiers
```bash
# Copier les nouveaux fichiers
cp data/parkings.js /votre-projet/data/
cp constants/theme.js /votre-projet/constants/
cp screens/* /votre-projet/screens/
cp context/ReservationContext.js /votre-projet/context/
```

### 2. Vérifier les dépendances
Toutes les dépendances nécessaires sont déjà dans `package.json`

### 3. Lancer
```bash
expo start
```

## 🗺️ Villes Couvertes

**Île-de-France** : Paris, Versailles, Boulogne, Neuilly, La Défense, Vincennes, Montreuil, Créteil, Nanterre, Rueil, Saint-Denis, Argenteuil, Colombes, Courbevoie, Vitry, Champigny, Aulnay

**Sud** : Marseille, Nice, Toulon, Montpellier, Nîmes, Avignon, Aix-en-Provence, Antibes, Cannes, Perpignan

**Ouest** : Bordeaux, Nantes, Rennes, Brest, Angers, Tours, Poitiers, La Rochelle, Vannes, Lorient, Cholet, Laval

**Est** : Lyon, Strasbourg, Grenoble, Dijon, Besançon, Mulhouse, Metz, Nancy, Colmar

**Nord** : Lille, Toulouse, Amiens, Rouen, Le Havre, Caen, Reims, Dunkerque, Roubaix, Tourcoing

**Centre** : Clermont-Ferrand, Limoges, Orléans, Bourges, Troyes, Châlons-en-Champagne

**Autres** : Saint-Étienne, Villeurbanne, Le Mans, Niort, Chambéry, Saint-Quentin, Beauvais, Mâcon, Albi, Agen, Valence, Pau, Tarbes, Carcassonne, Bayonne, Biarritz, Quimper

## 💡 Utilisation

### Trouver un parking
1. Ouvrir l'app → Carte s'affiche
2. Utiliser les filtres (Tous / Petite / Moyenne / Grande)
3. Marqueurs verts = places disponibles
4. Tap sur un marqueur → Voir le parking

### Réserver
1. Sélectionner un parking
2. Voir les places disponibles
3. Tap sur une place
4. QR code généré automatiquement

### Accéder au parking
1. Aller dans "Mes réservations"
2. Tap sur la réservation active
3. Scanner le QR code à l'entrée

### Annuler
1. Aller dans "Mes réservations"
2. Tap sur l'icône X
3. Confirmer l'annulation

## 📱 Compatibilité

- ✅ iOS 13+
- ✅ Android 8.0+
- ✅ Expo SDK 54
- ✅ React Native 0.81

---

**Fait main avec soin 🚗**
