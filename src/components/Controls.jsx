/**
 * COMPONENTE DE CONTROLES Y FILTROS
 * 
 * Panel superior con filtros interactivos y información del estado
 * Permite filtrar antenas por operador y tecnología
 */

import React from 'react'

/**
 * COMPONENTE PRINCIPAL DE CONTROLES
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.stats - Estadísticas para poblar los filtros
 * @param {Object} props.filters - Filtros actualmente activos
 * @param {Function} props.onFilterChange - Callback para cambiar filtros
 * @param {number} props.antenasCount - Número de antenas mostradas
 */
export default function Controls({ stats, filters, onFilterChange, antenasCount }) {
  /**
   * DATOS PARA LOS FILTROS
   * 
   * Extrae operadores y tecnologías de las estadísticas
   * Usa valores por defecto si stats no está disponible
   */
  const operadores = stats?.por_operador ? Object.keys(stats.por_operador) : []
  const tecnologias = stats?.por_tecnologia ? Object.keys(stats.por_tecnologia) : []

  /**
   * MANEJADOR DE CAMBIO DE FILTROS
   * 
   * Se ejecuta cuando el usuario cambia un filtro
   * Actualiza el estado en el componente padre (App)
   */
  const handleFilterChange = (filterType, value) => {
    onFilterChange({ [filterType]: value })
  }

  /**
   * MANEJADOR DE LIMPIAR FILTROS
   * 
   * Restablece todos los filtros a sus valores por defecto
   */
  const handleClearFilters = () => {
    onFilterChange({ operador: '', tecnologia: '' })
  }

  return (
    <div className="controls-panel">
      {/* ENCABEZADO DEL PANEL */}
      <div className="controls-header">
        <h2>📡 Mapa de Antenas Móviles - España</h2>
        
        {/* CONTADOR DE ANTENAS VISIBLES */}
        <div className="antena-count">
          {antenasCount} antenas mostradas
          {stats?.total_antenas && (
            <span className="total-count">
              {" "}de {stats.total_antenas} totales
            </span>
          )}
        </div>
      </div>
      
      {/* SECCIÓN DE FILTROS */}
      <div className="filters">
        
        {/* FILTRO POR OPERADOR */}
        <div className="filter-group">
          <label htmlFor="operador-filter">Operador:</label>
          <select 
            id="operador-filter"
            value={filters.operador} 
            onChange={(e) => handleFilterChange('operador', e.target.value)}
            aria-label="Filtrar por operador"
          >
            <option value="">Todos los operadores</option>
            {operadores.map(op => (
              <option key={op} value={op}>
                {op} ({stats.por_operador[op]})
              </option>
            ))}
          </select>
        </div>
        
        {/* FILTRO POR TECNOLOGÍA */}
        <div className="filter-group">
          <label htmlFor="tecnologia-filter">Tecnología:</label>
          <select 
            id="tecnologia-filter"
            value={filters.tecnologia} 
            onChange={(e) => handleFilterChange('tecnologia', e.target.value)}
            aria-label="Filtrar por tecnología"
          >
            <option value="">Todas las tecnologías</option>
            {tecnologias.map(tech => (
              <option key={tech} value={tech}>
                {tech} ({stats.por_tecnologia[tech]})
              </option>
            ))}
          </select>
        </div>
        
        {/* BOTÓN PARA LIMPIAR FILTROS */}
        <button 
          className="clear-filters"
          onClick={handleClearFilters}
          disabled={!filters.operador && !filters.tecnologia}
          aria-label="Limpiar todos los filtros"
        >
          🗑️ Limpiar filtros
        </button>
      </div>

      {/* INDICADORES VISUALES DE FILTROS ACTIVOS */}
      {(filters.operador || filters.tecnologia) && (
        <div className="active-filters">
          <span className="filters-label">Filtros activos:</span>
          
          {filters.operador && (
            <span className="filter-tag">
              Operador: {filters.operador}
              <button 
                onClick={() => handleFilterChange('operador', '')}
                aria-label={`Quitar filtro de operador ${filters.operador}`}
              >
                ×
              </button>
            </span>
          )}
          
          {filters.tecnologia && (
            <span className="filter-tag">
              Tecnología: {filters.tecnologia}
              <button 
                onClick={() => handleFilterChange('tecnologia', '')}
                aria-label={`Quitar filtro de tecnología ${filters.tecnologia}`}
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
