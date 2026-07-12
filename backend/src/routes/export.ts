import { Hono } from 'hono';
import { Env, getUserByToken } from '../database';

export const exportRoute = new Hono<{ Bindings: Env }>();

exportRoute.post('/', async (c) => {
  const token = c.req.header('token');
  if (!token) return c.json({ code: 401, msg: '未登录' }, 401);

  const user = await getUserByToken(c.env.DB, token);
  if (!user) return c.json({ code: 401, msg: '登录已过期' }, 401);

  const results = await c.env.DB.prepare(`
    SELECT * FROM notes WHERE user_id = ? ORDER BY update_time DESC
  `).bind((user as any).id).all();

  const notes = (results as any).results || [];
  const nickname = (user as any).nickname || (user as any).username || '用户';
  
  let content = `===== 备忘录导出 - 用户：${nickname} =====\n`;
  content += `导出时间：${new Date().toLocaleString('zh-CN')}\n`;
  content += `共 ${notes.length} 条备忘录\n\n`;

  notes.forEach((note: any, index: number) => {
    content += `--- 第 ${index + 1} 条 ---\n`;
    content += `标题：${note.title || '无标题'}\n`;
    content += `创建时间：${note.create_time}\n`;
    content += `更新时间：${note.update_time}\n`;
    content += `字数：${note.word_count}\n`;
    content += `内容：\n${note.content || '(空)'}\n\n`;
  });

  return c.json({
    code: 0,
    data: {
      content,
      downloadUrl: null
    }
  });
});
