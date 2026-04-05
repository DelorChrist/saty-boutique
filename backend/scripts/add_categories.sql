-- Utiliser la base de données
USE saty_boutique;

-- Supprimer les catégories existantes pour repartir à zéro
DELETE FROM Categories;

-- Insérer les catégories avec des UUID générés par MySQL
INSERT INTO Categories (id, name, slug, description, isActive, createdAt, updatedAt) VALUES
(UUID(), 'Boubous Hommes', 'boubous-hommes', 'Collection de boubous élégants pour hommes', 1, NOW(), NOW()),
(UUID(), 'Boubous Femmes', 'boubous-femmes', 'Boubous féminins modernes et traditionnels', 1, NOW(), NOW()),
(UUID(), 'Robes', 'robes', 'Robes africaines élégantes pour tous vos événements', 1, NOW(), NOW()),
(UUID(), 'Chaussures', 'chaussures', 'Chaussures assorties à vos tenues africaines', 1, NOW(), NOW()),
(UUID(), 'Accessoires', 'accessoires', 'Sacs, bijoux et accessoires wax', 1, NOW(), NOW()),
(UUID(), 'Ensembles', 'ensembles', 'Ensembles complets pagne et bazin', 1, NOW(), NOW()),
(UUID(), 'Chemises', 'chemises', 'Chemises modernes et confortables', 1, NOW(), NOW()),
(UUID(), 'Tuniques', 'tuniques', 'Tuniques légères et élégantes', 1, NOW(), NOW()),
(UUID(), 'Chapeaux', 'chapeaux', 'Chapeaux traditionnels et modernes', 1, NOW(), NOW());

-- Vérifier le résultat
SELECT id, name, slug FROM Categories;
