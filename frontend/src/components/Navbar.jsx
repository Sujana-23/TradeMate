
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  History as HistoryIcon,
  TrendingUp
} from 'lucide-react';
import './Navbar.css'

function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/" end className="brand">
        <span className="brand-icon">T</span>
        <span>TradeMate</span>
      </NavLink>

      <nav className="nav-links">
        <NavLink to="/" end>
          <LayoutDashboard size={17} />
          Dashboard
        </NavLink>

        <NavLink to="/converter">
          <ArrowLeftRight size={17} />
          Converter
        </NavLink>

        <NavLink to="/history">
          <HistoryIcon size={17} />
          History
        </NavLink>

        <NavLink to="/trends">
          <TrendingUp size={17} />
          Trends
        </NavLink>
      </nav>
    </header>
  );
}

export default Navbar;
