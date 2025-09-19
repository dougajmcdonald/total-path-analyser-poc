import { createApp } from './app.js'

const app = createApp()

// For Vercel, export the app as default
export default app

// For local development, start the server
if (process.env.NODE_ENV !== 'production') {
  const port = Number(process.env.PORT ?? 3001)
  app.listen(port, () => {
    console.log(`[backend] listening on http://localhost:${port}`)
  })
}
