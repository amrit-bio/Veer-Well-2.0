import { app } from '../server/dist/server.js';

export default async function handler(req: any, res: any) {
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
