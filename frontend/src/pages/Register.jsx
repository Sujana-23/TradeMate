
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  registerUser,
  sendOtp,
  verifyOtp
} from '../services/authService';

import {
  Mail,
  Phone,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';

import './Auth.css';
import Terms from './Terms';

function Register() {
  const navigate = useNavigate();

  const [verificationToken, setVerificationToken] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    countryCode: '+91',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const phoneLengths = {
    '+91': [10],
    '+1': [10],
    '+44': [10],
    '+971': [9],
    '+81': [10],
    '+61': [9],
    '+65': [8],
    '+49': [10, 11],
    '+33': [9]
  };

  const passwordRules = [
    formData.password.length >= 8,
    /[A-Z]/.test(formData.password),
    /[a-z]/.test(formData.password),
    /[0-9]/.test(formData.password),
    /[^A-Za-z0-9]/.test(formData.password)
  ];

  const isPasswordStrong = passwordRules.every(Boolean);

  const missingRequirements = [
    formData.password.length < 8 && '8+ characters',
    !/[A-Z]/.test(formData.password) && 'uppercase',
    !/[a-z]/.test(formData.password) && 'lowercase',
    !/[0-9]/.test(formData.password) && 'number',
    !/[^A-Za-z0-9]/.test(formData.password) && 'special character'
  ].filter(Boolean);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'email') {
      setOtpSent(false);
      setEmailVerified(false);
      setOtp('');
    }

    setError('');
    setSuccess('');
  };

  

    
  const handleSendOTP = async () => {
    setError('');
    setSuccess('');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const email = formData.email.trim().toLowerCase();

    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setOtpLoading(true);

      await sendOtp(email);

      setOtpSent(true);
      setEmailVerified(false);
      setOtp('');
      setVerificationToken('');

      setSuccess(
        'OTP sent successfully! Please check your email.'
      );
    } catch (error) {
      setError(error.message || 'Unable to send OTP.');
    } finally {
      setOtpLoading(false);
    }
  };


  const handleVerifyOTP = async () => {
    setError('');
    setSuccess('');

    if (!/^\d{6}$/.test(otp)) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    try {
      setOtpLoading(true);

      const data = await verifyOtp(
        formData.email.trim().toLowerCase(),
        otp
      );

      setVerificationToken(data.verificationToken);
      setEmailVerified(true);

      setSuccess('Email address verified successfully!');
    } catch (error) {
      setError(error.message || 'OTP verification failed.');
    } finally {
      setOtpLoading(false);
    }
  };


  
const handleSubmit = async (event) => {
  event.preventDefault();

  setError('');
  setSuccess('');

  // EMAIL VERIFICATION
  if (!emailVerified || !verificationToken) {
    setError('Please verify your email address before creating your account.');
    return;
  }
    

  // EMAIL VALIDATION
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(formData.email.trim())) {
    setError('Please enter a valid email address.');
    return;
  }

  // PHONE VALIDATION
  const phoneDigits = formData.phone.replace(/\D/g, '');
  const allowedLengths = phoneLengths[formData.countryCode];

  if (
    !phoneDigits ||
    (allowedLengths
      ? !allowedLengths.includes(phoneDigits.length)
      : phoneDigits.length < 7 || phoneDigits.length > 12)
  ) {
    setError('Please enter a valid phone number.');
    return;
  }

  // PASSWORD VALIDATION
  if (!isPasswordStrong) {
    setError('Please enter a strong password.');
    return;
  }

  // CONFIRM PASSWORD
  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match.');
    return;
  }

  // TERMS VALIDATION
  if (!formData.agreeTerms) {
    setError('Please accept the Terms and Conditions.');
    return;
  }

  try {
    setSubmitting(true);

    const fullPhoneNumber =
      `${formData.countryCode}${phoneDigits}`;

    await registerUser({
      email: formData.email.trim().toLowerCase(),
      phone: fullPhoneNumber,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      termsAccepted: formData.agreeTerms,
      verificationToken: verificationToken
    });

    setSuccess('Registration successful! Redirecting to login...');

    setTimeout(() => {
      navigate('/login', {
        state: { registered: true }
      });
    }, 1500);

  } catch (error) {
    setError(
      error.message || 'Registration failed. Please try again.'
    );
  } finally {
    setSubmitting(false);
  }
};


  return (
    <main className="auth-page">
      <section className="auth-container register-container">

        <div className="auth-brand-panel">
          <div className="auth-brand">
            <span className="brand-icon">T</span>
            <span>TradeMate</span>
          </div>

          <div className="auth-brand-content">
            <span className="auth-eyebrow">
              START YOUR JOURNEY
            </span>

            <h1>
              Make smarter
              <span> currency decisions.</span>
            </h1>

            <p>
              Create your TradeMate account to explore global
              exchange rates, currency trends and financial
              insights in one place.
            </p>
          </div>

          <div className="auth-panel-footer">
            TradeMate · International Currency Monitor
          </div>
        </div>

        <div className="auth-form-panel register-form-panel">

          <div className="auth-mobile-brand">
            <span className="brand-icon">T</span>
            <span>TradeMate</span>
          </div>

          <div className="auth-form-content register-content">

            <div className="auth-heading">
              <span className="auth-small-label">
                GET STARTED
              </span>

              <h2>Create your account</h2>
              <p>Fill in your details to join TradeMate.</p>
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {success && (
              <div className="auth-success">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* EMAIL */}

              <div className="auth-field">
                <label htmlFor="email">
                  Email Address
                </label>

                <div className="auth-input-wrapper">
                  <Mail size={18} />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />

                  {!emailVerified && (
                    <button
                      type="button"
                      className="otp-send-button"
                      onClick={handleSendOTP}
                      disabled={otpLoading}
                    >
                      {otpLoading
                        ? 'Sending...'
                        : otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  )}

                  {emailVerified && (
                    <CheckCircle
                      size={20}
                      color="#18845b"
                    />
                  )}
                </div>

                {emailVerified && (
                  <small className="email-verified">
                    <ShieldCheck size={14} />
                    Email verified successfully
                  </small>
                )}
              </div>

              {/* OTP */}

              {otpSent && !emailVerified && (
                <div className="auth-field otp-field">
                  <label htmlFor="otp">
                    Enter Email OTP
                  </label>

                  <div className="otp-input-group">
                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => {
                        setOtp(
                          e.target.value.replace(/\D/g, '')
                        );
                        setError('');
                      }}
                    />

                    <button
                      type="button"
                      className="otp-verify-button"
                      onClick={handleVerifyOTP}
                      disabled={otpLoading}
                    >
                      {otpLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>

                  
                </div>
              )}

              {/* PHONE */}

              <div className="auth-field">
                <label htmlFor="phone">
                  Phone Number
                </label>

                <div className="auth-input-wrapper phone-input-wrapper">
                  <Phone size={18} />

                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="country-code-select"
                    aria-label="Country calling code"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+65">🇸🇬 +65</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+33">🇫🇷 +33</option>
                  </select>

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel-national"
                    maxLength={12}
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div className="auth-field">
                <label htmlFor="registerPassword">
                  Password
                </label>

                <div className="auth-input-wrapper">
                  <LockKeyhole size={18} />

                  <input
                    id="registerPassword"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    autoComplete="new-password"
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

                {passwordFocused && (
                  <div
                    className={`password-strength ${
                      isPasswordStrong ? 'strong' : 'weak'
                    }`}
                  >
                    {isPasswordStrong
                      ? 'Strong password ✓'
                      : `Weak – ${missingRequirements.join(', ')} needed`}
                  </div>
                )}
              </div>

              {/* CONFIRM PASSWORD */}

              <div className="auth-field">
                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <div className="auth-input-wrapper">
                  <LockKeyhole size={18} />

                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword
                      ? <EyeOff size={18} />
                      : <Eye size={18} />}
                  </button>
                </div>

                {formData.confirmPassword && (
                  <small
                    className={
                      formData.password === formData.confirmPassword
                        ? 'password-match'
                        : 'password-mismatch'
                    }
                  >
                    {formData.password === formData.confirmPassword
                      ? '✓ Passwords match'
                      : '✕ Passwords do not match'}
                  </small>
                )}
              </div>

              {/* TERMS */}

              <label className="terms-option">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                />

                <span>
                  I agree to the{' '}
                  <button
                    type="button"
                    className="terms-link"
                    onClick={() => setShowTerms(true)}
                  >
                    Terms and Conditions
                  </button>
                  {' '}and Privacy Policy.
                </span>
              </label>

              {showTerms && (
                <Terms onClose={() => setShowTerms(false)} />
              )}

              {/* REGISTER */}

              <button
                type="submit"
                className="auth-submit"
                disabled={submitting}
              >
                {submitting
                  ? 'Creating Account...'
                  : 'Create Account'}

                {!submitting && <ArrowRight size={18} />}
              </button>

              {!emailVerified && (
                <small className="registration-hint">
                  Please verify your email before creating your account.
                </small>
              )}

            </form>

            <div className="auth-divider">
              <span>OR CONTINUE WITH</span>
            </div>

            <button
              type="button"
              className="google-button"
              onClick={() =>
                alert('Google sign-in will be integrated later.')
              }
            >
              Continue with Google
            </button>

            <p className="auth-switch">
              Already have an account?
              <Link to="/login"> Sign in</Link>
            </p>

          </div>
        </div>
      </section>
    </main>
  );
}

export default Register;
