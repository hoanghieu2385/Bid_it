-- data.sql
INSERT IGNORE INTO category (name, icon, description, commission_rate, created_at, updated_at) 
VALUES 
('Fashion', 'bi-bag', 'Clothing and accessories', 10.0, NOW(), NOW()),
('Electronics', 'bi-laptop', 'All electronic items', 5.0, NOW(), NOW()),
('Home & Garden', 'bi-house-door', 'Furniture and gardening supplies', 7.5, NOW(), NOW()),
('Art', 'bi-brush', 'Original artwork and prints', 6.5, NOW(), NOW()),
('Books', 'bi-book', 'Books and stationery', 2.5, NOW(), NOW()),
('Jewelry', 'bi-gem', 'Rings, necklaces and more', 8.0, NOW(), NOW()),
('Sports', 'bi-bicycle', 'Sporting goods and gear', 4.5, NOW(), NOW()),
('Collectibles', 'bi-star', 'Rare and collectible items', 5.5, NOW(), NOW());