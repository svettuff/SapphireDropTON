import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <TonConnectUIProvider manifestUrl="https://svettuff.github.io/SapphireDrop/tonconnect-manifest.json">
          <App />
      </TonConnectUIProvider>
  </React.StrictMode>
);