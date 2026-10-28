import { useState } from 'react'

function CurrencyConverter(props) {
  const data = props.data;

  if (!data?.rates) {
    return <p>Loading exchange rates...</p>;
  }

  const [amount, setAmount] = useState(1);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('INR');

  const fromRate = data?.rates?.[from];
  const toRate = data?.rates?.[to];

  const convertedAmount =
  fromRate && toRate
    ? (Number(amount) / fromRate) * toRate
    : 0;

  return (
    <div>
      <h2>Currency Converter</h2>

      <label >Amount:</label> 
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <br />
      <br />

      <label >From:</label>
      <select
        value={from}
        onChange={(e) => setFrom(e.target.value)}
      >
        <option value="USD">USD</option>
        <option value="INR">INR</option>
        <option value="EUR">EUR</option>
        <option value="GBP">GBP</option>
      </select>

      <br />
      <br />


      <label >To:</label>
      <select
        value={to}
        onChange={(e) => setTo(e.target.value)}
      >
        <option value="USD">USD</option>
        <option value="INR">INR</option>
        <option value="EUR">EUR</option>
        <option value="GBP">GBP</option>
      </select>

      <h3>
        Converted Amount: {Number(amount) >= 0
          ? convertedAmount.toFixed(2)
          : 'Enter a valid amount'} {to}
      </h3>

    </div>
  )
}

export default CurrencyConverter
