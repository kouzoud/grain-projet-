# Placez vos certificats SSL ici :
# - fullchain.pem (certificat + chaîne)
# - privkey.pem (clé privée)

# Pour générer des certificats auto-signés (développement uniquement) :
# openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
#   -keyout privkey.pem -out fullchain.pem \
#   -subj "/C=MA/ST=Casablanca/L=Casablanca/O=SolidarLink/CN=localhost"
