
import { useState } from 'react';

import {
  Mail,
  Phone,
  CalendarDays,
  UserRound,
  Save,
  X,
  LockKeyhole,
  Eye,
  EyeOff,
  AlertCircle,
  Edit
} from 'lucide-react';

import './Profile.css';

function Profile() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('tradeMateUser');

      return savedUser
        ? JSON.parse(savedUser)
        : {
            email: '',
            countryCode: '+91',
            phone: '',
            createdAt: new Date().toLocaleDateString(),
            accountType: 'TradeMate User',
            termsAccepted: false
          };
    } catch {
      return {
        email: '',
        countryCode: '+91',
        phone: '',
        createdAt: '',
        accountType: 'TradeMate User',
        termsAccepted: false
      };
    }
  });

  const [editMode, setEditMode] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [formData, setFormData] = useState(user);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    setMessage('');
  };

  const handleSave = (e) => {
    e.preventDefault();

    const email = formData.email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Please enter a valid email address.');
      return;
    }

    const digits = formData.phone.replace(/\D/g, '');

    if (!digits) {
      setMessage('Please enter a valid phone number.');
      return;
    }

    const updatedUser = {
      ...user,
      ...formData,
      email,
      phone: digits
    };

    try {
      localStorage.setItem(
        'tradeMateUser',
        JSON.stringify(updatedUser)
      );

      setUser(updatedUser);
      setFormData(updatedUser);
      setEditMode(false);
      setMessage('Profile updated successfully!');
    } catch {
      setMessage('Unable to save profile. Please try again.');
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });

    setMessage('');
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();

    const {
      currentPassword,
      newPassword,
      confirmPassword
    } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('Please fill in all password fields.');
      return;
    }

    const strongPassword =
      newPassword.length >= 8 &&
      /[A-Z]/.test(newPassword) &&
      /[a-z]/.test(newPassword) &&
      /[0-9]/.test(newPassword) &&
      /[^A-Za-z0-9]/.test(newPassword);

    if (!strongPassword) {
      setMessage(
        'Password must contain uppercase, lowercase, number and special character.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match.');
      return;
    }

    setMessage(
      'Password change requires backend authentication.'
    );
  };

  const cancelEdit = () => {
    setFormData(user);
    setEditMode(false);
    setMessage('');
  };

  const togglePassword = () => {
    setChangePassword(!changePassword);
    setShowPassword(false);
    setMessage('');

    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <main className="dashboard profile-dashboard">

      {/* PAGE HEADING */}

      <section className="profile-page-heading">

        <div className="profile-heading-content">
          <span className="profile-eyebrow">
            TRADEMATE ACCOUNT
          </span>

          <h1>My Profile</h1>

          <p>
            Manage your personal information and account settings.
          </p>
        </div>

        {!editMode && (
          <button
            type="button"
            className="profile-heading-edit"
            onClick={() => {
              setFormData(user);
              setEditMode(true);
              setMessage('');
            }}
          >
            <Edit size={16} />
            Edit Profile
          </button>
        )}

      </section>

      {/* ACCOUNT HEADING */}

      <div className="profile-account-heading">
        <div>
          <h2>My Account</h2>
          <p>Manage your TradeMate profile</p>
        </div>
      </div>

      {/* MESSAGE */}

      {message && (
        <div
          className="profile-message"
          role="status"
        >
          <AlertCircle size={17} />

          <span>{message}</span>

          <button
            type="button"
            aria-label="Close message"
            onClick={() => setMessage('')}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="profile-section">

        {/* PERSONAL INFORMATION */}

        <div className="profile-card">

          <div className="profile-card-heading">
            <div className="profile-icon">
              <UserRound size={19} />
            </div>

            <div>
              <h2>Personal Information</h2>
              <p>Update your contact information.</p>
            </div>
          </div>

          <form onSubmit={handleSave}>

            <div className="profile-details">

              {/* EMAIL */}

              <div className="profile-field">
                <label>
                  <Mail size={15} />
                  Email Address
                </label>

                {editMode ? (
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                ) : (
                  <p>
                    {user.email || 'Not available'}
                  </p>
                )}
              </div>

              {/* PHONE */}

              <div className="profile-field">
                <label>
                  <Phone size={15} />
                  Phone Number
                </label>

                {editMode ? (
                  <div className="profile-phone-input">

                    <select
                      name="countryCode"
                      value={formData.countryCode || '+91'}
                      onChange={handleChange}
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+971">+971</option>
                      <option value="+81">+81</option>
                      <option value="+61">+61</option>
                      <option value="+65">+65</option>
                      <option value="+49">+49</option>
                      <option value="+33">+33</option>
                    </select>

                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      required
                    />

                  </div>
                ) : (
                  <p>
                    {user.phone
                      ? `${user.countryCode || '+91'} ${user.phone}`
                      : 'Not available'}
                  </p>
                )}
              </div>

              {/* ACCOUNT CREATED */}

              <div className="profile-field">
                <label>
                  <CalendarDays size={15} />
                  Account Created
                </label>

                <p>
                  {user.createdAt || 'Not available'}
                </p>
              </div>

            </div>

            {/* EDIT ACTIONS */}

            {editMode && (
              <div className="profile-actions">

                <button
                  type="submit"
                  className="profile-save-button"
                >
                  <Save size={16} />
                  Save Changes
                </button>

                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={cancelEdit}
                >
                  <X size={16} />
                  Cancel
                </button>

              </div>
            )}

          </form>

        </div>

        {/* SECURITY SETTINGS */}

        <div className="profile-card">

          <div className="profile-security-heading">

            <div className="profile-card-heading">
              <div className="profile-icon">
                <LockKeyhole size={19} />
              </div>

              <div>
                <h2>Security Settings</h2>
                <p>Manage your account password.</p>
              </div>
            </div>

            <button
              type="button"
              className="profile-edit-button"
              onClick={togglePassword}
            >
              <LockKeyhole size={16} />

              {changePassword ? 'Cancel' : 'Change Password'}
            </button>

          </div>

          {changePassword && (

            <form
              className="password-change-form"
              onSubmit={handlePasswordSave}
            >

              <div className="profile-field">
                <label>Current Password</label>

                <input
                  type={showPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="profile-field">
                <label>New Password</label>

                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div className="profile-field">
                <label>Confirm New Password</label>

                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <div className="password-requirements">
                Password must contain:
                <ul>
                  <li>At least 8 characters</li>
                  <li>One uppercase and one lowercase letter</li>
                  <li>One number and one special character</li>
                </ul>
              </div>

              <div className="password-actions">

                <button
                  type="button"
                  className="password-visibility-button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword
                    ? <EyeOff size={16} />
                    : <Eye size={16} />}

                  {showPassword
                    ? 'Hide Passwords'
                    : 'Show Passwords'}
                </button>

                <button
                  type="submit"
                  className="profile-save-button"
                >
                  <Save size={16} />
                  Update Password
                </button>

              </div>

            </form>

          )}

        </div>

      </section>

    </main>
  );
}

export default Profile;
