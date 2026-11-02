
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

import './Auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    setError('');
    setMessage('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // TODO: Connect this form to the password recovery API.
    setMessage(
      'Your email address is validated. Password recovery will be available once the backend API is connected.'
    );
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
              ACCOUNT RECOVERY
            </span>

            <h1>
              Get back to
              <span> smarter trading.</span>
            </h1>

            <p>
              Forgot your password? Don't worry.
              We'll help you securely recover access
              to your TradeMate account.
            </p>

            <div className="auth-feature">
              <ShieldCheck size={20} />
              <span>Secure password recovery.</span>
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
              <span className="auth-small-label">
                PASSWORD RECOVERY
              </span>

              <h2>Forgot your password?</h2>

              <p>
                Enter your registered email address.
                We'll help you reset your password.
              </p>
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {message && (
              <div className="auth-success">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="auth-field">
                <label htmlFor="recoveryEmail">
                  Email Address
                </label>

                <div className="auth-input-wrapper">
                  <Mail size={18} />

                  <input
                    id="recoveryEmail"
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit"
              >
                Send Reset Link
                <ArrowRight size={18} />
              </button>

            </form>

            <p className="auth-switch">
              <Link to="/login">
                <ArrowLeft
                  size={15}
                  style={{ verticalAlign: 'middle' }}
                />
                {' '}Back to Login
              </Link>
            </p>

          </div>
        </div>

      </section>
    </main>
  );
}

export default ForgotPassword;
