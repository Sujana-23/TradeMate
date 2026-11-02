
import { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Mail,
  Phone,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';

import './Auth.css';
import Terms from './Terms';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    countryCode: '+91',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [error, setError] = useState('');

  // Password validation
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

  // Phone number lengths (national digits)
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

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

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
      setError('Please enter a valid phone number for the selected country.');
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

    const fullPhoneNumber =
      `${formData.countryCode}${phoneDigits}`;

    alert(
      `Registration UI is ready!\nEmail: ${formData.email}\nPhone: ${fullPhoneNumber}`
    );

    // Backend API integration will be added here.
  };

  return (
    <main className="auth-page">
      <section className="auth-container register-container">

        {/* BRAND PANEL */}
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

        {/* REGISTER FORM */}
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

                </div>

              </div>

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

                <small className="auth-hint">
                  Select your country code and enter your phone number.
                </small>

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
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                    aria-label={
                      showConfirmPassword ? 'Hide password' : 'Show password'
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

              {/* TERMS AND CONDITIONS */}
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

              {/* REGISTER BUTTON */}
              <button
                type="submit"
                className="auth-submit"
              >
                Create Account
                <ArrowRight size={18} />
              </button>

            </form>

            {/* TERMS POPUP */}
            {showTerms && (
              <Terms onClose={() => setShowTerms(false)} />
            )}

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
              <GoogleIcon />
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

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20">

      <path
        fill="#4285F4"
        d="M46 24.5c0-1.5-.2-3-.5-4.5H24v9h12.4c-.5 2.8-2.1 5.2-4.5 6.8l7.2 5.6C43.3 37.4 46 31.5 46 24.5z"
      />

      <path
        fill="#34A853"
        d="M24 46c6.2 0 11.4-2 15.1-5.5l-7.2-5.6c-2 1.4-4.6 2.2-7.9 2.2-6.1 0-11.3-4.1-13.2-9.6l-7.5 5.8C6.9 41 14.9 46 24 46z"
      />

      <path
        fill="#FBBC05"
        d="M10.8 27.5a13.5 13.5 0 0 0 0-7l-7.5-5.8a23 23 0 0 0 0 18.6z"
      />

      <path
        fill="#EA4335"
        d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.7-6.7C35.5 2.4 30.2 0 24 0 14.9 0 6.9 5 3.3 12.7l7.5 5.8C12.7 13.6 17.9 9.5 24 9.5z"
        transform="translate(0 4)"
      />

    </svg>
  );
}

export default Register;
