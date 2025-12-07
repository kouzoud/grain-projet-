-- Script SQL Simple pour vérifier et valider un compte
-- Copiez-collez ces commandes dans votre client PostgreSQL (pgAdmin, DBeaver, etc.)

-- 1. Vérifier l'état actuel de votre compte
SELECT 
    id, 
    nom, 
    prenom, 
    email, 
    role, 
    is_validated AS "Validé?", 
    is_banned AS "Banni?",
    created_at AS "Date création"
FROM _user
WHERE email = 'kouzoud@gmail.com';

-- 2. VALIDER votre compte (exécutez cette commande)
UPDATE _user
SET is_validated = true
WHERE email = 'kouzoud@gmail.com';

-- 3. Vérifier à nouveau après validation
SELECT 
    id, 
    nom, 
    prenom, 
    email, 
    role, 
    is_validated AS "Validé?", 
    is_banned AS "Banni?"
FROM _user
WHERE email = 'kouzoud@gmail.com';

-- 4. Si vous voulez voir TOUS les comptes non validés
SELECT 
    id, 
    email, 
    nom, 
    prenom, 
    role, 
    is_validated,
    created_at
FROM _user
WHERE is_validated = false
ORDER BY created_at DESC;
