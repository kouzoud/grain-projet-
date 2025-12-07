-- Script SQL pour diagnostiquer et valider un utilisateur
-- Utilisez ce script dans votre client PostgreSQL

-- 1. Vérifier l'état d'un utilisateur par email
SELECT id, nom, prenom, email, role, is_validated, is_banned, created_at
FROM _user
WHERE email = 'kouzoud@gmail.com';  -- Remplacez par votre email

-- 2. Valider manuellement un utilisateur (si besoin)
UPDATE _user
SET is_validated = true
WHERE email = 'kouzoud@gmail.com';  -- Remplacez par votre email

-- 3. Débloquer un utilisateur banni
UPDATE _user
SET is_banned = false
WHERE email = 'kouzoud@gmail.com';  -- Remplacez par votre email

-- 4. Lister tous les utilisateurs non validés
SELECT id, nom, prenom, email, role, is_validated, created_at
FROM _user
WHERE is_validated = false
ORDER BY created_at DESC;

-- 5. Vérifier le mot de passe hashé (pour debug uniquement)
SELECT email, password
FROM _user
WHERE email = 'kouzoud@gmail.com';  -- Remplacez par votre email
