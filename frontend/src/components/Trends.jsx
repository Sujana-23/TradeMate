
import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { TrendingUp, CalendarDays, Globe } from 'lucide-react';
import './Trends.css'

const trendData = {
  USD: {
    name: 'US Dollar',
    data: [
      { date: '01 Oct', rate: 82.70 },
      { date: '05 Oct', rate: 82.85 },
      { date: '09 Oct', rate: 82.60 },
      { date: '13 Oct', rate: 82.95 },
      { date: '17 Oct', rate: 83.10 },
      { date: '21 Oct', rate: 82.90 },
      { date: '25 Oct', rate: 83.20 },
      { date: '28 Oct', rate: 83.00 }
    ]
  },
  EUR: {
    name: 'Euro',
    data: [
      { date: '01 Oct', rate: 89.20 },
      { date: '05 Oct', rate: 89.50 },
      { date: '09 Oct', rate: 89.30 },
      { date: '13 Oct', rate: 89.80 },
      { date: '17 Oct', rate: 90.10 },
      { date: '21 Oct', rate: 89.75 },
      { date: '25 Oct', rate: 90.20 },
      { date: '28 Oct', rate: 90.00 }
    ]
  },
  GBP: {
    name: 'British Pound',
    data: [
      { date: '01 Oct', rate: 104.20 },
      { date: '05 Oct', rate: 104.60 },
      { date: '09 Oct', rate: 104.40 },
      { date: '13 Oct', rate: 104.90 },
      { date: '17 Oct', rate: 105.20 },
      { date: '21 Oct', rate: 104.80 },
      { date: '25 Oct', rate: 105.30 },
      { date: '28 Oct', rate: 105.00 }
    ]
  },
  AED: {
    name: 'UAE Dirham',
    data: [
      { date: '01 Oct', rate: 22.50 },
      { date: '05 Oct', rate: 22.52 },
      { date: '09 Oct', rate: 22.55 },
      { date: '13 Oct', rate: 22.54 },
      { date: '17 Oct', rate: 22.58 },
      { date: '21 Oct', rate: 22.57 },
      { date: '25 Oct', rate: 22.62 },
      { date: '28 Oct', rate: 22.60 }
    ]
  },
  JPY: {
    name: 'Japanese Yen',
    data: [
      { date: '01 Oct', rate: 0.550 },
      { date: '05 Oct', rate: 0.553 },
      { date: '09 Oct', rate: 0.551 },
      { date: '13 Oct', rate: 0.556 },
      { date: '17 Oct', rate: 0.558 },
      { date: '21 Oct', rate: 0.555 },
      { date: '25 Oct', rate: 0.561 },
      { date: '28 Oct', rate: 0.560 }
    ]
  }
};

function Trends() {
  const [currency, setCurrency] = useState('USD');
  const [period, setPeriod] = useState('monthly');

  const selectedTrend = trendData[currency];
  const chartData = selectedTrend.data;

  const firstRate = chartData[0].rate;
  const latestRate = chartData[chartData.length - 1].rate;
  const change = latestRate - firstRate;
  const percentageChange = (change / firstRate) * 100;

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
        <div className="trends-controls">
          <div className="trend-field">
            <label htmlFor="trendCurrency">
              <Globe size={15} /> Select currency
            </label>

            <select
              id="trendCurrency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {Object.entries(trendData).map(([code, item]) => (
                <option key={code} value={code}>
                  {code} — {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="trend-field">
            <label htmlFor="trendPeriod">
              <CalendarDays size={15} /> View period
            </label>

            <select
              id="trendPeriod"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
            >
              <option value="monthly">Monthly view</option>
              <option value="yearly">Yearly view</option>
            </select>
          </div>
        </div>

        <div className="trend-summary">
          <div className="trend-summary-card">
            <p>Selected currency</p>
            <h2>{currency}</h2>
            <span>{selectedTrend.name}</span>
          </div>

          <div className="trend-summary-card">
            <p>Latest sample rate</p>
            <h2>₹{latestRate.toFixed(4)}</h2>
            <span>Per 1 {currency}</span>
          </div>

          <div className="trend-summary-card">
            <p>Change in displayed period</p>
            <h2 className={change >= 0 ? 'trend-positive' : 'trend-negative'}>
              {change >= 0 ? '+' : ''}{change.toFixed(4)}
            </h2>
            <span>
              {percentageChange >= 0 ? '+' : ''}
              {percentageChange.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="trend-chart-heading">
          <div>
            <h2>{selectedTrend.name} vs INR</h2>
            <p>
              {period === 'monthly'
                ? 'Illustrative observations for October 2026'
                : 'Illustrative observations from a single month; yearly data will be added later'}
            </p>
          </div>

          <span className="chart-unit">Rate in INR</span>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 15, right: 20, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e8edf4" />

              <XAxis
                dataKey="date"
                tick={{ fill: '#718096', fontSize: 12 }}
                axisLine={{ stroke: '#d9e1ec' }}
                tickLine={false}
              />

              <YAxis
                domain={['auto', 'auto']}
                tick={{ fill: '#718096', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `₹${value}`}
                width={75}
              />

              <Tooltip
                formatter={(value) => [
                  `₹${Number(value).toFixed(4)}`,
                  'Rate'
                ]}
                labelStyle={{ color: '#173b64' }}
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
                dot={{ r: 4, fill: '#347bb4' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="disclaimer">
          This graph uses illustrative sample data, not actual historical
          exchange rates. The period selector is a placeholder for now;
          yearly data requires historical records from an API or SQL Server.
        </p>
      </section>
    </main>
  );
}

export default Trends;
