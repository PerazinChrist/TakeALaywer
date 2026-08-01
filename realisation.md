# TakeALawyer — Feuille de route de réalisation

> Découpage complet du projet en phases livrables, dérivé de `project-modules.md`
> (les 10 modules) et de `directive-ui.md` (les 5 directives UX).
>
> **Légende** — `[x]` livré et vérifié · `[~]` partiellement livré · `[ ]` à faire
>
> Dernière mise à jour : 1er août 2026

---

## Où en est le projet

Seule la **vitrine publique** existe. Il n'y a ni backend, ni base de données,
ni authentification : la page d'accueil est alimentée par des données de
démonstration (`lib/data/home.ts`) dont la forme correspond déjà aux futurs
endpoints.

| Périmètre | État |
|---|---|
| Fondations frontend (Next 16, React 19, Tailwind 4, TypeScript) | Livré |
| Charte graphique + 3 thèmes commutables | Livré |
| Page d'accueil complète (11 sections) | Livré |
| Toutes les autres pages | Néant — les liens mènent à des 404 |
| Backend, base de données, auth | Néant |
| Paiements, messagerie, modération | Néant |

**Avancement global estimé : ~8 %** du produit décrit dans `project-modules.md`.
La landing page représente une part visible mais faible du travail total : les
modules 1 à 10 constituent l'essentiel de la charge.

---

## Phase 0 — Fondations techniques ✅

**Objectif** : un socle frontend qui démarre, compile et se déploie.

- [x] Scaffold Next.js 16.2.10 / React 19.2.4 / TypeScript 5.9 / Tailwind CSS 4.3
- [x] `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`
- [x] ESLint 9 en configuration plate (`eslint.config.mjs`) — lint vert
- [x] `.gitignore`
- [x] Alias d'import `@/*`
- [x] Build de production vérifié (page d'accueil prérendue en statique)
- [ ] **Dépôt Git structuré** : branches `main` / `develop`, convention de commits
- [ ] **Intégration continue** : lint + build + tests sur chaque PR
- [ ] **Variables d'environnement** : `.env.example` documenté, secrets hors dépôt
- [ ] **Déploiement de préproduction** (Vercel ou équivalent) sur un domaine de test

---

## Phase 1 — Design system & identité ✅

**Objectif** : la charte de `project-modules.md` traduite en tokens réutilisables.

- [x] Palette en tokens Tailwind v4 : marine `#0F172A`, or `#D97706`/`#CA8A04`,
      émeraude `#10B981` (réservé preuve sociale), gris platine
- [x] Typographie : Playfair Display (titres) + Inter (corps/UI) via `next/font`
- [x] Ombres, animations et utilitaires de marque (`rule-gold`, `paywall-blur`,
      `skeleton`, `container-page`)
- [x] Respect de `prefers-reduced-motion`
- [x] Primitives UI faites main, sans dépendance : `button`, `badge`, `avatar`,
      `rating`, `section-heading`, `skeleton`, jeu de 40 icônes SVG
- [x] Contrastes WCAG AA vérifiés au ratio (règle « surface dorée → texte marine »)
- [x] 3 thèmes commutables (Or & ambre, Marine & crème, Émeraude) pilotés par
      `data-theme`, avec illustration de hero dédiée par thème
- [~] **Sélecteur de thème** — outil temporaire, à supprimer une fois le choix arrêté
- [ ] **Arrêter un thème définitif**, replier ses valeurs dans `@theme`,
      supprimer les deux illustrations inutilisées
- [ ] Si le thème retenu n'est pas l'or : renommer la famille `gold-*` en
      `accent-*` (elle est trompeuse) et réattribuer une couleur distinctive à la
      preuve sociale si collision
- [ ] Documenter le design system (Storybook ou page `/design-system` interne)

---

## Phase 2 — Page d'accueil ✅

**Objectif** : la landing décrite dans `project-modules.md` + les 5 directives UX.

### Structure de la page
- [x] En-tête collant : logo, navigation à puces, réseaux, menu plein écran
- [x] Hero : titre sur deux niveaux, 2 CTA distincts (or / contour), illustration
      organique commutée par thème
- [x] Bande de recherche rapide en débordement (spécialité + ville, formulaire GET
      fonctionnel sans JavaScript)
- [x] Barre de réassurance : 7 000+ avocats, 100 % anonymat, réponses < 24h, 40 000 citoyens
- [x] Cartes par situation de vie (directive-ui § 1) — 6 situations réelles
- [x] Composant « Diagnostic Rapide » en 3 clics avec orientation calculée (directive-ui § 1)
- [x] Section « Comment ça marche » en 3 étapes
- [x] Articles & guides populaires avec badges Gratuit / Premium
- [x] Paywall « teaser » : 30 % lisible, flou dégradé, aperçu des pépites (directive-ui § 4)
- [x] Carte auteur avec badge de vérification et CTA direct (directive-ui § 2)
- [x] Annuaire en vedette avec badges Vérifié / Expert auteur / Pionnier
- [x] Avis certifiés
- [x] CTA avocat / Offre Pionnière
- [x] Pied de page institutionnel : mentions légales, charte déontologique, maillage SEO

### Micro-interactions
- [x] Widget de preuve sociale « en direct », discret et refermable (directive-ui § 3)
- [x] Barre d'action flottante mobile `[Rechercher | Poser un besoin | Articles]` (directive-ui § 5)
- [x] Skeleton loaders (directive-ui § 5)
- [x] Animations d'apparition

### Qualité
- [x] Responsive vérifié en 375 px et 1265 px, zéro débordement horizontal
- [x] Métadonnées SEO, Open Graph, Twitter Card
- [x] Données structurées JSON-LD (Organization + WebSite + SearchAction)
- [x] Lien d'évitement, `aria-*`, navigation au clavier
- [ ] **Audit Lighthouse** (performance, accessibilité, SEO, bonnes pratiques)
- [ ] **Tests end-to-end** du parcours d'accueil (Playwright)
- [ ] Remplacer les données de démonstration par de vrais appels API

---

## Phase 3 — Squelette des pages publiques

**Objectif** : ne plus avoir un seul lien mort. Tous les liens de la landing
pointent aujourd'hui vers des routes inexistantes.

- [ ] `/avocats` — annuaire avec filtres multi-critères
- [ ] `/avocats/[slug]` — fiche publique d'un avocat
- [ ] `/guides` — index des articles avec filtres
- [ ] `/guides/[slug]` — lecture d'un article
- [ ] `/besoin/nouveau` — tunnel de dépôt de besoin
- [ ] `/avocats/inscription` — onboarding avocat
- [ ] `/connexion`, `/inscription`
- [ ] `/tarifs`
- [ ] `/mentions-legales`, `/charte-deontologique`, `/cgu`, `/confidentialite`, `/contact`
- [ ] Page 404 et page d'erreur aux couleurs du site
- [ ] `sitemap.xml` et `robots.txt` générés
- [ ] Layouts partagés : espace public / espace citoyen / espace avocat / back-office

---

## Phase 4 — Backend : socle

**Objectif** : l'API modulaire alignée sur le découpage en 10 modules.

- [ ] Initialiser NestJS en monorepo ou dépôt séparé, un module Nest par module métier
- [ ] PostgreSQL + Prisma : schéma initial (Utilisateur, Avocat, Citoyen, Besoin,
      Article, Transaction, Message, Avis, Badge, Abonnement)
- [ ] Migrations versionnées et jeu de données de démonstration (`seed`)
- [ ] Stockage objet S3 / Cloudflare R2 : buckets privés, URL signées à durée limitée
- [ ] Gestion de configuration et validation des variables d'environnement
- [ ] Journalisation structurée, gestion centralisée des erreurs, health checks
- [ ] Documentation OpenAPI générée
- [ ] Limitation de débit et protections de base (CORS, Helmet)
- [ ] Côté frontend : TanStack Query pour le cache des requêtes, Zustand pour l'état local

---

## Phase 5 — Module 1 : Authentification & profils

**Objectif** : les 4 rôles opérationnels, l'anonymat citoyen garanti.

### 1.1 Onboarding avocat (KYB)
- [ ] Inscription en plusieurs étapes avec sauvegarde de la progression
- [ ] Téléversement chiffré des pièces : carte professionnelle, attestation d'inscription au Barreau
- [ ] File de vérification côté administrateur, avec motif de rejet et relance
- [ ] Statuts : `en_attente` → `validé` → `suspendu`

### 1.2 Onboarding citoyen
- [ ] Inscription rapide e-mail / téléphone
- [ ] OAuth 2.0 social (Google, Facebook)
- [ ] **Pseudonyme obligatoire** : l'identité réelle n'est jamais exposée à l'avocat
      avant acceptation explicite du contact
- [ ] Vérification du numéro par SMS

### 1.3 RBAC
- [ ] 4 rôles : Citoyen, Avocat En Attente, Avocat Validé (Pionnier / Premium), Administrateur
- [ ] Garde de permissions côté API et côté rendu
- [ ] JWT avec rotation des refresh tokens, sessions révocables
- [ ] Bcrypt pour les mots de passe, politique de robustesse
- [ ] Réinitialisation de mot de passe, changement d'e-mail vérifié

**Fait quand** : un avocat peut s'inscrire, être validé par un admin et accéder à
son espace ; un citoyen peut déposer un besoin sans révéler son identité.

---

## Phase 6 — Module 4 : Appels d'offres (boucle de valeur centrale)

> Traité avant la marketplace : c'est ce module qui crée la rencontre entre les
> 40 000 citoyens et les 7 000 avocats. Sans lui, le reste n'a pas d'usage.

### 4.1 Tunnel de dépôt de besoins
- [ ] Formulaire dynamique étape par étape, sans jargon
- [ ] Reprise des cartes « situation de vie » de la page d'accueil comme point d'entrée
- [ ] Continuité avec le Diagnostic Rapide (pré-remplissage depuis les 3 réponses)
- [ ] Option d'anonymisation garantie, explicite et réversible
- [ ] Sauvegarde du brouillon, reprise plus tard

### 4.2 Moteur d'acheminement
- [ ] Routage automatique vers les avocats compétents (spécialité + localisation + disponibilité)
- [ ] Règles de priorité selon le degré d'urgence déclaré
- [ ] Plafonnement du nombre d'avocats sollicités par besoin
- [ ] Journal d'acheminement pour audit

### 4.3 Réponses & crédits
- [ ] Interface de réponse de l'avocat (proposition ou invitation à un rendez-vous)
- [ ] Décompte d'un « crédit de réponse » à chaque envoi
- [ ] Compteur de crédits visible, blocage à zéro, recharge
- [ ] Côté citoyen : comparaison des réponses reçues, acceptation d'un contact

**Fait quand** : un besoin déposé anonymement atteint les bons avocats et
déclenche des réponses en moins de 24 h.

---

## Phase 7 — Module 2 : Annuaire & espace avocat

### 2.1 Profil public
- [ ] Fiche complète : biographie, spécialités, honoraires indicatifs, localisation,
      diplômes, articles rédigés, note moyenne
- [ ] Édition par l'avocat avec passage en modération avant publication
- [ ] Optimisation SEO de chaque fiche (métadonnées, données structurées)

### 2.2 Espace praticien
- [ ] Tableau de bord : demandes reçues, en cours, converties
- [ ] Statistiques de consultation du profil
- [ ] Gestion des disponibilités

### 2.3 Gestionnaire d'abonnement
- [ ] Bascule Offre Pionnière (gratuite, 500 places) → Abonnement mensuel
- [ ] Déblocage progressif des fonctionnalités selon le palier
- [ ] Compteur public des places Pionnières restantes
- [ ] Facturation, renouvellement, résiliation

---

## Phase 8 — Module 5 : Messagerie & e-consultation

### 5.1 Chat chiffré
- [ ] Messagerie 1-à-1, déclenchée uniquement après acceptation du citoyen
- [ ] Temps réel (WebSockets)
- [ ] Chiffrement des messages au repos
- [ ] Notifications de lecture, indicateur de saisie

### 5.2 Coffre-fort documentaire
- [ ] Téléversement chiffré (PDF, scans, images)
- [ ] URL signées à durée limitée, jamais d'accès public
- [ ] Antivirus à l'upload, limite de taille et de type

### 5.3 Prise de rendez-vous
- [ ] Créneaux proposés par l'avocat
- [ ] Réservation téléphonique ou au cabinet
- [ ] Rappels automatiques, annulation et report

---

## Phase 9 — Module 3 : Knowledge Marketplace

### 3.1 Éditeur de contenu
- [ ] Éditeur riche WYSIWYG (formatage, images, pièces jointes)
- [ ] Modèles de documents juridiques réutilisables
- [ ] Brouillons, versions, prévisualisation

### 3.2 Moteur de paywall dynamique
- [ ] Trois statuts : gratuit, payant à l'unité, inclus dans l'abonnement
- [ ] Masquage automatique au-delà d'un seuil de lecture configurable (~30 %)
- [ ] Effet de flou + bloc de paiement (maquette déjà en place sur la page d'accueil)
- [ ] Liste « ce que vous allez débloquer » saisie par l'auteur
- [ ] Déblocage après paiement, accès permanent, historique d'achats

### 3.3 Recherche & indexation
- [ ] Recherche plein texte (PostgreSQL `tsvector` ou Meilisearch)
- [ ] Filtres : mots-clés, domaine du droit, région
- [ ] Métadonnées SEO générées automatiquement par article
- [ ] Sitemap dynamique des articles

### Boucle de découverte (directive-ui § 2)
- [ ] « Read Next » contextuel : 3 contenus liés en fin d'article
- [ ] Carte flottante de l'avocat auteur avec CTA direct
- [ ] Temps de lecture estimé + barre de progression en haut d'écran

---

## Phase 10 — Module 6 : Moteur financier

### 6.1 Gateway de paiement multicanal
- [ ] Mobile Money via agrégateur local (CinetPay, Notch Pay ou PaySika) — MTN / Orange
- [ ] Cartes bancaires via Stripe
- [ ] Webhooks de confirmation, idempotence, reprise sur échec

### 6.2 Portefeuille virtuel
- [ ] Solde de crédits par avocat
- [ ] Historique complet des transactions
- [ ] Demande de retrait et suivi

### 6.3 Split payment
- [ ] Répartition automatique à chaque vente (ex. 70 % avocat / 30 % plateforme)
- [ ] Taux de commission paramétrable depuis le back-office
- [ ] Écritures comptables traçables et rapprochables

**Exigence transverse** : aucune donnée de carte ne transite par nos serveurs ;
tout passe par les formulaires hébergés du prestataire.

---

## Phase 11 — Module 7 : Modération & conformité déontologique

### 7.1 File d'attente de validation
- [ ] Validation préalable des articles avant publication
- [ ] Validation préalable des profils d'avocats
- [ ] Traçabilité des décisions et notification à l'auteur

### 7.2 Filtre anti-spam & contenus illicites
- [ ] Détection automatique des termes interdits ou diffamatoires
- [ ] Contrôle des règles de l'Ordre des Avocats (démarchage, publicité comparative)
- [ ] Signalement par les utilisateurs

### 7.3 Registre d'audit & confidentialité
- [ ] Historisation sécurisée des consentements
- [ ] Export des données personnelles sur demande
- [ ] Suppression du compte et des données (droit à l'effacement)
- [ ] Politique de rétention et purge automatique
- [ ] Bandeau cookies conforme, consentement granulaire

---

## Phase 12 — Module 8 : Conversion & preuve sociale

### 8.1 Avis certifiés
- [ ] Collecte déclenchée **uniquement après une interaction réelle** citoyen ↔ avocat
- [ ] Note + commentaire, modération avant publication
- [ ] Calcul de la note moyenne, affichage sur la fiche et sous les articles
- [ ] Droit de réponse de l'avocat

### 8.2 Micro-interactions d'engagement
- [x] Widgets de preuve sociale « en direct » (maquette en place, données factices)
- [x] Compteurs dynamiques (« 12 besoins résolus aujourd'hui », « réponse sous 2 h »)
- [ ] **Brancher ces widgets sur des événements réels** — c'est aujourd'hui du contenu figé

### 8.3 Système de badges
- [x] Rendu visuel des badges Vérifié / Expert auteur / Membre Pionnier
- [ ] Attribution automatique selon les règles métier
- [ ] Retrait automatique si les conditions ne sont plus remplies

---

## Phase 13 — Module 9 : Notifications & marketing automation

### 9.1 Relances automatisées
- [ ] E-mails transactionnels (Resend ou SendGrid) : gabarits aux couleurs du site
- [ ] SMS et WhatsApp Business (Twilio ou équivalent local)
- [ ] Séquences d'activation : réveil des 7 000 avocats, engagement des 40 000 citoyens
- [ ] Désinscription et gestion des préférences par canal

### 9.2 Notifications push
- [ ] Alerte temps réel à l'avocat quand un besoin paraît dans son secteur
- [ ] Notifications in-app avec centre de notifications
- [ ] Push web (et mobile si application ultérieure)

---

## Phase 14 — Module 10 : Back-office d'administration

- [ ] Console super-admin : recherche et gestion des utilisateurs
- [ ] Validation / suspension de comptes avec motif
- [ ] Suivi du chiffre d'affaires et des transactions
- [ ] Gestion des taux de commission
- [ ] Tableau de bord des KPI : besoins déposés, taux de réponse, délai moyen,
      conversion, revenus par module
- [ ] Export des données, journal d'activité administrateur

---

## Phase 15 — Qualité, sécurité et mise en production

### Tests
- [ ] Tests unitaires sur la logique métier (matching, paywall, split payment)
- [ ] Tests d'intégration API
- [ ] Tests end-to-end des parcours critiques : dépôt de besoin, réponse avocat,
      achat d'article, inscription avocat
- [ ] Seuil de couverture défini et vérifié en intégration continue

### Sécurité
- [ ] Revue de sécurité : injections, XSS, CSRF, IDOR sur les documents
- [ ] Test d'intrusion avant ouverture au public
- [ ] Chiffrement au repos des données sensibles, rotation des clés
- [ ] Sauvegardes automatiques et procédure de restauration testée

### Performance
- [ ] Budget de performance et suivi des Core Web Vitals
- [ ] Optimisation des images, mise en cache, CDN
- [ ] Indexation et plans de requêtes vérifiés sur les tables volumineuses
- [ ] Test de charge sur le moteur d'acheminement

### Conformité & lancement
- [ ] Validation juridique des mentions légales et de la charte déontologique
- [ ] Conformité à la réglementation locale sur les données personnelles
- [ ] Supervision : erreurs (Sentry), disponibilité, alertes
- [ ] Analytique respectueuse de la vie privée
- [ ] Documentation d'exploitation et procédure d'astreinte
- [ ] Bêta fermée avec un panel d'avocats pionniers
- [ ] Ouverture au public

---

## Décisions restées ouvertes

Ces points bloqueront le développement s'ils ne sont pas tranchés :

1. **Thème définitif** — trois colorimétries sont en place, une seule doit rester.
2. **Marché et devise** — la stack Mobile Money (MTN / Orange) et les villes des
   données de démonstration visent le Cameroun ; à confirmer, ainsi que la devise
   et la langue (français seul ou bilingue français / anglais).
3. **Monorepo ou dépôts séparés** pour le frontend Next.js et l'API NestJS.
4. **Agrégateur de paiement** — CinetPay, Notch Pay ou PaySika : les frais et la
   couverture opérateur diffèrent sensiblement.
5. **Shadcn UI** — recommandé dans `project-modules.md` mais non installé ;
   les primitives actuelles sont faites main. Adopter Shadcn signifie installer
   ses dépendances et migrer l'existant, ou bien assumer l'approche sans dépendance.
6. **Portée du chiffrement de la messagerie** — chiffrement au repos côté serveur,
   ou chiffrement de bout en bout (qui interdirait toute modération du contenu).
7. **Application mobile** — le web responsive suffit-il au lancement, sachant que
   plus de 70 % du trafic attendu est mobile ?

---

## Ordre de réalisation recommandé

Le numéro de module n'est pas l'ordre de développement. Séquence conseillée :

```
Phase 0-2  ✅  Fondations + vitrine
   ↓
Phase 3        Squelette des pages (supprime les liens morts)
   ↓
Phase 4        Socle backend
   ↓
Phase 5        Auth (module 1) ─────── prérequis de tout le reste
   ↓
Phase 6        Appels d'offres (module 4) ─── la boucle de valeur
   ↓
Phase 7        Annuaire & espace avocat (module 2)
   ↓
Phase 8        Messagerie (module 5) ── rend la mise en relation exploitable
   ↓
Phase 9-10     Marketplace (module 3) + Paiements (module 6) ── monétisation
   ↓
Phase 11-14    Modération, preuve sociale, notifications, back-office
   ↓
Phase 15       Durcissement et lancement
```

Un produit minimum viable démontrable s'arrête à la **phase 8** : un citoyen
dépose un besoin anonyme, des avocats vérifiés répondent, l'échange se poursuit
en messagerie sécurisée. La monétisation (phases 9-10) vient ensuite.
