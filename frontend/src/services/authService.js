
const API_URL = 'http://localhost:5134/api/auth';

// SEND OTP
export const sendOtp = async (email) => {
  const response = await fetch(`${API_URL}/send-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to send OTP.');
  }

  return data;
};

// VERIFY OTP
export const verifyOtp = async (email, otp) => {
  const response = await fetch(`${API_URL}/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, otp })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'OTP verification failed.');
  }

  return data;
};

// REGISTER
export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed.');
  }

  return data;
};

// LOGIN
export const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed.');
  }

  sessionStorage.setItem('authToken', data.token);

  return data;
};

// LOGOUT
export const logoutUser = () => {
  sessionStorage.removeItem('authToken');
};

// GET TOKEN
export const getToken = () => {
  return sessionStorage.getItem('authToken');
};
