import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'github-oauth-dev-middleware',
        configureServer(server) {
          server.middlewares.use('/api/auth', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Method not allowed' }));
              return;
            }

            let bodyStr = '';
            req.on('data', (chunk) => {
              bodyStr += chunk;
            });

            req.on('end', async () => {
              try {
                const { code } = JSON.parse(bodyStr || '{}');
                const clientId = env.VITE_GITHUB_CLIENT_ID || process.env.VITE_GITHUB_CLIENT_ID;
                const clientSecret = env.GITHUB_CLIENT_SECRET || process.env.GITHUB_CLIENT_SECRET;

                if (!clientId || !clientSecret) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    error: 'GitHub OAuth non configuré en local. Renseignez VITE_GITHUB_CLIENT_ID et GITHUB_CLIENT_SECRET dans votre fichier .env.'
                  }));
                  return;
                }

                const ghRes = await fetch('https://github.com/login/oauth/access_token', {
                  method: 'POST',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code
                  })
                });

                const data = await ghRes.json();
                res.statusCode = data.error ? 400 : 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify(
                    data.error
                      ? { error: data.error_description || data.error }
                      : { access_token: data.access_token }
                  )
                );
              } catch (e) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: e.message || 'Internal error' }));
              }
            });
          });
        }
      }
    ],
    server: {
      host: true,
      port: 5173
    }
  };
});
