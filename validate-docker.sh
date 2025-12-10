#!/bin/bash

# ==========================================
# Script de validation de la configuration Docker
# ==========================================

echo "🔍 Validation de la configuration Docker Link2Act"
echo "=================================================="

ERRORS=0
WARNINGS=0

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        return 0
    else
        echo -e "${RED}❌${NC} $1 (MANQUANT)"
        ((ERRORS++))
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $1/"
        return 0
    else
        echo -e "${YELLOW}⚠️${NC}  $1/ (sera créé au déploiement)"
        ((WARNINGS++))
        return 1
    fi
}

check_command() {
    if command -v "$1" &> /dev/null; then
        VERSION=$($1 --version 2>&1 | head -n1)
        echo -e "${GREEN}✅${NC} $1 ($VERSION)"
        return 0
    else
        echo -e "${RED}❌${NC} $1 (NON INSTALLÉ)"
        ((ERRORS++))
        return 1
    fi
}

echo ""
echo -e "${BLUE}📋 Fichiers Docker requis${NC}"
echo "─────────────────────────────"
check_file "docker-compose.yml"
check_file "back/Dockerfile"
check_file "frontend/Dockerfile"
check_file "frontend/nginx.conf"
check_file ".env.production"
check_file "deploy.sh"

echo ""
echo -e "${BLUE}📁 Structure de dossiers${NC}"
echo "─────────────────────────────"
check_dir "back/src"
check_dir "back/target"
check_dir "frontend/src"
check_dir "frontend/dist"
check_dir "/var/www/solidarlink/back/uploads"
check_dir "/var/www/solidarlink/back/logs"

echo ""
echo -e "${BLUE}🛠️  Outils système${NC}"
echo "─────────────────────────────"
check_command "docker"
check_command "docker-compose"
check_command "psql"

echo ""
echo -e "${BLUE}🔍 Validation PostgreSQL natif${NC}"
echo "─────────────────────────────"

if systemctl is-active --quiet postgresql 2>/dev/null; then
    echo -e "${GREEN}✅${NC} PostgreSQL actif"
    
    # Test connexion
    if psql -U postgres -d solidedb -c "SELECT 1" > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC} Base de données 'solidedb' accessible"
    else
        echo -e "${RED}❌${NC} Base de données 'solidedb' non accessible"
        echo -e "${YELLOW}   Créer avec: sudo -u postgres psql -c 'CREATE DATABASE solidedb;'${NC}"
        ((ERRORS++))
    fi
    
    # Vérifier extension PostGIS
    if psql -U postgres -d solidedb -c "SELECT PostGIS_version();" > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC} Extension PostGIS installée"
    else
        echo -e "${YELLOW}⚠️${NC}  Extension PostGIS non détectée"
        echo -e "${YELLOW}   Installer avec: sudo -u postgres psql -d solidedb -c 'CREATE EXTENSION postgis;'${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}❌${NC} PostgreSQL non actif"
    echo -e "${YELLOW}   Démarrer avec: sudo systemctl start postgresql${NC}"
    ((ERRORS++))
fi

echo ""
echo -e "${BLUE}🔍 Validation docker-compose.yml${NC}"
echo "─────────────────────────────"

if grep -q "network_mode.*host" docker-compose.yml; then
    echo -e "${GREEN}✅${NC} Backend utilise network_mode: host"
else
    echo -e "${RED}❌${NC} Backend ne utilise PAS network_mode: host"
    ((ERRORS++))
fi

if grep -q "localhost:5432" docker-compose.yml; then
    echo -e "${GREEN}✅${NC} Backend pointe vers localhost:5432"
else
    echo -e "${RED}❌${NC} Backend ne pointe PAS vers localhost:5432"
    ((ERRORS++))
fi

if grep -q "/var/www/solidarlink/back/uploads" docker-compose.yml; then
    echo -e "${GREEN}✅${NC} Volume uploads correctement configuré"
else
    echo -e "${YELLOW}⚠️${NC}  Volume uploads utilise un chemin relatif"
    ((WARNINGS++))
fi

echo ""
echo -e "${BLUE}🔍 Validation Dockerfile Backend${NC}"
echo "─────────────────────────────"

if grep -q "maven.*eclipse-temurin.*AS builder" back/Dockerfile; then
    echo -e "${GREEN}✅${NC} Multi-stage build configuré"
else
    echo -e "${RED}❌${NC} Multi-stage build manquant"
    ((ERRORS++))
fi

if grep -q "mkdir.*uploads" back/Dockerfile; then
    echo -e "${GREEN}✅${NC} Dossier uploads créé dans l'image"
else
    echo -e "${RED}❌${NC} Dossier uploads non créé"
    ((ERRORS++))
fi

if grep -q "chown.*spring.*uploads" back/Dockerfile; then
    echo -e "${GREEN}✅${NC} Permissions uploads configurées"
else
    echo -e "${RED}❌${NC} Permissions uploads manquantes"
    ((ERRORS++))
fi

echo ""
echo -e "${BLUE}🔍 Validation Dockerfile Frontend${NC}"
echo "─────────────────────────────"

if grep -q "node.*AS builder" frontend/Dockerfile; then
    echo -e "${GREEN}✅${NC} Multi-stage build configuré"
else
    echo -e "${RED}❌${NC} Multi-stage build manquant"
    ((ERRORS++))
fi

if grep -q "nginx.*alpine" frontend/Dockerfile; then
    echo -e "${GREEN}✅${NC} Image Nginx Alpine utilisée"
else
    echo -e "${RED}❌${NC} Image Nginx non optimale"
    ((WARNINGS++))
fi

if grep -q "COPY.*nginx.conf" frontend/Dockerfile; then
    echo -e "${GREEN}✅${NC} Configuration Nginx personnalisée"
else
    echo -e "${RED}❌${NC} Configuration Nginx manquante"
    ((ERRORS++))
fi

echo ""
echo -e "${BLUE}🔍 Validation nginx.conf${NC}"
echo "─────────────────────────────"

if grep -q "try_files.*index.html" frontend/nginx.conf; then
    echo -e "${GREEN}✅${NC} SPA routing configuré (try_files)"
else
    echo -e "${RED}❌${NC} SPA routing manquant (404 sur refresh)"
    ((ERRORS++))
fi

if grep -q "gzip.*on" frontend/nginx.conf; then
    echo -e "${GREEN}✅${NC} Compression Gzip activée"
else
    echo -e "${YELLOW}⚠️${NC}  Compression Gzip non configurée"
    ((WARNINGS++))
fi

echo ""
echo "=================================================="
echo -e "${BLUE}📊 RÉSUMÉ${NC}"
echo "=================================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Configuration parfaite ! Prêt pour docker-compose up --build${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS avertissement(s) - Déploiement possible mais non optimal${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS erreur(s) critique(s) - Corriger avant déploiement${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS avertissement(s)${NC}"
    fi
    exit 1
fi
