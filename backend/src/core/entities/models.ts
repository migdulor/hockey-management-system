// Player entity
/*
  Positions: Goalkeeper, Defender, Midfielder, Forward, Substitute (for non-starters in formation)
  No injury history, statistics, or medical data required
  Players cannot change teams, but can be available for higher category formations
  No contact or documentation fields needed
  Nationality not required
  Add field for nickname or short name
*/
export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  position: string;
  teamId: string;
  nickname?: string;
  // Add more fields as needed
}

// Team entity
/*
  Teams can have multiple coaches, but coach is not registered as a user
  Must store history of players and formations for match statistics
  Allow team badges/logos
  No competition relationship; formation is linked to match
*/
export interface Team {
  id: string;
  name: string;
  badgeUrl?: string;
  founded: number;
  // Add more fields as needed
}

// Match entity
/*
  Matches are part of tournaments or leagues, but not directly linked to them
  Coach selects players for starting and substitute positions per category
  Events structure is defined by admin and available during match
  State is important for post-match reports
*/
export interface Match {
  id: string;
  date: Date;
  homeTeamId: string;
  awayTeamId: string;
  location: string;
  score: string;
  state: 'scheduled' | 'in_progress' | 'finished';
  // Add more fields as needed
}

// Training Session entity (US005)
/*
  Entrenamientos del equipo con control de asistencias
  Permite diferentes tipos de entrenamiento y control de condiciones
*/
export interface TrainingSession {
  id: string;
  teamId: string;
  name: string;
  date: Date;
  time?: string;
  location?: string;
  durationMinutes: number;
  type: 'regular' | 'tactical' | 'physical' | 'recovery';
  notes?: string;
  isCancelled: boolean;
  weatherConditions?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Training Attendance entity (US005 - Refactored)
/*
  Estados: presente, tarde, ausente (según US005)
  Vinculado a entrenamientos, no a partidos
  Control detallado de participación y rendimiento
*/
export interface TrainingAttendance {
  id: string;
  playerId: string;
  trainingSessionId: string;
  status: 'presente' | 'tarde' | 'ausente';
  arrivalTime?: string;
  departureTime?: string;
  excuseReason?: string;
  participationLevel?: number; // 1-5
  performanceNotes?: string;
  markedBy: string;
  markedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Attendance entity
export interface Attendance {
  id: string;
  playerId: string;
  sessionId: string; // Can be matchId or trainingSessionId
  sessionType: 'match' | 'training';
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Formation entity (US006, US007, US008 - Refactored)
/*
  Formaciones visuales con drag & drop support
  Información contextual del partido
  Exportación a PNG 1080x1350px
  Plantillas reutilizables
*/
export interface Formation {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  
  // US007: Información del partido contextual
  matchId?: string;
  rivalTeamName?: string;
  matchDate?: Date;
  matchTime?: string;
  matchLocation?: string;
  
  // US006: Configuración táctica
  tacticalSystem: string; // ej: "4-3-3", "4-4-2"
  formationType: 'offensive' | 'defensive' | 'balanced';
  
  // Configuración visual y exportación
  fieldDimensions?: object;
  colorScheme?: object;
  
  // US006: Plantillas reutilizables
  isTemplate: boolean;
  templateCategory?: string;
  
  // US008: Configuración exportación PNG
  exportSettings: {
    width: number;
    height: number;
    format: string;
    backgroundColor: string;
    playerCircleSize: number;
    fontFamily: string;
    fontSize: number;
  };
  
  // Control de versiones y uso
  version: number;
  usageCount: number;
  lastUsedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// Formation Position entity (US006 - Drag & Drop)
/*
  Posiciones específicas en la formación
  11 titulares + 9 suplentes máximo
  Coordenadas para drag & drop visual
*/
export interface FormationPosition {
  id: string;
  formationId: string;
  playerId: string;
  
  // US006: Titulares y suplentes
  positionType: 'starter' | 'substitute';
  positionNumber: number; // 1-11 titulares, 12-20 suplentes
  
  // US006: Coordenadas para drag & drop
  fieldPositionX: number; // 0-100 (porcentaje de la cancha)
  fieldPositionY: number; // 0-100 (porcentaje de la cancha)
  
  // Información táctica
  positionName?: string; // "Arquera", "Lateral Derecho"
  tacticalRole?: string; // "Playmaker", "Marcador"
  positionZone: 'defensive' | 'midfield' | 'offensive';
  
  // Configuración visual
  jerseyNumber?: number;
  captain: boolean;
  viceCaptain: boolean;
  
  // Instrucciones específicas
  specialInstructions?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
