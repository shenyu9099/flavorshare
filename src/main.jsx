import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 初始化 Azure Application Insights
import { appInsights } from './config/appInsights'

// 全局错误处理
window.onerror = (message, source, lineno, colno, error) => {
  appInsights.trackException({ exception: error || new Error(message) });
};

// Promise 未捕获错误处理
window.onunhandledrejection = (event) => {
  appInsights.trackException({ exception: event.reason });
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

