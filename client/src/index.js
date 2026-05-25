// Path: client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; 
import { GoogleOAuthProvider } from '@react-oauth/google';

/**
 * React 18 Root API
 * We create the root once and render our App component inside it.
 * StrictMode helps identify potential problems in the application during development.
 */
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);