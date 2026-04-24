import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { Capacitor } from '@capacitor/core';

// Static imports — avoids dynamic import issues in Capacitor WebView
import AppWeb from './App.web';
import AppMobile from './App.mobile';

const isNative = Capacitor.isNativePlatform();
const App = isNative ? AppMobile : AppWeb;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

reportWebVitals();
