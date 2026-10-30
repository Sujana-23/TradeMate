
import { useState } from 'react';

import {
  ArrowLeftRight,
  Calculator,
  ArrowRightLeft
} from 'lucide-react';

import './CurrencyConverter.css';

const currencyNames = {
  INR: 'Indian Rupee',
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  AED: 'UAE Dirham',
  JPY: 'Japanese Yen',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  SGD: 'Singapore Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
  NZD: 'New Zealand Dollar'
};

function CurrencyConverter({ data }) {

  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');

  const baseCurrency = data?.base_code;
  const rates = data?.rates;

  if (!rates || !baseCurrency) {
    return (
      <main className="dashboard">
        <p>Loading exchange rates...</p>
      </main>
    );
  }

  // Get available currencies from API
  const currencies = Object.keys(rates);

  // Ensure base currency is available
  if (!currencies.includes(baseCurrency)) {
    currencies.push(baseCurrency);
  }

  const from = currencies.includes(fromCurrency)
    ? fromCurrency
    : baseCurrency;

  const to = currencies.includes(toCurrency)
    ? toCurrency
    : baseCurrency;

  // Rates are expressed relative to INR
  const fromRate = Number(rates[from]);
  const toRate = Number(rates[to]);

  const numericAmount = Number(amount);

  const validAmount =
    amount.trim() !== '' &&
    Number.isFinite(numericAmount) &&
    numericAmount >= 0;

  // Correct conversion calculation
  const result =
  validAmount &&
  Number.isFinite(fromRate) &&
  Number.isFinite(toRate) &&
  fromRate > 0 &&
  toRate > 0
    ? (numericAmount * fromRate) / toRate
    : null;

  // Calculate exchange rate
  const exchangeRate =
  Number.isFinite(fromRate) &&
  Number.isFinite(toRate) &&
  fromRate > 0 &&
  toRate > 0
    ? fromRate / toRate
    : null;
  // Swap currencies
  function swapCurrencies() {
    setFromCurrency(to);
    setToCurrency(from);
  }

  // Format converted values
  function formatNumber(value, maximumFractionDigits = 4) {
    return Number(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits
    });
  }

  return (
    <main className="dashboard">

      <section className="welcome">
        <div>
          <p className="eyebrow">
            TRADEMATE CURRENCY TOOLS
          </p>

          <h1>Currency Converter</h1>

          <p className="subtitle">
            Estimate the cost of products purchased from other countries.
          </p>
        </div>
      </section>

      <section className="rates-section converter-section">

        <div className="converter-heading">

          <div className="converter-icon">
            <Calculator size={25} />
          </div>

          <div>
            <h2>Convert Currency</h2>
            <p>
              Enter an amount and choose your currencies.
            </p>
          </div>

        </div>

        <div className="converter-form">

          {/* Amount */}

          <div className="form-group">

            <label htmlFor="converterAmount">
              Amount
            </label>

            <input
              id="converterAmount"
              type="number"
              min="0"
              step="any"
              placeholder="Enter amount"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
            />

          </div>

          {/* From Currency */}

          <div className="form-group">

            <label htmlFor="fromCurrency">
              From currency
            </label>

            <select
              id="fromCurrency"
              value={from}
              onChange={(event) =>
                setFromCurrency(event.target.value)
              }
            >

              {currencies.map((code) => (
                <option key={code} value={code}>
                  {code} — {currencyNames[code] || code}
                </option>
              ))}

            </select>

          </div>

          {/* Swap Button */}

          <button
            type="button"
            className="swap-button"
            onClick={swapCurrencies}
            aria-label="Swap currencies"
            title="Swap currencies"
          >
            <ArrowLeftRight size={20} />
          </button>

          {/* To Currency */}

          <div className="form-group">

            <label htmlFor="toCurrency">
              To currency
            </label>

            <select
              id="toCurrency"
              value={to}
              onChange={(event) =>
                setToCurrency(event.target.value)
              }
            >

              {currencies.map((code) => (
                <option key={code} value={code}>
                  {code} — {currencyNames[code] || code}
                </option>
              ))}

            </select>

          </div>

        </div>

        {/* Conversion Result */}

        <div className="conversion-result">

          <p className="result-label">
            Converted Amount
          </p>

          {result !== null ? (
            <h2>
              {formatNumber(result)} {to}
            </h2>
          ) : (
            <h2>
              Please enter a valid amount
            </h2>
          )}

          <p className="result-description">

            {result !== null
              ? `${amount} ${from} = ${formatNumber(result)} ${to}`
              : 'Enter a valid amount and check the selected currencies.'}

          </p>

        </div>

        {/* Exchange Rate Information */}

        <div className="rate-information">

          <ArrowRightLeft size={18} />

          <span>
            {exchangeRate !== null
              ? `1 ${from} = ${formatNumber(exchangeRate, 6)} ${to}`
              : 'Exchange rate unavailable'}
          </span>

        </div>

        <p className="disclaimer">
          Calculations use the exchange rates provided by your connected API.
          Actual bank and transaction rates may differ.
        </p>

      </section>

    </main>
  );
}

export default CurrencyConverter;
