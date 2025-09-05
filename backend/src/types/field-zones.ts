/**
 * DEFINICIONES DE ZONAS DE CANCHA - 12 ZONAS
 * Para uso en backend y validaciones
 * Fecha: 2025-09-05
 */

// Enum de las 12 zonas actualizadas
export enum FieldZone {
  ZONA_1 = 1,   // Defensivo Izquierdo
  ZONA_2 = 2,   // Defensivo Centro
  ZONA_3 = 3,   // Defensivo Derecho
  ZONA_4 = 4,   // Medio Defensivo Izquierdo
  ZONA_5 = 5,   // Medio Defensivo Centro
  ZONA_6 = 6,   // Medio Defensivo Derecho
  ZONA_7 = 7,   // Medio Ofensivo Izquierdo
  ZONA_8 = 8,   // Medio Ofensivo Centro
  ZONA_9 = 9,   // Medio Ofensivo Derecho
  ZONA_10 = 10, // Ofensivo Izquierdo
  ZONA_11 = 11, // Ofensivo Centro
  ZONA_12 = 12  // Ofensivo Derecho
}

// Sectores del área rival (sin cambios)
export enum RivalAreaSector {
  LEFT = 'L',
  CENTER = 'C',
  RIGHT = 'R'
}

// Interface para zona con metadatos
export interface ZoneDefinition {
  id: number;
  name: string;
  description: string;
  row: number;      // 1-4 (defensivo a ofensivo)
  column: number;   // 1-3 (izquierdo, centro, derecho)
  isDefensive: boolean;
  isOffensive: boolean;
}

// Definiciones completas de las 12 zonas
export const ZONE_DEFINITIONS: Record<FieldZone, ZoneDefinition> = {
  [FieldZone.ZONA_1]: {
    id: 1,
    name: 'Defensivo Izquierdo',
    description: 'Zona defensiva del lado izquierdo del campo',
    row: 1,
    column: 1,
    isDefensive: true,
    isOffensive: false
  },
  [FieldZone.ZONA_2]: {
    id: 2,
    name: 'Defensivo Centro',
    description: 'Zona defensiva del centro del campo',
    row: 1,
    column: 2,
    isDefensive: true,
    isOffensive: false
  },
  [FieldZone.ZONA_3]: {
    id: 3,
    name: 'Defensivo Derecho',
    description: 'Zona defensiva del lado derecho del campo',
    row: 1,
    column: 3,
    isDefensive: true,
    isOffensive: false
  },
  [FieldZone.ZONA_4]: {
    id: 4,
    name: 'Medio Defensivo Izquierdo',
    description: 'Zona media defensiva del lado izquierdo del campo',
    row: 2,
    column: 1,
    isDefensive: true,
    isOffensive: false
  },
  [FieldZone.ZONA_5]: {
    id: 5,
    name: 'Medio Defensivo Centro',
    description: 'Zona media defensiva del centro del campo',
    row: 2,
    column: 2,
    isDefensive: true,
    isOffensive: false
  },
  [FieldZone.ZONA_6]: {
    id: 6,
    name: 'Medio Defensivo Derecho',
    description: 'Zona media defensiva del lado derecho del campo',
    row: 2,
    column: 3,
    isDefensive: true,
    isOffensive: false
  },
  [FieldZone.ZONA_7]: {
    id: 7,
    name: 'Medio Ofensivo Izquierdo',
    description: 'Zona media ofensiva del lado izquierdo del campo',
    row: 3,
    column: 1,
    isDefensive: false,
    isOffensive: true
  },
  [FieldZone.ZONA_8]: {
    id: 8,
    name: 'Medio Ofensivo Centro',
    description: 'Zona media ofensiva del centro del campo',
    row: 3,
    column: 2,
    isDefensive: false,
    isOffensive: true
  },
  [FieldZone.ZONA_9]: {
    id: 9,
    name: 'Medio Ofensivo Derecho',
    description: 'Zona media ofensiva del lado derecho del campo',
    row: 3,
    column: 3,
    isDefensive: false,
    isOffensive: true
  },
  [FieldZone.ZONA_10]: {
    id: 10,
    name: 'Ofensivo Izquierdo',
    description: 'Zona ofensiva del lado izquierdo del campo',
    row: 4,
    column: 1,
    isDefensive: false,
    isOffensive: true
  },
  [FieldZone.ZONA_11]: {
    id: 11,
    name: 'Ofensivo Centro',
    description: 'Zona ofensiva del centro del campo',
    row: 4,
    column: 2,
    isDefensive: false,
    isOffensive: true
  },
  [FieldZone.ZONA_12]: {
    id: 12,
    name: 'Ofensivo Derecho',
    description: 'Zona ofensiva del lado derecho del campo',
    row: 4,
    column: 3,
    isDefensive: false,
    isOffensive: true
  }
};

// Funciones helper
export function isValidZone(zone: number): zone is FieldZone {
  return zone >= 1 && zone <= 12 && Number.isInteger(zone);
}

export function getZoneDefinition(zone: FieldZone): ZoneDefinition {
  return ZONE_DEFINITIONS[zone];
}

export function getDefensiveZones(): FieldZone[] {
  return [
    FieldZone.ZONA_1, FieldZone.ZONA_2, FieldZone.ZONA_3,
    FieldZone.ZONA_4, FieldZone.ZONA_5, FieldZone.ZONA_6
  ];
}

export function getOffensiveZones(): FieldZone[] {
  return [
    FieldZone.ZONA_7, FieldZone.ZONA_8, FieldZone.ZONA_9,
    FieldZone.ZONA_10, FieldZone.ZONA_11, FieldZone.ZONA_12
  ];
}

export function getZonesByRow(row: number): FieldZone[] {
  return Object.values(FieldZone)
    .filter(zone => typeof zone === 'number' && ZONE_DEFINITIONS[zone].row === row) as FieldZone[];
}

export function getZonesByColumn(column: number): FieldZone[] {
  return Object.values(FieldZone)
    .filter(zone => typeof zone === 'number' && ZONE_DEFINITIONS[zone].column === column) as FieldZone[];
}
