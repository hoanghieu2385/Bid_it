-- tạo admin nếu chưa có
INSERT INTO users (
    email, first_name, last_name, password,
    phone_number, score, enable, verified, verified_response, created_at
)
SELECT
    'admin@example.com','System','Admin','$2a$10$BwppVKii2PdUVNUM09sQiusM19JlmS4x/9.CDSgMQqyVJA6nyPgmi',
    '0000000000', 0, true, true, 'Email verified successfully', NOW()
    WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email='admin@example.com'
);

-- chèn role ADMIN nếu chưa có
INSERT INTO user_roles (user_id, role)
SELECT u.id, 'ADMIN'
FROM users u
WHERE u.email='admin@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = u.id AND ur.role = 'ADMIN'
);
