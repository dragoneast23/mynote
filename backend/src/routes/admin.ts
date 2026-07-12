import { Hono } from 'hono';
import { Env } from '../database';
import bcrypt from 'bcryptjs';

export const adminRoute = new Hono<{ Bindings: Env }>();

adminRoute.get('/zcm', async (c) => {
  const auth = c.req.header('Authorization');
  
  if (!auth || !auth.startsWith('Basic ')) {
    return c.html(`
      <html>
      <body>
      <script>
      const password = prompt('请输入管理员密码:');
      if (password) {
        window.location.href = '/admin/zcm?password=' + encodeURIComponent(password);
      } else {
        alert('请输入密码');
      }
      </script>
      </body>
      </html>
    `);
  }

  const password = c.req.query('password');
  if (!password || password !== c.env.ADMIN_PASSWORD) {
    return c.html(`
      <html>
      <body>
      <script>
      alert('密码错误');
      window.location.href = '/admin/zcm';
      </script>
      </body>
      </html>
    `);
  }

  const results = await c.env.DB.prepare('SELECT * FROM registers').all();
  const codes = (results as any).results || [];

  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>注册码管理</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .code-card { transition: all 0.2s; }
    .code-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    </style>
    </head>
    <body class="bg-gray-50 min-h-screen">
    <div class="max-w-4xl mx-auto p-4">
      <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-key text-green-500 mr-2"></i>注册码管理系统
        </h1>
        
        <div class="flex flex-wrap gap-4 mb-6">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm text-gray-600 mb-1">生成数量</label>
            <input type="number" id="count" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" value="10" min="1" max="100">
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm text-gray-600 mb-1">长度</label>
            <input type="number" id="length" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" value="8" min="8" max="16">
          </div>
          <button onclick="generateCodes()" class="align-self-end px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center">
            <i class="fas fa-plus mr-2"></i>生成注册码
          </button>
        </div>

        <div class="flex gap-2 mb-4">
          <button onclick="copyAll()" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center">
            <i class="fas fa-copy mr-2"></i>复制全部
          </button>
          <button onclick="deleteAll()" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center">
            <i class="fas fa-trash mr-2"></i>删除全部
          </button>
        </div>

        <div class="flex justify-between items-center mb-4">
          <span class="text-sm text-gray-500">共 ${codes.length} 个注册码</span>
          <button onclick="changePassword()" class="text-sm text-gray-500 hover:text-gray-700">修改管理员密码</button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          ${codes.map((code: any) => `
            <div class="code-card bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div class="font-mono text-lg text-gray-700 break-all mb-2">${code.registercode}</div>
              <div class="flex gap-2">
                <button onclick="copyCode('${code.registercode}')" class="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors">复制</button>
                <button onclick="deleteCode('${code.registercode}')" class="flex-1 px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors">删除</button>
              </div>
            </div>
          `).join('')}
          ${codes.length === 0 ? '<div class="col-span-full text-center text-gray-400 py-10">暂无注册码</div>' : ''}
        </div>
      </div>
    </div>

    <script>
    async function generateCodes() {
      const count = parseInt(document.getElementById('count').value);
      const length = parseInt(document.getElementById('length').value);
      
      const res = await fetch('/api/admin/generate_codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count, length })
      });
      const data = await res.json();
      
      if (data.code === 0) {
        location.reload();
      } else {
        alert(data.msg);
      }
    }

    async function copyCode(code) {
      await navigator.clipboard.writeText(code);
      alert('已复制');
    }

    async function deleteCode(code) {
      if (!confirm('确定删除此注册码?')) return;
      
      const res = await fetch('/api/admin/delete_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      
      if (data.code === 0) {
        location.reload();
      } else {
        alert(data.msg);
      }
    }

    async function copyAll() {
      const res = await fetch('/api/admin/get_codes');
      const data = await res.json();
      
      if (data.code === 0) {
        const codes = data.data.join('\\n');
        await navigator.clipboard.writeText(codes);
        alert('已复制全部注册码');
      }
    }

    async function deleteAll() {
      if (!confirm('确定删除所有注册码?')) return;
      
      const res = await fetch('/api/admin/delete_all_codes', { method: 'POST' });
      const data = await res.json();
      
      if (data.code === 0) {
        location.reload();
      } else {
        alert(data.msg);
      }
    }

    async function changePassword() {
      const newPassword = prompt('请输入新密码:');
      if (!newPassword) return;
      
      const res = await fetch('/api/admin/change_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      const data = await res.json();
      
      if (data.code === 0) {
        alert('密码修改成功');
      } else {
        alert(data.msg);
      }
    }
    </script>
    </body>
    </html>
  `);
});

adminRoute.post('/generate_codes', async (c) => {
  const { count, length } = await c.req.json();
  
  if (!count || !length) {
    return c.json({ code: -1, msg: '参数错误' });
  }

  const codes = [];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  
  for (let i = 0; i < count; i++) {
    let code = '';
    for (let j = 0; j < length; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    codes.push(code);
  }

  for (const code of codes) {
    await c.env.DB.prepare('INSERT OR IGNORE INTO registers (registercode) VALUES (?)')
      .bind(code).run();
  }

  return c.json({ code: 0, msg: `成功生成 ${codes.length} 个注册码` });
});

adminRoute.get('/get_codes', async (c) => {
  const results = await c.env.DB.prepare('SELECT * FROM registers').all();
  const codes = ((results as any).results || []).map((r: any) => r.registercode);
  return c.json({ code: 0, data: codes });
});

adminRoute.post('/delete_code', async (c) => {
  const { code } = await c.req.json();
  await c.env.DB.prepare('DELETE FROM registers WHERE registercode = ?')
    .bind(code).run();
  return c.json({ code: 0, msg: '删除成功' });
});

adminRoute.post('/delete_all_codes', async (c) => {
  await c.env.DB.prepare('DELETE FROM registers').run();
  return c.json({ code: 0, msg: '全部删除成功' });
});

adminRoute.post('/change_password', async (c) => {
  const { password } = await c.req.json();
  
  if (!password) {
    return c.json({ code: -1, msg: '密码不能为空' });
  }

  await c.env.DB.prepare('UPDATE registers_admin SET password_hash = ? WHERE username = ?')
    .bind(bcrypt.hashSync(password, 10), 'along').run();

  return c.json({ code: 0, msg: '密码修改成功' });
});

adminRoute.get('/mima', async (c) => {
  const auth = c.req.header('Authorization');
  
  if (!auth || !auth.startsWith('Basic ')) {
    return c.html(`
      <html>
      <body>
      <script>
      const password = prompt('请输入管理员密码:');
      if (password) {
        window.location.href = '/admin/mima?password=' + encodeURIComponent(password);
      } else {
        alert('请输入密码');
      }
      </script>
      </body>
      </html>
    `);
  }

  const password = c.req.query('password');
  if (!password || password !== c.env.ADMIN_PASSWORD) {
    return c.html(`
      <html>
      <body>
      <script>
      alert('密码错误');
      window.location.href = '/admin/mima';
      </script>
      </body>
      </html>
    `);
  }

  const results = await c.env.DB.prepare(`
    SELECT id, username, nickname, register_time FROM users ORDER BY id ASC
  `).all();
  const users = (results as any).results || [];

  return c.html(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>用户密码重置</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body class="bg-gray-50 min-h-screen">
    <div class="max-w-4xl mx-auto p-4">
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-users text-blue-500 mr-2"></i>用户密码重置管理
        </h1>
        
        <div class="text-sm text-gray-500 mb-4">
          重置后的密码默认为：<span class="font-mono bg-gray-100 px-2 py-1 rounded">12345678</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-50">
                <th class="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-600">ID</th>
                <th class="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-600">账号</th>
                <th class="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-600">昵称</th>
                <th class="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-600">注册时间</th>
                <th class="border border-gray-200 px-4 py-2 text-center text-sm font-semibold text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              ${users.map((user: any) => `
                <tr class="hover:bg-gray-50">
                  <td class="border border-gray-200 px-4 py-2 text-sm">${user.id}</td>
                  <td class="border border-gray-200 px-4 py-2 text-sm">${user.username || '<span class="text-gray-400">微信用户</span>'}</td>
                  <td class="border border-gray-200 px-4 py-2 text-sm">${user.nickname || '-'}</td>
                  <td class="border border-gray-200 px-4 py-2 text-sm">${user.register_time || '-'}</td>
                  <td class="border border-gray-200 px-4 py-2 text-center">
                    ${user.username ? `
                      <button onclick="resetPassword(${user.id})" class="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors">
                        重置密码
                      </button>
                    ` : '<span class="text-gray-400 text-sm">无账号</span>'}
                  </td>
                </tr>
              `).join('')}
              ${users.length === 0 ? '<tr><td colspan="5" class="border border-gray-200 px-4 py-8 text-center text-gray-400">暂无用户</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <script>
    async function resetPassword(userId) {
      if (!confirm('确定重置该用户密码?')) return;
      
      const res = await fetch('/api/admin/reset_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      
      if (data.code === 0) {
        alert('密码重置成功');
      } else {
        alert(data.msg);
      }
    }
    </script>
    </body>
    </html>
  `);
});

adminRoute.post('/reset_password', async (c) => {
  const { userId } = await c.req.json();
  
  if (!userId) {
    return c.json({ code: -1, msg: '参数错误' });
  }

  const hashedPassword = bcrypt.hashSync('12345678', 10);
  
  await c.env.DB.prepare(`
    UPDATE users SET password = ?, token = NULL, token_expire = NULL WHERE id = ?
  `).bind(hashedPassword, userId).run();

  return c.json({ code: 0, msg: '密码重置成功' });
});

adminRoute.post('/migrate_data', async (c) => {
  const { password } = await c.req.json();
  
  if (password !== c.env.ADMIN_PASSWORD) {
    return c.json({ code: -1, msg: '密码错误' });
  }

  try {
    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO users (id, username, password, openid, nickname, register_time, token, token_expire) VALUES
      (1, NULL, NULL, 'oxKdt192HLNhOOKriSGAe32gqWwQ', '无情', '2025-10-09 08:29:49', NULL, NULL),
      (2, '13582538844', '$2y$10$x9MlwrPe8VnD5daoCut87OuD43PmO7HwPRNw1CHJkFN2jXSTf7/ba', NULL, '13582538844', '2025-10-09 22:55:48', NULL, NULL)
    `).run();

    await c.env.DB.prepare(`
      INSERT OR IGNORE INTO registers (registercode) VALUES
      ('xTpixvgRlavw'), ('iHAZduBLTA'), ('7KikGh23jc'), ('cVprRLkZQYi'),
      ('PIPEGe1Z'), ('uMYgA0pEfk0m'), ('ftTRcFs9FuX8'), ('Eyf4a6IN0uhoT7Xm'),
      ('DrVSNYvWGa'), ('fb5NKPnrjEwC'), ('a060NN5TV58n4'), ('12345678')
    `).run();

    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO registers_admin (id, username, password_hash) VALUES
      (1, 'along', '$2y$12$dr.NXlkorFuaQTRfS2eLZu8bfbgGBs5rwGJEGKJRUbaKTgSV3t6RC')
    `).run();

    await c.env.DB.prepare(`
      INSERT INTO notes (user_id, title, content, create_time, update_time, word_count) VALUES
      (1, '这是一个示例备忘录内容，您可以用此APP', '这是一个示例备忘录内容，您可以用此APP记录自己的日', '2025-10-13 17:21:30', '2026-04-17 10:29:59', 46),
      (1, '这是我在云端更改的标题', '最新版本数据能不', '2025-10-13 21:16:29', '2026-07-03 15:14:26', 19),
      (1, '19199496868546661819', '191994968685466618194664', '2025-10-13 21:32:48', '2025-10-13 21:32:48', 44),
      (1, '64634578168361873679', '646345781683618736791316就是啊，是的啊', '2025-10-13 21:32:55', '2025-10-14 11:42:31', 51),
      (1, '15973761546461664676', '1597376154646166467646', '2025-10-13 21:33:01', '2025-10-13 21:33:01', 42),
      (1, ' 💾 💾 🔠 📀 💿 💽', ' 💾 🔠 📀 💿 💽比', '2025-10-21 22:57:23', '2025-10-22 11:07:12', 23),
      (1, '咋打看着看着就', '咋打看着看着就', '2025-10-22 11:07:24', '2025-10-22 11:07:24', 14)
    `).run();

    await c.env.DB.prepare(`
      INSERT INTO notes (user_id, title, content, create_time, update_time, word_count) VALUES
      (2, '688464498449[我正在开发微信', '688464498449[我正在开发微信小程序精选工具栈，以下]我正在开发微信小程序精选工具栈，以下是具体需要的页面及功能：1.聚合页：是本小程序的主页面，以工具类、休闲类、影视类和其他类划分区块，分别展示本小程序可以完成的功能，点击相应区块，即可跳转相应页面实现该功能。每个区块相应文件各占一个文件夹，功能和数据与其他区块必须隔离，各自使用不同的数据库，关于数据库后边有详述。另外多设些区块显示开发中便于将来继续编辑补充。现在先制作工具类的--图书管理区块：点击进入图书管理区块的首页2.图书管理首页：（本功能区块要使用数据库tushuguanli）该页面展示图书管理的具体功能，介绍包括展示、新增、修改、删除图书等功能，并提示需要登录个人账户才能使用此功能，设置现在登录按钮跳转到登录页面。3.登录页面：每个用户存储使用自己的数据，需要设置登录界面，默认使用账号和密码的方法登录，没有账号可跳转至注册页面进行注册，也可选用微信直接登录的方法，调用用户自己的微信账号信息注册到数据库内进行登录，免去了输入账号和密码的方法，新注册和登录用户信息数据和个人录入的程序数据此功能区块都用数据库tushuguanli来进行存储，登录后进入图书展示页面。4.注册页面：需要用户分别输入注册的账号、密码。下方设置取消提交按钮，取消-不注册返回登录页面，提交-存储用户输入的账号和密码到数据库并跳转至登录页面以便用户使用刚才注册的账号和密码进行登录。5.图书展示页面：本页面展示当前用户已经存储到数据库中的所有图书信息记录，包括书名和作者，点击其中任何一条记录可以跳转到图书编辑页面进行修改，若数据为空，提示用户新增图书，同时本页面设置新增图书和退出登录按钮，退出登录-点击后退出登录跳转至图书管理的首页，新增图书-跳转到新增图书页面。6.图书编辑页面：本页面用户可以对当前记录的书名和作者内容进行修改，下方设置取消保存删除按钮，取消-不修改跳转至图书展示页面，保存-存储用户修改的数据后跳转至展示页面，删除-删除当前记录（二次确认）后跳转至图书展示页面。7.新增图书页面：本页面用户可以输入书名和作者内容，下方设置取消和提交按钮，取消-不带数据直接返回图书展示页面，提交-存储用户输入的数据到数据库内并返回图书展示页面，如果有重复记录，提示重复请修改信息，直到用户输入不重复记录为止。关于图书管理的数据库tushuguanli通过微信请求php脚本来调用我服务器上的mysql数据库，脚本存放位置：https://wxdata.1234223.xyz/tools/，get方式 ，我的微信接口获取openid信息：$appid = wxe8a901c5f3d32ff0; $secret = 12887902f01f7560837b9305e872ce75; mysql数据库服务器信息：端口：3306$dbhost = 47.92.252.72/;  // mysql服务器主机地址$dbuser = root;            // mysql用户名$dbpass = wjl403224736;          // mysql用户名密码请顺便帮我写好查询展示、编辑修改、新增图书记录以及登录和注册相关的php脚本。本小程序设计意图：每个功能区块相应文件各占一个文件夹，功能和数据与其他区块可以隔离。在将来增加新功能的时候我就直接将代码文件放到该文件夹了，方便程序后期维护，另外多设些区块显示开发中便于将来继续编辑补充。我需要一个完整的系统，不要缺失文件，并将所有相关文件放到一起，便于我打包下载，包括js、json、wxss、wxxml，注意页面美观整洁清爽。小程序在把代码中的所有POST更改为GET，{// 获取POST数据$id = $_POST[id];}将PHP脚本中的$_POST改为$_GET可以暂时正常运转了，其他暂时不用更改是的咋啊撒', '2025-10-16 13:50:15', '2026-07-02 21:41:17', 1731)
    `).run();

    return c.json({ code: 0, msg: '数据迁移成功' });
  } catch (error) {
    return c.json({ code: -1, msg: `迁移失败: ${error.message}` });
  }
});
