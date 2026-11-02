
import { useState } from 'react';
import {
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  ShieldCheck,
  Edit,
  Save,
  X,
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import './Profile.css';

function Profile() {
  const [user, setUser] = useState(() => {
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
  };

  const handleSave = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
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
      phone: digits
    };

    setUser(updatedUser);
    localStorage.setItem(
      'tradeMateUser',
      JSON.stringify(updatedUser)
    );

    setFormData(updatedUser);
    setEditMode(false);
    setMessage('Profile updated successfully!');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmPassword } =
      passwordData;

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
      setMessage('New password must meet all security requirements.');
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

  return (
    <main className="dashboard">

      <section className="welcome">
        <p className="eyebrow">TRADEMATE ACCOUNT</p>
        <h1>My Profile</h1>
        <p className="subtitle">
          View and manage your personal information.
        </p>
      </section>

      {message && (
        <div className="profile-message">
          <AlertCircle size={17} />
          {message}
          <button onClick={() => setMessage('')}>
            <X size={16} />
          </button>
        </div>
      )}

      <section className="profile-section">

        <div className="profile-header">
          <div className="profile-avatar">
            <UserRound size={40} />
          </div>

          <div>
            <h2>My Account</h2>
            <p>TradeMate Member</p>
          </div>

          <button
            className="profile-edit-button"
            onClick={() => {
              setFormData(user);
              setEditMode(!editMode);
              setMessage('');
            }}
          >
            {editMode ? <X size={17} /> : <Edit size={17} />}
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="profile-card">

          <h2>Personal Information</h2>

          <div className="profile-details">

            <div className="profile-field">
              <label><Mail size={15} /> Email Address</label>
              {editMode ? (
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                />
              ) : (
                <p>{user.email || 'Not available'}</p>
              )}
            </div>

            <div className="profile-field">
              <label><Phone size={15} /> Phone Number</label>

              {editMode ? (
                <div className="profile-phone-input">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
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
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                  />
                </div>
              ) : (
                <p>
                  {user.phone
                    ? `${user.countryCode} ${user.phone}`
                    : 'Not available'}
                </p>
              )}
            </div>

            <div className="profile-field">
              <label>
                <CalendarDays size={15} /> Account Created
              </label>
              <p>{user.createdAt || 'Not available'}</p>
            </div>

          </div>

          {editMode && (
            <div className="profile-actions">
              <button
                className="profile-save-button"
                onClick={handleSave}
              >
                <Save size={16} /> Save Changes
              </button>

              <button
                className="profile-cancel-button"
                onClick={() => {
                  setFormData(user);
                  setEditMode(false);
                }}
              >
                Cancel
              </button>
            </div>
          )}

        </div>

        <div className="profile-card">

          <h2>Account Information</h2>

          <div className="profile-details">

            <div className="profile-field">
              <label><ShieldCheck size={15} /> Account Status</label>
              <p>Logged In</p>
            </div>

            <div className="profile-field">
              <label><UserRound size={15} /> Account Type</label>
              <p>{user.accountType}</p>
            </div>

            <div className="profile-field">
              <label><CheckCircle size={15} /> Terms Acceptance</label>
              <p>{user.termsAccepted ? 'Accepted' : 'Not available'}</p>
            </div>

          </div>

        </div>

        <div className="profile-card">

          <div className="profile-security-heading">
            <h2>Security Settings</h2>

            <button
              className="profile-edit-button"
              onClick={() => {
                setChangePassword(!changePassword);
                setMessage('');
              }}
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
                  required
                />
              </div>

              <button
                type="button"
                className="password-visibility-button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword
                  ? <EyeOff size={16} />
                  : <Eye size={16} />}
                {showPassword ? 'Hide Passwords' : 'Show Passwords'}
              </button>

              <button
                type="submit"
                className="profile-save-button"
              >
                Update Password
              </button>

            </form>
          )}

        </div>

      </section>

    </main>
  );
}

export default Profile;
