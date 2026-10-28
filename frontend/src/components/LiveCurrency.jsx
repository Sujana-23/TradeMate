import { useState } from 'react'

function LiveCurrency(props) {
  const data = props.data;

  if(!data) {
    return <p>Failed to fetch exchange rates...</p>;
  } 

  return (
    <div>
      <h2>Live Currency Rates</h2>
      <p>Base Currency: {data.base_code}</p>

      <table>
        <thead>
          <tr>
            <th>Currency</th>
            <th>Exchange rate</th>
          </tr>
        </thead>

        <tbody>
          {Object.entries(data.rates).map(([currency,rate]) => (
            <tr key={currency}>
              <td>{currency}</td>
              <td>{rate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default LiveCurrency
