
import { useEffect, useState } from 'react';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

import {
  TrendingUp,
  CalendarDays,
  Globe,
  AlertCircle
} from 'lucide-react';

import { getHistoricalRates } from '../services/trendsService';

import './Trends.css';

function Trends() {
  const [currency, setCurrency] = useState('USD');
  const [period, setPeriod] = useState('month');

  const [filterType, setFilterType] = useState('period');

  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear()
  );

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1
  );

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [chartData, setChartData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currencyNames = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    AED: 'UAE Dirham',
    JPY: 'Japanese Yen',
    AUD: 'Australian Dollar',
    CAD: 'Canadian Dollar',
    SGD: 'Singapore Dollar',
    CHF: 'Swiss Franc',
    INR: 'Indian Rupee'
  };

  useEffect(() => {
    let cancelled = false;

    const fetchRates = async () => {
      setLoading(true);
      setError('');

      try {
        let params = {
          fromCurrency: currency,
          toCurrency: 'INR'
        };

        if (filterType === 'period') {
          params.period = period;
        }

        if (filterType === 'month') {
          params.year = selectedYear;
          params.month = selectedMonth;
        }

        if (filterType === 'custom') {
          if (!startDate || !endDate) {
            setChartData([]);
            setLoading(false);
            return;
          }

          if (startDate > endDate) {
            setError('Start date cannot be after end date.');
            setChartData([]);
            setLoading(false);
            return;
          }

          params.startDate = startDate;
          params.endDate = endDate;
        }

        const data = await getHistoricalRates(params);

        if (cancelled) return;

        const formattedData = data.map((item) => ({
          date: new Date(item.date).toLocaleDateString(
            'en-IN',
            {
              day: '2-digit',
              month: 'short',
              timeZone: 'UTC'
            }
          ),
          rate: Number(item.rate),
          fullDate: item.date
        }));

        setChartData(formattedData);
      } catch (err) {
        if (cancelled) return;

        setError(
          err.response?.data?.message ||
          'Unable to retrieve historical exchange rates.'
        );

        setChartData([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchRates();

    return () => {
      cancelled = true;
    };
  }, [
    currency,
    period,
    filterType,
    selectedYear,
    selectedMonth,
    startDate,
    endDate
  ]);

  const firstRate = chartData[0]?.rate ?? 0;

  const latestRate =
    chartData[chartData.length - 1]?.rate ?? 0;

  const change = latestRate - firstRate;

  const percentageChange =
    firstRate !== 0
      ? (change / firstRate) * 100
      : 0;

  const selectedCurrencyName =
    currencyNames[currency] || currency;

  return (
    <main className="dashboard">

      <section className="welcome">
        <div>
          <p className="eyebrow">CURRENCY ANALYSIS</p>

          <h1>Exchange Rate Trends</h1>

          <p className="subtitle">
            Monitor how foreign currencies move against the Indian Rupee.
          </p>
        </div>
      </section>

      <section className="rates-section trends-section">

        {/* FILTERS */}

        <div className="trends-controls">

          <div className="trend-field">

            <label htmlFor="trendCurrency">
              <Globe size={15} />
              Select currency
            </label>

            <select
              id="trendCurrency"
              value={currency}
              onChange={(event) =>
                setCurrency(event.target.value)
              }
            >
              {Object.entries(currencyNames)
                .filter(([code]) => code !== 'INR')
                .map(([code, name]) => (
                  <option key={code} value={code}>
                    {code} — {name}
                  </option>
                ))}
            </select>

          </div>

          <div className="trend-field">

            <label htmlFor="trendFilter">
              <CalendarDays size={15} />
              View period
            </label>

            <select
              id="trendFilter"
              value={filterType}
              onChange={(event) =>
                setFilterType(event.target.value)
              }
            >
              <option value="period">Period</option>
              <option value="month">Specific month</option>
              <option value="custom">Custom date range</option>
            </select>

          </div>

          {filterType === 'period' && (
            <div className="trend-field">

              <label htmlFor="trendPeriod">
                <CalendarDays size={15} />
                Select period
              </label>

              <select
                id="trendPeriod"
                value={period}
                onChange={(event) =>
                  setPeriod(event.target.value)
                }
              >
                <option value="week">Weekly view</option>
                <option value="month">Monthly view</option>
                <option value="year">Yearly view</option>
              </select>

            </div>
          )}

          {filterType === 'month' && (
            <>
              <div className="trend-field">

                <label htmlFor="trendMonth">
                  Select month
                </label>

                <select
                  id="trendMonth"
                  value={selectedMonth}
                  onChange={(event) =>
                    setSelectedMonth(Number(event.target.value))
                  }
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString(
                        'en-IN',
                        { month: 'long' }
                      )}
                    </option>
                  ))}
                </select>

              </div>

              <div className="trend-field">

                <label htmlFor="trendYear">
                  Select year
                </label>

                <select
                  id="trendYear"
                  value={selectedYear}
                  onChange={(event) =>
                    setSelectedYear(Number(event.target.value))
                  }
                >
                  {[2025, 2026].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

              </div>
            </>
          )}

          {filterType === 'custom' && (
            <>
              <div className="trend-field">

                <label htmlFor="startDate">
                  Start date
                </label>

                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    setStartDate(event.target.value)
                  }
                />

              </div>

              <div className="trend-field">

                <label htmlFor="endDate">
                  End date
                </label>

                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(event) =>
                    setEndDate(event.target.value)
                  }
                />

              </div>
            </>
          )}

        </div>

        {/* SUMMARY */}

        <div className="trend-summary">

          <div className="trend-summary-card">
            <p>Selected currency</p>

            <h2>{currency}</h2>

            <span>{selectedCurrencyName}</span>
          </div>

          <div className="trend-summary-card">
            <p>Latest rate</p>

            <h2>
              {chartData.length > 0
                ? `₹${latestRate.toFixed(4)}`
                : '—'}
            </h2>

            <span>Per 1 {currency}</span>
          </div>

          <div className="trend-summary-card">
            <p>Change in displayed period</p>

            <h2
              className={
                change >= 0
                  ? 'trend-positive'
                  : 'trend-negative'
              }
            >
              {chartData.length > 0
                ? `${change >= 0 ? '+' : ''}${change.toFixed(4)}`
                : '—'}
            </h2>

            <span>
              {chartData.length > 0
                ? `${percentageChange >= 0 ? '+' : ''}${percentageChange.toFixed(2)}%`
                : 'No data'}
            </span>
          </div>

        </div>

        {/* CHART HEADING */}

        <div className="trend-chart-heading">

          <div>
            <h2>{selectedCurrencyName} vs INR</h2>

            <p>
              {chartData.length > 0
                ? `${chartData.length} actual historical observations`
                : 'Historical exchange-rate data'}
            </p>
          </div>

          <span className="chart-unit">
            Rate in INR
          </span>

        </div>

        {/* CHART */}

        <div className="chart-container">

          {loading ? (
            <p className="trend-loading">
              Loading historical exchange rates...
            </p>
          ) : error ? (
            <p className="trend-error">
              <AlertCircle size={17} />
              {error}
            </p>
          ) : chartData.length === 0 ? (
            <p className="trend-loading">
              No historical records available for this selection.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">

              <LineChart
                data={chartData}
                margin={{
                  top: 15,
                  right: 20,
                  left: 5,
                  bottom: 5
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e8edf4"
                />

                <XAxis
                  dataKey="date"
                  tick={{
                    fill: '#718096',
                    fontSize: 12
                  }}
                  axisLine={{
                    stroke: '#d9e1ec'
                  }}
                  tickLine={false}
                  minTickGap={25}
                />

                <YAxis
                  domain={['auto', 'auto']}
                  tick={{
                    fill: '#718096',
                    fontSize: 12
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `₹${value}`}
                  width={75}
                />

                <Tooltip
                  labelFormatter={(_, payload) => {
                    const date = payload?.[0]?.payload?.fullDate;

                    return date
                      ? new Date(date).toLocaleDateString(
                          'en-IN',
                          {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            timeZone: 'UTC'
                          }
                        )
                      : '';
                  }}
                  formatter={(value) => [
                    `₹${Number(value).toFixed(4)}`,
                    currency
                  ]}
                  labelStyle={{
                    color: '#173b64'
                  }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5eaf2'
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="rate"
                  name={currency}
                  stroke="#347bb4"
                  strokeWidth={3}
                  dot={{
                    r: 3,
                    fill: '#347bb4'
                  }}
                  activeDot={{
                    r: 7
                  }}
                />

              </LineChart>

            </ResponsiveContainer>
          )}

        </div>

        <p className="disclaimer">
          Historical exchange rates are retrieved from stored
          database observations. Values represent the actual
          records returned by the exchange-rate data source.
        </p>

      </section>

    </main>
  );
}

export default Trends;
