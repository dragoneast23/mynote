# MyNote - 个人备忘录

基于 Cloudflare Workers + Vue 3 的个人备忘录应用，支持网页端和微信小程序共用同一套 API 和数据库。

## 功能特性

- ✅ 用户注册/登录（账号密码 + 微信扫码登录）
- ✅ 备忘录 CRUD（创建、阅读、更新、删除）
- ✅ 关键词搜索
- ✅ 批量导出
- ✅ 字体大小设置
- ✅ 注册码管理系统
- ✅ 用户密码重置

## 技术栈

### 后端
- **Cloudflare Workers** - 无服务器后端运行时
- **Cloudflare D1** - SQLite 兼容数据库
- **Cloudflare KV** - 键值存储（缓存 Token）
- **Hono** - 轻量级 HTTP 框架
- **TypeScript** - 类型安全

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **Vue Router** - 路由管理
- **Tailwind CSS** - 原子化 CSS 框架
- **Vite** - 快速构建工具
- **Axios** - HTTP 客户端

## 项目结构

```
mynote/
├── backend/                    # Cloudflare Workers 后端
│   ├── src/
│   │   ├── index.ts            # 入口文件，路由配置
│   │   ├── database.ts         # 数据库初始化和工具函数
│   │   ├── schema.sql          # 数据库表结构
│   │   └── routes/
│   │       ├── auth.ts         # 认证接口（登录/注册）
│   │       ├── notes.ts        # 备忘录 CRUD
│   │       ├── search.ts       # 搜索接口
│   │       ├── export.ts       # 导出接口
│   │       └── admin.ts        # 管理接口
│   ├── scripts/                # 数据迁移脚本
│   ├── wrangler.toml           # Cloudflare 配置
│   └── package.json
│
├── frontend/                   # Vue 前端
│   ├── src/
│   │   ├── views/              # 页面组件
│   │   │   ├── Login.vue       # 登录页面
│   │   │   ├── Register.vue    # 注册页面
│   │   │   ├── Notes.vue       # 备忘录列表
│   │   │   ├── AddNote.vue     # 添加备忘录
│   │   │   ├── NoteDetail.vue  # 备忘录详情
│   │   │   ├── Search.vue      # 搜索页面
│   │   │   ├── Account.vue     # 修改密码
│   │   │   ├── Font.vue        # 字体设置
│   │   │   └── Export.vue      # 导出页面
│   │   ├── api/
│   │   │   └── index.js        # API 接口配置
│   │   ├── router/
│   │   │   └── index.js        # 路由配置
│   │   ├── App.vue             # 主应用组件
│   │   ├── main.js             # 入口文件
│   │   └── style.css           # 全局样式
│   ├── dist/                   # 构建产物
│   ├── vite.config.js          # Vite 配置
│   ├── tailwind.config.js      # Tailwind 配置
│   └── package.json
│
└── .gitignore                  # Git 忽略配置
```

## 部署说明

### 1. 环境准备

确保已安装：
- Node.js >= 18
- Git
- Cloudflare Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

### 2. 配置 Cloudflare

#### 创建 D1 数据库
```bash
wrangler d1 create note
```

#### 创建 KV 命名空间
```bash
wrangler kv:namespace create NOTE_KV
```

#### 更新 wrangler.toml
将生成的数据库 ID 和 KV ID 填入 `backend/wrangler.toml`。

### 3. 设置环境变量

```bash
wrangler secret put WECHAT_APPID
wrangler secret put WECHAT_APPSECRET
wrangler secret put ADMIN_PASSWORD
```

### 4. 部署后端

```bash
cd backend
npm install
wrangler deploy
```

### 5. 部署前端

```bash
cd frontend
npm install
npm run build
wrangler pages deploy dist --project-name mynote-web
```

### 6. 初始化数据库

访问后端 `/init` 端点初始化数据库表结构：
```bash
curl -X POST https://your-worker-url/init
```

## API 接口

### 认证接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/login` | POST | 用户登录 |
| `/api/register` | POST | 用户注册 |
| `/api/logout` | GET | 退出登录 |
| `/api/change_password` | POST | 修改密码 |
| `/api/wechat_login` | POST | 微信登录 |

### 备忘录接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/notes` | GET | 获取备忘录列表 |
| `/api/notes/:id` | GET | 获取单条备忘录 |
| `/api/notes` | POST | 添加备忘录 |
| `/api/notes/:id` | PUT | 更新备忘录 |
| `/api/notes/:id` | DELETE | 删除备忘录 |
| `/api/search?keyword=xxx` | GET | 搜索备忘录 |
| `/api/export` | POST | 导出备忘录 |

### 管理接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/admin/zcm` | GET | 注册码管理页面 |
| `/admin/mima` | GET | 用户密码重置页面 |
| `/api/admin/generate_codes` | POST | 生成注册码 |
| `/api/admin/delete_code` | POST | 删除注册码 |
| `/api/admin/reset_password` | POST | 重置用户密码 |

## 使用说明

### 网页端

访问部署的 Pages 地址，使用账号密码登录或注册新账号。

### 微信小程序

1. 修改小程序 API 地址为 Cloudflare Workers 域名
2. 在微信公众平台配置服务器域名
3. 扫码登录功能需要在小程序后台配置"获取小程序码"权限

### 管理后台

访问管理页面需要管理员密码：
- 注册码管理：`https://your-worker-url/admin/zcm?password=xxx`
- 用户密码重置：`https://your-worker-url/admin/mima?password=xxx`

## 数据库表结构

### users（用户表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| username | VARCHAR(50) | 用户名 |
| password | VARCHAR(255) | 密码哈希 |
| openid | VARCHAR(100) | 微信 openid |
| nickname | VARCHAR(100) | 昵称 |
| register_time | DATETIME | 注册时间 |
| token | VARCHAR(255) | 登录令牌 |
| token_expire | DATETIME | 令牌过期时间 |

### notes（备忘录表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| user_id | INTEGER | 用户 ID |
| title | VARCHAR(255) | 标题 |
| content | TEXT | 内容 |
| create_time | DATETIME | 创建时间 |
| update_time | DATETIME | 更新时间 |
| word_count | INTEGER | 字数统计 |

### registers（注册码表）

| 字段 | 类型 | 说明 |
|------|------|------|
| registercode | VARCHAR(50) | 注册码 |
| 备注 | VARCHAR(255) | 备注 |

## 开发指南

### 本地开发

```bash
# 后端
cd backend
npm run dev

# 前端
cd frontend
npm run dev
```

### 代码规范

- TypeScript 类型检查
- ESLint 代码检查
- 提交信息使用英文描述

## 许可证

MIT License
