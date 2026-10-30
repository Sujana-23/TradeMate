
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

import './Auth.css';

function Login({ onLogin }) {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!identifier.trim() || !password.trim()) {
        setError('Please enter your username and password.');
        return;
    }

    onLogin();
    navigate('/');

  // Temporary frontend testing only.
  // Replace with actual API authentication later.

    navigate('/dashboard-test');
  };
  return (
    <main className="auth-page">
      <section className="auth-container">

        <div className="auth-brand-panel">
          <div className="auth-brand">
            <span className="brand-icon">T</span>
            <span>TradeMate</span>
          </div>

          <div className="auth-brand-content">
            <span className="auth-eyebrow">
              YOUR GLOBAL CURRENCY COMPANION
            </span>

            <h1>
              Welcome back to
              <span> smarter trading.</span>
            </h1>

            <p>
              Monitor international currencies, track exchange
              rates and make informed financial decisions
              with TradeMate.
            </p>

            <div className="auth-feature">
              <ShieldCheck size={20} />
              <span>Your financial information matters.</span>
            </div>
          </div>

          <div className="auth-panel-footer">
            TradeMate · International Currency Monitor
          </div>
        </div>

        <div className="auth-form-panel">

          <div className="auth-mobile-brand">
            <span className="brand-icon">T</span>
            <span>TradeMate</span>
          </div>

          <div className="auth-form-content">

            <div className="auth-heading">
              <span className="auth-small-label">WELCOME BACK</span>
              <h2>Sign in to your account</h2>
              <p>
                Enter your credentials to access your dashboard.
              </p>
            </div>

            {error && (
              <div className="auth-error">{error}</div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="auth-field">
                <label htmlFor="identifier">
                  Username or Email Address
                </label>

                <div className="auth-input-wrapper">
                  <Mail size={18} />

                  <input
                    id="identifier"
                    type="text"
                    placeholder="Enter username or email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="loginPassword">
                  Password
                </label>

                <div className="auth-input-wrapper">
                  <LockKeyhole size={18} />

                  <input
                    id="loginPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword
                      ? <EyeOff size={18} />
                      : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="auth-options">
                <label className="remember-option">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>

                <Link to="/forgot-password" className="auth-link">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="auth-submit">
                Sign In
                <ArrowRight size={18} />
              </button>

            </form>

            <div className="auth-divider">
              <span>OR CONTINUE WITH</span>
            </div>

            <button
              type="button"
              className="google-button"
              onClick={() => alert('Google sign-in will be integrated later.')}
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <p className="auth-switch">
              Don't have an account?
              <Link to="/register"> Create account</Link>
            </p>

          </div>
        </div>
      </section>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20">
      <path fill="#4285F4" d="M46 24.5c0-1.5-.2-3-.5-4.5H24v9h12.4c-.5 2.8-2.1 5.2-4.5 6.8l7.2 5.6C43.3 37.4 46 31.5 46 24.5z"/>
      <path fill="#34A853" d="M24 46c6.2 0 11.4-2 15.1-5.5l-7.2-5.6c-2 1.4-4.6 2.2-7.9 2.2-6.1 0-11.3-4.1-13.2-9.6l-7.5 5.8C6.9 41 14.9 46 24 46z"/>
      <path fill="#FBBC05" d="M10.8 27.5a13.5 13.5 0 0 1 0-7l-7.5-5.8a23 23 0 0 0 0 18.6z"/>
      <path fill="#EA4335" d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.7-6.7C35.5 2.4 30.2 0 24 0 14.9 0 6.9 5 3.3 12.7l7.5 5.8C12.7 13.6 17.9 9.5 24 9.5z" transform="translate(0 4)"/>
    </svg>
  );
}

export default Login;
