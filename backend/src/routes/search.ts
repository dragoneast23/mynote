import { Hono } from 'hono';
import { Env, getUserByToken } from '../database';

export const searchRoute = new Hono<{ Bindings: Env }>();

searchRoute.get('/', async (c) => {
  const token = c.req.header('token');
  if (!token) return c.json({ code: 401, msg: '未登录' }, 401);

  const user = await getUserByToken(c.env.DB, token);
  if (!user) return c.json({ code: 401, msg: '登录已过期' }, 401);

  const keyword = c.req.query('keyword');
  
  if (!keyword) {
    return c.json({ code: -1, msg: '搜索关键词不能为空' }, 400);
  }

  const results = await c.env.DB.prepare(`
    SELECT * FROM notes WHERE user_id = ? AND (title LIKE ? OR content LIKE ?) 
    ORDER BY update_time DESC
  `).bind((user as any).id, `%${keyword}%`, `%${keyword}%`).all();

  return c.json({
    code: 0,
    data: (results as any).results || []
  });
});
