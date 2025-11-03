/**
 * COMPONENTE DEL MAPA LEAFLET
 * 
 * Renderiza el mapa interactivo y gestiona los marcadores
 * Implementa optimizaciones para rendimiento con muchos puntos
 */

import React, { useMemo, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

/**
 * FIX PARA ICONOS DE LEAFLET EN ENTORNOS MODERNOS
 * 
 * Leaflet espera iconos en rutas específicas que no existen en React
 * Esta configuración usa CDN para los iconos por defecto
 */
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

/**
 * PALETA DE COLORES POR OPERADOR
 * 
 * Colores distintivos para cada compañía
 * Mejora la experiencia visual y la identificación rápida
 */
const OPERATOR_COLORS = {
  'Movistar': '#00a8ff',    // Azul corporativo
  'Vodafone': '#e84118',    // Rojo corporativo
  'Orange': '#ff9f1a',      // Naranja corporativo
  'Yoigo': '#44bd32',       // Verde corporativo
  'Default': '#718093'      // Gris para operadores desconocidos
}

/**
 * COMPONENTE DE EVENTOS DEL MAPA
 * 
 * Se encarga de detectar cambios en la vista del mapa
 * y notificar al componente padre para lazy loading
 */
function MapEvents({ onViewportChange }) {
  const map = useMapEvents({
    /**
     * EVENTO: MOVIMIENTO DEL MAPA FINALIZADO
     * 
     * Se ejecuta cuando el usuario termina de mover/zoom el mapa
     * Es más eficiente que escuchar cada frame de movimiento
     */
    moveend: () => {
      const bounds = map.getBounds()
      const center = map.getCenter()
      const zoom = map.getZoom()
      
      /**
       * INFORMACIÓN DEL VIEWPORT ACTUAL
       * 
       * - bbox: Bounding box [min_lon, min_lat, max_lon, max_lat]
       * - center: Coordenadas del centro [lat, lon]
       * - zoom: Nivel de zoom actual
       */
      onViewportChange({
        bbox: [
          bounds.getWest(),  // Longitud oeste
          bounds.getSouth(), // Latitud sur
          bounds.getEast(),  // Longitud este  
          bounds.getNorth()  // Latitud norte
        ],
        center: [center.lat, center.lng],
        zoom
      })
    }
  })
  
  // Componente no renderiza nada visible
  return null
}

/**
 * COMPONENTE PRINCIPAL DEL MAPA
 */
export default function MapComponent({ antenas, onViewportChange, filters }) {
  /**
   * CONFIGURACIÓN INICIAL DEL MAPA
   * 
   * useMemo evita recrear estos valores en cada render
   * Centro en Madrid por defecto como vista inicial de España
   */
  const center = useMemo(() => [40.4168, -3.7038], []) // Madrid
  const zoom = 6 // Zoom que muestra toda España

  /**
   * FUNCIÓN PARA CREAR ICONOS PERSONALIZADOS
   * 
   * useCallback memoiza la función para evitar recreaciones
   * que causarían rerenders innecesarios de los marcadores
   */
  const createIcon = useCallback((operador) => {
    const color = OPERATOR_COLORS[operador] || OPERATOR_COLORS.Default
    
    /**
     * ICONO DIV PERSONALIZADO
     * 
     * Más eficiente que imágenes para muchos marcadores
     * Círculos de colores con borde blanco para mejor contraste
     */
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color}; 
          width: 12px; 
          height: 12px; 
          border-radius: 50%; 
          border: 2px solid white; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [16, 16],    // Tamaño total del icono
      iconAnchor: [8, 8]     // Punto de anclaje (centro)
    })
  }, [])

  /**
   * AGRUPAMIENTO DE ANTENAS CERCANAS
   * 
   * Evita superposición de marcadores en zoom bajo
   * Mejora rendimiento y legibilidad del mapa
   */
  const groupedAntenas = useMemo(() => {
    if (!antenas.length) return []
    
    const groups = []
    const groupDistance = 0.01 // ~1km en grados decimales
    
    antenas.forEach(antena => {
      const coords = antena.geometry.coordinates // [lon, lat]
      let addedToGroup = false
      
      // BUSCAR GRUPO EXISTENTE CERCANO
      for (const group of groups) {
        const groupCoords = group.geometry.coordinates
        
        // DISTANCIA EUCLIDIANA SIMPLIFICADA
        // Suficientemente precisa para agrupamiento visual
        const distance = Math.sqrt(
          Math.pow(coords[0] - groupCoords[0], 2) + 
          Math.pow(coords[1] - groupCoords[1], 2)
        )
        
        // SI ESTÁ DENTRO DEL RADIO, AGRUPAR
        if (distance < groupDistance) {
          group.properties.count = (group.properties.count || 1) + 1
          addedToGroup = true
          break
        }
      }
      
      // SI NO SE AGRUPÓ, CREAR NUEVO GRUPO
      if (!addedToGroup) {
        groups.push({
          ...antena,
          properties: {
            ...antena.properties,
            count: 1 // Iniciar contador
          }
        })
      }
    })
    
    console.log(`📍 [MAP] ${antenas.length} antenas → ${groups.length} grupos`)
    return groups
  }, [antenas])

  /**
   * RENDERIZADO DEL COMPONENTE
   */
  return (
    <div className="map-container">
      {/**
       * CONTENEDOR PRINCIPAL DE LEAFLET
       * 
       * Configuración optimizada:
       * - zoomControl: true (controles de zoom visibles)
       * - maxBounds: Limita el mapa a España
       */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        maxBounds={[[27.5, -18.5], [44.0, 4.5]]} // España bounds
      >
        {/**
         * CAPA DE TILES (BASE DEL MAPA)
         * 
         * OpenStreetMap es gratuito y no requiere API key
         * Alternativas: Mapbox, Google Maps (requieren API key)
         */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/**
         * COMPONENTE DE EVENTOS
         * Detecta cambios en la vista para lazy loading
         */}
        <MapEvents onViewportChange={onViewportChange} />
        
        {/**
         * RENDERIZADO DE MARCADORES
         * 
         * Usa grupos para evitar superposición
         * Key única para cada marcador para optimización de React
         */}
        {groupedAntenas.map((antena, index) => (
          <Marker
            key={antena.properties?.id || `antena-${index}`}
            position={[
              antena.geometry.coordinates[1], // lat
              antena.geometry.coordinates[0]  // lon
            ]}
            icon={createIcon(antena.properties?.operador)}
          >
            {/**
             * POPUP INFORMATIVO
             * Se muestra al hacer click en el marcador
             */}
            <Popup>
              <div className="popup-content">
                <h3>Antena {antena.properties?.operador}</h3>
                <p><strong>Tecnología:</strong> {antena.properties?.tecnologia || 'N/A'}</p>
                <p><strong>Provincia:</strong> {antena.properties?.provincia || 'N/A'}</p>
                
                {/**
                 * INDICADOR DE AGRUPAMIENTO
                 * Muestra cuántas antenas hay en este grupo
                 */}
                {antena.properties?.count > 1 && (
                  <p><em>{antena.properties.count} antenas en esta zona</em></p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
