import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: './certs/localhost-key.pem',  // Path to your private key
      cert: './certs/localhost.pem',     // Path to your certificate
    },
  },
  
})
