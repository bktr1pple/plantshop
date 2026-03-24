process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'test-refresh';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/test_db';
process.env.RECAPTCHA_SECRET_KEY =
  process.env.RECAPTCHA_SECRET_KEY || 'test-recaptcha';
process.env.JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DOMAIN_COOKIE = process.env.DOMAIN_COOKIE || 'localhost';
process.env.BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS || '10';
process.env.MAIL_FROM_EMAIL =
  process.env.MAIL_FROM_EMAIL || 'no-reply@test.local';
process.env.MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || 'PlantShop Test';
