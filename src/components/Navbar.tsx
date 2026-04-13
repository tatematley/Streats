import { NavLink } from 'react-router-dom';
import SearchBar from './SearchBar';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        <div className="navbar-logo-wrap">
          <img src="/StreatsLogo.png" alt="Streats" className="navbar-logo" />
        </div>
      </NavLink>
      <div className="navbar-center">
        <SearchBar />
      </div>
      <div className="navbar-links">
        <NavLink to="/map" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          Map
        </NavLink>
        <NavLink to="/favorites" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          Favorites
        </NavLink>
      </div>
    </nav>
  );
}
