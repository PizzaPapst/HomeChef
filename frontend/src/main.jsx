import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <--- Importieren
import App from './App.jsx'
import './index.css'
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';


ReactDOM.createRoot(document.getElementById('root')).render(
  
  <React.StrictMode>
    {/* Die App wird vom Router umschlossen */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)