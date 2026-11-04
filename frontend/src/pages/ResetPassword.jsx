import { useState } from 'react';
import {
  Link,
  useSearchParams,
  useNavigate,
  useLocation
} from 'react-router-dom';

import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Mail
} from 'lucide-react';

import {
  verifyResetOtp,
  resetPassword
} from '../services/authService';

import './Auth.css';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const email = searchParams.get('email') || '';

  // STEP MANAGEMENT
  const [step, setStep] = useState(1);

  // OTP
  const [otp, setOtp] = useState('');
  const [verificationToken, setVerificationToken] = useState('');

  // PASSWORD
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // PASSWORD VISIBILITY
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // MESSAGES
  const [error, setError] = useState('');
  const [message, setMessage] = useState(
    location.state?.message || ''
  );

  const [loading, setLoading] = useState(false);

  // STEP 1: VERIFY RESET OTP
  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    setError('');
    setMessage('');

    if (!email) {
      setError('Email address is missing. Please try again.');
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      setLoading(true);

      const response = await verifyResetOtp({
        email,
        otp
      });

      if (!response.verificationToken) {
        throw new Error(
          'Verification token was not received. Please try again.'
        );
      }

      setVerificationToken(response.verificationToken);

      setMessage(
        response.message || 'OTP verified successfully.'
      );

      setStep(2);

      setOtp('');

    } catch (err) {
      setError(
        err.message || 'OTP verification failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: RESET PASSWORD
  const handleResetPassword = async (event) => {
    event.preventDefault();

    setError('');
    setMessage('');

    if (!verificationToken) {
      setError('Please verify your OTP first.');
      setStep(1);
      return;
    }

    if (newPassword.length < 8) {
      setError(
        'Password must contain at least 8 characters.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      const response = await resetPassword({
        email,
        verificationToken,
        newPassword,
        confirmPassword
      });

      setMessage(
        response.message || 'Password reset successfully.'
      );

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);

    } catch (err) {
      setError(
        err.message || 'Password reset failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-container">

        {/* LEFT BRAND PANEL */}
        <div className="auth-brand-panel">

          <div className="auth-brand">
            <span className="brand-icon">T</span>
            <span>TradeMate</span>
          </div>

          <div className="auth-brand-content">

            <span className="auth-eyebrow">
              ACCOUNT SECURITY
            </span>

            <h1>
              Secure your
              <span> account again.</span>
            </h1>

            <p>
              Create a new password to regain secure
              access to your TradeMate account.
            </p>

            <div className="auth-feature">
              <ShieldCheck size={20} />
              <span>Secure password protection.</span>
            </div>

          </div>

          <div className="auth-panel-footer">
            TradeMate · International Currency Monitor
          </div>

        </div>

        {/* RIGHT FORM PANEL */}
        <div className="auth-form-panel">

          <div className="auth-mobile-brand">
            <span className="brand-icon">T</span>
            <span>TradeMate</span>
          </div>

          <div className="auth-form-content">

            {/* HEADING */}
            <div className="auth-heading">

              <span className="auth-small-label">
                PASSWORD RECOVERY
              </span>

              <h2>
                {step === 1
                  ? 'Verify OTP'
                  : 'Reset Password'}
              </h2>

              <p>
                {step === 1
                  ? 'Enter the 6-digit OTP sent to your registered email address.'
                  : 'Create a new password for your TradeMate account.'}
              </p>

            </div>

            {/* EMAIL DISPLAY */}
            {email && (
              <div className="auth-feature">
                <Mail size={18} />
                <span>{email}</span>
              </div>
            )}

            {/* ERROR MESSAGE */}
            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {/* SUCCESS MESSAGE */}
            {message && (
              <div className="auth-success">
                {message}
              </div>
            )}

            {/* STEP 1: OTP VERIFICATION */}
            {step === 1 && (

              <form onSubmit={handleVerifyOtp}>

                <div className="auth-field">

                  <label htmlFor="resetOtp">
                    Enter OTP
                  </label>

                  <div className="auth-input-wrapper">

                    <ShieldCheck size={18} />

                    <input
                      id="resetOtp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) =>
                        setOtp(
                          e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 6)
                        )
                      }
                      inputMode="numeric"
                      maxLength={6}
                      autoComplete="one-time-code"
                      required
                      disabled={loading}
                    />

                  </div>

                </div>

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                  <ArrowRight size={18} />
                </button>

              </form>

            )}

            {/* STEP 2: NEW PASSWORD */}
            {step === 2 && (

              <form onSubmit={handleResetPassword}>

                {/* NEW PASSWORD */}
                <div className="auth-field">

                  <label htmlFor="newPassword">
                    New Password
                  </label>

                  <div className="auth-input-wrapper">

                    <Lock size={18} />

                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(e.target.value)
                      }
                      autoComplete="new-password"
                      required
                      minLength={8}
                      disabled={loading}
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showPassword
                        ? <EyeOff size={18} />
                        : <Eye size={18} />}
                    </button>

                  </div>

                </div>

                {/* CONFIRM PASSWORD */}
                <div className="auth-field">

                  <label htmlFor="confirmPassword">
                    Confirm New Password
                  </label>

                  <div className="auth-input-wrapper">

                    <Lock size={18} />

                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? 'text'
                          : 'password'
                      }
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      autoComplete="new-password"
                      required
                      disabled={loading}
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showConfirmPassword
                        ? <EyeOff size={18} />
                        : <Eye size={18} />}
                    </button>

                  </div>

                </div>

                {/* RESET BUTTON */}
                <button
                  type="submit"
                  className="auth-submit"
                  disabled={loading}
                >
                  {loading
                    ? 'Resetting...'
                    : 'Reset Password'}

                  <ArrowRight size={18} />
                </button>

              </form>

            )}

            {/* BACK TO LOGIN */}
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

export default ResetPassword;
