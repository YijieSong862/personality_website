import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css'; // 确保只引入 Navbar 的样式

const Navbar = ({ username }) => {
  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">
          <img src="/logo.png" alt="Logo" />
        </Link>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/forum">论坛</Link>
        </li>
        <li>
          <Link to="/test">测试</Link>
        </li>
        <li className="user-info">
          <img src="/user-icon.png" alt="User" className="user-icon" />
          <span>{username}</span>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;