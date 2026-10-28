import { useState } from 'react'
import Navbar from '../components/Navbar'
import LiveCurrency from '../components/LiveCurrency'
import CurrencyConverter from '../components/CurrencyConverter'

function Dashboard(props) {
  
  return (
    <>
      <Navbar />
      <LiveCurrency data={props.data} />
      <CurrencyConverter data={props.data}/>
    </>
  )
}

export default Dashboard