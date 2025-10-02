#!/bin/bash

# Script de vérification de la migration console.log → Winston
# Version: 1.0.0

echo "=================================================="
echo "🔍 Vérification Migration Logging NORM_PAIE"
echo "=================================================="
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Compteurs
TOTAL_CONSOLE=0
MIGRATED=0
REMAINING=0

echo "1️⃣  Fichiers déjà migrés avec Winston..."
echo "----------------------------------------"

# Vérifier les fichiers migrés
MIGRATED_FILES=(
    "src/lib/auth.ts"
    "src/app/api/auth/register/route.ts"
    "src/hooks/useEmployeeForm.ts"
)

for file in "${MIGRATED_FILES[@]}"; do
    if [ -f "$file" ]; then
        if grep -q "import.*logger" "$file" 2>/dev/null; then
            echo -e "${GREEN}✅ $file - Winston importé${NC}"
            ((MIGRATED++))
        else
            echo -e "${YELLOW}⚠️  $file - Import Winston manquant${NC}"
        fi

        CONSOLE_COUNT=$(grep -c "console\." "$file" 2>/dev/null || echo 0)
        if [ "$CONSOLE_COUNT" -eq 0 ]; then
            echo -e "${GREEN}   ✓ Aucun console.log restant${NC}"
        else
            echo -e "${YELLOW}   ! $CONSOLE_COUNT console.log restants${NC}"
        fi
    else
        echo -e "${RED}❌ $file - Fichier non trouvé${NC}"
    fi
    echo ""
done

echo ""
echo "2️⃣  Console.log restants dans le projet..."
echo "----------------------------------------"

# Rechercher tous les console.log restants
echo "Recherche des console.log dans src/..."
CONSOLE_FILES=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "console\." 2>/dev/null)

if [ -z "$CONSOLE_FILES" ]; then
    echo -e "${GREEN}✅ Aucun console.log trouvé !${NC}"
else
    echo -e "${YELLOW}Console.log trouvés dans:${NC}"
    echo "$CONSOLE_FILES" | while read file; do
        if [ -n "$file" ]; then
            COUNT=$(grep -c "console\." "$file" 2>/dev/null || echo 0)
            echo -e "${YELLOW}  📄 $file ($COUNT occurrences)${NC}"
            ((REMAINING++))
            ((TOTAL_CONSOLE += COUNT))
        fi
    done
fi

echo ""
echo "3️⃣  Vérification Winston..."
echo "----------------------------------------"

# Vérifier si Winston fonctionne
if [ -f "src/lib/logger.ts" ]; then
    echo -e "${GREEN}✅ Winston configuré (src/lib/logger.ts)${NC}"

    # Vérifier les logs existants
    if [ -d "logs" ]; then
        LOG_COUNT=$(ls logs/*.log 2>/dev/null | wc -l)
        if [ "$LOG_COUNT" -gt 0 ]; then
            echo -e "${GREEN}✅ Logs actifs ($LOG_COUNT fichiers dans logs/)${NC}"
            echo "   Derniers logs:"
            ls -la logs/*.log 2>/dev/null | tail -3 | while read line; do
                echo "   $line"
            done
        else
            echo -e "${YELLOW}⚠️  Aucun fichier de log trouvé${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Dossier logs/ non trouvé${NC}"
    fi
else
    echo -e "${RED}❌ Winston non configuré${NC}"
fi

echo ""
echo "4️⃣  Analyse des types..."
echo "----------------------------------------"

# Vérifier les bonnes pratiques de typage
echo "Vérification des patterns de typage..."

# Rechercher les "as Error" dangereux
AS_ERROR_COUNT=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "as Error" 2>/dev/null | awk -F: '{sum += $2} END {print sum+0}')
if [ "$AS_ERROR_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✅ Aucun casting 'as Error' dangereux${NC}"
else
    echo -e "${YELLOW}⚠️  $AS_ERROR_COUNT casting 'as Error' trouvés${NC}"
fi

# Rechercher les instanceof Error appropriés
INSTANCEOF_COUNT=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -c "instanceof Error" 2>/dev/null | awk -F: '{sum += $2} END {print sum+0}')
if [ "$INSTANCEOF_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ $INSTANCEOF_COUNT vérifications 'instanceof Error' trouvées${NC}"
else
    echo -e "${YELLOW}⚠️  Aucune vérification 'instanceof Error' trouvée${NC}"
fi

echo ""
echo "5️⃣  Test de compilation..."
echo "----------------------------------------"

# Tester la compilation
echo "Test de compilation TypeScript..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Compilation réussie${NC}"
else
    echo -e "${RED}❌ Erreurs de compilation${NC}"
    echo "Exécutez 'npm run build' pour voir les détails"
fi

echo ""
echo "======================================"
echo "📊 RÉSUMÉ DE MIGRATION"
echo "======================================"

# Calculer les statistiques
TOTAL_FILES=$(find src -name "*.ts" -o -name "*.tsx" | wc -l)
REMAINING_FILES=$(echo "$CONSOLE_FILES" | grep -c "." 2>/dev/null || echo 0)
MIGRATED_PERCENT=0

if [ "$TOTAL_FILES" -gt 0 ]; then
    MIGRATED_PERCENT=$(( (MIGRATED * 100) / (MIGRATED + REMAINING_FILES) ))
fi

echo -e "📈 Progression: ${BLUE}$MIGRATED fichiers migrés${NC} / ${YELLOW}$REMAINING_FILES restants${NC}"
echo -e "📊 Avancement: ${BLUE}${MIGRATED_PERCENT}%${NC}"

if [ "$REMAINING_FILES" -eq 0 ]; then
    echo -e "${GREEN}🎉 MIGRATION COMPLÈTE !${NC}"
    echo ""
    echo "Toutes les migrations sont terminées ✅"
    echo "Winston est maintenant utilisé partout"
elif [ "$MIGRATED" -gt 0 ]; then
    echo -e "${YELLOW}🔄 MIGRATION EN COURS${NC}"
    echo ""
    echo "Prochaines étapes:"
    echo "1. Continuer la migration des fichiers restants"
    echo "2. Suivre le guide: GUIDE_MIGRATION_LOGGING.md"
    echo "3. Tester les logs avec: tail -f logs/application-\$(date +%Y-%m-%d).log"
else
    echo -e "${RED}🚨 MIGRATION À DÉMARRER${NC}"
    echo ""
    echo "Consultez GUIDE_MIGRATION_LOGGING.md pour commencer"
fi

echo ""
echo "Pour plus de détails, consultez GUIDE_MIGRATION_LOGGING.md"
echo ""

# Code de sortie basé sur l'état
if [ "$REMAINING_FILES" -eq 0 ]; then
    exit 0
elif [ "$MIGRATED" -gt 0 ]; then
    exit 1
else
    exit 2
fi