
import { NavLink, useNavigate } from 'react-router-dom';

import {
  LayoutDashboard,
  ArrowLeftRight,
  History as HistoryIcon,
  TrendingUp,
  LogOut
} from 'lucide-react';

import './Navbar.css';

function Navbar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login', { replace: true });
  };

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

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          <LogOut size={17} />
          Logout
        </button>

      </nav>
    </header>
  );
}

export default Navbar;
