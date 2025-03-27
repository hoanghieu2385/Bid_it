import React from 'react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaSearch, FaPhone, FaBars, FaTimes } from 'react-icons/fa';
import logoImage from '../../assets/images/logo.png';
import '../../assets/styles/client/header.css';

const Header = () => {
    const [expanded, setExpanded] = useState(false);


    return (
        <header className="client-header">
            <nav className="navbar navbar-expand-lg">
                <div className="container-fluid">
                    {/* Logo */}
					<Link to="/" className="client-header-logo navbar-brand">
                        <div className="d-flex align-items-center">
                            <img src={logoImage} alt="Logo" className="logo-image me-1" />
                            <span className="text-primary fw-bold fs-5">Bid</span>
                            <span className="fw-bold fs-5">it</span>
                        </div>
                    </Link>

                    {/* Mobile Toggle */}
                    <button 
                        className="navbar-toggler border-0" 
                        type="button" 
                        onClick={() => setExpanded(!expanded)}
                        aria-controls="client-navbar-nav"
                        aria-expanded={expanded}
                    >
                        {expanded ? <FaTimes /> : <FaBars />}
                    </button>

                    {/* Navigation Menu and Actions */}
                    <div 
                        className={`collapse navbar-collapse ${expanded ? 'show' : ''}`} 
                        id="client-navbar-nav"
                    >
                        {/* Navigation Links */}
                        <ul className="client-header-nav navbar-nav mx-lg-auto mb-3 mb-lg-0">
                            <li className="nav-item">
                                <Link 
                                    to="/" 
                                    className="client-nav-link nav-link" 
                                    onClick={() => setExpanded(false)}
                                >
                                    Home
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link 
                                    to="/about" 
                                    className="client-nav-link nav-link" 
                                    onClick={() => setExpanded(false)}
                                >
                                    About Us
                                </Link>
                            </li>
                            <li className="nav-item dropdown d-xl-none">
                                <a 
                                    className="client-nav-link nav-link dropdown-toggle" 
                                    href="#" 
                                    id="moreDropdown" 
                                    role="button" 
                                    data-bs-toggle="dropdown" 
                                    aria-expanded="false"
                                >
                                    More
                                </a>
                                <ul className="dropdown-menu" aria-labelledby="moreDropdown">
                                    <li>
                                        <Link 
                                            to="/how-it-works" 
                                            className="dropdown-item" 
                                            onClick={() => setExpanded(false)}
                                        >
                                            How it Works
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            to="/blog" 
                                            className="dropdown-item" 
                                            onClick={() => setExpanded(false)}
                                        >
                                            Blog
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                            <li className="nav-item d-none d-xl-block">
                                <Link 
                                    to="/how-it-works" 
                                    className="client-nav-link nav-link" 
                                    onClick={() => setExpanded(false)}
                                >
                                    How it Works
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link 
                                    to="/auctions" 
                                    className="client-nav-link nav-link" 
                                    onClick={() => setExpanded(false)}
                                >
                                    Browse Auctions
                                </Link>
                            </li>
                            <li className="nav-item d-none d-xl-block">
                                <Link 
                                    to="/blog" 
                                    className="client-nav-link nav-link" 
                                    onClick={() => setExpanded(false)}
                                >
                                    Blog
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link 
                                    to="/contact" 
                                    className="client-nav-link nav-link" 
                                    onClick={() => setExpanded(false)}
                                >
                                    Contact
                                </Link>
                            </li>
                        </ul>

                        {/* User Actions */}
                        <div className="client-header-actions d-flex align-items-center gap-3">
                            {/* Search */}
                            <div className="input-group w-auto d-none d-lg-flex">
                                <span className="input-group-text bg-white border-end-0">
                                    <FaSearch className="text-muted" />
                                </span>
                                <input 
                                    type="text" 
                                    className="form-control border-start-0" 
                                    placeholder="Search" 
                                />
                            </div>

                            {/* Phone */}
                            {/* <div className="d-none d-xl-flex align-items-center text-muted">
                                <FaPhone className="me-1" />
                                <span className="small">+889 (909) 3456</span>
                            </div> */}

                            {/* Sign In/Up */}
                            <Link 
                                to="/signin" 
                                className="client-btn-login btn d-none d-sm-inline-block"
                                onClick={() => setExpanded(false)}
                            >
                                Sign In
                            </Link>
                            <Link 
                                to="/signup" 
                                className="client-btn-register btn"
                                onClick={() => setExpanded(false)}
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;