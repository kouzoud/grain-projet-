-- ==========================================
-- Script d'initialisation PostgreSQL + PostGIS
-- ==========================================

-- Créer l'extension PostGIS pour les données géospatiales
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Vérifier la version de PostGIS
SELECT PostGIS_version();

-- Créer un utilisateur de lecture seule (optionnel)
-- CREATE ROLE solidarlink_readonly WITH LOGIN PASSWORD 'readonly_password';
-- GRANT CONNECT ON DATABASE solidarlink TO solidarlink_readonly;
-- GRANT USAGE ON SCHEMA public TO solidarlink_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO solidarlink_readonly;

-- Afficher les extensions installées
\dx
