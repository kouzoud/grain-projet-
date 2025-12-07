# 🐳 Link2Act - Guide Docker

Ce guide explique comment démarrer Link2Act avec Docker en mode développement et production.

---

## 📋 Prérequis

- **Docker** : version 20.10 ou supérieure
- **Docker Compose** : version 2.0 ou supérieure
- **Git** : pour cloner le projet

Vérifier l'installation :
```bash
docker --version
docker-compose --version
```

---

## 🚀 Démarrage rapide

### Mode Développement (avec hot reload)

```bash
# 1. Copier le fichier d'exemple d'environnement
cp .env.example .env

# 2. Démarrer tous les services en mode dev
docker-compose -f docker-compose.dev.yml up --build

# 3. Accéder à l'application
# Frontend : http://localhost:5173
# Backend  : http://localhost:8080
# Database : localhost:5432
```

### Mode Production

```bash
# 1. Configurer les variables d'environnement
cp .env.example .env
# Éditez .env et changez les mots de passe

# 2. Construire et démarrer les services
docker-compose up --build -d

# 3. Accéder à l'application
# Application : http://localhost
# API         : http://localhost:8080
# Nginx Proxy : http://localhost:8888
```

---

## 🏗️ Architecture Docker

```
┌─────────────────────────────────────────────────────┐
│                  Nginx Reverse Proxy                │
│              (Port 80/443/8888)                     │
└──────────────────┬──────────────────────────────────┘
                   │
       ┌───────────┴───────────┐
       │                       │
┌──────▼──────┐      ┌─────────▼────────┐
│   Frontend  │      │     Backend      │
│  React+Vite │      │   Spring Boot    │
│  (Port 80)  │      │   (Port 8080)    │
└─────────────┘      └─────────┬────────┘
                               │
                     ┌─────────▼─────────┐
                     │    PostgreSQL     │
                     │     + PostGIS     │
                     │   (Port 5432)     │
                     └───────────────────┘
```

---

## 📦 Services Docker

### 1. **Database (PostgreSQL + PostGIS)**
- Image : `postgis/postgis:16-3.4-alpine`
- Port : `5432`
- Volume : `postgres_data` (données persistantes)
- Healthcheck : `pg_isready`

### 2. **Backend (Spring Boot)**
- Build : Multi-stage (Maven → JRE 17)
- Port : `8080`
- Depends on : `db`
- Volumes : `uploads/`, `logs/`
- Healthcheck : `/actuator/health`

### 3. **Frontend (React + Nginx)**
- Build : Multi-stage (Node 20 → Nginx)
- Port : `80` (production) / `5173` (dev)
- Depends on : `backend`
- Healthcheck : `wget`

### 4. **Nginx (Reverse Proxy)**
- Image : `nginx:1.25-alpine`
- Ports : `80`, `443`, `8888`
- Config : `nginx/nginx.conf`
- SSL/TLS : Support HTTPS (certificats requis)

---

## 🛠️ Commandes utiles

### Gestion des services

```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Redémarrer un service spécifique
docker-compose restart backend

# Voir les logs
docker-compose logs -f
docker-compose logs -f backend

# Reconstruire les images
docker-compose build --no-cache
```

### Inspection et débogage

```bash
# Voir l'état des conteneurs
docker-compose ps

# Accéder à un conteneur
docker exec -it Link2Act-backend sh
docker exec -it Link2Act-db psql -U postgres -d Link2Act

# Voir les ressources utilisées
docker stats

# Nettoyer les volumes et images inutilisés
docker system prune -a --volumes
```

### Base de données

```bash
# Se connecter à PostgreSQL
docker exec -it Link2Act-db psql -U postgres -d Link2Act

# Backup de la base
docker exec Link2Act-db pg_dump -U postgres Link2Act > backup.sql

# Restaurer un backup
docker exec -i Link2Act-db psql -U postgres Link2Act < backup.sql

# Vérifier PostGIS
docker exec -it Link2Act-db psql -U postgres -d Link2Act -c "SELECT PostGIS_version();"
```

---

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Database
DB_NAME=Link2Act
DB_USER=postgres
DB_PASSWORD=your_secure_password

# Backend
SPRING_PROFILES_ACTIVE=prod
JAVA_OPTS=-Xmx512m -Xms256m

# Frontend
VITE_API_URL=http://localhost:8080
```

### Ports exposés

| Service  | Dev Port | Prod Port | Description              |
|----------|----------|-----------|--------------------------|
| Frontend | 5173     | 80        | Interface React          |
| Backend  | 8080     | 8080      | API Spring Boot          |
| Database | 5432     | 5432      | PostgreSQL + PostGIS     |
| Nginx    | -        | 443/8888  | Reverse proxy SSL/HTTP   |

### Volumes persistants

- `postgres_data` : Données PostgreSQL (production)
- `postgres_dev_data` : Données PostgreSQL (dev)
- `maven_cache` : Cache Maven (dev)
- `./back/uploads` : Fichiers uploadés
- `./back/logs` : Logs Spring Boot

---

## 🔒 Sécurité (Production)

### 1. Certificats SSL/TLS

Générer des certificats auto-signés (dev) :
```bash
cd nginx/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout privkey.pem -out fullchain.pem \
  -subj "/C=MA/ST=Casablanca/L=Casablanca/O=Link2Act/CN=localhost"
```

Pour la production, utilisez **Let's Encrypt** :
```bash
# Installer Certbot
docker run -it --rm -v /etc/letsencrypt:/etc/letsencrypt \
  certbot/certbot certonly --standalone -d yourdomain.com
```

### 2. Mots de passe forts

Changez tous les mots de passe par défaut dans `.env` :
```bash
# Générer un mot de passe sécurisé
openssl rand -base64 32
```

### 3. Firewalls et limites

Le fichier `nginx.conf` inclut :
- Rate limiting : 10 requêtes/seconde par IP
- Security headers : HSTS, X-Frame-Options, etc.
- CORS configuré (à activer si nécessaire)

---

## 🐛 Dépannage

### Problème : Erreur de connexion à la base de données

```bash
# Vérifier que PostgreSQL est démarré
docker-compose ps db

# Vérifier les logs
docker-compose logs db

# Tester la connexion
docker exec -it Link2Act-db pg_isready -U postgres
```

### Problème : Frontend ne se connecte pas au backend

```bash
# Vérifier que le backend est accessible
curl http://localhost:8080/actuator/health

# Vérifier les variables d'environnement
docker exec Link2Act-frontend env | grep VITE_API_URL
```

### Problème : Erreur "port already in use"

```bash
# Trouver le processus utilisant le port 8080
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # Linux/Mac

# Arrêter le processus ou changer le port dans docker-compose.yml
```

### Problème : Builds très lents

```bash
# Utiliser le cache Docker
docker-compose build

# Si besoin, nettoyer et reconstruire
docker system prune -a
docker-compose build --no-cache
```

---

## 🚀 Déploiement

### CI/CD avec GitHub Actions

Exemple de workflow `.github/workflows/deploy.yml` :

```yaml
name: Deploy Docker

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and push images
        run: |
          docker-compose build
          docker-compose push
      
      - name: Deploy to production
        run: |
          ssh user@server 'cd /app && docker-compose pull && docker-compose up -d'
```

### Cloud Deployment

**Azure Container Instances** :
```bash
az container create \
  --resource-group Link2Act-rg \
  --name Link2Act \
  --image your-registry/Link2Act:latest \
  --ports 80 443
```

**AWS ECS / Fargate** :
```bash
aws ecs create-cluster --cluster-name Link2Act-cluster
aws ecs create-service --cluster Link2Act-cluster --service-name Link2Act
```

---

## 📚 Ressources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)
- [React Production Build](https://vitejs.dev/guide/build.html)
- [PostGIS Docker](https://registry.hub.docker.com/r/postgis/postgis/)

---

## 📝 Licence

Link2Act © 2024 - Tous droits réservés
