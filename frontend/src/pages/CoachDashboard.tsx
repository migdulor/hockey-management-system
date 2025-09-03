import React, { useState } from 'react';

const CoachDashboard = () => {
  const [activeModule, setActiveModule] = useState('overview');

  // Datos mock para entrenador - basados en la documentación
  const coachStats = [
    { label: 'Equipos Gestionados', value: '3', color: 'bg-blue-500', category: 'Equipos', limit: '3 equipos' },
    { label: 'Jugadoras Totales', value: '47', color: 'bg-green-500', category: 'Jugadoras', limit: '60 máximo' },
    { label: 'Partidos Jugados', value: '12', color: 'bg-purple-500', category: 'Partidos', limit: 'Esta temporada' },
    { label: 'Entrenamientos', value: '28', color: 'bg-orange-500', category: 'Asistencias', limit: 'Este mes' }
  ];

  // Equipos del entrenador
  const myTeams = [
    { 
      id: 1, 
      name: 'Los Pumas Sub 16', 
      division: 'Sub16 Femenino', 
      players: 18, 
      lastMatch: '2025-08-20', 
      nextTraining: '2025-08-24',
      status: 'Activo',
      formation: 'Disponible'
    },
    { 
      id: 2, 
      name: 'Los Pumas Inter', 
      division: 'Inter Femenino', 
      players: 16, 
      lastMatch: '2025-08-22', 
      nextTraining: '2025-08-25',
      status: 'Activo',
      formation: 'Pendiente'
    },
    { 
      id: 3, 
      name: 'Los Pumas Primera', 
      division: 'Primera Femenino', 
      players: 13, 
      lastMatch: null, 
      nextTraining: '2025-08-26',
      status: 'Preparación',
      formation: 'No configurada'
    }
  ];

  // Próximos partidos
  const upcomingMatches = [
    { id: 1, team: 'Los Pumas Sub 16', vs: 'Águilas FC Sub 16', date: '2025-08-25', time: '15:00', venue: 'Cancha Municipal' },
    { id: 2, team: 'Los Pumas Inter', vs: 'Tigres Inter', date: '2025-08-26', time: '17:00', venue: 'Club Deportivo' },
    { id: 3, team: 'Los Pumas Primera', vs: 'Leones Primera', date: '2025-08-28', time: '19:00', venue: 'Estadio Central' }
  ];

  // Asistencias recientes
  const recentAttendance = [
    { teamName: 'Los Pumas Sub 16', date: '2025-08-23', present: 16, absent: 2, late: 0, percentage: 89 },
    { teamName: 'Los Pumas Inter', date: '2025-08-22', present: 14, absent: 1, late: 1, percentage: 94 },
    { teamName: 'Los Pumas Primera', date: '2025-08-21', present: 11, absent: 2, late: 0, percentage: 85 }
  ];

  const modules = [
    { 
      key: 'overview', 
      label: 'Resumen', 
      icon: () => (
        <span className="text-sm mb-1">📊</span>
      )
    },
    { 
      key: 'teams', 
      label: 'Equipos', 
      icon: () => (
        <span className="text-sm mb-1">�</span>
      )
    },
    { 
      key: 'players', 
      label: 'Jugadores', 
      icon: () => (
        <span className="text-sm mb-1">👤</span>
      )
    },
    { 
      key: 'attendance', 
      label: 'Asistencias', 
      icon: () => (
        <span className="text-sm mb-1">📅</span>
      )
    },
    { 
      key: 'formations', 
      label: 'Formación', 
      icon: () => (
        <span className="text-sm mb-1">🎯</span>
      )
    },
    { 
      key: 'live-match', 
      label: 'Partido en Vivo', 
      icon: () => (
        <span className="text-sm mb-1">🔴</span>
      )
    }
  ];

  const getFormationStatus = (status: string) => {
    switch (status) {
      case 'Disponible': return 'bg-green-100 text-green-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'No configurada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTeamStatus = (status: string) => {
    switch (status) {
      case 'Activo': return 'bg-green-100 text-green-800';
      case 'Preparación': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto flex-1 flex flex-col px-4 lg:px-6">
        {/* Header - Compacto */}
        <div className="py-3 border-b border-gray-200 bg-white mb-3 -mx-4 px-4 lg:-mx-6 lg:px-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Dashboard de Entrenador</h2>
              <p className="text-sm text-gray-600">Gestión completa de equipos y jugadoras</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right text-xs">
                <p className="text-gray-900 font-medium">Carlos Rodríguez</p>
                <p className="text-gray-600">Club Los Pumas</p>
                <p className="text-blue-600">Plan 3 Equipos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Compacto */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          {coachStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-3 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                  <p className="text-xs text-gray-500">{stat.limit}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-2 ml-2`}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Module Navigation - Cuadricular */}
        <div className="bg-white rounded-lg shadow mb-3 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Módulos de Gestión</h3>
          <div className="grid grid-cols-3 gap-3">
            {modules.map((module) => (
              <button
                key={module.key}
                onClick={() => setActiveModule(module.key)}
                className={`p-4 rounded-lg border-2 transition-all text-center hover:shadow-md ${
                  activeModule === module.key
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {module.icon()}
                <div className="text-sm font-medium">{module.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Module Content */}
        <div className="flex-1 min-h-0">
          {/* Contenedor con altura fija para todos los módulos */}
          <div className="h-full bg-white rounded-lg shadow flex flex-col">
            {activeModule === 'overview' && (
              <>
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="text-md font-semibold text-gray-900">Resumen General</h3>
                </div>
                <div className="flex-1 p-4 overflow-hidden">
                  <div className="grid grid-cols-3 gap-4 h-full">
                    {/* My Teams Summary */}
                    <div className="col-span-2 border rounded-lg p-3 overflow-hidden flex flex-col">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Mis Equipos</h4>
                      <div className="flex-1 space-y-2 overflow-y-auto">
                        {myTeams.map((team) => (
                          <div key={team.id} className="border rounded p-2 hover:bg-gray-50">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-medium text-gray-900 text-xs">{team.name}</h5>
                              <div className="flex space-x-1">
                                <span className={`px-1 py-0.5 text-xs rounded ${getTeamStatus(team.status)}`}>
                                  {team.status}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600">{team.division} • {team.players} jugadoras</p>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>Último: {team.lastMatch || 'Sin partidos'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col space-y-3">
                      {/* Upcoming Matches */}
                      <div className="border rounded-lg p-3 flex-1 overflow-hidden">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Próximos Partidos</h4>
                        <div className="space-y-2 overflow-y-auto max-h-32">
                          {upcomingMatches.slice(0, 3).map((match) => (
                            <div key={match.id} className="border-l-4 border-blue-500 bg-blue-50 p-2 rounded">
                              <div className="font-medium text-gray-900 text-xs">{match.team}</div>
                              <div className="text-xs text-gray-600">vs {match.vs}</div>
                              <div className="text-xs text-gray-500">
                                {match.date} • {match.time}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Recent Attendance */}
                      <div className="border rounded-lg p-3 flex-1 overflow-hidden">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Asistencia</h4>
                        <div className="space-y-2 overflow-y-auto">
                          {recentAttendance.slice(0, 2).map((attendance, index) => (
                            <div key={index} className="border rounded p-2">
                              <div className="flex items-center justify-between mb-1">
                                <h5 className="font-medium text-gray-900 text-xs">{attendance.teamName}</h5>
                                <span className="text-xs text-gray-500">{attendance.percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1">
                                <div 
                                  className="bg-blue-600 h-1 rounded-full" 
                                  style={{ width: `${attendance.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeModule === 'teams' && (
              <>
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-md font-semibold text-gray-900">Gestión de Equipos</h3>
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Nuevo Equipo
                  </button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-3">
                    {myTeams.map((team) => (
                      <div key={team.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full ${team.status === 'Activo' ? 'bg-green-500' : team.status === 'Preparación' ? 'bg-blue-500' : 'bg-gray-500'} flex items-center justify-center`}>
                              <span className="text-white font-bold text-sm">{team.name.split(' ')[2]?.substring(0, 2) || 'LP'}</span>
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{team.name}</h4>
                              <p className="text-sm text-gray-600">{team.division}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-sm rounded-full ${getTeamStatus(team.status)}`}>
                            {team.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-xl font-bold text-blue-600">{team.players}</div>
                            <div className="text-xs text-gray-600">Jugadoras</div>
                            <div className="text-xs text-gray-500">Máx. 20</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-green-600">{team.lastMatch ? '✓' : '–'}</div>
                            <div className="text-xs text-gray-600">Último Partido</div>
                            <div className="text-xs text-gray-500">{team.lastMatch || 'Sin partidos'}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-purple-600">📅</div>
                            <div className="text-xs text-gray-600">Próximo Entreno</div>
                            <div className="text-xs text-gray-500">{team.nextTraining}</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-xl font-bold ${team.formation === 'Disponible' ? 'text-green-600' : team.formation === 'Pendiente' ? 'text-yellow-600' : 'text-red-600'}`}>
                              {team.formation === 'Disponible' ? '🏑' : team.formation === 'Pendiente' ? '⏳' : '❌'}
                            </div>
                            <div className="text-xs text-gray-600">Formación</div>
                            <div className="text-xs text-gray-500">{team.formation}</div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                          <div className="flex space-x-2">
                            <button className="bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Gestionar
                            </button>
                            <button className="border border-gray-300 text-gray-700 py-2 px-4 rounded text-sm hover:bg-gray-50 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Ver Detalles
                            </button>
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-gray-400 hover:text-gray-600 p-1">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Card para crear nuevo equipo */}
                    {myTeams.length < 3 && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 cursor-pointer bg-gray-50 hover:bg-blue-50 transition-colors">
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 mb-1">Crear Nuevo Equipo</h4>
                          <p className="text-sm text-gray-600 mb-2">Puedes crear {3 - myTeams.length} equipo(s) más con tu plan actual</p>
                          <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            Plan: {3 - myTeams.length} equipos disponibles
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeModule === 'players' && (
              <>
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-md font-semibold text-gray-900">Gestión de Jugadores</h3>
                  <div className="flex space-x-2">
                    <select className="px-2 py-1 border border-gray-300 rounded text-sm">
                      <option>Todos los equipos</option>
                      <option>Los Pumas Sub 16</option>
                      <option>Los Pumas Inter</option>
                      <option>Los Pumas Primera</option>
                    </select>
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Agregar Jugadora
                    </button>
                  </div>
                </div>
                <div className="flex-1 p-4 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-md font-medium">Gestión de Jugadoras</p>
                    <p className="text-sm">Registro y asignación de jugadoras a equipos</p>
                  </div>
                </div>
              </>
            )}

            {activeModule === 'attendance' && (
              <>
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-md font-semibold text-gray-900">Control de Asistencias</h3>
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Registrar Asistencia
                  </button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-3">
                    {recentAttendance.map((attendance, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900 text-sm">{attendance.teamName}</h5>
                          <span className="text-xs text-gray-500">{attendance.date}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs text-center">
                          <div>
                            <div className="text-lg font-bold text-green-600">{attendance.present}</div>
                            <div className="text-gray-600">Presentes</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-red-600">{attendance.absent}</div>
                            <div className="text-gray-600">Ausentes</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-yellow-600">{attendance.late}</div>
                            <div className="text-gray-600">Tarde</div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Porcentaje</span>
                            <span className="font-medium">{attendance.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-blue-600 h-1 rounded-full" 
                              style={{ width: `${attendance.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeModule === 'formations' && (
              <>
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-md font-semibold text-gray-900">Planificación de Formaciones</h3>
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Nueva Formación
                  </button>
                </div>
                <div className="flex-1 p-4 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <p className="text-md font-medium">Editor de Formaciones</p>
                    <p className="text-sm">Crea formaciones tácticas de manera visual</p>
                  </div>
                </div>
              </>
            )}

            {activeModule === 'live-match' && (
              <>
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-md font-semibold text-gray-900">Partido en Vivo</h3>
                  <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293L12 11l.707-.707A1 1 0 0113.414 10H15M8 15V9a4 4 0 118 0v6M3 18h18" />
                    </svg>
                    Iniciar Partido
                  </button>
                </div>
                <div className="flex-1 p-4 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-md font-medium">Registro de Partidos</p>
                    <p className="text-sm">Registro de acciones en tiempo real</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;
