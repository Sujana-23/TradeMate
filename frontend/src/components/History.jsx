
import { useState } from 'react';
import { Search, Download, CalendarDays, History as HistoryIcon } from 'lucide-react';
import './History.css'


const sampleHistory = [
  { date: '2026-10-28', currency: 'USD', country: 'United States', rate: 83.00 },
  { date: '2026-10-27', currency: 'USD', country: 'United States', rate: 82.85 },
  { date: '2026-10-26', currency: 'USD', country: 'United States', rate: 82.70 },
  { date: '2026-10-28', currency: 'EUR', country: 'Eurozone', rate: 90.00 },
  { date: '2026-10-27', currency: 'EUR', country: 'Eurozone', rate: 89.80 },
  { date: '2026-10-26', currency: 'EUR', country: 'Eurozone', rate: 89.95 },
  { date: '2026-10-28', currency: 'GBP', country: 'United Kingdom', rate: 105.00 },
  { date: '2026-10-27', currency: 'GBP', country: 'United Kingdom', rate: 104.75 },
  { date: '2026-10-28', currency: 'AED', country: 'United Arab Emirates', rate: 22.60 },
  { date: '2026-10-27', currency: 'AED', country: 'United Arab Emirates', rate: 22.55 },
  { date: '2026-10-28', currency: 'JPY', country: 'Japan', rate: 0.56 },
  { date: '2026-10-27', currency: 'JPY', country: 'Japan', rate: 0.557 }
];

function History() {
  const [selectedCurrency, setSelectedCurrency] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = sampleHistory.filter((item) => {
    const matchesCurrency =
      selectedCurrency === 'ALL' || item.currency === selectedCurrency;

    const matchesStart = !startDate || item.date >= startDate;
    const matchesEnd = !endDate || item.date <= endDate;

    const matchesSearch =
      item.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.country.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCurrency && matchesStart && matchesEnd && matchesSearch;
  });

  function exportCSV() {
    const header = ['Date', 'Currency', 'Country', 'Rate in INR'];

    const rows = filteredHistory.map((item) => [
      item.date,
      item.currency,
      item.country,
      item.rate.toFixed(4)
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'trademate-rate-history.csv';
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="dashboard">
      <section className="welcome">
        <div>
          <p className="eyebrow">PAST EXCHANGE RATES</p>
          <h1>Exchange Rate History</h1>
          <p className="subtitle">
            Review historical exchange rates against Indian Rupees.
          </p>
        </div>

        <div className="updated-badge">
          <HistoryIcon size={17} />
          <span>{filteredHistory.length} records</span>
        </div>
      </section>

      <section className="rates-section">
        <div className="section-heading">
          <div>
            <h2>Historical Records</h2>
            <p>Filter and export your exchange rate records.</p>
          </div>

          <button className="refresh-button" onClick={exportCSV}>
            <Download size={16} />
            Export CSV
          </button>
        </div>

        <div className="history-filters">
          <div className="history-field">
            <label htmlFor="historyCurrency">Currency</label>
            <select
              id="historyCurrency"
              value={selectedCurrency}
              onChange={(event) => setSelectedCurrency(event.target.value)}
            >
              <option value="ALL">All currencies</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="AED">AED — UAE Dirham</option>
              <option value="JPY">JPY — Japanese Yen</option>
            </select>
          </div>

          <div className="history-field">
            <label htmlFor="startDate">
              <CalendarDays size={14} /> From date
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>

          <div className="history-field">
            <label htmlFor="endDate">
              <CalendarDays size={14} /> To date
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>

          <div className="history-field">
            <label htmlFor="historySearch">
              <Search size={14} /> Search
            </label>
            <input
              id="historySearch"
              type="text"
              placeholder="Currency or country"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Currency</th>
                <th>Country / Region</th>
                <th>Rate in INR</th>
              </tr>
            </thead>

            <tbody>
              {filteredHistory.map((item, index) => (
                <tr key={`${item.date}-${item.currency}-${index}`}>
                  <td>{item.date}</td>
                  <td><strong>{item.currency}</strong></td>
                  <td>{item.country}</td>
                  <td>₹{item.rate.toFixed(4)}</td>
                </tr>
              ))}

              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan="4" className="empty-history">
                    No records match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="disclaimer">
          Demonstration records only. Data is not stored permanently yet.
          SQL Server integration will be added later.
        </p>
      </section>
    </main>
  );
}

export default History;
