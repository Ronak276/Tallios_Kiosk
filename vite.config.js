import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { stripeCheckoutPlugin } from './server/stripeCheckout.js'

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), stripeCheckoutPlugin(loadEnv(mode, process.cwd(), 'STRIPE_'))],
}))
