-- Script pour nettoyer les index en trop de la table Categories
-- Exécutez ce script dans MySQL pour résoudre l'erreur "Trop de clefs sont définies"

USE saty_boutique;

-- Option 1: Supprimer et recréer la table Categories (ATTENTION: perte de données)
-- DROP TABLE IF EXISTS Categories;

-- Option 2: Supprimer tous les index sauf PRIMARY KEY
-- Lister d'abord tous les index
SHOW INDEX FROM Categories;

-- Supprimer les index en double/inutiles (ajustez selon les noms affichés)
-- Exemple:
-- ALTER TABLE Categories DROP INDEX slug;
-- ALTER TABLE Categories DROP INDEX slug_2;
-- ALTER TABLE Categories DROP INDEX slug_3;
-- etc...

-- Option 3 (RECOMMANDÉ): Supprimer uniquement les index en double sur 'slug'
-- Gardez un seul index unique sur slug
SELECT CONCAT('ALTER TABLE Categories DROP INDEX ', INDEX_NAME, ';') AS cleanup_queries
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'saty_boutique'
  AND TABLE_NAME = 'Categories'
  AND COLUMN_NAME = 'slug'
  AND INDEX_NAME != 'PRIMARY'
  AND INDEX_NAME != (
    SELECT INDEX_NAME
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'saty_boutique'
      AND TABLE_NAME = 'Categories'
      AND COLUMN_NAME = 'slug'
      AND INDEX_NAME != 'PRIMARY'
    LIMIT 1
  );

-- Copier et exécuter les requêtes générées ci-dessus
-- Puis redémarrer le serveur backend
