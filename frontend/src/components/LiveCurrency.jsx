
import { useState } from 'react';
import {
  RefreshCw,
  Globe,
  Clock,
  IndianRupee
} from 'lucide-react';
import './LiveCurrency.css'


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

function Home({ data, onRefresh, refreshing = false }) {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Use the actual API response instead of demo data.
  const rates = Object.entries(data?.rates ?? {}).map(
    ([code, rate]) => ({
      code,
      country: currencyCountries[code] || 'Other region',
      rate
    })
  );

  const baseCurrency = data?.base_code;

  // Handle loading or failed API responses.
  if (!data?.rates || !baseCurrency) {
    return (
      <main className="dashboard">
        <section className="welcome">
          <h1>Currency Dashboard</h1>
          <p>
            Unable to load exchange rates. Please try again.
          </p>

          {onRefresh && (
            <button onClick={onRefresh} disabled={refreshing}>
              Retry
            </button>
          )}
        </section>
      </main>
    );
  }

  // Make sure the selected currency exists in the API response.
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
            {selectedCurrency === baseCurrency
              ? '1.0000'
              : selectedRate
                ? (1 / selectedRate.rate).toFixed(4)
                : '—'}

            <span className="rate-unit">
              {' '}{baseCurrency} per 1 {selectedCurrency}
            </span>
          </h2>

          <p className="muted">
            Rate relative to {baseCurrency}
          </p>
        </article>
      </section>

      <section className="rates-section">
        <div className="section-heading">
          <div>
            <h2>Exchange Rates</h2>

            <p>
              Compare currencies against {baseCurrency}.
            </p>
          </div>

          <button
            className="refresh-button"
            onClick={onRefresh}
            disabled={!onRefresh || refreshing}
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
                <th>Rate relative to {baseCurrency}</th>
                <th>Type</th>
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

                  <td>{Number(item.rate).toFixed(4)}</td>

                  <td>
                    <span className="rate-label">
                      Live API
                    </span>
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
