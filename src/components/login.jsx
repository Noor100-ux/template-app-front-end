import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const requestBody = {
      email: email,
      password: password
    };

    try {
      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }
      const response = await fetch('https://template-app-backend-cts1.onrender.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', email); 
        setTimeout(() => {
          // Navigate to dashboard or home page
          navigate('/Dashboard');
        }, 2000);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Login</h2>
        
        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="Enter your password"
            />
          </div>
          <button 
            type="submit" 
            className="auth-button"
            disabled={!email || !password}
          >
            Login
          </button>
        </form>
        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
