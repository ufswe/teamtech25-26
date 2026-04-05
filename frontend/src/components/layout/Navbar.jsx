import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link to="/home" className={`nav-item ${location.pathname === "/home" ? "active" : ""}`}>Home</Link>
      <Link to="/flight" className={`nav-item ${location.pathname === "/flight" ? "active" : ""}`}>Flight</Link>
      <Link to="/flight-history" className={`nav-item ${location.pathname === "/flight-history" ? "active" : ""}`}>Flight History</Link>
      <Link to="/about" className={`nav-item ${location.pathname === "/about" ? "active" : ""}`}>About</Link>
    </nav>
  );
}
