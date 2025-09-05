/**
 * COORDENADAS DE ZONAS DE CANCHA - 12 ZONAS
 * Basado en la imagen proporcionada y especificaciones actualizadas
 * Fecha: 2025-09-05
 */

// Definición de las 12 zonas con sus coordenadas para mapas de calor
export const FIELD_ZONES_12 = {
  // Fila 1 - Defensiva (cerca del arco propio)
  ZONA_1: {
    id: 1,
    name: 'Defensivo Izquierdo',
    coordinates: {
      x: 16.67,  // 1/6 del ancho (primer tercio)
      y: 12.5,   // 1/8 de la altura (primera fila)
      width: 16.67,
      height: 12.5
    },
    color: '#ff4444' // Rojo para zona defensiva
  },
  ZONA_2: {
    id: 2,
    name: 'Defensivo Centro',
    coordinates: {
      x: 33.33,  // 2/6 del ancho (segundo tercio)
      y: 12.5,
      width: 16.67,
      height: 12.5
    },
    color: '#ff6666'
  },
  ZONA_3: {
    id: 3,
    name: 'Defensivo Derecho',
    coordinates: {
      x: 50.0,   // 3/6 del ancho (tercer tercio)
      y: 12.5,
      width: 16.67,
      height: 12.5
    },
    color: '#ff8888'
  },

  // Fila 2 - Medio Defensiva
  ZONA_4: {
    id: 4,
    name: 'Medio Defensivo Izquierdo',
    coordinates: {
      x: 16.67,
      y: 37.5,   // 3/8 de la altura (segunda fila)
      width: 16.67,
      height: 12.5
    },
    color: '#ffaa44' // Naranja para zona medio defensiva
  },
  ZONA_5: {
    id: 5,
    name: 'Medio Defensivo Centro',
    coordinates: {
      x: 33.33,
      y: 37.5,
      width: 16.67,
      height: 12.5
    },
    color: '#ffcc66'
  },
  ZONA_6: {
    id: 6,
    name: 'Medio Defensivo Derecho',
    coordinates: {
      x: 50.0,
      y: 37.5,
      width: 16.67,
      height: 12.5
    },
    color: '#ffdd88'
  },

  // Fila 3 - Medio Ofensiva
  ZONA_7: {
    id: 7,
    name: 'Medio Ofensivo Izquierdo',
    coordinates: {
      x: 16.67,
      y: 62.5,   // 5/8 de la altura (tercera fila)
      width: 16.67,
      height: 12.5
    },
    color: '#44ff44' // Verde para zona medio ofensiva
  },
  ZONA_8: {
    id: 8,
    name: 'Medio Ofensivo Centro',
    coordinates: {
      x: 33.33,
      y: 62.5,
      width: 16.67,
      height: 12.5
    },
    color: '#66ff66'
  },
  ZONA_9: {
    id: 9,
    name: 'Medio Ofensivo Derecho',
    coordinates: {
      x: 50.0,
      y: 62.5,
      width: 16.67,
      height: 12.5
    },
    color: '#88ff88'
  },

  // Fila 4 - Ofensiva (cerca del arco rival)
  ZONA_10: {
    id: 10,
    name: 'Ofensivo Izquierdo',
    coordinates: {
      x: 16.67,
      y: 87.5,   // 7/8 de la altura (cuarta fila)
      width: 16.67,
      height: 12.5
    },
    color: '#4444ff' // Azul para zona ofensiva
  },
  ZONA_11: {
    id: 11,
    name: 'Ofensivo Centro',
    coordinates: {
      x: 33.33,
      y: 87.5,
      width: 16.67,
      height: 12.5
    },
    color: '#6666ff'
  },
  ZONA_12: {
    id: 12,
    name: 'Ofensivo Derecho',
    coordinates: {
      x: 50.0,
      y: 87.5,
      width: 16.67,
      height: 12.5
    },
    color: '#8888ff'
  }
};

// Función helper para obtener coordenadas por ID de zona
export function getZoneCoordinates(zoneId) {
  const zone = Object.values(FIELD_ZONES_12).find(z => z.id === zoneId);
  return zone ? zone.coordinates : null;
}

// Función helper para obtener color por ID de zona
export function getZoneColor(zoneId) {
  const zone = Object.values(FIELD_ZONES_12).find(z => z.id === zoneId);
  return zone ? zone.color : '#cccccc';
}

// Sectores del área rival (sin cambios)
export const RIVAL_AREA_SECTORS = {
  L: { name: 'Izquierda', x: 20, y: 95, width: 20, height: 5, color: '#ff0000' },
  C: { name: 'Central', x: 40, y: 95, width: 20, height: 5, color: '#ff4444' },
  R: { name: 'Derecha', x: 60, y: 95, width: 20, height: 5, color: '#ff8888' }
};

// Configuración para generación de mapas de calor
export const HEATMAP_CONFIG = {
  fieldWidth: 800,   // Ancho del campo en pixels
  fieldHeight: 600,  // Alto del campo en pixels
  zoneOpacityMin: 0.1,
  zoneOpacityMax: 0.8,
  colorScale: ['#blue', '#green', '#yellow', '#orange', '#red']
};
