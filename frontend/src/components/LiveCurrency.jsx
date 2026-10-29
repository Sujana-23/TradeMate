
import { useState, useEffect } from 'react';
import {
  RefreshCw,
  Globe,
  Clock,
  IndianRupee
} from 'lucide-react';
import './LiveCurrency.css';

const currencyCountries = {
  USD: 'United States',
  EUR: 'Eurozone',
  GBP: 'United Kingdom',
  AED: 'United Arab Emirates',
  JPY: 'Japan',
  AUD: 'Australia',
  CAD: 'Canada',
  SGD: 'Singapore',
  INR: 'India',
  CHF: 'Switzerland',
  CNY: 'China',
  NZD: 'New Zealand'
};

function Home({ data }) {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [alreadyUpdated, setAlreadyUpdated] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Original refresh logic preserved.
  const handleRefresh = async () => {
    if (alreadyUpdated) {
      setMessage("Today's exchange rates are already updated!");
      setMessageType('success');
      return;
    }

    setRefreshing(true);
    setMessage('');

    try {
      const response = await fetch(
        'http://localhost:5134/api/exchangerates'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const apiData = await response.json();

      setAlreadyUpdated(apiData.alreadyUpdated);

      if (apiData.alreadyUpdated) {
        setMessage("Today's exchange rates are already updated!");
        setMessageType('success');
      } else {
        setMessage('Exchange rates have been checked and updated!');
        setMessageType('success');
      }
    } catch (error) {
      console.error('Failed to refresh exchange rates:', error);
      setMessage('Unable to refresh exchange rates. Please try again.');
      setMessageType('error');
    } finally {
      setRefreshing(false);
    }
  };

  // Original toast timeout preserved.
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  const rates = Object.entries(data?.rates ?? {}).map(
    ([code, rate]) => ({
      code,
      country: currencyCountries[code] || 'Other region',
      rate
    })
  );

  const baseCurrency = data?.base_code;

  if (!data?.rates || !baseCurrency) {
    return (
      <main className="dashboard">
        <section className="welcome">
          <h1>Currency Dashboard</h1>
          <p>
            Unable to load exchange rates. Please try again.
          </p>

          <button
            className="refresh-button"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={refreshing ? 'spin' : ''}
            />
            {refreshing ? 'Refreshing...' : 'Refresh Rates'}
          </button>
        </section>
      </main>
    );
  }

  const selectedRate = rates.find(
    (item) => item.code === selectedCurrency
  );

  const formattedTime = data.time_last_update_utc
    ? new Date(data.time_last_update_utc).toLocaleString(
        'en-IN',
        { dateStyle: 'medium', timeStyle: 'short' }
      )
    : 'Unavailable';

  return (
    <main className="dashboard">
      {message && (
        <div className={`refresh-toast ${messageType}`}>
          {message}
        </div>
      )}

      <section className="welcome">
        <div>
          <p className="eyebrow">
            INTERNATIONAL BUSINESS MONITOR
          </p>

          <h1>Currency Dashboard</h1>

          <p className="subtitle">
            Monitor exchange rates for your international purchases.
          </p>
        </div>

        <div className="updated-badge">
          <Clock size={16} />
          <span>Updated: {formattedTime}</span>
        </div>
      </section>

      <section className="currency-cards">
        <article className="currency-card base-card">
          <div className="card-top">
            <span className="currency-icon">
              <IndianRupee size={23} />
            </span>
            <span className="tag">BASE CURRENCY</span>
          </div>

          <p className="currency-name">
            {currencyCountries[baseCurrency] || baseCurrency}
          </p>

          <h2>{baseCurrency}</h2>

          <p className="muted">
            Your API reference currency
          </p>
        </article>

        <article className="currency-card selected-card">
          <div className="card-top">
            <span className="currency-icon">
              <Globe size={23} />
            </span>
            <span className="tag">SELECT CURRENCY</span>
          </div>

          <label htmlFor="currencySelect">
            Choose a currency
          </label>

          <select
            id="currencySelect"
            value={selectedRate ? selectedCurrency : baseCurrency}
            onChange={(event) =>
              setSelectedCurrency(event.target.value)
            }
          >
            {rates.map((item) => (
              <option key={item.code} value={item.code}>
                {item.code} — {item.country}
              </option>
            ))}
          </select>

          <h2>
            ₹{selectedCurrency === baseCurrency
              ? '1.00'
              : selectedRate
                ? Number(selectedRate.rate).toFixed(2)
                : '—'}

            <span className="rate-unit">
              {' '}for 1 {selectedCurrency}
            </span>
          </h2>

          <p className="muted">
            Value in Indian Rupees
          </p>
        </article>
      </section>

      <section className="rates-section">
        <div className="section-heading">
          <div>
            <h2>Exchange Rates</h2>
            <p>
              See how much foreign money is worth in Indian rupees.
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={refreshing ? 'spin' : ''}
            />
            {refreshing ? 'Refreshing...' : 'Refresh Rates'}
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Currency</th>
                <th>Country / Region</th>
                <th>Value in Rupees (₹)</th>
              </tr>
            </thead>

            <tbody>
              {rates.map((item) => (
                <tr
                  key={item.code}
                  className={
                    selectedCurrency === item.code
                      ? 'selected-row'
                      : ''
                  }
                >
                  <td>
                    <strong>{item.code}</strong>
                  </td>

                  <td>{item.country}</td>

                  <td>
                    ₹{Number(item.rate).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="disclaimer">
          Rates are supplied by your exchange-rate API and may
          differ from bank or transaction rates.
        </p>
      </section>
    </main>
  );
}

export default Home;
