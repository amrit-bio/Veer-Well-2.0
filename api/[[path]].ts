import { app } from '../server/dist/server.js';

export default async function handler(req: any, res: any) {
  console.log('[api/[[path]]] Incoming request:', req.method, req.url);
  try {
    return await new Promise<void>((resolve, reject) => {
      app(req, res, (err: any) => {
        if (err) {
          console.error('[api/[[path]]] Express error:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: err.message || 'Internal server error' });
          }
          reject(err);
        } else {
          console.log('[api/[[path]]] Express handled without error, status:', res.statusCode);
          resolve();
        }
      });
    });
  } catch (err: any) {
    console.error('[api/[[path]]] Handler error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
