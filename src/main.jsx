/**
 * PUNTO DE ENTRADA PRINCIPAL DE LA APLICACIÓN
 * 
 * Este archivo inicializa React y renderiza la aplicación en el DOM.
 * Se mantiene minimalista para optimizar el bundle inicial.
 */

import React from 'react'
import ReactDOM from 'react-dom/client' // React 18 - Nuevo API de root
import App from './App.jsx'
import './styles.css' // Estilos globales

/**
 * INICIALIZACIÓN DE REACT
 * 
 * ReactDOM.createRoot() es más eficiente que ReactDOM.render()
 * Permite características concurrentes de React 18
 */
const root = ReactDOM.createRoot(document.getElementById('root'))

/**
 * RENDERIZADO DE LA APLICACIÓN
 * 
 * <React.StrictMode> ayuda a detectar problemas potenciales
 * en desarrollo, pero no afecta el build de producción
 */
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
