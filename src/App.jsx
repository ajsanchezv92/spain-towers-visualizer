/**
 * COMPONENTE PRINCIPAL DE LA APLICACIÓN
 * 
 * Maneja el estado global, efectos de carga de datos,
 * y la comunicación entre componentes.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import MapContainer from './components/MapContainer'
import Controls from './components/Controls'
import StatsPanel from './components/StatsPanel'
import { loadMapData } from './services/api'

/**
 * CONFIGURACIÓN DE LA API
 * 
 * Usa variable de entorno en producción, fallback para desarrollo
 * Esto permite diferentes entornos sin cambiar código
 */
const API_BASE = import.meta.env.VITE_API_URL || 'https://your-api.railway.app'

function App() {
  // ESTADO GLOBAL DE LA APLICACIÓN
  
  /**
   * antenas: Array de antenas a mostrar en el mapa
   * Formato GeoJSON FeatureCollection para compatibilidad con Leaflet
   */
  const [antenas, setAntenas] = useState([])
  
  /**
   * stats: Estadísticas globales (operadores, tecnologías, etc.)
   * Se carga una vez al inicio y se cachea
   */
  const [stats, setStats] = useState(null)
  
  /**
   * loading: Estado de carga inicial
   * Controla la pantalla de carga mientras se obtienen datos
   */
  const [loading, setLoading] = useState(true)
  
  /**
   * error: Manejo de errores de la aplicación
   * Muestra mensajes amigables al usuario en caso de fallos
   */
  const [error, setError] = useState(null)
  
  /**
   * filters: Filtros activos aplicados a los datos
   * - operador: Filtro por compañía (Movistar, Vodafone, etc.)
   * - tecnologia: Filtro por tecnología (4G, 5G, etc.)
   * - viewport: Bounding box actual del mapa para lazy loading
   */
  const [filters, setFilters] = useState({
    operador: '',
    tecnologia: '',
    viewport: null
  })

  // EFECTO: CARGA INICIAL DE DATOS
  useEffect(() => {
    /**
     * Función asíncrona que carga los datos iniciales
     * Se ejecuta una vez al montar el componente
     */
    const initializeData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        /**
         * CARGAR DATOS EN PARALELO
         * 
         * Promise.all() permite cargar múltiples endpoints simultáneamente
         * Esto reduce el tiempo de carga inicial
         */
        const [statsData, initialAntenas] = await Promise.all([
          // Estadísticas globales
          loadMapData(`${API_BASE}/map/stats`),
          // Datos iniciales para el mapa (limitados para mejor rendimiento)
          loadMapData(`${API_BASE}/map/antenas?limit=200`)
        ])
        
        // ACTUALIZAR ESTADO CON DATOS OBTENIDOS
        setStats(statsData)
        setAntenas(initialAntenas.features || [])
        
      } catch (err) {
        /**
         * MANEJO DE ERRORES
         * 
         * Captura errores de red, API no disponible, etc.
         * Proporciona feedback al usuario
         */
        console.error('❌ Error loading initial data:', err)
        setError('No se pudieron cargar los datos de antenas. Verifica tu conexión.')
      } finally {
        // FINALIZAR ESTADO DE CARGA INDEPENDIENTEMENTE DEL RESULTADO
        setLoading(false)
      }
    }

    // EJECUTAR CARGA INICIAL
    initializeData()
  }, []) // Array de dependencias vacío = solo al montar

  /**
   * ACTUALIZACIÓN DE FILTROS
   * 
   * useCallback evita recreaciones innecesarias de la función
   * lo que optimiza el rendimiento en componentes hijos
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  /**
   * DATOS FILTRADOS MEMORIZADOS
   * 
   * useMemo evita recalcular los datos filtrados en cada render
   * Solo se recalcula cuando cambian antenas o los filtros
   */
  const filteredAntenas = useMemo(() => {
    return antenas.filter(antena => {
      const props = antena.properties || {}
      
      // FILTRO POR OPERADOR
      if (filters.operador && props.operador !== filters.operador) {
        return false
      }
      
      // FILTRO POR TECNOLOGÍA
      if (filters.tecnologia && props.tecnologia !== filters.tecnologia) {
        return false
      }
      
      // SI PASA TODOS LOS FILTROS, INCLUIR EN RESULTADOS
      return true
    })
  }, [antenas, filters.operador, filters.tecnologia])

  /**
   * MANEJO DE CAMBIO DE VIEWPORT
   * 
   * Carga datos específicos para el área visible en el mapa
   * Implementa lazy loading para mejor rendimiento
   */
  const handleViewportChange = useCallback(async (viewport) => {
    if (!viewport) return
    
    try {
      const { bbox, zoom } = viewport
      
      /**
       * ESTRATEGIA DE CARGA INTELIGENTE
       * 
       * - Zoom bajo (<=10): Usa clusters para áreas amplias
       * - Zoom alto (>10): Muestra antenas individuales
       */
      const endpoint = zoom <= 10 ? '/map/clusters' : '/map/antenas'
      const params = new URLSearchParams({
        bbox: bbox.join(','),
        zoom: zoom.toString()
      })
      
      // AÑADIR FILTROS ACTIVOS A LA CONSULTA
      if (filters.operador) params.append('operador', filters.operador)
      if (filters.tecnologia) params.append('tecnologia', filters.tecnologia)
      
      // CARGAR DATOS ESPECÍFICOS DEL VIEWPORT
      const data = await loadMapData(`${API_BASE}${endpoint}?${params}`)
      setAntenas(data.features || [])
      
    } catch (err) {
      console.error('❌ Error updating viewport data:', err)
      // No mostramos error al usuario para no interrumpir experiencia
    }
  }, [filters.operador, filters.tecnologia])

  // ESTADOS DE LA INTERFAZ DE USUARIO

  /**
   * ESTADO DE CARGA INICIAL
   * Muestra spinner mientras se obtienen los primeros datos
   */
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Cargando mapa de antenas móviles...</p>
      </div>
    )
  }

  /**
   * ESTADO DE ERROR
   * Muestra mensaje amigable y opción para reintentar
   */
  if (error) {
    return (
      <div className="error-screen">
        <h2>⚠️ Error al cargar el dashboard</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    )
  }

  /**
   * ESTADO NORMAL - INTERFAZ PRINCIPAL
   * 
   * Layout en CSS Grid para organización responsive
   * Componentes separados por responsabilidades
   */
  return (
    <div className="app">
      {/* PANEL DE CONTROLES SUPERIOR */}
      <Controls 
        stats={stats}
        filters={filters}
        onFilterChange={updateFilters}
        antenasCount={filteredAntenas.length}
      />
      
      {/* COMPONENTE DEL MAPA - Ocupa la mayor parte de la pantalla */}
      <MapContainer 
        antenas={filteredAntenas}
        onViewportChange={handleViewportChange}
        filters={filters}
      />
      
      {/* PANEL LATERAL DE ESTADÍSTICAS */}
      <StatsPanel stats={stats} />
    </div>
  )
}

export default App
