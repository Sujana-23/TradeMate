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

// VERIFY REGISTRATION OTP
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

// FORGOT PASSWORD - SEND RESET OTP
export const forgotPassword = async (email) => {
  const response = await fetch(`${API_URL}/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to send password reset OTP.'
    );
  }

  return data;
};

// VERIFY FORGOT PASSWORD OTP
export const verifyResetOtp = async ({ email, otp }) => {
  const response = await fetch(
    `${API_URL}/verify-reset-otp`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'OTP verification failed.'
    );
  }

  return data;
};

// RESET PASSWORD AFTER OTP VERIFICATION
export const resetPassword = async (resetData) => {
  const response = await fetch(
    `${API_URL}/reset-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resetData)
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Password reset failed.'
    );
  }

  return data;
};
