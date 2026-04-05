-- Création de la base de données
CREATE DATABASE IF NOT EXISTS saty_boutique;
USE saty_boutique;

-- Table Categories
CREATE TABLE IF NOT EXISTS Categories (
    id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(191),
    description TEXT,
    imageUrl VARCHAR(255),
    parentId CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
    isActive TINYINT(1) DEFAULT 1,
    displayOrder INT DEFAULT 0,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY unique_slug (slug),
    KEY parentId (parentId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Products
CREATE TABLE IF NOT EXISTS Products (
    id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(191),
    description TEXT NOT NULL,
    brand VARCHAR(255) DEFAULT 'Saty Collection',
    price INT NOT NULL,
    oldPrice INT,
    stock INT DEFAULT 0,
    images JSON,
    variants JSON,
    features JSON,
    isActive TINYINT(1) DEFAULT 1,
    isFeatured TINYINT(1) DEFAULT 0,
    isNew TINYINT(1) DEFAULT 0,
    rating FLOAT DEFAULT 0,
    reviewsCount INT DEFAULT 0,
    categoryId CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY unique_product_slug (slug),
    KEY categoryId (categoryId),
    CONSTRAINT fk_category FOREIGN KEY (categoryId) REFERENCES Categories (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Users (Clients et Admin)
CREATE TABLE IF NOT EXISTS Users (
    id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(191) NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hashé
    role ENUM('customer', 'admin') DEFAULT 'customer',
    phone VARCHAR(50),
    addresses JSON, -- Tableau d'objets adresses
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY unique_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Orders (Commandes)
CREATE TABLE IF NOT EXISTS Orders (
    id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    userId CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
    guestInfo JSON, -- Si commande invité (nom, email, tel)
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    totalAmount INT NOT NULL,
    shippingAddress JSON NOT NULL,
    paymentMethod VARCHAR(50) NOT NULL,
    paymentStatus ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    PRIMARY KEY (id),
    KEY userId (userId),
    CONSTRAINT fk_user FOREIGN KEY (userId) REFERENCES Users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table OrderItems (Détails Commande)
CREATE TABLE IF NOT EXISTS OrderItems (
    id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    orderId CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
    productId CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
    productName VARCHAR(255) NOT NULL,
    variant JSON,
    quantity INT NOT NULL,
    price INT NOT NULL, 
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    PRIMARY KEY (id),
    KEY orderId (orderId),
    KEY productId (productId),
    CONSTRAINT fk_order FOREIGN KEY (orderId) REFERENCES Orders (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_order_product FOREIGN KEY (productId) REFERENCES Products (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
