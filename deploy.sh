#!/bin/bash

##############################################################
# Script de déploiement pour norm_paie sur VPS OVH
# Usage: ./deploy.sh [ENV_FILE]
##############################################################

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENV_FILE="${1:-.env.production}"
COMPOSE_FILE="docker-compose.yml"

##############################################################
# Fonctions utilitaires
##############################################################

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Vérification des prérequis..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé. Installez-le avec: curl -fsSL https://get.docker.com | sh"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose n'est pas installé."
        exit 1
    fi

    log_info "✓ Docker et Docker Compose sont installés"
}

check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Fichier d'environnement '$ENV_FILE' introuvable!"
        log_info "Créez-le en copiant .env.example: cp .env.example $ENV_FILE"
        exit 1
    fi

    log_info "✓ Fichier d'environnement trouvé: $ENV_FILE"
}

validate_env_vars() {
    log_info "Validation des variables d'environnement..."

    source "$ENV_FILE"

    REQUIRED_VARS=(
        "DATABASE_URL"
        "NEXTAUTH_SECRET"
        "NEXTAUTH_URL"
    )

    MISSING_VARS=()
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            MISSING_VARS+=("$var")
        fi
    done

    if [ ${#MISSING_VARS[@]} -ne 0 ]; then
        log_error "Variables manquantes dans $ENV_FILE:"
        for var in "${MISSING_VARS[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi

    log_info "✓ Variables d'environnement validées"
}

build_images() {
    log_info "Construction des images Docker..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache
    log_info "✓ Images construites"
}

stop_containers() {
    log_info "Arrêt des conteneurs existants..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
    log_info "✓ Conteneurs arrêtés"
}

start_containers() {
    log_info "Démarrage des conteneurs..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    log_info "✓ Conteneurs démarrés"
}

wait_for_services() {
    log_info "Attente de la disponibilité des services..."

    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps | grep -q "healthy"; then
            log_info "✓ Services opérationnels"
            return 0
        fi

        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done

    log_warn "Timeout lors de l'attente des services"
}

run_migrations() {
    log_info "Exécution des migrations Prisma..."

    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T app npx prisma migrate deploy || {
        log_error "Échec des migrations"
        exit 1
    }

    log_info "✓ Migrations appliquées"
}

seed_database() {
    log_info "Voulez-vous charger les données initiales? (y/n)"
    read -r response

    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        log_info "Chargement des données initiales..."

        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T app npx tsx prisma/seed-parametres-fiscaux.ts
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T app npx tsx prisma/seed-bareme-indemnites.ts
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T app npx tsx prisma/seed-bareme-quotient-familial.ts
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T app npx tsx prisma/seed-constantes-legales.ts

        log_info "✓ Données initiales chargées"
    else
        log_info "Données initiales ignorées"
    fi
}

show_status() {
    log_info "État des conteneurs:"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

    echo ""
    log_info "Logs de l'application (dernières 20 lignes):"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs --tail=20 app

    echo ""
    log_info "================================"
    log_info "Déploiement terminé avec succès!"
    log_info "================================"
    echo ""
    log_info "Application disponible sur: ${NEXTAUTH_URL:-http://localhost:3000}"
    echo ""
    log_info "Commandes utiles:"
    echo "  - Voir les logs:       docker-compose logs -f app"
    echo "  - Arrêter:             docker-compose down"
    echo "  - Redémarrer:          docker-compose restart app"
    echo "  - Entrer dans le shell: docker-compose exec app sh"
}

##############################################################
# Programme principal
##############################################################

main() {
    log_info "==================================="
    log_info "Déploiement de norm_paie"
    log_info "==================================="
    echo ""

    check_requirements
    check_env_file
    validate_env_vars

    log_info "Démarrage du déploiement avec $ENV_FILE"

    stop_containers
    build_images
    start_containers
    wait_for_services
    run_migrations
    seed_database
    show_status
}

# Exécuter le script
main "$@"
