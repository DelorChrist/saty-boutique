-- Vérifier la structure de la table categories
DESCRIBE categories;

-- Voir quelle catégorie existe déjà
SELECT * FROM categories;

-- Supprimer toutes les catégories existantes (ATTENTION: cela supprime tout!)
-- DELETE FROM categories;

-- Ajouter toutes les catégories (sans INSERT IGNORE pour voir les erreurs)
INSERT INTO categories (name, slug, description, isActive, createdAt, updatedAt) 
VALUES 
('Boubous Hommes', 'boubous-hommes', 'Collection de boubous élégants pour hommes', 1, NOW(), NOW()),
('Boubous Femmes', 'boubous-femmes', 'Boubous féminins modernes et traditionnels', 1, NOW(), NOW()),
('Robes', 'robes', 'Robes africaines élégantes pour tous vos événements', 1, NOW(), NOW()),
('Chaussures', 'chaussures', 'Chaussures assorties à vos tenues africaines', 1, NOW(), NOW()),
('Accessoires', 'accessoires', 'Sacs, bijoux et accessoires wax', 1, NOW(), NOW()),
('Ensembles', 'ensembles', 'Ensembles complets pagne et bazin', 1, NOW(), NOW()),
('Chemises', 'chemises', 'Chemises modernes et confortables', 1, NOW(), NOW()),
('Tuniques', 'tuniques', 'Tuniques légères et élégantes', 1, NOW(), NOW()),
('Chapeaux', 'chapeaux', 'Chapeaux traditionnels et modernes', 1, NOW(), NOW());
