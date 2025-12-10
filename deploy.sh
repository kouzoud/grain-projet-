#!/bin/bash

# ==========================================
# Script de déploiement Link2Act sur VPS
# ==========================================

set -e  # Arrêt en cas d'erreur

echo "🚀 Déploiement de Link2Act sur VPS..."

# Couleurs pour les logs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ==========================================
# 1. Vérifications préliminaires
# ==========================================
echo -e "${BLUE}📋 Vérification des prérequis...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    exit 1
fi

# Vérifier PostgreSQL natif
if ! sudo systemctl is-active --quiet postgresql; then
    echo -e "${RED}❌ PostgreSQL n'est pas actif${NC}"
    echo "Démarrage de PostgreSQL..."
    sudo systemctl start postgresql
fi

echo -e "${GREEN}✅ Prérequis validés${NC}"

# ==========================================
# 2. Créer les dossiers nécessaires
# ==========================================
echo -e "${BLUE}📁 Création des dossiers uploads et logs...${NC}"

sudo mkdir -p /var/www/solidarlink/back/uploads
sudo mkdir -p /var/www/solidarlink/back/logs

# Donner les bonnes permissions (1000:1000 = utilisateur spring dans le conteneur)
sudo chown -R 1000:1000 /var/www/solidarlink/back/uploads
sudo chown -R 1000:1000 /var/www/solidarlink/back/logs
sudo chmod -R 755 /var/www/solidarlink/back

echo -e "${GREEN}✅ Dossiers créés${NC}"

# ==========================================
# 3. Charger les variables d'environnement
# ==========================================
if [ -f .env.production ]; then
    echo -e "${BLUE}📝 Chargement de .env.production...${NC}"
    export $(cat .env.production | grep -v '^#' | xargs)
else
    echo -e "${RED}⚠️  Fichier .env.production non trouvé, utilisation des valeurs par défaut${NC}"
fi

# ==========================================
# 4. Arrêter les anciens conteneurs
# ==========================================
echo -e "${BLUE}🛑 Arrêt des anciens conteneurs...${NC}"
docker-compose down || true

# ==========================================
# 5. Build et lancement
# ==========================================
echo -e "${BLUE}🔨 Build des images Docker...${NC}"
docker-compose build --no-cache

echo -e "${BLUE}🚀 Démarrage des conteneurs...${NC}"
docker-compose up -d

# ==========================================
# 6. Vérification des logs
# ==========================================
echo -e "${BLUE}📊 Vérification du démarrage...${NC}"
sleep 5

echo -e "${BLUE}Backend logs:${NC}"
docker-compose logs --tail=20 backend

echo -e "${BLUE}Frontend logs:${NC}"
docker-compose logs --tail=20 frontend

# ==========================================
# 7. Test de santé
# ==========================================
echo -e "${BLUE}🏥 Tests de santé...${NC}"

# Attendre que le backend soit prêt
echo "Attente du backend (max 60s)..."
for i in {1..60}; do
    if curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend opérationnel${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Vérifier le frontend
if curl -sf http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend opérationnel${NC}"
else
    echo -e "${RED}⚠️  Frontend non accessible${NC}"
fi

# ==========================================
# 8. Résumé
# ==========================================
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Déploiement terminé !${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📌 Services accessibles :${NC}"
echo "   🔹 Backend API : http://localhost:8080"
echo "   🔹 Frontend    : http://localhost:3000"
echo "   🔹 PostgreSQL  : localhost:5432 (natif)"
echo ""
echo -e "${BLUE}📋 Commandes utiles :${NC}"
echo "   • Voir les logs        : docker-compose logs -f"
echo "   • Redémarrer           : docker-compose restart"
echo "   • Arrêter              : docker-compose down"
echo "   • Status               : docker-compose ps"
echo ""
echo -e "${BLUE}📁 Dossiers persistants :${NC}"
echo "   • Uploads : /var/www/solidarlink/back/uploads"
echo "   • Logs    : /var/www/solidarlink/back/logs"
echo ""
