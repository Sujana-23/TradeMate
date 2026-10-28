
import { useState, useEffect,useCallback } from 'react';
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

import Navbar from './components/Navbar';
import LiveCurrency from './components/LiveCurrency';
import CurrencyConverter from './components/CurrencyConverter';

import History from './components/History';
import Trends from './components/Trends';

import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRates = useCallback(async () => {
    setRefreshing(true);

    try {
      const response = await fetch(
        'http://localhost:5134/api/exchangerates'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const apiData = await response.json();
      setData(apiData);
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />

        <Routes>
          <Route
            path="/"
            element={<LiveCurrency data={data} onRefresh={fetchRates} refreshing={refreshing}/>}
          />

          <Route
            path="/converter"
            element={<CurrencyConverter data={data} />}
          />

          <Route
            path="/history"
            element={<History />}
          />

          <Route
            path="/trends"
            element={<Trends />}
          />

          <Route
            path="*"
            element={
              <main className="dashboard">
                <h1>Page not found</h1>
              </main>
            }
          />
        </Routes>

        <footer className="footer">
          TradeMate · International Currency Monitor
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
