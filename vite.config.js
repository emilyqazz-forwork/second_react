//현재 CHICKODE 프로젝트의 프런트엔드가 Vite 환경에서 React로 돌아가기 위한 가장 기본적인 최소 설정
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
