import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CoachDashboard from './pages/CoachDashboard';
import TeamsPage from './pages/TeamsPage';
import './styles/globals.css';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'coach' | null>(null);

  // Check if user is authenticated
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole') as 'admin' | 'coach' | null;
    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLogin = (role: 'admin' | 'coach') => {
    setIsAuthenticated(true);
    setUserRole(role);
    // Store role in localStorage for persistence
    localStorage.setItem('userRole', role);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentPage('login');
  };

  const handleNavigation = (page: string) => {
    if (isAuthenticated) {
      setCurrentPage(page);
    }
  };

  // Simple navigation component with role-based navigation
  const Navigation = () => (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="mr-2 text-blue-600">�</span>
              Hockey Manager
            </h1>
            <div className="ml-4">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded capitalize">
                {userRole}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => handleNavigation('dashboard')}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                currentPage === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-1">⊞</span>
              Dashboard
            </button>
            {userRole === 'coach' && (
              <button 
                onClick={() => handleNavigation('teams')}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  currentPage === 'teams' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-1">👥</span>
                Equipos
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <span className="mr-1">→</span>
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  const renderPage = () => {
    if (!isAuthenticated) {
      return <LoginPage onLogin={handleLogin} />;
    }

    switch (currentPage) {
      case 'dashboard':
        // Show different dashboard based on role
        return userRole === 'admin' ? <DashboardPage /> : <CoachDashboard />;
      case 'teams':
        return <TeamsPage />;
      default:
        return userRole === 'admin' ? <DashboardPage /> : <CoachDashboard />;
    }
  };

  return (
    <div className="App">
      {isAuthenticated && <Navigation />}
      {renderPage()}
    </div>
  );
}

export default App;
