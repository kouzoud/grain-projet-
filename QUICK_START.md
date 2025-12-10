# 🚀 DÉPLOIEMENT RAPIDE - Link2Act sur VPS

## ⚡ Quick Start (2 commandes)

```bash
# 1. Validation
chmod +x *.sh && ./validate-docker.sh

# 2. Déploiement
./deploy.sh
```

---

## 📋 Checklist Pré-Déploiement

### Sur le VPS :

- [ ] PostgreSQL installé et actif
  ```bash
  sudo systemctl status postgresql
  ```

- [ ] Base de données créée
  ```bash
  sudo -u postgres psql -c "CREATE DATABASE solidedb;"
  sudo -u postgres psql -d solidedb -c "CREATE EXTENSION postgis;"
  ```

- [ ] Docker & Docker Compose installés
  ```bash
  docker --version
  docker-compose --version
  ```

- [ ] Dossiers uploads créés (ou seront créés par le script)
  ```bash
  sudo mkdir -p /var/www/solidarlink/back/uploads
  sudo chown -R 1000:1000 /var/www/solidarlink/back
  ```

---

## 🎯 Commandes Essentielles

### Déploiement
```bash
./deploy.sh                          # Déploiement automatique complet
docker-compose up -d --build         # Build et démarrage
docker-compose down                  # Arrêt complet
```

### Monitoring
```bash
docker-compose ps                    # Status des conteneurs
docker-compose logs -f               # Logs en temps réel
docker-compose logs -f backend       # Logs backend seul
docker stats                         # Utilisation ressources
```

### Debug
```bash
# Entrer dans le backend
docker exec -it Link2Act-backend sh

# Vérifier PostgreSQL
psql -U postgres -d solidedb -c "SELECT 1;"

# Test health backend
curl http://localhost:8080/actuator/health

# Test frontend
curl http://localhost:3000
```

### Maintenance
```bash
# Rebuild complet
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Redémarrer un service
docker-compose restart backend

# Voir les volumes
docker volume ls

# Nettoyer (⚠️ ATTENTION aux volumes)
docker system prune -a
```

---

## 🔧 Résolution Problèmes Courants

### Backend ne démarre pas

**Erreur** : `Connection refused localhost:5432`

✅ **Solution** :
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

**Erreur** : `Permission denied /app/uploads`

✅ **Solution** :
```bash
sudo chown -R 1000:1000 /var/www/solidarlink/back/uploads
sudo chmod -R 755 /var/www/solidarlink/back/uploads
```

---

### Frontend 404 sur refresh

✅ **Solution** : Déjà configuré dans `frontend/nginx.conf` :
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

### Base de données inaccessible

✅ **Vérifications** :
```bash
# PostgreSQL actif ?
sudo systemctl status postgresql

# Base existe ?
sudo -u postgres psql -l | grep solidedb

# PostGIS installé ?
sudo -u postgres psql -d solidedb -c "SELECT PostGIS_version();"
```

---

## 📊 Ports Utilisés

| Service    | Port  | Protocole | Accessible |
|------------|-------|-----------|------------|
| PostgreSQL | 5432  | TCP       | localhost  |
| Backend    | 8080  | HTTP      | localhost  |
| Frontend   | 3000  | HTTP      | public     |

---

## 🔐 Sécurité Production

### Firewall (UFW)
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### SSL avec Certbot
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d link2act.cloud
```

### Reverse Proxy Nginx
```nginx
# /etc/nginx/sites-available/link2act
server {
    listen 80;
    server_name link2act.cloud;
    
    location / {
        proxy_pass http://localhost:3000;
    }
    
    location /api {
        proxy_pass http://localhost:8080;
    }
}
```

---

## 📈 Monitoring

### Logs Backend (Spring Boot)
```bash
# Logs Docker
docker-compose logs -f backend

# Logs fichier
tail -f back/logs/spring.log
```

### Métriques (Actuator)
```bash
curl http://localhost:8080/actuator/health    # Health
curl http://localhost:8080/actuator/metrics   # Metrics
curl http://localhost:8080/actuator/info      # Info
```

---

## 🔄 Mise à Jour Application

```bash
# 1. Pull nouveau code
git pull origin main

# 2. Rebuild
docker-compose build --no-cache

# 3. Redémarrage sans downtime
docker-compose up -d --force-recreate

# 4. Vérifier
docker-compose ps
docker-compose logs -f
```

---

## 💾 Backup PostgreSQL

### Manuel
```bash
# Export
pg_dump -U postgres solidedb > backup_$(date +%Y%m%d).sql

# Import
psql -U postgres solidedb < backup_20251210.sql
```

### Automatique (Cron)
```bash
# Editer crontab
crontab -e

# Ajouter (backup daily à 2h du matin)
0 2 * * * pg_dump -U postgres solidedb > /backups/solidedb_$(date +\%Y\%m\%d).sql
```

---

## 📞 URLs de Vérification

| Service                | URL                                    |
|------------------------|----------------------------------------|
| Frontend               | http://localhost:3000                  |
| Backend API            | http://localhost:8080                  |
| Backend Health         | http://localhost:8080/actuator/health  |
| Backend Metrics        | http://localhost:8080/actuator/metrics |
| PostgreSQL             | localhost:5432                         |

---

## ✅ Validation Post-Déploiement

```bash
# 1. Tous les conteneurs UP
docker-compose ps

# 2. Backend healthy
curl http://localhost:8080/actuator/health | grep UP

# 3. Frontend accessible
curl -I http://localhost:3000 | grep 200

# 4. PostgreSQL répond
psql -U postgres -d solidedb -c "SELECT 1;"

# 5. Uploads writable
docker exec Link2Act-backend sh -c "touch /app/uploads/test.txt && rm /app/uploads/test.txt"
```

Si tous les tests passent : **✅ DÉPLOIEMENT RÉUSSI !**

---

**Dernière mise à jour** : Décembre 2025  
**Équipe** : DevOps Link2Act
