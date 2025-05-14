-- Insert banks
INSERT IGNORE INTO banks (name) VALUES ('MB Bank');
INSERT IGNORE INTO banks (name) VALUES ('Vietcombank');
INSERT IGNORE INTO banks (name) VALUES ('Techcombank');
INSERT IGNORE INTO banks (name) VALUES ('ACB');

-- Insert admin user with password 'admin123'
-- INSERT INTO users (
--     email, first_name, last_name, password, avatar, avatar_public_id,
--     phone_number, address, bank_id, bank_account_number,
--     score, created_at, updated_at, enable, verified,
--     verified_response, locked
-- )
-- SELECT 
--     'admin@example.com', 'Admin', 'System',
--     '$2a$10$MaXDR6O17hIg0/QFFS2zMOyJuucMFJ9eOglOYUFqyYqk1Kxfiv0im',
--     NULL, NULL,
--     '0900000000', 'Hanoi', (SELECT id FROM banks WHERE name = 'MB Bank' LIMIT 1), '000111222',
--     100, NOW(), NULL, TRUE, TRUE,
--     'Email verified successfully', FALSE
-- WHERE NOT EXISTS (
--     SELECT 1 FROM users WHERE email = 'admin@example.com'
-- );

-- -- Gán role ADMIN
-- INSERT INTO user_roles (user_id, role)
-- SELECT id, 'ADMIN'
-- FROM users
-- WHERE email = 'admin@example.com'
--     AND NOT EXISTS (
--     SELECT 1 FROM user_roles WHERE user_id = users.id AND role = 'ADMIN'
-- );
