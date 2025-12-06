# ==========================================
# Guide de déploiement sur Render.com
# ==========================================

Ce guide vous aide à déployer SolidarLink sur Render.com étape par étape.

---

## 📋 Prérequis

1. **Compte Render.com** : https://render.com (gratuit)
2. **Repository GitHub** : Votre code doit être sur GitHub
3. **Pusher les fichiers Docker** : Assurez-vous que tous les Dockerfiles sont dans le repo

---

## 🚀 Étape 1 : Pousser le code sur GitHub

```powershell
# Ajouter les nouveaux fichiers Docker
git add render.yaml postgres/Dockerfile.render

# Commit
git commit -m "Add Render.com deployment configuration"

# Push
git push origin main
```

---

## 🗄️ Étape 2 : Créer la base de données PostgreSQL

1. Allez sur https://dashboard.render.com
2. Cliquez sur **"New +"** → **"PostgreSQL"**
3. Remplissez le formulaire :

### Configuration Base de Données

| Champ | Valeur à remplir |
|-------|------------------|
| **Name** | `solidarlink-db` |
| **Database** | `solidarlink` |
| **User** | `postgres` |
| **Region** | `Frankfurt (EU Central)` ou proche de vous |
| **PostgreSQL Version** | `16` |
| **Instance Type** | **Free** (512 MB RAM) |

4. Cliquez sur **"Create Database"**
5. **Attendez 2-3 minutes** que la base soit créée
6. **IMPORTANT** : Notez ces informations (onglet "Info") :
   - **Internal Database URL** (pour le backend)
   - **External Database URL** (pour connexion locale)

7. **Activer PostGIS** :
   - Allez dans l'onglet **"Console"** (Shell)
   - Connectez-vous à la base :
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS postgis_topology;
   SELECT PostGIS_version();
   ```

---

## ⚙️ Étape 3 : Déployer le Backend Spring Boot

1. Cliquez sur **"New +"** → **"Web Service"**
2. Connectez votre repository GitHub
3. Remplissez le formulaire :

### Configuration Backend (formulaire que vous montrez)

| Champ | Valeur à remplir |
|-------|------------------|
| **Name** | `solidarlink-backend` (ou `Link2Act`) |
| **Project** | `My project` |
| **Environment** | `Production` |
| **Language** | **Docker** |
| **Branch** | `main` |
| **Region** | `Virginia (US East)` ou `Frankfurt` |
| **Root Directory** | Laissez vide ou mettez `back` |
| **Dockerfile Path** | `./back/Dockerfile` |
| **Instance Type** | **Starter** ($7/mois) ou **Free** (limité) |

4. Cliquez sur **"Advanced"** et configurez les **Environment Variables** :

### Variables d'environnement Backend

Cliquez sur **"Add Environment Variable"** pour chaque ligne :

| Key | Value |
|-----|-------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://[INTERNAL_HOST]:5432/solidarlink` |
| `SPRING_DATASOURCE_USERNAME` | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | `[PASSWORD_FROM_DB]` |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` |
| `SERVER_PORT` | `8080` |
| `JAVA_OPTS` | `-Xmx512m -Xms256m` |
| `APPLICATION_SECURITY_JWT_SECRET_KEY` | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` |
| `APPLICATION_SECURITY_JWT_EXPIRATION` | `86400000` |
| `SPRING_MAIL_USERNAME` | `kouzoudmohemad@gmail.com` |
| `SPRING_MAIL_PASSWORD` | `wpad sggu ychg bfsi` |
| `APP_ADMIN_EMAIL` | `admin1@solidarlink.com` |
| `APP_ADMIN_PASSWORD` | `admin123` |
| `APP_MAIL_FROM_NAME` | `SolidarLink` |

**🔍 Comment récupérer l'URL de la base de données :**
- Allez dans votre base de données `solidarlink-db`
- Onglet **"Connect"** → **"Internal Database URL"**
- Copiez et remplacez `postgresql://` par `jdbc:postgresql://`
- Format : `jdbc:postgresql://dpg-xxxxx-a.frankfurt-postgres.render.com:5432/solidarlink`

5. **Health Check Path** : `/actuator/health`
6. Cliquez sur **"Create Web Service"**
7. Attendez 5-10 minutes pour le build et déploiement

---

## 🎨 Étape 4 : Déployer le Frontend React

1. Cliquez sur **"New +"** → **"Web Service"**
2. Connectez le même repository GitHub
3. Remplissez le formulaire :

### Configuration Frontend

| Champ | Valeur à remplir |
|-------|------------------|
| **Name** | `solidarlink-frontend` |
| **Project** | `My project` |
| **Environment** | `Production` |
| **Language** | **Docker** |
| **Branch** | `main` |
| **Region** | `Virginia (US East)` (même que backend) |
| **Root Directory** | Laissez vide ou `frontend` |
| **Dockerfile Path** | `./frontend/Dockerfile` |
| **Instance Type** | **Free** (512 MB RAM) |

4. **Environment Variables** :

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://solidarlink-backend.onrender.com` |

**🔍 Comment récupérer l'URL du backend :**
- Allez dans votre service backend
- Copiez l'URL en haut (ex: `https://solidarlink-backend.onrender.com`)
- Collez-la dans `VITE_API_URL`

5. Cliquez sur **"Create Web Service"**
6. Attendez 5-7 minutes pour le build

---

## ✅ Étape 5 : Vérification et tests

### Vérifier le Backend

1. Ouvrez : `https://solidarlink-backend.onrender.com/actuator/health`
2. Vous devriez voir : `{"status":"UP"}`

### Vérifier le Frontend

1. Ouvrez : `https://solidarlink-frontend.onrender.com`
2. Vous devriez voir la page d'accueil de SolidarLink

### Tester l'application

1. Créez un compte citoyen
2. Créez une demande d'aide
3. Vérifiez que les données sont sauvegardées (rechargez la page)

---

## 🐛 Dépannage

### Backend ne démarre pas

**Erreur : "Connection refused to database"**
- Vérifiez que `SPRING_DATASOURCE_URL` utilise l'**Internal Database URL**
- Format : `jdbc:postgresql://dpg-xxxxx-a:5432/solidarlink`
- Ne pas utiliser l'External URL (postgres:// au lieu de dpg-)

**Logs Backend :**
```bash
# Allez dans votre service backend → Onglet "Logs"
# Recherchez les erreurs
```

### Frontend ne se connecte pas au backend

**Erreur 404 ou CORS**
- Vérifiez que `VITE_API_URL` pointe vers le backend Render
- Format : `https://solidarlink-backend.onrender.com` (pas de `/` à la fin)
- Redéployez le frontend après modification

### Build trop long

**Free tier limitations**
- Le build peut prendre 10-15 minutes sur le plan gratuit
- Considérez le plan Starter ($7/mois) pour des builds plus rapides

### Service suspendu après 15 min

**Free tier sleep mode**
- Les services gratuits s'endorment après 15 min d'inactivité
- Première requête peut prendre 30-60 secondes
- Solution : Utiliser un plan payant ou un service de ping (UptimeRobot)

---

## 💰 Coûts estimés

| Service | Plan | Coût |
|---------|------|------|
| Base de données PostgreSQL | Free | $0/mois |
| Backend Spring Boot | Starter | $7/mois |
| Frontend React | Free | $0/mois |
| **TOTAL** | - | **$7/mois** |

**Alternative 100% gratuite :**
- Tous les services en Free : $0/mois
- Limitations : 
  - Services s'endorment après 15 min
  - 512 MB RAM par service
  - 750h/mois (suffisant pour 1 service)

---

## 🔗 URLs finales

Après déploiement, vous aurez :

- **Frontend** : `https://solidarlink-frontend.onrender.com`
- **Backend** : `https://solidarlink-backend.onrender.com`
- **Database** : `dpg-xxxxx-a.frankfurt-postgres.render.com:5432`

---

## 📝 Checklist finale

- [ ] Base de données créée avec PostGIS activé
- [ ] Backend déployé avec variables d'environnement configurées
- [ ] Frontend déployé avec VITE_API_URL correct
- [ ] Health check backend répond : `/actuator/health`
- [ ] Application accessible et fonctionnelle
- [ ] Connexion / Inscription fonctionne
- [ ] Création de cas fonctionne
- [ ] Données persistantes après rechargement

---

## 🎉 Félicitations !

Votre application SolidarLink est maintenant déployée sur Render.com !

**Prochaines étapes recommandées :**
1. Configurer un nom de domaine personnalisé
2. Activer SSL/TLS (automatique sur Render)
3. Configurer des alertes de monitoring
4. Mettre en place des backups automatiques de la base de données
5. Optimiser les performances (CDN, cache, etc.)

---

## 📞 Support

- Render Docs : https://render.com/docs
- Render Community : https://community.render.com
- Support SolidarLink : kouzoudmohemad@gmail.com
