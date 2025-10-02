# 🌍 Architecture Internationalization (i18n)

**Bibliothèque**: `next-intl` v4.3.9
**Langues supportées**: Français (fr) - défaut, English (en)
**Date**: 2025-09-30

---

## 📁 Structure des Fichiers

```
.
├── src/
│   ├── i18n/
│   │   └── request.ts              # Configuration next-intl
│   ├── components/
│   │   └── LanguageSwitcher.tsx    # Sélecteur de langue
│   └── app/
│       └── api/
│           └── locale/
│               └── route.ts         # API changement langue
├── messages/
│   ├── fr.json                      # Traductions françaises
│   └── en.json                      # Traductions anglaises
└── next.config.ts                   # Config Next.js avec plugin i18n
```

---

## ⚙️ Configuration

### 1. Installation
```bash
npm install next-intl
```

### 2. next.config.ts
```typescript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // ... config
};

export default withNextIntl(nextConfig);
```

### 3. src/i18n/request.ts
```typescript
import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export const locales = ['fr', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'fr'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const locale = (cookieStore.get('NEXT_LOCALE')?.value as Locale) || defaultLocale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  }
})
```

---

## 📝 Fichiers de Traduction

### Structure JSON hiérarchique

**messages/fr.json**:
```json
{
  "common": {
    "save": "Enregistrer",
    "cancel": "Annuler",
    "loading": "Chargement..."
  },
  "parameters": {
    "title": "Paramètres",
    "fiscal": {
      "cnss": "Caisse Nationale de Sécurité Sociale",
      "cnss_description": "Cotisation sociale obligatoire"
    }
  }
}
```

**messages/en.json**:
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "loading": "Loading..."
  },
  "parameters": {
    "title": "Settings",
    "fiscal": {
      "cnss": "National Social Security Fund",
      "cnss_description": "Mandatory social contribution"
    }
  }
}
```

---

## 🎨 Utilisation dans les Composants

### Composant Client ('use client')
```typescript
'use client'

import { useTranslations } from 'next-intl'

export function MyComponent() {
  const t = useTranslations('parameters.fiscal')

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('cnss_description')}</p>
    </div>
  )
}
```

### Composant Serveur (Server Component)
```typescript
import { useTranslations } from 'next-intl'

export default function MyPage() {
  const t = useTranslations('parameters')

  return <h1>{t('title')}</h1>
}
```

### Traductions avec Variables
```typescript
// messages/fr.json
{
  "welcome": "Bonjour {name}, vous avez {count} messages"
}

// Component
const t = useTranslations('common')
t('welcome', { name: 'Jean', count: 5 })
// → "Bonjour Jean, vous avez 5 messages"
```

### Pluralisation
```typescript
// messages/fr.json
{
  "items": "{count, plural, =0 {Aucun élément} =1 {Un élément} other {# éléments}}"
}

// Component
t('items', { count: 0 })  // → "Aucun élément"
t('items', { count: 1 })  // → "Un élément"
t('items', { count: 5 })  // → "5 éléments"
```

---

## 🔄 Changement de Langue

### Composant LanguageSwitcher

**src/components/LanguageSwitcher.tsx**:
```typescript
'use client'

import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'

export function LanguageSwitcher() {
  const locale = useLocale()

  const changeLanguage = async (newLocale: string) => {
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: newLocale })
    })
    window.location.reload()
  }

  return (
    <Button onClick={() => changeLanguage('en')}>
      {locale === 'fr' ? '🇬🇧 English' : '🇫🇷 Français'}
    </Button>
  )
}
```

### API Route

**src/app/api/locale/route.ts**:
```typescript
export async function POST(req: NextRequest) {
  const { locale } = await req.json()

  const cookieStore = await cookies()
  cookieStore.set('NEXT_LOCALE', locale, {
    maxAge: 365 * 24 * 60 * 60, // 1 an
    path: '/',
    sameSite: 'lax'
  })

  return NextResponse.json({ success: true })
}
```

---

## 🗂️ Organisation des Traductions

### Convention de Nommage
- **Clés**: `snake_case` ou `camelCase` cohérent
- **Espaces de noms**: Hiérarchie par domaine fonctionnel

### Structure Recommandée
```json
{
  "common": {},           // Éléments communs (boutons, actions)
  "parameters": {},       // Page paramètres
  "employees": {},        // Page employés
  "payroll": {},          // Page paie
  "errors": {},           // Messages d'erreur
  "validation": {}        // Messages de validation
}
```

---

## 📊 Traductions Créées

### Domaines couverts dans messages/fr.json et messages/en.json:

1. **common** - Actions communes (save, cancel, delete, etc.)
2. **parameters** - Page paramètres complète:
   - Titres et sous-titres
   - Onglets (rubriques, exercices, départements, etc.)
   - **fiscal** - Paramètres fiscaux (CNSS, CAMU, TUS, IRPP)
   - **irpp** - Barème IRPP (tranches, taux)
   - **quotient** - Quotient familial (situations, enfants)
   - **indemnites** - Barèmes indemnités (types, unités)
   - **legales** - Constantes légales (types, unités)
3. **errors** - Messages d'erreur standardisés

---

## 🎯 Migration des Composants Existants

### Étapes pour migrer un composant:

1. **Importer useTranslations**:
```typescript
import { useTranslations } from 'next-intl'
```

2. **Initialiser dans le composant**:
```typescript
const t = useTranslations('parameters.fiscal')
```

3. **Remplacer les strings hardcodés**:
```typescript
// Avant
<h2>Paramètres Fiscaux</h2>

// Après
<h2>{t('title')}</h2>
```

4. **Ajouter les traductions dans messages/*.json**

### Exemple: PayrollConstants.tsx (avant migration)
```typescript
<h2 className="text-2xl">Paramètres Fiscaux</h2>
<p>Taux et paramètres fiscaux Congo</p>
```

### Après migration:
```typescript
const t = useTranslations('parameters.fiscal')

<h2 className="text-2xl">{t('title')}</h2>
<p>{t('subtitle')}</p>
```

---

## 🔍 Bonnes Pratiques

### 1. Cohérence
- Utiliser toujours les mêmes clés pour les actions communes
- Préférer `common.save` à `parameters.save`, `employees.save`, etc.

### 2. Contexte
- Inclure suffisamment de contexte dans les clés
- `parameters.fiscal.cnss` plutôt que `cnss`

### 3. Descriptions
- Ajouter des descriptions pour les éléments techniques
- `cnss_description` en plus de `cnss`

### 4. Variables
- Utiliser des variables pour les valeurs dynamiques
- `"welcome {name}"` plutôt que concaténer

### 5. Pluralisation
- Utiliser ICU MessageFormat pour les pluriels
- `{count, plural, ...}`

### 6. Dates et Nombres
```typescript
// Utiliser les formatters next-intl
import { useFormatter } from 'next-intl'

const format = useFormatter()
format.dateTime(new Date(), { dateStyle: 'long' })
format.number(1234.56, { style: 'currency', currency: 'XAF' })
```

---

## 🚀 Prochaines Étapes

### Court terme
1. ✅ Infrastructure i18n en place
2. ⏳ Migrer composants paramètres (PayrollConstants, IrppBareme, etc.)
3. ⏳ Ajouter LanguageSwitcher dans Header
4. ⏳ Tester changement de langue

### Moyen terme
1. Migrer tous les composants UI
2. Ajouter traductions pour erreurs API
3. Traductions des emails/notifications
4. Documentation utilisateur multilingue

### Long terme
1. Ajouter plus de langues (es, pt, etc.)
2. Interface d'administration des traductions
3. Traductions dynamiques en base de données
4. Pluralisation avancée par langue

---

## 🛠️ Commandes Utiles

### Vérifier clés manquantes
```bash
# Comparer fr.json et en.json
diff <(jq -S . messages/fr.json) <(jq -S . messages/en.json)
```

### Extraire toutes les clés utilisées
```bash
# Rechercher useTranslations dans le code
grep -r "useTranslations" src/ | grep -o "'[^']*'" | sort -u
```

### Valider JSON
```bash
npx jsonlint messages/fr.json
npx jsonlint messages/en.json
```

---

## 📚 Ressources

- **Documentation next-intl**: https://next-intl-docs.vercel.app/
- **ICU MessageFormat**: https://unicode-org.github.io/icu/userguide/format_parse/messages/
- **Exemples**: https://github.com/amannn/next-intl/tree/main/examples

---

## ✅ Checklist de Migration i18n

### Infrastructure ✅
- [x] Installer next-intl
- [x] Configurer next.config.ts
- [x] Créer src/i18n/request.ts
- [x] Créer messages/fr.json
- [x] Créer messages/en.json
- [x] Créer LanguageSwitcher component
- [x] Créer API /api/locale

### Traductions Initiales ✅
- [x] common (actions, états)
- [x] parameters (page complète)
- [x] parameters.fiscal
- [x] parameters.irpp
- [x] parameters.quotient
- [x] parameters.indemnites
- [x] parameters.legales
- [x] errors

### Migration Composants ⏳
- [ ] PayrollConstants.tsx
- [ ] IrppBareme.tsx
- [ ] BaremeIndemnites.tsx
- [ ] QuotientFamilial.tsx
- [ ] ConstantesLegales.tsx
- [ ] Header.tsx (ajouter LanguageSwitcher)
- [ ] Sidebar.tsx
- [ ] Autres composants UI

### Tests ⏳
- [ ] Test changement de langue
- [ ] Test persistence cookie
- [ ] Test fallback fr par défaut
- [ ] Test tous les composants migrés

---

**Statut**: Infrastructure i18n ✅ COMPLÉTÉE
**Prêt pour**: Migration progressive des composants UI
**Date**: 2025-09-30
