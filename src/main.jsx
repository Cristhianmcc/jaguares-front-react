import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/tailwind.css';
import { loadScriptsSequentially } from './loadScripts.js';

const root = createRoot(document.getElementById('root'));
root.render(<App />);

// Eliminar el loader splash cuando TODO esté cargado (imágenes, scripts, CSS)
const hideLoader = () => {
  const loader = document.getElementById('app-loader');
  if (!loader) return;
  loader.classList.add('fade-out');
  loader.addEventListener('transitionend', () => loader.remove(), { once: true });
};

// Tiempo mínimo de display (600ms) + esperar a que window cargue completamente
const minDisplay = new Promise(resolve => setTimeout(resolve, 600));
const pageLoad  = new Promise(resolve => {
  if (document.readyState === 'complete') resolve();
  else window.addEventListener('load', resolve, { once: true });
});
Promise.all([minDisplay, pageLoad]).then(hideLoader);

loadScriptsSequentially().catch((err) => console.error('Script loading failed:', err));
