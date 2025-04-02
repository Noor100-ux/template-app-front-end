import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');

    
    const requestBody = {
      email: email,
      password: password
    };

  
    console.log('Signup Request:', {
      url: 'http://localhost:5055/register',
      method: 'POST',
      body: requestBody
    });

    try {
      
      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }

    
      const response = await fetch('http://localhost:5055/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

     
      const data = await response.json();

    
      console.log('Signup Response:', {
        status: response.status,
        body: data
      });

     
      if (data.success) {
        
        setSuccess(data.message);
        
       
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Error scenario (existing user or other errors)
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Signup Error:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Sign Up</h2>
        
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

        <form onSubmit={handleSignup}>
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
              minLength={6}
            />
          </div>
          <button 
            type="submit" 
            className="auth-button"
            disabled={!email || !password}
          >
            Sign Up
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
