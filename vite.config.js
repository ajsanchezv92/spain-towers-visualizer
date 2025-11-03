/**
 * CONFIGURACIÓN DE VITE - BUILD TOOL OPTIMIZADO
 * 
 * Vite es más rápido que Create React App para desarrollo y build
 * Configuración optimizada para producción
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  /**
   * PLUGINS PRINCIPALES
   * 
   * @vitejs/plugin-react: Soporte para React con Fast Refresh
   */
  plugins: [react()],
  
  /**
   * CONFIGURACIÓN DE BUILD PARA PRODUCCIÓN
   */
  build: {
    /**
     * TARGET DE COMPILACIÓN
     * 
     * 'esnext': Genera código moderno para mejores optimizaciones
     * Navegadores modernos soportan ES modules nativamente
     */
    target: 'esnext',
    
    /**
     * MINIFICACIÓN
     * 
     * 'esbuild': Más rápido y eficiente que Terser
     * Reduce el tamaño del bundle significativamente
     */
    minify: 'esbuild',
    
    /**
     * ANÁLISIS DE BUNDLE
     * 
     * Habilita el análisis visual del bundle para optimizaciones
     * Descomentar para debuggear el tamaño del bundle
     */
    // rollupOptions: {
    //   plugins: [
    //     // visualizer({ open: true }) // npm install rollup-plugin-visualizer
    //   ]
    // },
    
    /**
     * CONFIGURACIÓN DE ASSETS
     * 
     * Límite para inline assets (base64)
     * Assets más pequeños se incluyen en el bundle
     */
    assetsInlineLimit: 4096,
    
    /**
     * REPORTE DE BUNDLE
     * 
     * Muestra advertencias cuando chunks son muy grandes
     * Ayuda a identificar oportunidades de optimización
     */
    chunkSizeWarningLimit: 1000,
    
    /**
     * ELIMINACIÓN DE CONSOLA.LOG EN PRODUCCIÓN
     * 
     * Descomentar para remover todos los console.log en build de producción
     */
    // esbuild: {
    //   drop: ['console', 'debugger']
    // }
  },
  
  /**
   * CONFIGURACIÓN DEL SERVIDOR DE DESARROLLO
   */
  server: {
    /**
     * HOST Y PUERTO
     * 
     * 'true': Permite conexiones desde cualquier IP (útil para testing móvil)
     * 3000: Puerto por defecto, cambiar si está ocupado
     */
    host: true,
    port: 3000,
    
    /**
     * HOT RELOAD
     * 
     * Habilita recarga en caliente para desarrollo rápido
     */
    hmr: {
      overlay: true // Muestra errores en overlay del navegador
    }
  },
  
  /**
   * ALIAS DE IMPORTACIÓN (OPCIONAL)
   * 
   * Permite imports absolutos para mejor legibilidad
   * Descomentar si prefieres imports como '@/components/Map'
   */
  // resolve: {
  //   alias: {
  //     '@': path.resolve(__dirname, './src')
  //   }
  // },
  
  /**
   * VARIABLES DE ENTORNO
   * 
   * Prefijo para variables que se exponen al cliente
   * Las variables con VITE_ estarán disponibles en import.meta.env
   */
  envPrefix: 'VITE_'
})
