import React, { useState } from 'react';
import { login, register } from '../../services/user-api';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported
import '../../assets/styles/client/login.css'; // Import custom CSS

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
    <div className="client-login-container d-flex justify-content-center align-items-center min-vh-100">
      <div className="client-form-wrapper bg-white p-4 p-md-5 rounded-3 shadow-lg">
        <h2 className="client-form-title mb-4 text-center">
          {isLogin ? 'Login' : 'Register'}
        </h2>
        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          <div className="client-form-group mb-3">
            <label htmlFor="username" className="form-label client-form-label">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="form-control client-form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>
          <div className="client-form-group mb-4">
            <label htmlFor="password" className="form-label client-form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-control client-form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="btn btn-primary client-submit-btn w-100">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <button
          onClick={toggleForm}
          className="btn btn-link client-toggle-btn mt-3 w-100 text-center"
        >
          {isLogin
            ? 'Need an account? Register here'
            : 'Already have an account? Login here'}
        </button>
        {message && (
          <p
            className={`client-message mt-3 text-center ${
              message.includes('successful') ? 'text-success' : 'text-danger'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;