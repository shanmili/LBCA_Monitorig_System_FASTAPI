import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import '../styles/Login.css';

const LoginScreen = ({ onLogin, onForgotPassword, onRegister, error, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-circle">
            <span className="logo-text">L</span>
          </div>
          <h1 className="title">LBCA Portal</h1>
          <p className="subtitle">Sign in to your account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label">Password</label>
              <button
                type="button"
                className="forgot-link"
                onClick={onForgotPassword}
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
              {password && (
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="register-prompt">
            Don't have an account?{' '}
            <button type="button" className="register-link" onClick={onRegister}>
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;