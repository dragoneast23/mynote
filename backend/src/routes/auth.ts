import { Hono } from 'hono';
import { Env, getUserByToken, generateToken, generateScene } from '../database';
import bcrypt from 'bcryptjs';

export const authRoute = new Hono<{ Bindings: Env }>();

authRoute.post('/login', async (c) => {
  const { username, password } = await c.req.json();
  
  if (!username || !password) {
    return c.json({ code: -1, msg: '账号或密码不能为空' }, 400);
  }

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE username = ?')
    .bind(username).first();

  if (!user) {
    return c.json({ code: -1, msg: '账号不存在' }, 401);
  }

  if (!bcrypt.compareSync(password, (user as any).password)) {
    return c.json({ code: -1, msg: '密码错误' }, 401);
  }

  const token = await generateToken(c.env.DB, (user as any).id);
  
  return c.json({
    code: 0,
    msg: '登录成功',
    data: {
      id: (user as any).id,
      username: (user as any).username,
      nickname: (user as any).nickname || (user as any).username,
      register_time: (user as any).register_time,
      token
    }
  });
});

authRoute.post('/wechat_login', async (c) => {
  const { code, nickname, registercode } = await c.req.json();
  
  if (!code) {
    return c.json({ code: -1, msg: '参数错误' }, 400);
  }

  try {
    const res = await fetch(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${c.env.WECHAT_APPID}&secret=${c.env.WECHAT_APPSECRET}&js_code=${code}&grant_type=authorization_code`
    );
    const data = await res.json();

    if (data.errcode) {
      return c.json({ code: -1, msg: data.errmsg || '微信登录失败' }, 401);
    }

    const { openid } = data;
    let user = await c.env.DB.prepare('SELECT * FROM users WHERE openid = ?')
      .bind(openid).first();

    if (user) {
      if (nickname) {
        await c.env.DB.prepare('UPDATE users SET nickname = ? WHERE id = ?')
          .bind(nickname, (user as any).id).run();
      }
    } else {
      if (!registercode) {
        return c.json({ code: -1, msg: '请输入注册码' }, 400);
      }

      const registerResult = await c.env.DB.prepare('SELECT * FROM registers WHERE registercode = ?')
        .bind(registercode).first();

      if (!registerResult) {
        return c.json({ code: -1, msg: '注册码无效' }, 400);
      }

      await c.env.DB.prepare('DELETE FROM registers WHERE registercode = ?')
        .bind(registercode).run();

      const now = new Date().toISOString();
      const result = await c.env.DB.prepare(`
        INSERT INTO users (openid, nickname, register_time) VALUES (?, ?, ?)
      `).bind(openid, nickname || '微信用户', now).run();

      user = await c.env.DB.prepare('SELECT * FROM users WHERE openid = ?')
        .bind(openid).first();
    }

    const token = await generateToken(c.env.DB, (user as any).id);
    
    return c.json({
      code: 0,
      msg: '登录成功',
      data: {
        id: (user as any).id,
        nickname: (user as any).nickname || '微信用户',
        openid,
        register_time: (user as any).register_time,
        token
      }
    });
  } catch (error) {
    return c.json({ code: -1, msg: '微信登录失败' }, 500);
  }
});

authRoute.post('/register', async (c) => {
  const { username, password, registercode } = await c.req.json();
  
  if (!username || !password || !registercode) {
    return c.json({ code: -1, msg: '参数不全' }, 400);
  }

  const exists = await c.env.DB.prepare('SELECT * FROM users WHERE username = ?')
    .bind(username).first();

  if (exists) {
    return c.json({ code: -1, msg: '账号已存在' }, 400);
  }

  const registerResult = await c.env.DB.prepare('SELECT * FROM registers WHERE registercode = ?')
    .bind(registercode).first();

  if (!registerResult) {
    return c.json({ code: -1, msg: '注册码无效' }, 400);
  }

  await c.env.DB.prepare('DELETE FROM registers WHERE registercode = ?')
    .bind(registercode).run();

  const hashedPassword = bcrypt.hashSync(password, 10);
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    INSERT INTO users (username, password, nickname, register_time) VALUES (?, ?, ?, ?)
  `).bind(username, hashedPassword, username, now).run();

  return c.json({ code: 0, msg: '注册成功' });
});

authRoute.get('/logout', async (c) => {
  const token = c.req.header('token');
  
  if (token) {
    await c.env.DB.prepare('UPDATE users SET token = NULL, token_expire = NULL WHERE token = ?')
      .bind(token).run();
  }

  return c.json({ code: 0, msg: '退出成功' });
});

authRoute.post('/change_password', async (c) => {
  const token = c.req.header('token');
  if (!token) return c.json({ code: 401, msg: '未登录' }, 401);

  const user = await getUserByToken(c.env.DB, token);
  if (!user) return c.json({ code: 401, msg: '登录已过期' }, 401);

  const { oldPassword, newPassword, confirmPassword } = await c.req.json();
  
  if (!oldPassword || !newPassword || !confirmPassword) {
    return c.json({ code: -1, msg: '参数不全' }, 400);
  }

  if (newPassword !== confirmPassword) {
    return c.json({ code: -1, msg: '两次密码不一致' }, 400);
  }

  if (!bcrypt.compareSync(oldPassword, (user as any).password)) {
    return c.json({ code: -1, msg: '原密码错误' }, 400);
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  await c.env.DB.prepare('UPDATE users SET password = ?, token = NULL, token_expire = NULL WHERE id = ?')
    .bind(hashedPassword, (user as any).id).run();

  return c.json({ code: 0, msg: '密码修改成功,即将退出登录' });
});

authRoute.post('/wechat_scan_login', async (c) => {
  const scene = generateScene();
  const now = new Date().toISOString();
  const expireTime = new Date(Date.now() + 300000).toISOString();

  await c.env.DB.prepare(`
    INSERT INTO scan_login (scene, status, create_time, expire_time) VALUES (?, 0, ?, ?)
  `).bind(scene, now, expireTime).run();

  const qrCodeContent = `https://noteapi.c8.ccwu.cc/api/wechat_scan_login?scene=${encodeURIComponent(scene)}`;
  
  return c.json({
    code: 0,
    data: {
      scene,
      qrCodeContent
    }
  });
});

authRoute.post('/wechat_scan_callback', async (c) => {
  const { code, scene } = await c.req.json();
  
  if (!code || !scene) {
    return c.json({ code: -1, msg: '参数错误' }, 400);
  }

  try {
    const res = await fetch(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${c.env.WECHAT_APPID}&secret=${c.env.WECHAT_APPSECRET}&js_code=${code}&grant_type=authorization_code`
    );
    const data = await res.json();

    if (data.errcode) {
      return c.json({ code: -1, msg: data.errmsg || '微信登录失败' }, 401);
    }

    const { openid } = data;
    let user = await c.env.DB.prepare('SELECT * FROM users WHERE openid = ?')
      .bind(openid).first();

    if (!user) {
      return c.json({ code: -1, msg: '用户不存在，请先在小程序注册' }, 400);
    }

    const token = await generateToken(c.env.DB, (user as any).id);
    
    await c.env.DB.prepare(`
      UPDATE scan_login SET openid = ?, token = ?, status = 1 WHERE scene = ?
    `).bind(openid, token, scene).run();

    return c.json({
      code: 0,
      msg: '登录确认成功',
      data: {
        nickname: (user as any).nickname
      }
    });
  } catch (error) {
    return c.json({ code: -1, msg: '登录失败' }, 500);
  }
});

authRoute.get('/wechat_scan_check', async (c) => {
  const scene = c.req.query('scene');
  
  if (!scene) {
    return c.json({ code: -1, msg: '参数错误' }, 400);
  }

  const result = await c.env.DB.prepare(`
    SELECT * FROM scan_login WHERE scene = ? AND expire_time > datetime('now')
  `).bind(scene).first();

  if (!result) {
    return c.json({ code: -1, msg: '二维码已过期' }, 400);
  }

  const scanResult = result as any;
  
  if (scanResult.status === 1 && scanResult.token) {
    await c.env.DB.prepare('UPDATE scan_login SET status = 2 WHERE scene = ?')
      .bind(scene).run();

    const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = (SELECT id FROM users WHERE token = ?)')
      .bind(scanResult.token).first();

    return c.json({
      code: 0,
      data: {
        token: scanResult.token,
        id: (user as any).id,
        username: (user as any).username,
        nickname: (user as any).nickname,
        register_time: (user as any).register_time
      }
    });
  }

  return c.json({ code: -2, msg: '等待扫码' });
});
