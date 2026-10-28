import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'


function App() {

  const [data, setData] = useState(null);

  useEffect( () => {
    async function loadRates() {
      try{
        const response = await fetch("http://localhost:5134/api/exchangerates");

        const apiData = await response.json();
        setData(apiData);

      } catch {
        console.error("Failed to fetch exchange rates");
      }

    }

    loadRates();
  }, [])
  
  return (
    <>
    <Dashboard data={data} />      
    </>
  )
}

export default App
