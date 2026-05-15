import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  /** 루트 CHICKODE 앱과 동일한 `public/`(예: `public/images`)을 씁니다. */
  publicDir: path.resolve(__dirname, '../public'),
})
