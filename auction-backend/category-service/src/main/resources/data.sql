-- data.sql
INSERT INTO category (name, icon, description, commission_rate, created_at, updated_at) 
VALUES 
('Electronics', 'bi-laptop', 'All electronic items', 5.0, NOW(), NOW()),
('Fashion', 'bi-fashion', 'Clothing and accessories', 10.0, NOW(), NOW()),
('Books', 'ibi-book', 'Books and stationery', 2.5, NOW(), NOW());