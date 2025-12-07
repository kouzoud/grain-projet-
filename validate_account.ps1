# Script PowerShell pour valider un compte utilisateur Link2Act
# Utilisez ce script pour valider manuellement votre compte

Write-Host "🔧 Validation de compte Link2Act" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Configuration de la base de données
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "solidedb"
$DB_USER = "postgres"
$DB_PASSWORD = "Fadema@@imi@@"

# Email de l'utilisateur à valider
$USER_EMAIL = "kouzoud@gmail.com"  # Changez ceci si nécessaire

Write-Host "📧 Email à valider : $USER_EMAIL" -ForegroundColor Yellow
Write-Host ""

# Commande SQL pour valider l'utilisateur
$SQL_VALIDATE = "UPDATE _user SET is_validated = true WHERE email = '$USER_EMAIL';"
$SQL_CHECK = "SELECT id, nom, prenom, email, role, is_validated, is_banned FROM _user WHERE email = '$USER_EMAIL';"

Write-Host "🔍 Vérification de l'état actuel..." -ForegroundColor Cyan

# Afficher l'état actuel
$env:PGPASSWORD = $DB_PASSWORD
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $SQL_CHECK

Write-Host ""
Write-Host "✅ Validation du compte en cours..." -ForegroundColor Green

# Valider le compte
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $SQL_VALIDATE

Write-Host ""
Write-Host "🔍 Vérification après validation..." -ForegroundColor Cyan

# Vérifier après validation
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $SQL_CHECK

Write-Host ""
Write-Host "✅ Terminé ! Essayez de vous reconnecter." -ForegroundColor Green
Write-Host ""

# Nettoyer la variable d'environnement
Remove-Item Env:\PGPASSWORD
