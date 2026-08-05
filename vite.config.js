import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base so the built app works whether it's served from the
  // repo root (custom domain / user page) or from a project page path
  // like https://username.github.io/repo-name/
  base: './',
})
