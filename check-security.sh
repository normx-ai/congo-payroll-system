#!/bin/bash

# Script de vérification de sécurité pour NORM_PAIE
# Version: 1.0.0

echo "======================================"
echo "🔐 Vérification de Sécurité NORM_PAIE"
echo "======================================"
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
ISSUES=0
WARNINGS=0

echo "1️⃣  Vérification des fichiers .env..."
echo "----------------------------------------"

# Vérifier si .env est dans Git
if git ls-files | grep -q "\.env$"; then
    echo -e "${RED}❌ CRITIQUE: Un fichier .env est tracké par Git!${NC}"
    git ls-files | grep "\.env$"
    ((ISSUES++))
else
    echo -e "${GREEN}✅ Aucun fichier .env n'est tracké par Git${NC}"
fi

# Vérifier la présence de .env dans .gitignore
if grep -q "^\.env" .gitignore 2>/dev/null || grep -q "^\.env" backend/.gitignore 2>/dev/null; then
    echo -e "${GREEN}✅ .env est dans .gitignore${NC}"
else
    echo -e "${YELLOW}⚠️  AVERTISSEMENT: .env devrait être dans .gitignore${NC}"
    ((WARNINGS++))
fi

# Vérifier si .env.example existe
if [ -f "backend/.env.example" ]; then
    echo -e "${GREEN}✅ .env.example existe${NC}"
else
    echo -e "${YELLOW}⚠️  AVERTISSEMENT: .env.example manquant${NC}"
    ((WARNINGS++))
fi

echo ""
echo "2️⃣  Recherche de secrets potentiels dans le code..."
echo "----------------------------------------"

# Rechercher des mots de passe hardcodés
HARDCODED_PASSWORDS=$(grep -r "password.*=.*['\"].*['\"]" --include="*.ts" --include="*.tsx" --include="*.js" --exclude-dir=node_modules --exclude-dir=.next --exclude="*.test.*" --exclude="*.spec.*" backend/src 2>/dev/null | grep -v "password.*:.*string" | wc -l)

if [ "$HARDCODED_PASSWORDS" -gt 0 ]; then
    echo -e "${RED}❌ CRITIQUE: $HARDCODED_PASSWORDS mot(s) de passe potentiel(s) trouvé(s) dans le code${NC}"
    echo "   Fichiers concernés:"
    grep -r "password.*=.*['\"].*['\"]" --include="*.ts" --include="*.tsx" --include="*.js" --exclude-dir=node_modules --exclude-dir=.next --exclude="*.test.*" --exclude="*.spec.*" backend/src 2>/dev/null | grep -v "password.*:.*string" | cut -d: -f1 | uniq | head -5
    ((ISSUES++))
else
    echo -e "${GREEN}✅ Aucun mot de passe hardcodé détecté${NC}"
fi

# Rechercher des clés API potentielles
API_KEYS=$(grep -r "api.*key.*=.*['\"]" --include="*.ts" --include="*.tsx" --include="*.js" --exclude-dir=node_modules --exclude-dir=.next backend/src 2>/dev/null | grep -v "process.env" | wc -l)

if [ "$API_KEYS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  AVERTISSEMENT: $API_KEYS clé(s) API potentielle(s) trouvée(s)${NC}"
    ((WARNINGS++))
else
    echo -e "${GREEN}✅ Aucune clé API hardcodée détectée${NC}"
fi

echo ""
echo "3️⃣  Vérification des console.log..."
echo "----------------------------------------"

# Compter les console.log
CONSOLE_LOGS=$(find backend/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "console\.\(log\|error\|warn\)" 2>/dev/null | wc -l)

if [ "$CONSOLE_LOGS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  AVERTISSEMENT: $CONSOLE_LOGS fichier(s) avec console.log${NC}"
    echo "   Considérez l'utilisation d'un système de logging approprié"
    ((WARNINGS++))
else
    echo -e "${GREEN}✅ Aucun console.log détecté${NC}"
fi

echo ""
echo "4️⃣  Vérification de l'historique Git..."
echo "----------------------------------------"

# Vérifier l'historique pour des .env committés
ENV_IN_HISTORY=$(git log --all --full-history -- "**/.env" 2>/dev/null | wc -l)

if [ "$ENV_IN_HISTORY" -gt 0 ]; then
    echo -e "${RED}❌ CRITIQUE: Des fichiers .env ont été trouvés dans l'historique Git${NC}"
    echo "   Considérez de nettoyer l'historique avec git-filter-branch ou BFG Repo-Cleaner"
    ((ISSUES++))
else
    echo -e "${GREEN}✅ Aucun .env dans l'historique Git${NC}"
fi

echo ""
echo "5️⃣  Vérification des permissions..."
echo "----------------------------------------"

# Vérifier les permissions du fichier .env
if [ -f "backend/.env" ]; then
    PERM=$(stat -c "%a" backend/.env 2>/dev/null || stat -f "%A" backend/.env 2>/dev/null)
    if [ "$PERM" = "644" ] || [ "$PERM" = "600" ]; then
        echo -e "${GREEN}✅ Permissions de .env correctes ($PERM)${NC}"
    else
        echo -e "${YELLOW}⚠️  AVERTISSEMENT: Permissions de .env trop permissives ($PERM)${NC}"
        echo "   Recommandé: chmod 600 backend/.env"
        ((WARNINGS++))
    fi
fi

echo ""
echo "======================================"
echo "📊 RÉSUMÉ"
echo "======================================"

if [ $ISSUES -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Aucun problème de sécurité détecté!${NC}"
elif [ $ISSUES -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS avertissement(s) détecté(s)${NC}"
    echo "   Vérifiez les points ci-dessus pour améliorer la sécurité"
else
    echo -e "${RED}❌ $ISSUES problème(s) critique(s) et $WARNINGS avertissement(s) détecté(s)${NC}"
    echo "   ACTION REQUISE: Corrigez les problèmes critiques immédiatement!"
fi

echo ""
echo "Pour plus de détails, consultez SECURITY_GUIDE.md"
echo ""

exit $ISSUES