# Récapitulatif des Cotisations - Système de Paie Congo

**Date:** 2025-10-01

---

## 📊 Cotisations Salariales (Retenues sur salaire)

| Code | Libellé DB | Formule | Taux | Base |
|------|------------|---------|------|------|
| **3100** | Retenue CNSS | `MIN(brutSocial, 1200000) * 0.04` | 4% | Plafonné 1 200 000 |
| **3510** | Retenue IRPP du mois | Barème progressif | Variable | Salaire imposable |
| **3540** | Retenue CAMU | `MAX(0, (brutSocial - CNSS_salarié - 500000) * 0.005)` | 0.5% | Excédent > 500 000 |
| **3550** | Taxe sur les locaux (local) | Montant fixe | - | 1 000 FCFA |
| **3560** | Taxe sur les locaux (Expat) | Montant fixe | - | 5 000 FCFA |
| **3570** | Taxe régionale | Montant fixe | - | 2 400 FCFA |

---

## 💼 Cotisations Patronales (Charges employeur)

| Code | Libellé DB | Formule | Taux | Base | Organisme |
|------|------------|---------|------|------|-----------|
| **CNSS** | Part employeur CNSS | `MIN(brutSocial, 1200000) * 0.08` | 8% | Plafonné 1 200 000 | CNSS |
| **3110** | SS - Allocations familiales | `MIN(brutSocial, 600000) * 0.1003` | 10.03% | Plafonné 600 000 | Sécurité Sociale |
| **3120** | SS - Accident de travail | `MIN(brutSocial, 600000) * 0.0225` | 2.25% | Plafonné 600 000 | Sécurité Sociale |
| **3130** | SS - Taxe unique sur salaire | `brutSocial * 0.03375` | 3.375% | Salaire brut | **Sécurité Sociale** |
| **3530** | Taxe unique sur salaire | `brutSocial * 0.04125` | 4.125% | Salaire brut | **Administration Fiscale** |

---

## 🔍 Détails Importants

### CNSS (3100)
- **Total CNSS** = 12% (4% salarié + 8% employeur)
- **Plafond** : 1 200 000 FCFA
- **Base de calcul** : MIN(salaire brut, 1 200 000)

### CAMU (3540)
- **Type** : Cotisation SALARIALE uniquement (❌ PAS employeur)
- **Taux** : 0.5%
- **Formule** :
  ```
  cotisations_cnss_salarié = MIN(brutSocial, 1200000) * 0.04
  base_camu = MAX(0, brutSocial - cotisations_cnss_salarié - 500000)
  CAMU = base_camu * 0.005
  ```

### Taxes Uniques sur Salaire (Double taxation PATRONALE)
Il existe **DEUX taxes uniques PATRONALES** versées à des organismes différents :

1. **3130 : SS - Taxe unique sur salaire** (PATRONALE → Sécurité Sociale)
   - Taux : 3.375%
   - Charge employeur
   - Base : Salaire brut
   - Organisme : **Sécurité Sociale**

2. **3530 : Taxe unique sur salaire** (PATRONALE → Administration Fiscale)
   - Taux : 4.125%
   - Charge employeur
   - Base : Salaire brut
   - Organisme : **Administration Fiscale**

**Total TUS = 3.375% + 4.125% = 7.5% (charge employeur uniquement)**

⚠️ **Note importante** : Il n'y a PAS de "TUS Patronale" séparée. Les deux taxes ci-dessus (3130 et 3530) sont TOUTES LES DEUX patronales.

### Taxes sur les Locaux (SALARIALES - Montants fixes)
Ces taxes sont des **retenues salariales à montant fixe** :

1. **3550 : Taxe sur les locaux (local)** = 1 000 FCFA (fixe)
2. **3560 : Taxe sur les locaux (Expat)** = 5 000 FCFA (fixe)
3. **3570 : Taxe régionale** = 2 400 FCFA (fixe)

### Allocations Familiales (3110)
- **Type** : Cotisation PATRONALE uniquement
- **Taux** : 10.03%
- **Plafond** : 600 000 FCFA
- **Base de calcul** : MIN(salaire brut, 600 000)

### Accidents de Travail (3120)
- **Type** : Cotisation PATRONALE uniquement
- **Taux** : 2.25%
- **Plafond** : 600 000 FCFA
- **Base de calcul** : MIN(salaire brut, 600 000)

### IRPP (3510)
- **Type** : Retenue SALARIALE
- **Calcul** : Barème progressif par tranches
- **Base** : Salaire imposable (brut fiscal)

### Total des Charges Patronales
- **CNSS employeur** : 8%
- **Allocations familiales** : 10.03%
- **Accidents de travail** : 2.25%
- **SS - Taxe unique** : 3.375%
- **TUS** : 4.125%
- **TOTAL** : **27.765%** du salaire brut (avec plafonds appliqués)

---

## 📝 Paramètres Fiscaux en DB

Les taux sont configurables via la table `fiscal_parameters` :

| Code Paramètre | Valeur | Description |
|----------------|--------|-------------|
| CNSS_EMPLOYE | 4 | Part salariale CNSS (%) |
| CNSS_EMPLOYEUR | 8 | Part patronale CNSS (%) |
| CNSS_PLAFOND | 1200000 | Plafond CNSS (FCFA) |
| ALLOC_FAM_TAUX | 10.03 | Allocations familiales (%) |
| ALLOC_FAM_PLAFOND | 600000 | Plafond allocations (FCFA) |
| ACCIDENT_TRAVAIL_TAUX | 2.25 | Accidents de travail (%) |
| ACCIDENT_TRAVAIL_PLAFOND | 600000 | Plafond accidents (FCFA) |
| TAXE_UNIQUE_TAUX | 3.375 | SS - Taxe unique patronale (%) |
| TUS_TAUX | 4.125 | Taxe unique salariale (%) |
| CAMU_TAUX | 0.5 | CAMU (%) |
| CAMU_SEUIL | 500000 | Seuil CAMU (FCFA) |

---

## ✅ Corrections Effectuées

### Avant (Erreurs du serveur)
- ❌ CAMU en charge employeur → **FAUX** (c'est salarié uniquement)
- ❌ Allocations familiales 7% → **FAUX** (c'est 10.03%)
- ❌ Accidents de travail 2% → **FAUX** (c'est 2.25%)
- ❌ Taxe unique 1.2% → **FAUX** (c'est 3.375% + 4.125%)
- ❌ Pas de plafonds appliqués → **FAUX** (600k et 1.2M de plafonds)

### Après (Correct - Source DB)
- ✅ CAMU = Retenue salariale uniquement (0.5% sur excédent > 500k)
- ✅ Allocations familiales = 10.03% employeur (plafonné 600k)
- ✅ Accidents de travail = 2.25% employeur (plafonné 600k)
- ✅ Taxes uniques = **2 taxes patronales distinctes** :
  - SS - Taxe unique : 3.375% → Sécurité Sociale
  - TUS : 4.125% → Administration Fiscale
- ✅ Tous les plafonds correctement appliqués

---

## 🧮 Exemple de Calcul

**Salaire brut : 1 500 000 FCFA**

### Cotisations Salariales
```
CNSS salarié     = MIN(1500000, 1200000) * 0.04    = 48 000 FCFA
IRPP             = (selon barème)                  = 150 000 FCFA (exemple)
CAMU             = MAX(0, (1500000 - 48000 - 500000)) * 0.005 = 4 760 FCFA
Taxes locales    = 1000 FCFA (local)

TOTAL RETENUES   = 203 760 FCFA
```

### Charges Patronales
```
CNSS employeur   = MIN(1500000, 1200000) * 0.08    = 96 000 FCFA
Alloc. familiales= MIN(1500000, 600000) * 0.1003   = 60 180 FCFA
Accidents travail= MIN(1500000, 600000) * 0.0225   = 13 500 FCFA
SS - Taxe unique = 1500000 * 0.03375               = 50 625 FCFA
TUS              = 1500000 * 0.04125               = 61 875 FCFA

TOTAL CHARGES    = 282 180 FCFA
```

### Résultat
```
Brut             = 1 500 000 FCFA
- Retenues       =  -203 760 FCFA
NET À PAYER      = 1 296 240 FCFA

Coût employeur   = 1 500 000 + 282 180 = 1 782 180 FCFA
```

---

**Auteur:** Claude Code
**Dernière mise à jour:** 2025-10-01
