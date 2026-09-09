import { app } from '../server/dist/server.js';

export default async function handler(req: any, res: any) {
  console.log('[Vercel Serverless] Incoming request:', req.method, req.url);

  return new Promise<void>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };

    res.on('finish', cleanup);
    res.on('close', cleanup);

    try {
      app(req, res, (err: any) => {
        if (settled) return;

        if (err) {
          console.error('[Vercel Serverless] Express error:', err);
          if (!res.headersSent) {
            res.status(500).json({
              error: err.message || 'Internal server error',
              success: false,
            });
          }
          settled = true;
          reject(err);
        } else {
          console.warn('[Vercel Serverless] Unmatched route:', req.method, req.url);
          if (!res.headersSent) {
            res.status(404).json({
              error: `API route not found: ${req.method} ${req.url}`,
              success: false,
            });
          }
          settled = true;
          resolve();
        }
      });
    } catch (err: any) {
      console.error('[Vercel Serverless] Synchronous error:', err);
      if (!res.headersSent) {
        res.status(500).json({
          error: err.message || 'Internal server error',
          success: false,
        });
      }
      settled = true;
      resolve();
    }
  });
}

