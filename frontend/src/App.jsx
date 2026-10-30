
import { useState, useEffect, useCallback } from 'react';

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import Navbar from './components/Navbar';

import LiveCurrency from './components/LiveCurrency';
import CurrencyConverter from './components/CurrencyConverter';
import History from './components/History';
import Trends from './components/Trends';

import Login from './pages/Login';
import Register from './pages/Register';

import './App.css';

function App() {

  const [data, setData] = useState(null);

  // Temporary frontend demo login session
  const [isLoggedIn, setIsLoggedIn] = useState(
    sessionStorage.getItem('demoLogin') === 'true'
  );

  // Fetch exchange rates
  const fetchRates = useCallback(async () => {
    try {
      const response = await fetch(
        'http://localhost:5134/api/exchangerates'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const apiData = await response.json();

      setData(apiData);

      return apiData;

    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      return null;
    }
  }, []);

  // Fetch rates only after login
  useEffect(() => {
    if (isLoggedIn) {
      fetchRates();
    }
  }, [isLoggedIn, fetchRates]);

  // Login handler
  const handleLogin = () => {
    sessionStorage.setItem('demoLogin', 'true');
    setIsLoggedIn(true);
  };

  // Logout handler
  const handleLogout = () => {
    sessionStorage.removeItem('demoLogin');
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>

      <div className="app">

        <Routes>

          {/* ROOT URL - LOGIN PAGE */}

          <Route
            path="/"
            element={
              isLoggedIn
                ? <Navigate to="/dashboard" replace />
                : <Login onLogin={handleLogin} />
            }
          />

          {/* LOGIN PAGE */}

          <Route
            path="/login"
            element={
              isLoggedIn
                ? <Navigate to="/dashboard" replace />
                : <Login onLogin={handleLogin} />
            }
          />

          {/* REGISTRATION PAGE */}

          <Route
            path="/register"
            element={
              isLoggedIn
                ? <Navigate to="/dashboard" replace />
                : <Register />
            }
          />

          {/* PROTECTED DASHBOARD */}

          <Route
            path="/dashboard"
            element={
              isLoggedIn ? (
                <>
                  <Navbar onLogout={handleLogout} />

                  <LiveCurrency data={data} />

                  <footer className="footer">
                    TradeMate · International Currency Monitor
                  </footer>
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* PROTECTED CONVERTER */}

          <Route
            path="/converter"
            element={
              isLoggedIn ? (
                <>
                  <Navbar onLogout={handleLogout} />

                  <CurrencyConverter data={data} />

                  <footer className="footer">
                    TradeMate · International Currency Monitor
                  </footer>
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* PROTECTED HISTORY */}

          <Route
            path="/history"
            element={
              isLoggedIn ? (
                <>
                  <Navbar onLogout={handleLogout} />

                  <History />

                  <footer className="footer">
                    TradeMate · International Currency Monitor
                  </footer>
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* PROTECTED TRENDS */}

          <Route
            path="/trends"
            element={
              isLoggedIn ? (
                <>
                  <Navbar onLogout={handleLogout} />

                  <Trends />

                  <footer className="footer">
                    TradeMate · International Currency Monitor
                  </footer>
                </>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* FORGOT PASSWORD PLACEHOLDER */}

          <Route
            path="/forgot-password"
            element={
              isLoggedIn
                ? <Navigate to="/dashboard" replace />
                : (
                  <main className="auth-page">
                    <div className="auth-form-content">
                      <h2>Forgot Password</h2>
                      <p>Password recovery will be added later.</p>
                      <a href="/login">Back to Login</a>
                    </div>
                  </main>
                )
            }
          />

          {/* INVALID URL */}

          <Route
            path="*"
            element={
              <Navigate
                to={isLoggedIn ? '/dashboard' : '/login'}
                replace
              />
            }
          />

        </Routes>

      </div>

    </BrowserRouter>
  );
}

export default App;
