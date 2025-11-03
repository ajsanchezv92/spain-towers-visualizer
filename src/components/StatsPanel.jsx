/**
 * PANEL DE ESTADÍSTICAS LATERAL
 * 
 * Muestra información resumida sobre las antenas
 * Operadores, tecnologías y distribución geográfica
 */

import React, { useMemo } from 'react'

/**
 * COMPONENTE PRINCIPAL DEL PANEL DE ESTADÍSTICAS
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.stats - Objeto con todas las estadísticas
 */
export default function StatsPanel({ stats }) {
  /**
   * ESTADÍSTICAS DE OPERADORES ORDENADAS
   * 
   * useMemo para evitar recalcular en cada render
   * Ordena por cantidad descendente
   */
  const sortedOperadores = useMemo(() => {
    if (!stats?.por_operador) return []
    
    return Object.entries(stats.por_operador)
      .sort(([, a], [, b]) => b - a) // Ordenar por cantidad descendente
      .slice(0, 10) // Mostrar solo top 10
  }, [stats?.por_operador])

  /**
   * ESTADÍSTICAS DE TECNOLOGÍAS ORDENADAS
   */
  const sortedTecnologias = useMemo(() => {
    if (!stats?.por_tecnologia) return []
    
    return Object.entries(stats.por_tecnologia)
      .sort(([, a], [, b]) => b - a)
  }, [stats?.por_tecnologia])

  /**
   * ESTADÍSTICAS DE PROVINCIAS (TOP 10)
   */
  const topProvincias = useMemo(() => {
    if (!stats?.por_provincia) return []
    
    return Object.entries(stats.por_provincia)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10) // Top 10 provincias
  }, [stats?.por_provincia])

  /**
   * CALCULAR PORCENTAJES
   * 
   * Convierte conteos absolutos en porcentajes para las barras
   */
  const calculatePercentage = (count) => {
    if (!stats?.total_antenas) return 0
    return ((count / stats.total_antenas) * 100).toFixed(1)
  }

  // Si no hay estadísticas, mostrar estado vacío
  if (!stats) {
    return (
      <div className="stats-panel">
        <div className="stats-section">
          <h3>📊 Estadísticas</h3>
          <p>Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="stats-panel">
      
      {/* ENCABEZADO DEL PANEL */}
      <div className="stats-header">
        <h3>📊 Estadísticas Globales</h3>
        <div className="total-antenas">
          Total: <strong>{stats.total_antenas?.toLocaleString()}</strong> antenas
        </div>
      </div>

      {/* SECCIÓN: DISTRIBUCIÓN POR OPERADOR */}
      <div className="stats-section">
        <h4>📶 Operadores</h4>
        <div className="stats-list">
          {sortedOperadores.map(([operador, count]) => (
            <div key={operador} className="stat-item">
              <div className="stat-label">
                <span className="operator-color" 
                      style={{backgroundColor: getOperatorColor(operador)}}>
                </span>
                {operador}
              </div>
              <div className="stat-value">
                <span className="count">{count.toLocaleString()}</span>
                <span className="percentage">
                  ({calculatePercentage(count)}%)
                </span>
              </div>
              {/* BARRA DE PROGRESO VISUAL */}
              <div className="stat-bar">
                <div 
                  className="stat-bar-fill"
                  style={{ width: `${calculatePercentage(count)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN: DISTRIBUCIÓN POR TECNOLOGÍA */}
      <div className="stats-section">
        <h4>🛰️ Tecnologías</h4>
        <div className="stats-list">
          {sortedTecnologias.map(([tecnologia, count]) => (
            <div key={tecnologia} className="stat-item">
              <div className="stat-label">{tecnologia}</div>
              <div className="stat-value">
                <span className="count">{count.toLocaleString()}</span>
                <span className="percentage">
                  ({calculatePercentage(count)}%)
                </span>
              </div>
              {/* BARRA DE PROGRESO VISUAL */}
              <div className="stat-bar">
                <div 
                  className="stat-bar-fill"
                  style={{ width: `${calculatePercentage(count)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN: TOP PROVINCIAS (si están disponibles) */}
      {topProvincias.length > 0 && (
        <div className="stats-section">
          <h4>📍 Top Provincias</h4>
          <div className="stats-list">
            {topProvincias.map(([provincia, count]) => (
              <div key={provincia} className="stat-item">
                <div className="stat-label">{provincia}</div>
                <div className="stat-value">
                  <span className="count">{count.toLocaleString()}</span>
                </div>
                <div className="stat-bar">
                  <div 
                    className="stat-bar-fill"
                    style={{ width: `${calculatePercentage(count)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INFORMACIÓN DE ACTUALIZACIÓN */}
      <div className="stats-footer">
        <p className="update-info">
          ℹ️ Datos proporcionados por el Ministerio de Industria, Comercio y Turismo
        </p>
        <p className="data-info">
          Última actualización: {new Date().toLocaleDateString('es-ES')}
        </p>
      </div>
    </div>
  )
}

/**
 * FUNCIÓN AUXILIAR: OBTENER COLOR POR OPERADOR
 * 
 * @param {string} operador - Nombre del operador
 * @returns {string} - Código hexadecimal del color
 */
function getOperatorColor(operador) {
  const colors = {
    'Movistar': '#00a8ff',
    'Vodafone': '#e84118', 
    'Orange': '#ff9f1a',
    'Yoigo': '#44bd32'
  }
  return colors[operador] || '#718093'
}
