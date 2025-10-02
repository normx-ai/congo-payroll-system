# 🧾 Norm Paie - Système de Paie Congo

Application de gestion de la paie conforme à la législation congolaise (Convention Collective Commerce).

---

## 🚀 Démarrage Rapide

### Installation

```bash
# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Initialiser la base de données
npx prisma migrate dev
npx prisma generate

# Charger les données initiales (60 entrées)
npx tsx prisma/seed-parametres-fiscaux.ts
npx tsx prisma/seed-bareme-irpp.ts
npx tsx prisma/seed-taux-heures-sup.ts
npx tsx prisma/seed-bareme-indemnites.ts
npx tsx prisma/seed-bareme-quotient-familial.ts
npx tsx prisma/seed-constantes-legales.ts

# Lancer le serveur
npm run dev
```

Application disponible sur **http://localhost:3000**

---

## ✨ Fonctionnalités

- ✅ **Gestion Employés** - Fiches complètes, contrats, historique
- ✅ **Calcul de Paie** - Bulletins conformes avec IRPP, CNSS, CAMU, TUS
- ✅ **Paramètres Configurables** - Administration complète via UI (9 onglets)
- ✅ **Multi-tenant** - Isolation par entreprise
- ✅ **Internationalisation** - FR/EN avec next-intl
- ✅ **Historisation** - Traçabilité complète des changements
- ✅ **Rapports** - Journal, états des charges, déclarations
- ✅ **Export PDF** - Bulletins et rapports professionnels

---

## 🗂️ Modules

### 1. Paramètres ✨ (9 onglets)
- Rubriques de Paie
- Exercices Fiscaux
- Départements
- **Paramètres Fiscaux** (CNSS, CAMU, TUS, IRPP)
- **Barème IRPP** (6 tranches progressives)
- **Quotient Familial** (24 configurations)
- **Barèmes Indemnités** (9 types)
- **Constantes Légales** (16 constantes)
- Entreprise

### 2. Employés
- Création et gestion fiches
- Historique salaires
- Allocations et charges fixes
- Documents

### 3. Paie
- Bulletins conformes
- Heures supplémentaires
- Primes et indemnités
- Calculs automatiques

### 4. Rapports
- Journal de paie
- État des charges
- Déclarations fiscales
- Export PDF/Excel

---

## 🌍 Langues

**Français** (défaut) et **English** supportés via next-intl.

Voir `docs/I18N_ARCHITECTURE.md` pour plus de détails.

---

## 📊 Données de Base (60 entrées)

### Paramètres Fiscaux (20)
- CNSS: 4%, CAMU: 0.5%, TUS: 7.5% (3.375% SS + 4.125%)
- IRPP abattement: 20%, Exonération: 15%, AF: 10.03%, AT: 2.25%

### Barème IRPP (4 tranches)
- 0-464K: 1%, 464K-1M: 10%, 1M-3M: 25%, 3M+: 40%

### Heures Supplémentaires (1)
Convention Collective Commerce: 140%-200%

### Barèmes Indemnités (9)
Retraite, Licenciement, Compression, Maternité, etc.

### Quotient Familial (24)
4 situations × 6 tranches enfants

### Constantes Légales (16)
Temps travail, congés, conversions, seuils

---

## 🛠️ Technologies

- **Next.js** 15.5.4 (App Router)
- **PostgreSQL** + Prisma ORM
- **NextAuth.js** - Authentification
- **next-intl** - i18n (FR/EN)
- **React** 19 + TailwindCSS
- **Puppeteer** - PDF

---

## 📚 Documentation

- **RAPPORT_FINAL_OPTIMISATION.md** - Synthèse complète
- **docs/I18N_ARCHITECTURE.md** - Guide i18n
- **docs/archives/** - Rapports historiques

---

## 📝 Conformité Légale

Respect de:
- Code du travail congolais
- Convention Collective Commerce Congo
- Code Général des Impôts (CGI)

Articles: 21-23 (indemnités), 27 (maternité), 34-36 (congés), 41 (ancienneté), 45 (prime), 91 (quotient familial)

---

## 🔐 Sécurité

Variables `.env`:
```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
ENABLE_MULTI_TENANT=true
```

---

**Version**: 2.0 | **Statut**: ✅ Production Ready | **Dernière MAJ**: 2025-09-30

