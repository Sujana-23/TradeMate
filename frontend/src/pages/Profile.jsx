
import { useEffect, useState } from 'react';

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

import api from '../services/api';

import './Profile.css';

function Profile() {
  const [user, setUser] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    phone: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // GET LOGGED-IN USER PROFILE
  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await api.get('/profile');

      const profile = response.data;

      setUser(profile);

      setFormData({
        email: profile.email || '',
        phone: profile.phone || ''
      });

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        'Unable to retrieve your profile.'
      );

      setMessageType('error');

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // HANDLE PROFILE INPUTS
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    setMessage('');
  };

  // UPDATE PROFILE
  const handleSave = async (e) => {
    e.preventDefault();

    const email = formData.email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Please enter a valid email address.');
      setMessageType('error');
      return;
    }

    const digits = formData.phone.replace(/\D/g, '');

    if (!digits || digits.length < 7 || digits.length > 15) {
      setMessage('Please enter a valid phone number.');
      setMessageType('error');
      return;
    }

    try {
      setSaving(true);
      setMessage('');

      const response = await api.put('/profile', {
        email,
        phone: digits
      });

      const updatedProfile = response.data.profile;

      setUser(updatedProfile);

      setFormData({
        email: updatedProfile.email || '',
        phone: updatedProfile.phone || ''
      });

      setEditMode(false);

      setMessage('Profile updated successfully!');
      setMessageType('success');

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        'Unable to update profile.'
      );

      setMessageType('error');

    } finally {
      setSaving(false);
    }
  };

  // HANDLE PASSWORD INPUTS
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });

    setMessage('');
  };

  // CHANGE PASSWORD
  const handlePasswordSave = async (e) => {
    e.preventDefault();

    const {
      currentPassword,
      newPassword,
      confirmPassword
    } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('Please fill in all password fields.');
      setMessageType('error');
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

      setMessageType('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match.');
      setMessageType('error');
      return;
    }

    try {
      setSaving(true);
      setMessage('');

      const response = await api.put(
        '/profile/change-password',
        passwordData
      );

      setMessage(
        response.data.message ||
        'Password changed successfully!'
      );

      setMessageType('success');

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setChangePassword(false);
      setShowPassword(false);

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        'Unable to change password.'
      );

      setMessageType('error');

    } finally {
      setSaving(false);
    }
  };

  // CANCEL PROFILE EDIT
  const cancelEdit = () => {
    setFormData({
      email: user.email || '',
      phone: user.phone || ''
    });

    setEditMode(false);
    setMessage('');
  };

  // TOGGLE PASSWORD FORM
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

  // FORMAT DATE AS DD/MM/YYYY
  const formatDate = (date) => {
    if (!date) return 'Not available';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Not available';
    }

    return parsedDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // LOADING STATE
  if (loading) {
    return (
      <main className="dashboard profile-dashboard">
        <p>Loading your profile...</p>
      </main>
    );
  }

  // ERROR STATE
  if (!user) {
    return (
      <main className="dashboard profile-dashboard">
        <div className="profile-message" role="alert">
          <AlertCircle size={17} />
          <span>{message || 'Unable to load your profile.'}</span>
        </div>
      </main>
    );
  }

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
              setFormData({
                email: user.email || '',
                phone: user.phone || ''
              });

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
          role={messageType === 'error' ? 'alert' : 'status'}
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
                  <p>{user.email || 'Not available'}</p>
                )}

              </div>

              {/* PHONE */}

              <div className="profile-field">

                <label>
                  <Phone size={15} />
                  Phone Number
                </label>

                {editMode ? (
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />
                ) : (
                  <p>
                    {user.phone
                      ? user.phone.replace(/^(\+\d{1,2})(\d+)$/, '$1 $2')
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

                <p>{formatDate(user.createdAt)}</p>

              </div>

            </div>

            {/* EDIT ACTIONS */}

            {editMode && (
              <div className="profile-actions">

                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={saving}
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>

                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={cancelEdit}
                  disabled={saving}
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
                  disabled={saving}
                >
                  <Save size={16} />
                  {saving ? 'Updating...' : 'Update Password'}
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
