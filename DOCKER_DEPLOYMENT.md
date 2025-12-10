# 🐳 Guide de Déploiement Docker - Link2Act

## 📋 Prérequis VPS

### Services natifs requis :
- ✅ **PostgreSQL 14+** avec extension PostGIS (déjà installé sur le VPS)
- ✅ **Docker** 20.10+
- ✅ **Docker Compose** 2.0+

### Ports utilisés :
- `5432` : PostgreSQL (natif)
- `8080` : Backend Spring Boot (Docker avec network_mode: host)
- `3000` : Frontend React (Docker)

---

## 🚀 Déploiement Rapide

### Option 1 : Script automatique (Recommandé)

```bash
# Rendre le script exécutable
chmod +x deploy.sh

# Lancer le déploiement
./deploy.sh
```

### Option 2 : Déploiement manuel

```bash
# 1. Créer les dossiers nécessaires
sudo mkdir -p /var/www/solidarlink/back/uploads
sudo mkdir -p /var/www/solidarlink/back/logs
sudo chown -R 1000:1000 /var/www/solidarlink/back
sudo chmod -R 755 /var/www/solidarlink/back

# 2. Build des images
docker-compose build --no-cache

# 3. Lancer les conteneurs
docker-compose up -d

# 4. Vérifier les logs
docker-compose logs -f
```

---

## 📐 Architecture Docker

### Backend (Mode Host)
```
┌─────────────────────────────────────┐
│   Container: Link2Act-backend       │
│   Network: host                     │
│   Port: 8080 (directement sur host) │
│                                     │
│   Volumes:                          │
│   • /var/www/.../uploads → /app/uploads
│   • ./back/logs → /app/logs        │
└─────────────────────────────────────┘
           ↓
    localhost:5432
           ↓
┌─────────────────────────────────────┐
│   PostgreSQL (NATIF sur VPS)        │
│   Database: solidedb                │
│   User: postgres                    │
└─────────────────────────────────────┘
```

### Frontend (Mode Bridge)
```
┌─────────────────────────────────────┐
│   Container: Link2Act-frontend      │
│   Network: Link2Act-network         │
│   Port: 3000:80                     │
│   Nginx serving React SPA           │
└─────────────────────────────────────┘
```

---

## 🔧 Configuration

### Variables d'environnement (`.env.production`)

Les variables sensibles sont dans `.env.production` :
- Credentials PostgreSQL
- Secrets JWT
- Configuration SMTP
- URLs frontend/backend

**⚠️ Important** : Ne jamais commiter `.env.production` dans Git !

---

## 📊 Commandes utiles

### Gestion des conteneurs
```bash
# Voir le status
docker-compose ps

# Voir les logs en temps réel
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend

# Redémarrer un service
docker-compose restart backend

# Arrêter tout
docker-compose down

# Rebuild complet
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Debug
```bash
# Entrer dans le conteneur backend
docker exec -it Link2Act-backend sh

# Vérifier la connexion PostgreSQL depuis le conteneur
docker exec -it Link2Act-backend sh -c "wget -qO- localhost:8080/actuator/health"

# Vérifier les fichiers uploads
ls -la /var/www/solidarlink/back/uploads

# Permissions uploads
sudo chown -R 1000:1000 /var/www/solidarlink/back/uploads
```

### Monitoring
```bash
# Utilisation ressources
docker stats

# Health check backend
curl http://localhost:8080/actuator/health

# Health check frontend
curl http://localhost:3000
```

---

## 🐛 Troubleshooting

### Backend ne démarre pas

**Problème** : `Connection refused to localhost:5432`

**Solution** :
```bash
# Vérifier PostgreSQL natif
sudo systemctl status postgresql
sudo systemctl start postgresql

# Vérifier que PostgreSQL écoute sur localhost
sudo netstat -tlnp | grep 5432
```

**Problème** : `Permission denied on /app/uploads`

**Solution** :
```bash
sudo chown -R 1000:1000 /var/www/solidarlink/back/uploads
sudo chmod -R 755 /var/www/solidarlink/back/uploads
```

### Frontend 404 sur refresh

**Cause** : Nginx ne redirige pas vers `index.html`

**Solution** : Vérifier `frontend/nginx.conf` contient :
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Uploads non persistants

**Cause** : Volume mal configuré

**Solution** : Vérifier dans `docker-compose.yml` :
```yaml
volumes:
  - /var/www/solidarlink/back/uploads:/app/uploads
```

---

## 🔐 Sécurité

### Bonnes pratiques appliquées :

✅ Multi-stage builds (réduction surface d'attaque)  
✅ Images Alpine (légères et sécurisées)  
✅ Utilisateur non-root dans les conteneurs  
✅ Healthchecks configurés  
✅ Restart policy `unless-stopped`  
✅ Secrets dans `.env.production` (hors Git)  

### Recommandations supplémentaires :

🔹 Utiliser **Nginx Reverse Proxy** avec SSL (Certbot)  
🔹 Configurer **UFW firewall** :
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

🔹 Mettre en place des **backups PostgreSQL** :
```bash
# Backup manuel
pg_dump -U postgres solidedb > backup_$(date +%Y%m%d).sql

# Backup automatique (crontab)
0 2 * * * pg_dump -U postgres solidedb > /backups/solidedb_$(date +\%Y\%m\%d).sql
```

---

## 📈 Monitoring Production

### Logs centralisés
```bash
# Rediriger vers fichiers
docker-compose logs -f > /var/log/Link2Act/docker.log

# Utiliser journalctl
journalctl -u docker.service -f
```

### Métriques Spring Boot Actuator
```bash
# Health
curl http://localhost:8080/actuator/health

# Metrics
curl http://localhost:8080/actuator/metrics

# Info
curl http://localhost:8080/actuator/info
```

---

## 🔄 Mise à jour

```bash
# 1. Pull du nouveau code
git pull origin main

# 2. Rebuild
docker-compose build --no-cache

# 3. Redémarrage sans downtime (recreate)
docker-compose up -d --force-recreate

# 4. Vérifier
docker-compose ps
docker-compose logs -f
```

---

## 📞 Support

En cas de problème :
1. Vérifier les logs : `docker-compose logs -f`
2. Vérifier le health : `curl localhost:8080/actuator/health`
3. Consulter ce README
4. Contacter l'équipe DevOps

---

**Dernière mise à jour** : Décembre 2025  
**Version Docker Compose** : 3.8  
**Version Backend** : Spring Boot 3.2 / Java 17  
**Version Frontend** : React 18 / Vite 5
