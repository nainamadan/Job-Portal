import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import process from 'node:process'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const hasClerkKey = !!(env.VITE_CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY)

  if (!hasClerkKey) {
    console.warn('\n[vite] VITE_CLERK_PUBLISHABLE_KEY is missing: job seeker login is turned off (no-login mode).\n')
  }

  return {
    plugins: [react()],
    resolve: {
      // Without a Clerk key, use a harmless stand-in so the site does not show a blank page.
      alias: hasClerkKey
        ? {}
        : { '@clerk/clerk-react': fileURLToPath(new URL('./src/auth/clerkFallback.jsx', import.meta.url)) },
    },
  }
})
