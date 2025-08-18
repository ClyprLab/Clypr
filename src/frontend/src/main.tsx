import './polyfills';  // Must be first import
import './index.css'; // Tailwind v4
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ToastProvider } from './components/Feedback/ToastProvider';

function removeInitialLoader() {
  try {
    const loader = document.getElementById('initial-loader');
    if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
  } catch (e) {
    // ignore
  }
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// ensure loader removal after mount
setTimeout(removeInitialLoader, 50);

export {};
