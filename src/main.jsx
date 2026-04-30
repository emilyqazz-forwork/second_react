//이 파일은 "모든 부품(jsx)과 스타일(css)을 하나로 모아서 브라우저의 지정된 자리에 딱 붙여주는 연결 고리

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
