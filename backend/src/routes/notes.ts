import { Hono } from 'hono';
import { Env, getUserByToken } from '../database';

export const notesRoute = new Hono<{ Bindings: Env }>();

notesRoute.get('/', async (c) => {
  const token = c.req.header('token');
  if (!token) return c.json({ code: 401, msg: '未登录' }, 401);

  const user = await getUserByToken(c.env.DB, token);
  if (!user) return c.json({ code: 401, msg: '登录已过期' }, 401);

  const results = await c.env.DB.prepare(`
    SELECT * FROM notes WHERE user_id = ? ORDER BY update_time DESC
  `).bind((user as any).id).all();

  return c.json({
    code: 0,
    data: (results as any).results || []
  });
});

notesRoute.get('/:id', async (c) => {
  const token = c.req.header('token');
  if (!token) return c.json({ code: 401, msg: '未登录' }, 401);

  const user = await getUserByToken(c.env.DB, token);
  if (!user) return c.json({ code: 401, msg: '登录已过期' }, 401);

  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) return c.json({ code: -1, msg: '参数错误' }, 400);

  const result = await c.env.DB.prepare(`
    SELECT * FROM notes WHERE id = ? AND user_id = ?
  `).bind(id, (user as any).id).first();

  if (!result) {
    return c.json({ code: -1, msg: '备忘录不存在' }, 404);
  }

  return c.json({
    code: 0,
    data: result
  });
});

notesRoute.post('/', async (c) => {
  const token = c.req.header('token');
  if (!token) return c.json({ code: 401, msg: '未登录' }, 401);

  const user = await getUserByToken(c.env.DB, token);
  if (!user) return c.json({ code: 401, msg: '登录已过期' }, 401);

  const { title, content } = await c.req.json();
  
  if (!title && !content) {
    return c.json({ code: -1, msg: '内容不能为空' }, 400);
  }

  const wordCount = content ? (content as string).length : 0;
  const now = new Date().toISOString();

  const result = await c.env.DB.prepare(`
    INSERT INTO notes (user_id, title, content, create_time, update_time, word_count) 
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind((user as any).id, title || '无标题', content || '', now, now, wordCount).run();

  const newNote = await c.env.DB.prepare(`
    SELECT * FROM notes WHERE id = (SELECT last_insert_rowid())
  `).first();

  return c.json({
    code: 0,
    msg: '添加成功',
    data: newNote
  });
});

notesRoute.put('/:id', async (c) => {
  const token = c.req.header('token');
  if (!token) return c.json({ code: 401, msg: '未登录' }, 401);

  const user = await getUserByToken(c.env.DB, token);
  if (!user) return c.json({ code: 401, msg: '登录已过期' }, 401);

  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) return c.json({ code: -1, msg: '参数错误' }, 400);

  const { title, content } = await c.req.json();
  
  if (!title && !content) {
    return c.json({ code: -1, msg: '内容不能为空' }, 400);
  }

  const wordCount = content ? (content as string).length : 0;
  const now = new Date().toISOString();

  await c.env.DB.prepare(`
    UPDATE notes SET title = ?, content = ?, update_time = ?, word_count = ? 
    WHERE id = ? AND user_id = ?
  `).bind(title || '无标题', content || '', now, wordCount, id, (user as any).id).run();

  const updatedNote = await c.env.DB.prepare(`
    SELECT * FROM notes WHERE id = ?
  `).bind(id).first();

  return c.json({
    code: 0,
    msg: '更新成功',
    data: updatedNote
  });
});

notesRoute.delete('/:id', async (c) => {
  const token = c.req.header('token');
  if (!token) return c.json({ code: 401, msg: '未登录' }, 401);

  const user = await getUserByToken(c.env.DB, token);
  if (!user) return c.json({ code: 401, msg: '登录已过期' }, 401);

  const id = parseInt(c.req.param('id'));
  if (isNaN(id)) return c.json({ code: -1, msg: '参数错误' }, 400);

  await c.env.DB.prepare(`
    DELETE FROM notes WHERE id = ? AND user_id = ?
  `).bind(id, (user as any).id).run();

  return c.json({
    code: 0,
    msg: '删除成功'
  });
});
