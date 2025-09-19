import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // We will create this file next

function Navbar() {
  return (
    <nav className="navbar">
      <ul className="nav-list">
        <li className="nav-item">
          <Link to="/" className="nav-link">Home</Link>
        </li>
        <li className="nav-item">
          <Link to="/scoring-results" className="nav-link">Scoring Results</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
