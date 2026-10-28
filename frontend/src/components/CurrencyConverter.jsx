
import { useState } from 'react';
import {
  ArrowLeftRight,
  Calculator,
  ArrowRightLeft
} from 'lucide-react';
import './CurrencyConverter.css'

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

  // Hooks must be called before any conditional return.
  const baseCurrency = data?.base_code;
  const rates = data?.rates;

  if (!rates || !baseCurrency) {
    return (
      <main className="dashboard">
        <p>Loading exchange rates...</p>
      </main>
    );
  }

  // Build the currency list from the real API response.
  const currencies = Object.keys(rates);

  // Include the base currency even if it isn't in rates.
  if (!currencies.includes(baseCurrency)) {
    currencies.push(baseCurrency);
  }

  // If the API response changes, fall back to available currencies.
  const from = currencies.includes(fromCurrency)
    ? fromCurrency
    : baseCurrency;

  const to = currencies.includes(toCurrency)
    ? toCurrency
    : baseCurrency;

  // Rates are relative to the API's base currency.
  const fromRate = from === baseCurrency ? 1 : rates[from];
  const toRate = to === baseCurrency ? 1 : rates[to];

  const numericAmount = Number(amount);

  const validAmount =
    amount.trim() !== '' &&
    Number.isFinite(numericAmount) &&
    numericAmount >= 0;

  const result =
    validAmount &&
    fromRate != null &&
    toRate != null &&
    Number.isFinite(Number(fromRate)) &&
    Number.isFinite(Number(toRate)) &&
    Number(fromRate) > 0 &&
    Number(toRate) > 0
      ? (numericAmount / Number(fromRate)) * Number(toRate)
      : null;

  function swapCurrencies() {
    setFromCurrency(to);
    setToCurrency(from);
  }

  function formatNumber(value, maximumFractionDigits = 4) {
    return value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits
    });
  }

  const exchangeRate =
    fromRate != null && toRate != null &&
    Number(fromRate) > 0 && Number(toRate) > 0
      ? Number(toRate) / Number(fromRate)
      : null;

  return (
    <main className="dashboard">
      <section className="welcome">
        <div>
          <p className="eyebrow">TRADEMATE CURRENCY TOOLS</p>

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
            <p>Enter an amount and choose your currencies.</p>
          </div>
        </div>

        <div className="converter-form">
          <div className="form-group">
            <label htmlFor="converterAmount">Amount</label>

            <input
              id="converterAmount"
              type="number"
              min="0"
              step="any"
              placeholder="Enter amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fromCurrency">From currency</label>

            <select
              id="fromCurrency"
              value={from}
              onChange={(event) => setFromCurrency(event.target.value)}
            >
              {currencies.map((code) => (
                <option key={code} value={code}>
                  {code} — {currencyNames[code] || code}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="swap-button"
            onClick={swapCurrencies}
            aria-label="Swap currencies"
            title="Swap currencies"
          >
            <ArrowLeftRight size={20} />
          </button>

          <div className="form-group">
            <label htmlFor="toCurrency">To currency</label>

            <select
              id="toCurrency"
              value={to}
              onChange={(event) => setToCurrency(event.target.value)}
            >
              {currencies.map((code) => (
                <option key={code} value={code}>
                  {code} — {currencyNames[code] || code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="conversion-result">
          <p className="result-label">Converted Amount</p>

          {result === null ? (
            <h2>Please enter a valid amount</h2>
          ) : (
            <h2>
              {formatNumber(result)} {to}
            </h2>
          )}

          <p className="result-description">
            {result !== null
              ? `${amount} ${from} = ${formatNumber(result)} ${to}`
              : 'Enter a valid amount and check the selected currencies.'}
          </p>
        </div>

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
