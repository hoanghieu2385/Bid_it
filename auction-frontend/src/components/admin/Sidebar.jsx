// src/components/admin/Sidebar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/admin/Sidebar.css';
import Logo from '../../assets/images/Logo2.png';

const Sidebar = () => {
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);
    const [isAuctionOpen, setIsAuctionOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    const paymentRef = useRef(null);
    const [paymentHeight, setPaymentHeight] = useState("0px");

    useEffect(() => {
        if (isPaymentOpen && paymentRef.current) {
            setPaymentHeight(`${paymentRef.current.scrollHeight}px`);
        } else {
            setPaymentHeight("0px");
        }
    }, [isDashboardOpen, isAuctionOpen, isPaymentOpen, isCategoryOpen]);

    const toggleCollapse = (section) => {
        switch (section) {
            case 'dashboard':
                setIsDashboardOpen(!isDashboardOpen);
                break;
            case 'auction':
                setIsAuctionOpen(!isAuctionOpen);
                break;
            case 'payment':
                setIsPaymentOpen(!isPaymentOpen);
                break;
            case 'category':
                setIsCategoryOpen(!isCategoryOpen);
                break;
            default:
                break;
        }
    };

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
                <a
                    className={`nav-link ${isPaymentOpen ? '' : 'collapsed'}`}
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        toggleCollapse('payment');
                    }}
                    data-toggle="collapse"
                    data-target="#collapsePayment"
                    aria-expanded={isPaymentOpen}
                    aria-controls="collapsePayment"
                >
                    <span>Payments</span>
                </a>
                <div
                    id="collapsePayment"
                    ref={paymentRef}
                    className="collapse-container"
                    style={{
                        maxHeight: paymentHeight,
                        overflow: 'hidden',
                        transition: 'max-height 0.3s ease'
                    }}
                >
                    <div className="bg-white py-2 collapse-inner rounded">
                        <Link
                            className={`collapse-item ${isPaymentOpen ? 'animate-item' : ''}`}
                            to="/payments/deposits"
                            style={{
                                transitionDelay: '0.1s',
                                opacity: isPaymentOpen ? 1 : 0,
                                transform: isPaymentOpen ? 'translateY(0)' : 'translateY(-10px)',
                                transition: 'opacity 0.3s ease, transform 0.3s ease'
                            }}
                        >
                            Deposits
                        </Link>
                        <Link
                            className={`collapse-item ${isPaymentOpen ? 'animate-item' : ''}`}
                            to="/payments/winners"
                            style={{
                                transitionDelay: '0.2s',
                                opacity: isPaymentOpen ? 1 : 0,
                                transform: isPaymentOpen ? 'translateY(0)' : 'translateY(-10px)',
                                transition: 'opacity 0.3s ease, transform 0.3s ease'
                            }}
                        >
                            Winner Payments
                        </Link>
                        <Link
                            className={`collapse-item ${isPaymentOpen ? 'animate-item' : ''}`}
                            to="/payments/seller-revenue"
                            style={{
                                transitionDelay: '0.3s',
                                opacity: isPaymentOpen ? 1 : 0,
                                transform: isPaymentOpen ? 'translateY(0)' : 'translateY(-10px)',
                                transition: 'opacity 0.3s ease, transform 0.3s ease'
                            }}
                        >
                            Seller Revenue
                        </Link>
                    </div>
                </div>
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
