# 🚀 Guide de Déploiement - norm_paie sur VPS OVH

Guide complet pour déployer l'application norm_paie sur un VPS OVH en production.

---

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Préparation du VPS](#préparation-du-vps)
3. [Configuration de l'environnement](#configuration-de-lenvironnement)
4. [Déploiement avec Docker](#déploiement-avec-docker)
5. [Configuration SSL/TLS](#configuration-ssltls)
6. [Monitoring et Maintenance](#monitoring-et-maintenance)
7. [Dépannage](#dépannage)

---

## 1. Prérequis

### Sur votre machine locale

- Git configuré avec accès au repository
- Accès SSH au VPS OVH

### Sur le VPS OVH

- **OS**: Ubuntu 22.04 LTS ou Debian 12 (recommandé)
- **RAM**: Minimum 2 GB (4 GB recommandé)
- **Disque**: Minimum 20 GB
- **Accès**: Root ou sudo
- **Domaine**: Nom de domaine pointant vers le VPS (optionnel mais recommandé)

---

## 2. Préparation du VPS

### 2.1 Connexion au VPS

```bash
ssh root@VOTRE_IP_VPS
```

### 2.2 Mise à jour du système

```bash
apt update && apt upgrade -y
```

### 2.3 Installation de Docker

```bash
# Installation de Docker
curl -fsSL https://get.docker.com | sh

# Démarrer Docker
systemctl start docker
systemctl enable docker

# Vérifier l'installation
docker --version
```

### 2.4 Installation de Docker Compose

```bash
# Télécharger Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Rendre exécutable
chmod +x /usr/local/bin/docker-compose

# Vérifier
docker-compose --version
```

### 2.5 Configuration du pare-feu (UFW)

```bash
# Installer UFW si nécessaire
apt install ufw -y

# Autoriser SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Activer le pare-feu
ufw enable

# Vérifier le statut
ufw status
```

### 2.6 Créer un utilisateur dédié (recommandé)

```bash
# Créer l'utilisateur
adduser norm_paie

# Ajouter aux groupes docker et sudo
usermod -aG docker,sudo norm_paie

# Passer à cet utilisateur
su - norm_paie
```

---

## 3. Configuration de l'environnement

### 3.1 Cloner le repository

```bash
cd ~
git clone git@github.com:normx-ai/congo-payroll-system.git norm_paie
cd norm_paie
```

### 3.2 Créer le fichier .env.production

```bash
cp .env.example .env.production
nano .env.production
```

**Configurez les variables suivantes:**

```env
# Database
POSTGRES_USER=norm_paie
POSTGRES_PASSWORD=VOTRE_MOT_DE_PASSE_SUPER_FORT_ICI  # Générer avec: openssl rand -hex 32
POSTGRES_DB=norm_paie_db
DATABASE_URL="postgresql://norm_paie:VOTRE_MOT_DE_PASSE@postgres:5432/norm_paie_db"

# Auth
NEXTAUTH_SECRET="VOTRE_SECRET_ICI"  # Générer avec: openssl rand -base64 32
NEXTAUTH_URL="https://votre-domaine.com"  # Ou http://VOTRE_IP:3000 si pas de domaine

# Redis
REDIS_PASSWORD=VOTRE_PASSWORD_REDIS  # Optionnel mais recommandé

# Multi-tenant
ENABLE_MULTI_TENANT=true

# Node
NODE_ENV=production
```

**🔐 Génération des secrets:**

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# POSTGRES_PASSWORD
openssl rand -hex 32

# REDIS_PASSWORD
openssl rand -hex 16
```

### 3.3 Créer les dossiers persistants

```bash
mkdir -p uploads logs public/uploads
chmod 755 uploads logs public/uploads
```

---

## 4. Déploiement avec Docker

### 4.1 Option A: Déploiement automatique (recommandé)

```bash
# Rendre le script exécutable
chmod +x deploy.sh

# Lancer le déploiement
./deploy.sh .env.production
```

Le script va:
- ✅ Vérifier les prérequis
- ✅ Construire les images Docker
- ✅ Démarrer PostgreSQL, Redis et l'application
- ✅ Exécuter les migrations Prisma
- ✅ Charger les données initiales (si demandé)

### 4.2 Option B: Déploiement manuel

```bash
# Construire les images
docker-compose --env-file .env.production build --no-cache

# Démarrer les services
docker-compose --env-file .env.production up -d

# Attendre que PostgreSQL démarre (30 secondes)
sleep 30

# Exécuter les migrations
docker-compose --env-file .env.production exec app npx prisma migrate deploy

# Générer le client Prisma
docker-compose --env-file .env.production exec app npx prisma generate

# Charger les données initiales
docker-compose --env-file .env.production exec app npx tsx prisma/seed-parametres-fiscaux.ts
docker-compose --env-file .env.production exec app npx tsx prisma/seed-bareme-indemnites.ts
docker-compose --env-file .env.production exec app npx tsx prisma/seed-bareme-quotient-familial.ts
docker-compose --env-file .env.production exec app npx tsx prisma/seed-constantes-legales.ts
```

### 4.3 Vérifier le déploiement

```bash
# Voir les conteneurs
docker-compose ps

# Voir les logs
docker-compose logs -f app

# Tester l'API
curl http://localhost:3000/api/health
```

---

## 5. Configuration SSL/TLS

### 5.1 Avec nginx et Let's Encrypt (recommandé)

#### Installer Certbot

```bash
apt install certbot python3-certbot-nginx -y
```

#### Modifier nginx.conf

```bash
nano nginx.conf
```

Remplacez `server_name _;` par votre domaine:

```nginx
server_name votre-domaine.com www.votre-domaine.com;
```

#### Créer le dossier SSL

```bash
mkdir -p ssl
```

#### Obtenir le certificat SSL

```bash
certbot certonly --standalone -d votre-domaine.com -d www.votre-domaine.com
```

#### Copier les certificats

```bash
cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem ssl/
cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem ssl/
```

#### Décommenter les lignes SSL dans nginx.conf

```nginx
ssl_certificate /etc/nginx/ssl/fullchain.pem;
ssl_certificate_key /etc/nginx/ssl/privkey.pem;
```

#### Démarrer nginx

```bash
# Démarrer avec le profil nginx
docker-compose --env-file .env.production --profile with-nginx up -d

# Ou sans Docker Compose:
docker run -d \
  --name norm_paie_nginx \
  --network norm_paie_norm_paie_network \
  -p 80:80 -p 443:443 \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
  -v $(pwd)/ssl:/etc/nginx/ssl:ro \
  nginx:alpine
```

#### Renouvellement automatique

```bash
# Ajouter un cron job
crontab -e

# Ajouter cette ligne (renouvellement tous les jours à 3h du matin)
0 3 * * * certbot renew --quiet && cp /etc/letsencrypt/live/votre-domaine.com/*.pem /home/norm_paie/norm_paie/ssl/ && docker restart norm_paie_nginx
```

---

## 6. Monitoring et Maintenance

### 6.1 Commandes utiles

```bash
# Voir les logs en temps réel
docker-compose logs -f app

# Redémarrer l'application
docker-compose restart app

# Arrêter tous les services
docker-compose down

# Voir l'utilisation des ressources
docker stats

# Entrer dans le conteneur
docker-compose exec app sh

# Exécuter les migrations
docker-compose exec app npx prisma migrate deploy

# Backup de la base de données
docker-compose exec postgres pg_dump -U norm_paie norm_paie_db > backup_$(date +%Y%m%d).sql
```

### 6.2 Sauvegarde automatique

Créer un script de backup:

```bash
nano /home/norm_paie/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/norm_paie/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker-compose -f /home/norm_paie/norm_paie/docker-compose.yml exec -T postgres \
  pg_dump -U norm_paie norm_paie_db | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /home/norm_paie/norm_paie/uploads

# Supprimer les backups de plus de 30 jours
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup terminé: $DATE"
```

```bash
chmod +x /home/norm_paie/backup.sh

# Ajouter au cron (tous les jours à 2h)
crontab -e
0 2 * * * /home/norm_paie/backup.sh >> /home/norm_paie/backup.log 2>&1
```

### 6.3 Mise à jour de l'application

```bash
# Arrêter les conteneurs
docker-compose down

# Récupérer les dernières modifications
git pull origin main

# Reconstruire et redémarrer
docker-compose --env-file .env.production build --no-cache
docker-compose --env-file .env.production up -d

# Exécuter les nouvelles migrations si nécessaire
docker-compose exec app npx prisma migrate deploy
```

---

## 7. Dépannage

### Problème: L'application ne démarre pas

```bash
# Vérifier les logs
docker-compose logs app

# Vérifier que PostgreSQL est prêt
docker-compose exec postgres pg_isready -U norm_paie
```

### Problème: Erreur de connexion à la base de données

```bash
# Vérifier la DATABASE_URL dans .env.production
cat .env.production | grep DATABASE_URL

# Tester la connexion
docker-compose exec app npx prisma db pull
```

### Problème: Puppeteer ne génère pas les PDF

```bash
# Vérifier que Chromium est installé
docker-compose exec app which chromium-browser

# Voir les logs Puppeteer
docker-compose logs app | grep -i puppeteer
```

### Problème: Port 3000 déjà utilisé

```bash
# Voir ce qui utilise le port
lsof -i :3000

# Ou changer le port dans docker-compose.yml
ports:
  - "8000:3000"  # Utiliser le port 8000 à la place
```

### Problème: Espace disque insuffisant

```bash
# Nettoyer les images Docker non utilisées
docker system prune -a

# Voir l'utilisation du disque
df -h
du -sh /var/lib/docker
```

---

## 📞 Support

- **Documentation**: Voir les fichiers `docs/` dans le repository
- **Issues GitHub**: https://github.com/normx-ai/congo-payroll-system/issues
- **Logs**: Consultez `logs/application-*.log` pour les détails

---

## ✅ Checklist finale

Avant de déclarer le déploiement terminé:

- [ ] Application accessible sur `https://votre-domaine.com`
- [ ] Base de données initialisée avec les données de base
- [ ] SSL/TLS configuré et fonctionnel
- [ ] Backups automatiques configurés
- [ ] Certificat SSL se renouvelle automatiquement
- [ ] Monitoring en place (logs accessibles)
- [ ] Pare-feu configuré (UFW)
- [ ] Variables d'environnement sécurisées
- [ ] Premier utilisateur admin créé
- [ ] Tests de génération de PDF réussis

---

**Version**: 1.0
**Dernière MAJ**: 2025-10-07
