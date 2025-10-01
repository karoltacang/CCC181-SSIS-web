import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import '../../components/Components.css';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle form submission for login or registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { username, password } : { username, email, password };
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (isLogin) {
          // Login Success
          localStorage.setItem('token', data.access_token);
          if (data.user) {
              localStorage.setItem('user', JSON.stringify(data.user));
          }
          window.location.href = '/';
        } else {
          // Registration Success
          setSuccess('Registration successful! Please sign in.');
          setIsLogin(true);
          setPassword('');
        }
      } else {
        setError(data.error || (isLogin ? 'Login failed' : 'Registration failed'));
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  // Initiate Google OAuth flow by redirecting to the backend
  const handleGoogleLogin = () => {
    // Redirect to backend Google auth endpoint
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{isLogin ? 'SSIS Login' : 'Create Account'}</h1>
          <p>{isLogin ? 'Student Information System' : 'Sign up to get started'}</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary full-width">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <button onClick={handleGoogleLogin} className="btn btn-google full-width">
          <FcGoogle className="google-icon" />
          {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
        </button>

        <div className="toggle-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span 
            className="toggle-link" 
            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
