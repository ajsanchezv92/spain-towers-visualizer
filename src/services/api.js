/**
 * SERVICIO DE API - GESTIÓN INTELIGENTE DE PETICIONES
 * 
 * Maneja todas las comunicaciones con el backend
 * Implementa cache, timeouts y manejo de errores
 */

/**
 * SISTEMA DE CACHE EN MEMORIA
 * 
 * Almacena respuestas para evitar peticiones duplicadas
 * Mejora rendimiento y reduce carga del servidor
 */
const CACHE = new Map()

/**
 * DURACIÓN DEL CACHE (5 minutos)
 * 
 * Balance entre datos frescos y rendimiento
 * 5 minutos es razonable para datos que no cambian frecuentemente
 */
const CACHE_DURATION = 5 * 60 * 1000

/**
 * FUNCIÓN PRINCIPAL PARA CARGAR DATOS DEL MAPA
 * 
 * @param {string} url - URL completa del endpoint
 * @returns {Promise<any>} - Datos parseados de la API
 * @throws {Error} - Si hay error de red o servidor
 */
export async function loadMapData(url) {
  /**
   * VERIFICAR CACHE PRIMERO
   * 
   * Si tenemos una respuesta cacheada y aún es válida,
   * la devolvemos inmediatamente sin hacer petición
   */
  const cached = CACHE.get(url)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📦 [CACHE HIT]', url)
    return cached.data
  }

  console.log('🌐 [API CALL]', url)

  try {
    /**
     * REALIZAR PETICIÓN HTTP
     * 
     * Configuración optimizada:
     * - Timeout de 10 segundos
     * - Solo acepta JSON
     * - AbortSignal para cancelación
     */
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // Timeout de 10 segundos
    })

    /**
     * VERIFICAR STATUS HTTP
     * 
     * Lanza error si la respuesta no es exitosa (200-299)
     * Esto captura 404, 500, etc.
     */
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    /**
     * PARSEAR RESPUESTA JSON
     * 
     * Usamos await en lugar de .then() para mejor legibilidad
     * y manejo de errores
     */
    const data = await response.json()

    /**
     * GUARDAR EN CACHE
     * 
     * Almacena tanto los datos como el timestamp
     * para controlar la expiración
     */
    CACHE.set(url, {
      data,
      timestamp: Date.now()
    })
    
    console.log('✅ [API SUCCESS]', url, `(${getDataSize(data)} bytes)`)
    return data

  } catch (error) {
    /**
     * MANEJO DETALLADO DE ERRORES
     * 
     * Distingue entre diferentes tipos de errores
     * para mejor debugging
     */
    console.error('❌ [API ERROR]', url, error)
    
    if (error.name === 'TimeoutError') {
      throw new Error('El servidor tardó demasiado en responder')
    } else if (error.name === 'AbortError') {
      throw new Error('La petición fue cancelada')
    } else if (error.message.includes('HTTP')) {
      throw new Error(`Error del servidor: ${error.message}`)
    } else {
      throw new Error('Error de conexión. Verifica tu internet.')
    }
  }
}

/**
 * FUNCIÓN AUXILIAR: CALCULAR TAMAÑO APROXIMADO DE DATOS
 * 
 * @param {any} data - Datos a medir
 * @returns {number} - Tamaño aproximado en bytes
 */
function getDataSize(data) {
  try {
    return new Blob([JSON.stringify(data)]).size
  } catch {
    return 0
  }
}

/**
 * LIMPIEZA PERIÓDICA DEL CACHE
 * 
 * Elimina entradas expiradas cada minuto
 * Previene crecimiento infinito de la memoria
 */
setInterval(() => {
  const now = Date.now()
  let cleanedCount = 0
  
  for (const [key, value] of CACHE.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      CACHE.delete(key)
      cleanedCount++
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`🧹 [CACHE CLEANED] ${cleanedCount} expired entries`)
  }
}, 60000) // Ejecutar cada minuto
