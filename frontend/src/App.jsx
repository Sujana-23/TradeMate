
import { useState, useEffect, useCallback } from 'react';

import { getToken, logoutUser } from './services/authService';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import Navbar from './components/Navbar';

import LiveCurrency from './components/LiveCurrency';
import CurrencyConverter from './components/CurrencyConverter';

import Profile from './pages/Profile';

import Trends from './components/Trends';

import Login from './pages/Login';
import Register from './pages/Register';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import './App.css';

function App() {

  const [data, setData] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());

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

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    logoutUser();
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

          {/* PROTECTED PROFILE */}

          <Route
            path="/profile"
            element={
              isLoggedIn ? (
                <>
                  <Navbar onLogout={handleLogout} />

                  <Profile />

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

          {/* FORGOT PASSWORD PAGE */}

          <Route
            path="/forgot-password"
            element={
              isLoggedIn
                ? <Navigate to="/dashboard" replace />
                : <ForgotPassword />
            }
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
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
