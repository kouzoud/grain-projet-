-- ==========================================
-- Script d'initialisation PostgreSQL + PostGIS
-- ==========================================

-- Créer l'extension PostGIS pour les données géospatiales
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Vérifier la version de PostGIS
SELECT PostGIS_version();

-- Créer un utilisateur de lecture seule (optionnel)
-- CREATE ROLE Link2Act_readonly WITH LOGIN PASSWORD 'readonly_password';
-- GRANT CONNECT ON DATABASE Link2Act TO Link2Act_readonly;
-- GRANT USAGE ON SCHEMA public TO Link2Act_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO Link2Act_readonly;

-- Afficher les extensions installées
\dx
