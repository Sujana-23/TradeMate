import { useState } from 'react'
import logo from '../assets/logo.webp'

function Navbar() {
  
  return (
      <nav>
        <div className='navhead'>
            <img src={logo} alt='TradeMate logo'></img>
            <div>TradeMate</div>
        </div>

        <div className='navlinks'>
            {/*dashboard */}
        </div>
      </nav>
  )
}

export default Navbar;
