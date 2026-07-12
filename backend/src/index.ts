import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env, initDatabase } from './database';
import { authRoute } from './routes/auth';
import { notesRoute } from './routes/notes';
import { searchRoute } from './routes/search';
import { exportRoute } from './routes/export';
import { adminRoute } from './routes/admin';

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'token']
}));

app.get('/', (c) => {
  return c.json({ code: 0, msg: '个人备忘录 API 服务运行中' });
});

app.get('/health', (c) => {
  return c.json({ code: 0, msg: 'OK' });
});

app.route('/api', authRoute);
app.route('/api/notes', notesRoute);
app.route('/api/search', searchRoute);
app.route('/api/export', exportRoute);
app.route('/admin', adminRoute);

app.onError((err, c) => {
  return c.json({ code: -1, msg: err.message }, 500);
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'POST' && request.url.includes('/init')) {
      await initDatabase(env.DB);
      return new Response('Database initialized', { status: 200 });
    }
    return app.fetch(request, env, ctx);
  }
};
