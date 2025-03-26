import React, { useState } from 'react';
import { login, register } from '../../services/user-api';
import '../../assets/styles/login.css'; // Import the CSS file

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(username, password);
      setMessage(response);
    } catch (error) {
      setMessage(error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await register(username, password);
      setMessage(response);
    } catch (error) {
      setMessage(error);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setMessage('');
    setUsername('');
    setPassword('');
  };

  return (
    <div className="login-container">
      <div className="form-wrapper">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="submit-btn">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <button onClick={toggleForm} className="toggle-btn">
          {isLogin ? 'Need to register? Sign up here' : 'Already have an account? Log in here'}
        </button>
        {message && <p className={`message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</p>}
      </div>
    </div>
  );
}

export default Login;