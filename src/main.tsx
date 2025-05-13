import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './styles/global.css';

// グローバル環境のポリフィル
window.global = window;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);