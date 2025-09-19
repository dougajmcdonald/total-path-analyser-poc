import { createApp } from './app.js'

const app = createApp()
const port = Number(process.env.PORT ?? 3001)

app.listen(port, () => {
  console.log(`[backend] listening on http://localhost:${port}`)
})
