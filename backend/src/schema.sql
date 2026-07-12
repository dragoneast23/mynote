CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) UNIQUE,
  password VARCHAR(255),
  openid VARCHAR(100) UNIQUE,
  nickname VARCHAR(100),
  register_time DATETIME,
  token VARCHAR(255),
  token_expire DATETIME
);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  title VARCHAR(255),
  content TEXT,
  create_time DATETIME,
  update_time DATETIME,
  word_count INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS registers (
  registercode VARCHAR(50) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS registers_admin (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50),
  password_hash VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS exports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  file_name VARCHAR(255),
  create_time DATETIME,
  expire_time DATETIME
);

CREATE TABLE IF NOT EXISTS scan_login (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scene VARCHAR(32) UNIQUE NOT NULL,
  openid VARCHAR(100),
  token VARCHAR(255),
  status INTEGER DEFAULT 0,
  create_time DATETIME,
  expire_time DATETIME
);

INSERT OR IGNORE INTO registers_admin (username, password_hash) VALUES ('along', '$2b$10$EixZaYbB.rK4fl8x2q7Meu6Q6D2V5fF5Q5Q5Q5Q5Q5Q5Q5Q5Q');
