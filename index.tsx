import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Import Tailwind directives via JS is not standard without CSS file, 
// so we rely on the CDN in index.html or setup postcss. 
// For this simple deployment, we will add the Tailwind CDN back to index.html to ensure styles work easily without complex CSS setup.
import './index.css'; 

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);