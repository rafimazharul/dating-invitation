import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'api-dev-server',
        configureServer(server) {
          server.middlewares.use('/api/send', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Method not allowed' }))
              return
            }

            let body = ''
            req.on('data', (chunk) => {
              body += chunk
            })
            req.on('end', async () => {
              try {
                req.body = body ? JSON.parse(body) : {}

                // Ensure env vars are in process.env for the handler
                process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || env.RESEND_API_KEY
                process.env.TO_EMAIL = process.env.TO_EMAIL || env.TO_EMAIL
                process.env.FROM_EMAIL = process.env.FROM_EMAIL || env.FROM_EMAIL

                const { default: handler } = await server.ssrLoadModule('/api/send.js')

                const mockRes = {
                  status(code) {
                    res.statusCode = code
                    return this
                  },
                  json(data) {
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify(data))
                    return this
                  },
                }

                await handler(req, mockRes)
              } catch (err) {
                console.error('[api/send] dev error:', err)
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }))
              }
            })
          })
        },
      },
    ],
  }
})
