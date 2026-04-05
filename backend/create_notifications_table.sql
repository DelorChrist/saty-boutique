-- Table des notifications
-- Les relations avec Users et Orders sont gérées par Sequelize dans models/index.js
CREATE TABLE IF NOT EXISTS `Notifications` (
  `id` CHAR(36) PRIMARY KEY,
  `userId` CHAR(36) NOT NULL,
  `orderId` CHAR(36) DEFAULT NULL,
  `type` ENUM('order_confirmed', 'order_shipped', 'order_delivered', 'order_cancelled', 'promo', 'system') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `data` JSON DEFAULT NULL,
  `isRead` TINYINT(1) DEFAULT 0,
  `readAt` DATETIME DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_userId` (`userId`),
  INDEX `idx_orderId` (`orderId`),
  INDEX `idx_isRead` (`isRead`),
  INDEX `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

