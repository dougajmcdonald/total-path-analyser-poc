import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.jsx"
import "./globals.css"

// Import debug utilities in development
if (import.meta.env.DEV) {
  import("./utils/debug.js")
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
