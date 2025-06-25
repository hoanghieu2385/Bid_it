// src/components/admin/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/admin/Sidebar.css';
import Logo from '../../assets/images/Logo2.png';

const Sidebar = () => {

    return (
        <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
            <Link className="sidebar-brand d-flex align-items-center justify-content-center" to="/">
                <div className="sidebar-brand-icon">
                    <img src={Logo} alt="Logo" />
                </div>
                <div className="sidebar-brand-text mx-3">Bid it Admin</div>
            </Link>
            <hr className="sidebar-divider my-0" />

            {/* Dashboard */}
            <li className="nav-item">
                <Link className="nav-link" to="/admin/dashboard">
                    <span>Dashboard</span>
                </Link>
            </li>

            <hr className="sidebar-divider d-none d-md-block" />

            {/* Auctions */}
            <li className="nav-item">
                <Link className="nav-link" to="/admin/auctions">
                    <span>Auctions</span>
                </Link>
            </li>

            <hr className="sidebar-divider d-none d-md-block" />

            {/* Categories */}
            <li className="nav-item">
                <Link className="nav-link" to="/admin/categories">
                    <span>Categories</span>
                </Link>
            </li>

            <hr className="sidebar-divider d-none d-md-block" />

            {/* Payments */}
            <li className="nav-item">
                <Link className="nav-link" to="/admin/payment">
                    <span>Payment</span>
                </Link>
            </li>

            <hr className="sidebar-divider d-none d-md-block" />

            {/* Users */}
            <li className="nav-item">
                <Link className="nav-link" to="/admin/users">
                    <span>Users</span>
                </Link>
            </li>
            
            <hr className="sidebar-divider d-none d-md-block" />

            {/* ✅ Verify Requests */}
            <li className="nav-item">
                <Link className="nav-link" to="/admin/verify-requests">
                    <span>Verify Requests</span>
                </Link>
            </li>

            <hr className="sidebar-divider d-none d-md-block" />

            {/* Security */}
            <li className="nav-item">
                <Link className="nav-link" to="/admin/security">
                    <span>Security</span>
                </Link>
            </li>

            <hr className="sidebar-divider d-none d-md-block" />
        </ul>
    );
};

export default Sidebar;
