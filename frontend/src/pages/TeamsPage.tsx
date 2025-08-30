import React, { useState } from 'react';

interface Player {
  id: number;
  name: string;
  position: string;
  age: number;
  goals: number;
  assists: number;
}

interface Team {
  id: number;
  name: string;
  coach: string;
  players: number;
  wins: number;
  losses: number;
  draws: number;
  playersList: Player[];
}

const TeamsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const mockTeams: Team[] = [
    {
      id: 1,
      name: 'Los Pumas',
      coach: 'Carlos Rodríguez',
      players: 15,
      wins: 8,
      losses: 2,
      draws: 1,
      playersList: [
        { id: 1, name: 'Juan Pérez', position: 'Delantero', age: 23, goals: 12, assists: 5 },
        { id: 2, name: 'María López', position: 'Defensor', age: 26, goals: 2, assists: 8 },
        { id: 3, name: 'Pedro Martín', position: 'Portero', age: 29, goals: 0, assists: 1 }
      ]
    },
    {
      id: 2,
      name: 'Águilas FC',
      coach: 'Ana García',
      players: 14,
      wins: 6,
      losses: 3,
      draws: 2,
      playersList: [
        { id: 4, name: 'Luis Fernández', position: 'Centrocampista', age: 25, goals: 8, assists: 12 },
        { id: 5, name: 'Carmen Ruiz', position: 'Delantero', age: 22, goals: 15, assists: 3 },
        { id: 6, name: 'Roberto Silva', position: 'Defensor', age: 28, goals: 1, assists: 4 }
      ]
    },
    {
      id: 3,
      name: 'Tigres United',
      coach: 'Miguel Torres',
      players: 16,
      wins: 9,
      losses: 1,
      draws: 1,
      playersList: [
        { id: 7, name: 'Sofia Castro', position: 'Delantero', age: 24, goals: 18, assists: 7 },
        { id: 8, name: 'Diego Morales', position: 'Centrocampista', age: 27, goals: 6, assists: 15 },
        { id: 9, name: 'Elena Vargas', position: 'Portero', age: 30, goals: 0, assists: 0 }
      ]
    }
  ];

  const filteredTeams = mockTeams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.coach.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewTeam = (team: Team) => {
    setSelectedTeam(team);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold leading-tight text-gray-900">Gestión de Equipos</h2>
              <p className="text-gray-600">Administra los equipos del sistema</p>
            </div>
            <button
              onClick={() => setShowAddTeamModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <span className="mr-2">➕</span>
              Nuevo Equipo
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 mb-6 sm:px-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar equipos por nombre o entrenador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-3 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <div key={team.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{team.name}</h3>
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    {team.players} jugadores
                  </span>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-600 flex items-center">
                    <span className="mr-2">👨‍💼</span>
                    <strong>Entrenador:</strong> {team.coach}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div className="bg-green-50 p-2 rounded">
                    <div className="text-lg font-bold text-green-600">{team.wins}</div>
                    <div className="text-xs text-gray-500">Victorias</div>
                  </div>
                  <div className="bg-red-50 p-2 rounded">
                    <div className="text-lg font-bold text-red-600">{team.losses}</div>
                    <div className="text-xs text-gray-500">Derrotas</div>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded">
                    <div className="text-lg font-bold text-yellow-600">{team.draws}</div>
                    <div className="text-xs text-gray-500">Empates</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewTeam(team)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center"
                  >
                    <span className="mr-2">👁️</span>
                    Ver Detalles
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 text-sm flex items-center justify-center">
                    <span className="mr-2">✏️</span>
                    Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No results */}
        {filteredTeams.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron equipos</h3>
            <p className="text-gray-500">Intenta con otros términos de búsqueda</p>
          </div>
        )}
      </div>

      {/* Team Detail Modal */}
      {showModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-90vh overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">{selectedTeam.name}</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Información del Equipo</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Entrenador:</strong> {selectedTeam.coach}</p>
                    <p><strong>Total de Jugadores:</strong> {selectedTeam.players}</p>
                    <p><strong>Victorias:</strong> {selectedTeam.wins}</p>
                    <p><strong>Derrotas:</strong> {selectedTeam.losses}</p>
                    <p><strong>Empates:</strong> {selectedTeam.draws}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Estadísticas</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-green-50 p-3 rounded">
                      <div className="text-2xl font-bold text-green-600">{selectedTeam.wins}</div>
                      <div className="text-xs text-gray-500">Victorias</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded">
                      <div className="text-2xl font-bold text-red-600">{selectedTeam.losses}</div>
                      <div className="text-xs text-gray-500">Derrotas</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                      <div className="text-2xl font-bold text-yellow-600">{selectedTeam.draws}</div>
                      <div className="text-xs text-gray-500">Empates</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Lista de Jugadores</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edad</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goles</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asistencias</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedTeam.playersList.map((player) => (
                        <tr key={player.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{player.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.position}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.age}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.goals}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.assists}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Editar Equipo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Team Modal */}
      {showAddTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Nuevo Equipo</h3>
                <button
                  onClick={() => setShowAddTeamModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Equipo</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ingresa el nombre del equipo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Entrenador</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre del entrenador"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de Jugadores</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="15"
                  />
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddTeamModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Crear Equipo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;