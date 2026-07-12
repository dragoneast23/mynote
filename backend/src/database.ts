export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  WECHAT_APPID: string;
  WECHAT_APPSECRET: string;
  ADMIN_PASSWORD: string;
}

export async function initDatabase(db: D1Database): Promise<void> {
  await db.exec(`
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
  `);

  const adminResult = await db.prepare('SELECT COUNT(*) as count FROM registers_admin').first();
  if ((adminResult as { count: number }).count === 0) {
    await db.prepare('INSERT INTO registers_admin (username, password_hash) VALUES (?, ?)')
      .bind('along', '$2y$12$dr.NXlkorFuaQTRfS2eLZu8bfbgGBs5rwGJEGKJRUbaKTgSV3t6RC')
      .run();
  }

  const userResult = await db.prepare('SELECT COUNT(*) as count FROM users').first();
  if ((userResult as { count: number }).count === 0) {
    await db.prepare(`
      INSERT INTO users (id, username, password, openid, nickname, register_time) VALUES
      (1, NULL, NULL, 'oxKdt192HLNhOOKriSGAe32gqWwQ', '无情', '2025-10-09 08:29:49'),
      (2, '13582538844', '$2y$10$x9MlwrPe8VnD5daoCut87OuD43PmO7HwPRNw1CHJkFN2jXSTf7/ba', NULL, '13582538844', '2025-10-09 22:55:48')
    `).run();

    await db.prepare(`
      INSERT INTO registers (registercode) VALUES
      ('xTpixvgRlavw'), ('iHAZduBLTA'), ('7KikGh23jc'), ('cVprRLkZQYi'),
      ('PIPEGe1Z'), ('uMYgA0pEfk0m'), ('ftTRcFs9FuX8'), ('Eyf4a6IN0uhoT7Xm'),
      ('DrVSNYvWGa'), ('fb5NKPnrjEwC'), ('a060NN5TV58n4'), ('12345678')
    `).run();

    await db.prepare(`
      INSERT INTO notes (user_id, title, content, create_time, update_time, word_count) VALUES
      (1, '这是一个示例备忘录内容，您可以用此APP', '这是一个示例备忘录内容，您可以用此APP记录自己的日', '2025-10-13 17:21:30', '2026-04-17 10:29:59', 46),
      (1, '这是我在云端更改的标题', '最新版本数据能不', '2025-10-13 21:16:29', '2026-07-03 15:14:26', 19),
      (1, '19199496868546661819', '191994968685466618194664', '2025-10-13 21:32:48', '2025-10-13 21:32:48', 44),
      (1, '64634578168361873679', '646345781683618736791316就是啊，是的啊', '2025-10-13 21:32:55', '2025-10-14 11:42:31', 51),
      (1, '15973761546461664676', '1597376154646166467646', '2025-10-13 21:33:01', '2025-10-13 21:33:01', 42),
      (1, ' 💾 💾 🔠 📀 💿 💽', ' 💾 🔠 📀 💿 💽比', '2025-10-21 22:57:23', '2025-10-22 11:07:12', 23),
      (1, '咋打看着看着就', '咋打看着看着就', '2025-10-22 11:07:24', '2025-10-22 11:07:24', 14),
      (2, '688464498449[我正在开发微信', '688464498449[我正在开发微信小程序精选工具栈，以下]我正在开发微信小程序精选工具栈，以下是具体需要的页面及功能：1.聚合页：是本小程序的主页面，以工具类、休闲类、影视类和其他类划分区块，分别展示本小程序可以完成的功能，点击相应区块，即可跳转相应页面实现该功能。每个区块相应文件各占一个文件夹，功能和数据与其他区块必须隔离，各自使用不同的数据库，关于数据库后边有详述。另外多设些区块显示开发中便于将来继续编辑补充。现在先制作工具类的--图书管理区块：点击进入图书管理区块的首页2.图书管理首页：（本功能区块要使用数据库tushuguanli）该页面展示图书管理的具体功能，介绍包括展示、新增、修改、删除图书等功能，并提示需要登录个人账户才能使用此功能，设置现在登录按钮跳转到登录页面。3.登录页面：每个用户存储使用自己的数据，需要设置登录界面，默认使用账号和密码的方法登录，没有账号可跳转至注册页面进行注册，也可选用微信直接登录的方法，调用用户自己的微信账号信息注册到数据库内进行登录，免去了输入账号和密码的方法，新注册和登录用户信息数据和个人录入的程序数据此功能区块都用数据库tushuguanli来进行存储，登录后进入图书展示页面。4.注册页面：需要用户分别输入注册的账号、密码。下方设置取消提交按钮，取消-不注册返回登录页面，提交-存储用户输入的账号和密码到数据库并跳转至登录页面以便用户使用刚才注册的账号和密码进行登录。5.图书展示页面：本页面展示当前用户已经存储到数据库中的所有图书信息记录，包括书名和作者，点击其中任何一条记录可以跳转到图书编辑页面进行修改，若数据为空，提示用户新增图书，同时本页面设置新增图书和退出登录按钮，退出登录-点击后退出登录跳转至图书管理的首页，新增图书-跳转到新增图书页面。6.图书编辑页面：本页面用户可以对当前记录的书名和作者内容进行修改，下方设置取消保存删除按钮，取消-不修改跳转至图书展示页面，保存-存储用户修改的数据后跳转至展示页面，删除-删除当前记录（二次确认）后跳转至图书展示页面。7.新增图书页面：本页面用户可以输入书名和作者内容，下方设置取消和提交按钮，取消-不带数据直接返回图书展示页面，提交-存储用户输入的数据到数据库内并返回图书展示页面，如果有重复记录，提示重复请修改信息，直到用户输入不重复记录为止。关于图书管理的数据库tushuguanli通过微信请求php脚本来调用我服务器上的mysql数据库，脚本存放位置：https://wxdata.1234223.xyz/tools/，get方式 ，我的微信接口获取openid信息：$appid = wxe8a901c5f3d32ff0; $secret = 12887902f01f7560837b9305e872ce75; mysql数据库服务器信息：端口：3306$dbhost = 47.92.252.72/;  // mysql服务器主机地址$dbuser = root;            // mysql用户名$dbpass = wjl403224736;          // mysql用户名密码请顺便帮我写好查询展示、编辑修改、新增图书记录以及登录和注册相关的php脚本。本小程序设计意图：每个功能区块相应文件各占一个文件夹，功能和数据与其他区块可以隔离。在将来增加新功能的时候我就直接将代码文件放到该文件夹了，方便程序后期维护，另外多设些区块显示开发中便于将来继续编辑补充。我需要一个完整的系统，不要缺失文件，并将所有相关文件放到一起，便于我打包下载，包括js、json、wxss、wxxml，注意页面美观整洁清爽。小程序在把代码中的所有POST更改为GET，{// 获取POST数据$id = $_POST[id];}将PHP脚本中的$_POST改为$_GET可以暂时正常运转了，其他暂时不用更改是的咋啊撒', '2025-10-16 13:50:15', '2026-07-02 21:41:17', 1731)
    `).run();
  }
}

export async function getUserByToken(db: D1Database, token: string): Promise<any | null> {
  const result = await db.prepare(`
    SELECT * FROM users WHERE token = ? AND token_expire > datetime('now')
  `).bind(token).first();
  return result || null;
}

export async function generateToken(db: D1Database, userId: number): Promise<string> {
  const token = Array.from({ length: 32 }, () => 
    Math.random().toString(36).substring(2, 3)
  ).join('');
  
  await db.prepare(`
    UPDATE users SET token = ?, token_expire = datetime('now', '+7 days') WHERE id = ?
  `).bind(token, userId).run();
  
  return token;
}

export function generateScene(): string {
  return Array.from({ length: 32 }, () => 
    Math.random().toString(36).substring(2, 3)
  ).join('');
}
