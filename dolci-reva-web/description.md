# Dolci Rêva - Plateforme de Tourisme et Loisirs en Côte d'Ivoire

## Nature du Projet
**Dolci Rêva** est une plateforme web de découverte et de réservation d'établissements de loisirs et de tourisme en Côte d'Ivoire. Le slogan du projet est **"Kiffer l'instant"** (profiter du moment).

## Objectif Principal
Le projet vise à mettre en valeur les potentialités touristiques de la Côte d'Ivoire qui restent méconnues des Ivoiriens et des touristes étrangers, en proposant une plateforme centralisée pour découvrir et réserver différents types d'établissements.

## Fonctionnalités Principales

### Sections de Découverte
- **Hôtels en vogue** - Établissements hôteliers de qualité
- **Haute gastronomie** - Restaurants et expériences culinaires
- **Chill de minuit** - Bars et lieux de détente nocturne
- **Espace des tout petits** - Aires de jeux et espaces pour enfants
- **Résidences incognito** - Hébergements discrets et confortables
- **Lounges** - Espaces de détente cosy et raffinés
- **Lieux magiques** - Endroits uniques et enchanteurs
- **Circuit touristiques** - Parcours de découverte
- **Espace évènementiels** - Lieux pour événements

### Interface Utilisateur
- Design moderne avec carrousels interactifs
- Animations de texte (TrueFocus)
- Interface responsive (mobile/desktop)
- Système de notation et de prix en FCFA
- Newsletter pour rester informé

## Architecture Technique

### Stack Technologique
- **Framework :** Next.js 15.3.4 avec React 19
- **Styling :** Tailwind CSS avec thème personnalisé
- **Composants :** Radix UI pour l'interface
- **Carrousels :** Embla Carousel
- **Animations :** Framer Motion
- **Authentification :** Système d'auth avec contexte React
- **Backend :** Axios pour les appels API

### Structure du Projet
```
app/
├── (front-office)/     # Pages publiques
│   ├── hotels/         # Page hôtels
│   ├── restaurants/    # Page restaurants
│   ├── lounges/        # Page lounges
│   ├── residences/     # Page résidences
│   ├── night-club/     # Page night club
│   ├── circuit-touristiques/  # Circuits touristiques
│   ├── espace-jeux-enfant/    # Espaces enfants
│   └── espace-evenementiels/  # Espaces événementiels
├── admin/              # Interface d'administration
└── auth/               # Authentification

components/
├── ui/                 # Composants d'interface
├── carousel/           # Composants de carrousel
└── auth/               # Composants d'authentification
```

## Cible
- **Ivoiriens** cherchant à découvrir leur pays
- **Touristes étrangers** visitant la Côte d'Ivoire
- **Résidents** recherchant des lieux de loisirs et de détente

## Monétisation
Le projet semble être une plateforme de mise en relation entre les utilisateurs et les établissements partenaires, avec des prix affichés en FCFA (Franc CFA), suggérant un modèle de commission ou de publicité.

## État Actuel
Le projet est en développement avec une interface front-end fonctionnelle, des données fictives pour la démonstration, et une structure prête pour l'intégration d'un backend réel.

## Description Métadonnées
- **Titre :** "Dolci Rêva"
- **Description :** "La Côte d'Ivoire regorge d'énormes potentialités, permettant ainsi la pratique du tourisme. Mais, toutes ces richesses restent méconnus de la plupart des ivoiriens et des touristes étrangers. Dolci Rêva vous aidera"
