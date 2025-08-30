import React, { useState } from 'react';

const DashboardPage = () => {
  const [activeModule, setActiveModule] = useState('overview');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);

  // Datos mock para administrador - basados en la documentación
  const adminStats = [
    { label: 'Entrenadores', value: '12', color: 'bg-blue-500', category: 'Usuarios', limit: '∞ usuarios' },
    { label: 'Equipos Totales', value: '34', color: 'bg-green-500', category: 'Equipos', limit: 'Sistema' },
    { label: 'Acciones Config', value: '18', color: 'bg-purple-500', category: 'Config', limit: 'Activas' },
    { label: 'Partidos Hoy', value: '7', color: 'bg-red-500', category: 'Partidos', limit: 'En vivo' }
  ];

  // Lista de entrenadores registrados
  const coaches = [
    { id: 1, name: 'Carlos Rodríguez', email: 'carlos@club.com', club: 'Club Los Pumas', plan: '3_teams', teams: 2, status: 'Activo', lastLogin: '2025-08-23 14:30' },
    { id: 2, name: 'Ana García', email: 'ana@aguila.com', club: 'Águilas FC', plan: '2_teams', teams: 2, status: 'Activo', lastLogin: '2025-08-22 16:45' },
    { id: 3, name: 'Miguel Torres', email: 'miguel@tigres.com', club: 'Tigres United', plan: '5_teams', teams: 4, status: 'Inactivo', lastLogin: '2025-08-20 09:15' },
    { id: 4, name: 'Laura Martín', email: 'laura@leones.com', club: 'Club Leones', plan: '2_teams', teams: 1, status: 'Prueba', lastLogin: '2025-08-23 11:20' }
  ];

  // Acciones de partido configuradas - según documentación
  const matchActions = [
    { id: 1, name: 'Gol', description: 'Gol anotado', requiresPlayer: true, requiresZone: false, requiresAreaSector: true, color: '#10B981', active: true },
    { id: 2, name: 'Cambio', description: 'Sustitución de jugadora', requiresPlayer: true, requiresZone: true, requiresAreaSector: false, color: '#3B82F6', active: true },
    { id: 3, name: 'Tarjeta Verde', description: 'Sanción 2 minutos', requiresPlayer: true, requiresZone: true, requiresAreaSector: false, color: '#22C55E', active: true },
    { id: 4, name: 'Tarjeta Amarilla', description: 'Sanción 5 minutos', requiresPlayer: true, requiresZone: true, requiresAreaSector: false, color: '#F59E0B', active: true },
    { id: 5, name: 'Tarjeta Roja', description: 'Expulsión', requiresPlayer: true, requiresZone: true, requiresAreaSector: false, color: '#EF4444', active: true },
    { id: 6, name: 'Recuperación', description: 'Recuperación de bocha', requiresPlayer: true, requiresZone: true, requiresAreaSector: false, color: '#8B5CF6', active: true },
    { id: 7, name: 'Pérdida', description: 'Pérdida de bocha', requiresPlayer: true, requiresZone: true, requiresAreaSector: false, color: '#F97316', active: true },
    { id: 8, name: 'Corner', description: 'Tiro de esquina', requiresPlayer: false, requiresZone: true, requiresAreaSector: false, color: '#06B6D4', active: true }
  ];

  const systemLogs = [
    { id: 1, action: 'Login Administrador', user: 'Admin Sistema', timestamp: '2025-08-23 14:30', status: 'Exitoso', details: 'Acceso desde IP 192.168.1.100' },
    { id: 2, action: 'Crear Usuario', user: 'Admin Sistema', timestamp: '2025-08-23 13:45', status: 'Exitoso', details: 'Usuario: carlos@club.com' },
    { id: 3, action: 'Modificar Acción', user: 'Admin Sistema', timestamp: '2025-08-23 12:15', status: 'Exitoso', details: 'Acción: Tarjeta Verde' },
    { id: 4, action: 'Login Fallido', user: 'usuario_desconocido', timestamp: '2025-08-23 11:30', status: 'Fallido', details: 'Credenciales incorrectas' }
  ];

  const modules = [
    { 
      key: 'overview', 
      label: 'Resumen', 
      icon: () => (
        <span className="text-sm mb-1 lg:mb-0 lg:mr-2">📊</span>
      )
    },
    { 
      key: 'coaches', 
      label: 'Entrenadores', 
      icon: () => (
        <span className="text-sm mb-1 lg:mb-0 lg:mr-2">👥</span>
      )
    },
    { 
      key: 'actions', 
      label: 'Acciones', 
      icon: () => (
        <span className="text-sm mb-1 lg:mb-0 lg:mr-2">⚙️</span>
      )
    }
  ];

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case '2_teams': return 'bg-blue-100 text-blue-800';
      case '3_teams': return 'bg-green-100 text-green-800';
      case '5_teams': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderContent = () => {
    switch (activeModule) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Estadísticas Generales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {adminStats.map((stat, index) => (
                <div key={index} className="bg-white p-4 md:p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                    <span className="text-xs text-gray-500 font-medium">{stat.category}</span>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{stat.limit}</div>
                </div>
              ))}
            </div>

            {/* Actividad Reciente del Sistema */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">Actividad Reciente</h2>
                  <span className="text-sm text-gray-500">Últimas 24 horas</span>
                </div>
              </div>
              <div className="p-4 md:p-6">
                <div className="space-y-4">
                  {systemLogs.map((log) => (
                    <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start space-x-3 mb-2 sm:mb-0">
                        <div className={`w-2 h-2 rounded-full mt-2 ${log.status === 'Exitoso' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <div className="font-medium text-gray-900">{log.action}</div>
                          <div className="text-sm text-gray-600">{log.user}</div>
                          <div className="text-xs text-gray-500 mt-1">{log.details}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">{log.timestamp}</div>
                        <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                          log.status === 'Exitoso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {log.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'coaches':
        return (
          <div className="space-y-6">
            {/* Header con botón de acción */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Gestión de Entrenadores</h2>
                <p className="text-gray-600 mt-1">Administra los usuarios entrenadores del sistema</p>
              </div>
              <button 
                onClick={() => setShowUserModal(true)}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                + Nuevo Entrenador
              </button>
            </div>

            {/* Lista de Entrenadores */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entrenador
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan / Estado
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Equipos
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Último Acceso
                      </th>
                      <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {coaches.map((coach) => (
                      <tr key={coach.id} className="hover:bg-gray-50">
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {coach.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{coach.name}</div>
                              <div className="text-sm text-gray-500">{coach.email}</div>
                              <div className="text-xs text-gray-400">{coach.club}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanColor(coach.plan)}`}>
                              Plan {coach.plan.replace('_', ' ')}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              coach.status === 'Activo' ? 'bg-green-100 text-green-800' :
                              coach.status === 'Inactivo' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {coach.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <span className="font-medium">{coach.teams}</span>
                            <span className="text-gray-500 ml-1">
                              / {coach.plan === '2_teams' ? '2' : coach.plan === '3_teams' ? '3' : '5'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {coach.lastLogin}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button className="text-indigo-600 hover:text-indigo-900 text-xs bg-indigo-100 hover:bg-indigo-200 px-2 py-1 rounded flex items-center">
                              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editar
                            </button>
                            <button className="text-red-600 hover:text-red-900 text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded flex items-center">
                              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Desactivar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'actions':
        return (
          <div className="space-y-6">
            {/* Header con botón de acción */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Configuración de Acciones</h2>
                <p className="text-gray-600 mt-1">Gestiona las acciones disponibles para registrar en partidos</p>
              </div>
              <button 
                onClick={() => setShowActionModal(true)}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                + Nueva Acción
              </button>
            </div>

            {/* Grid de Acciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {matchActions.map((action) => (
                <div key={action.id} className="bg-white p-4 md:p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: action.color }}
                    ></div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      action.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {action.active ? 'Activa' : 'Inactiva'}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{action.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-xs">
                      <span className={`w-2 h-2 rounded-full mr-2 ${action.requiresPlayer ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      <span className={action.requiresPlayer ? 'text-green-700' : 'text-gray-500'}>
                        Requiere Jugadora
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={`w-2 h-2 rounded-full mr-2 ${action.requiresZone ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      <span className={action.requiresZone ? 'text-green-700' : 'text-gray-500'}>
                        Requiere Zona
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={`w-2 h-2 rounded-full mr-2 ${action.requiresAreaSector ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      <span className={action.requiresAreaSector ? 'text-green-700' : 'text-gray-500'}>
                        Requiere Sector
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
                    <button className="text-blue-600 hover:text-blue-800 text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded">
                      Editar
                    </button>
                    <button className={`text-xs px-2 py-1 rounded ${
                      action.active 
                        ? 'text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200' 
                        : 'text-green-600 hover:text-green-800 bg-green-100 hover:bg-green-200'
                    }`}>
                      {action.active ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <div>Módulo no encontrado</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Unificado */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 lg:px-8 lg:py-6 gap-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl lg:text-3xl font-bold text-gray-900">Panel de Administrador</h1>
              <div className="hidden lg:block h-6 w-px bg-gray-300"></div>
              <p className="hidden lg:block text-gray-600">Gestión de usuarios y configuración del sistema</p>
            </div>
            
            {/* Navegación de módulos - Grid responsivo 3x1 */}
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-4">
              <div className="grid grid-cols-3 gap-2 lg:flex lg:space-x-2">
                {modules.map((module) => (
                  <button
                    key={module.key}
                    onClick={() => setActiveModule(module.key)}
                    className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-[60px] lg:min-h-[40px] ${
                      activeModule === module.key
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                  >
                    {module.icon()}
                    <span className="text-xs lg:text-sm text-center lg:text-left">{module.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto p-4 lg:px-8 lg:py-8">
        {renderContent()}
      </div>

      {/* Modales */}
      {showUserModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Crear Nuevo Entrenador</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Carlos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Rodríguez"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="carlos@club.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Club</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Club Los Pumas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="2_teams">2 Equipos</option>
                    <option value="3_teams">3 Equipos</option>
                    <option value="5_teams">5 Equipos</option>
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Crear Entrenador
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showActionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Crear Nueva Acción</h3>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ej: Falta ofensiva"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={2}
                    placeholder="Descripción de la acción"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input
                    type="color"
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                    defaultValue="#3B82F6"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Requerimientos</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="requiresPlayer" className="mr-2" />
                      <label htmlFor="requiresPlayer" className="text-sm text-gray-700">Requiere Jugadora</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="requiresZone" className="mr-2" />
                      <label htmlFor="requiresZone" className="text-sm text-gray-700">Requiere Zona</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="requiresArea" className="mr-2" />
                      <label htmlFor="requiresArea" className="text-sm text-gray-700">Requiere Sector</label>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowActionModal(false)}
                    className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Crear Acción
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;