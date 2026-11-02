
const API_URL = 'http://localhost:5134/api/auth';

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

    // Store token for the current browser tab session
    sessionStorage.setItem('authToken', data.token);

    return data;
};


// LOGOUT
export const logoutUser = () => {
    sessionStorage.removeItem('authToken');
};


// GET STORED TOKEN
export const getToken = () => {
    return sessionStorage.getItem('authToken');
};
