SELECT user_id, email, role, 
       LEFT(password, 20) as password_prefix,
       LENGTH(password) as password_length
FROM USERS_ADMIN 
WHERE email = 'admin@naver.com';
