import React, { useState } from 'react';
import './AdminLogin.css';

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Updated credentials
    const adminUser = 'iqbal';
    const adminPass = '1234';
    if (username === adminUser && password === adminPass) {
      onLogin();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      {/* Food animation section */}
      <div className="food-animation">
        <span role="img" aria-label="pizza" className="pizza-emoji">🍕</span>
        <span role="img" aria-label="burger" className="burger-emoji">🍔</span>
        <span role="img" aria-label="fries" className="fries-emoji">🍟</span>
      </div>
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}

export default AdminLogin;
