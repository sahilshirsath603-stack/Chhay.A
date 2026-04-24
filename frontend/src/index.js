import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { isNative } from './platform';

// Dynamically pick the correct app based on platform
const AppWeb = React.lazy(() => import('./App.web'));
const AppMobile = React.lazy(() => import('./App.mobile'));

const App = isNative ? AppMobile : AppWeb;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.Suspense fallback={<div style={{ background: '#0f0f1a', height: '100vh' }} />}>
    <App />
  </React.Suspense>
);

reportWebVitals();
