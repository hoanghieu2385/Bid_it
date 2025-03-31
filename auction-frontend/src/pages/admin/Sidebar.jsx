import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/admin/Sidebar.css';

const Sidebar = () => {
    // State để quản lý trạng thái mở/đóng của các menu
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);
    const [isAuctionOpen, setIsAuctionOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    
    // Refs để quản lý chiều cao của các dropdown
    const dashboardRef = useRef(null);
    const auctionRef = useRef(null);
    const paymentRef = useRef(null);
    
    // State để quản lý hiệu ứng animation của các dropdown
    const [dashboardHeight, setDashboardHeight] = useState("0px");
    const [auctionHeight, setAuctionHeight] = useState("0px");
    const [paymentHeight, setPaymentHeight] = useState("0px");
    
    // Dùng useEffect để tính toán chiều cao thực của các dropdown
    useEffect(() => {
        if (isDashboardOpen) {
            setDashboardHeight(`${dashboardRef.current.scrollHeight}px`);
        } else {
            setDashboardHeight("0px");
        }
        
        if (isAuctionOpen) {
            setAuctionHeight(`${auctionRef.current.scrollHeight}px`);
        } else {
            setAuctionHeight("0px");
        }
        
        if (isPaymentOpen) {
            setPaymentHeight(`${paymentRef.current.scrollHeight}px`);
        } else {
            setPaymentHeight("0px");
        }
    }, [isDashboardOpen, isAuctionOpen, isPaymentOpen]);
    
    // Hàm xử lý việc toggle các dropdown
    const toggleCollapse = (section) => {
        switch (section) {
            case 'dashboard':
                setIsDashboardOpen(!isDashboardOpen);
                if (isAuctionOpen) setIsAuctionOpen(false);
                if (isPaymentOpen) setIsPaymentOpen(false);
                break;
            case 'auction':
                setIsAuctionOpen(!isAuctionOpen);
                if (isDashboardOpen) setIsDashboardOpen(false);
                if (isPaymentOpen) setIsPaymentOpen(false);
                break;
            case 'payment':
                setIsPaymentOpen(!isPaymentOpen); // Fixed: was isPaymentOpen
                if (isDashboardOpen) setIsDashboardOpen(false);
                if (isAuctionOpen) setIsAuctionOpen(false);
                break;
            default:
                break;
        }
    };

    return (
        <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
            <Link className="sidebar-brand d-flex align-items-center justify-content-center" to="/">
                <div className="sidebar-brand-icon">
                    <img src="" alt="Logo" />
                </div>
                <div className="sidebar-brand-text mx-3">Bit it Admin</div>
            </Link>
            <hr className="sidebar-divider my-0" />
            
            {/* Dashboard Menu */}
            <li className="nav-item">
                <a 
                    className={`nav-link ${isDashboardOpen ? '' : 'collapsed'}`}
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        toggleCollapse('dashboard');
                    }}
                    data-toggle="collapse"
                    data-target="#collapseDashboard"
                    aria-expanded={isDashboardOpen}
                    aria-controls="collapseDashboard"
                >
                    <span>Dashboard</span>
                </a>
                <div 
                    id="collapseDashboard" 
                    ref={dashboardRef}
                    className="collapse-container"
                    style={{ 
                        maxHeight: dashboardHeight,
                        overflow: 'hidden',
                        transition: 'max-height 0.3s ease'
                    }}
                >
                    <div className="bg-white py-2 collapse-inner rounded">
                        <Link 
                            className={`collapse-item ${isDashboardOpen ? 'animate-item' : ''}`} 
                            to="/dashboard/overview"
                            style={{ 
                                transitionDelay: '0.1s',
                                opacity: isDashboardOpen ? 1 : 0,
                                transform: isDashboardOpen ? 'translateY(0)' : 'translateY(-10px)',
                                transition: 'opacity 0.3s ease, transform 0.3s ease'
                            }}
                        >
                            Overview
                        </Link>
                        <Link 
                            className={`collapse-item ${isDashboardOpen ? 'animate-item' : ''}`} 
                            to="/dashboard/analytics"
                            style={{ 
                                transitionDelay: '0.2s',
                                opacity: isDashboardOpen ? 1 : 0,
                                transform: isDashboardOpen ? 'translateY(0)' : 'translateY(-10px)',
                                transition: 'opacity 0.3s ease, transform 0.3s ease'
                            }}
                        >
                            Analytics 
                        </Link>
                        <Link 
                            className={`collapse-item ${isDashboardOpen ? 'animate-item' : ''}`} 
                            to="/dashboard/reports"
                            style={{ 
                                transitionDelay: '0.3s',
                                opacity: isDashboardOpen ? 1 : 0,
                                transform: isDashboardOpen ? 'translateY(0)' : 'translateY(-10px)',
                                transition: 'opacity 0.3s ease, transform 0.3s ease'
                            }}
                        >
                            Reports
                        </Link>
                    </div>
                </div>
            </li>
            
            {/* Auctions Menu */}
            <li className="nav-item">
                <a 
                    className={`nav-link ${isAuctionOpen ? '' : 'collapsed'}`}
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        toggleCollapse('auction');
                    }}
                    data-toggle="collapse"
                    data-target="#collapseAuction"
                    aria-expanded={isAuctionOpen}
                    aria-controls="collapseAuction"
                >
                    <span>Auctions</span>
                </a>
                <div 
                    id="collapseAuction" 
                    ref={auctionRef}
                    className="collapse-container"
                    style={{ 
                        maxHeight: auctionHeight,
                        overflow: 'hidden',
                        transition: 'max-height 0.3s ease'
                    }}
                >
                    <div className="bg-white py-2 collapse-inner rounded">
                        <Link 
                            className={`collapse-item ${isAuctionOpen ? 'animate-item' : ''}`} 
                            to="/auctions/active"
                            style={{ 
                                transitionDelay: '0.1s',
                                opacity: isAuctionOpen ? 1 : 0,
                                transform: isAuctionOpen ? 'translateY(0)' : 'translateY(-10px)',
                                transition: 'opacity 0.3s ease, transform 0.3s ease'
                            }}
                        >
                            Active Auctions
                        </Link>
                        <Link 
                            className={`collapse-item ${isAuctionOpen ? 'animate-item' : ''}`} 
                            to="/auctions/reports"
                            style={{ 
                                transitionDelay: '0.2s',
                                opacity: isAuctionOpen ? 1 : 0,
                                transform: isAuctionOpen ? 'translateY(0)' : 'translateY(-10px)',
                                transition: 'opacity 0.3s ease, transform 0.3s ease'
                            }}
                        >
                            Auction Reports
                        </Link>
                        <Link 
                            className={`collapse-item ${isAuctionOpen ? 'animate-item' : ''}`} 
                            to="/auctions/disputes"
                            style={{ 
                                transitionDelay: '0.3s',
                                opacity: isAuctionOpen ? 1 : 0,
                                transform: isAuctionOpen ? 'translateY(0)' : 'translateY(-10px)',
                                transition: 'opacity 0.3s ease, transform 0.3s ease'
                            }}
                        >
                            Disputes
                        </Link>
                    </div>
                </div>
            </li>
            
            {/* Payments Menu */}
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

            <li className="nav-item">
                <Link className="nav-link" to="/users">
                    <span>Users</span>
                </Link>
            </li>

            <li className="nav-item">
                <Link className="nav-link" to="/categories">
                    <span>Categories</span>
                </Link>
            </li>

            <hr className="sidebar-divider d-none d-md-block" />
        </ul>
    );
};

export default Sidebar;