import React, { useState } from 'react';
import QRCode from 'qrcode.react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setError('');
    alert('Inicio de sesión exitoso');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div
      style={{
        backgroundColor: darkMode ? '#2c3e50' : '#ecf0f1',
        color: darkMode ? 'white' : 'black',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '400px',
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      <h1>Inicio de Sesión</h1>
      <button onClick={toggleDarkMode} style={{ marginBottom: '20px' }}>
        {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
      </button>
      <div style={{ marginBottom: '20px' }}>
        <label>
          Usuario:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ display: 'block', margin: '10px auto', padding: '5px' }}
          />
        </label>
        <label>
          Contraseña:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: 'block', margin: '10px auto', padding: '5px' }}
          />
        </label>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
      <button onClick={handleLogin} style={{ padding: '10px 20px' }}>
        Iniciar Sesión
      </button>
      <div style={{ marginTop: '20px' }}>
        <h3>Escanea el código QR para iniciar sesión:</h3>
        <QRCode value="https://hockey-management-system/login" size={128} />
      </div>
    </div>
  );
};

export default Login;
