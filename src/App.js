
import React, { useState } from 'react';
import './App.css';
import Admin from './Admin';
import AdminLogin from './AdminLogin';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <div className="App">
      {isAuthenticated ? <Admin /> : <AdminLogin onLogin={handleLogin} />}
    </div>
  );
}

export default App;
