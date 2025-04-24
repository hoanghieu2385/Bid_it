import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/admin/Sidebar.css';

const Sidebar = () => {
    // State để quản lý trạng thái mở/đóng của các menu
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);
    const [isAuctionOpen, setIsAuctionOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    
    // Refs để quản lý chiều cao của các dropdown
    const paymentRef = useRef(null);
    
    // State để quản lý hiệu ứng animation của các dropdown
    const [paymentHeight, setPaymentHeight] = useState("0px");
    
    // Dùng useEffect để tính toán chiều cao thực của các dropdown
    useEffect(() => {
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
                <Link className="nav-link" to="/admin/dashboard">
                    <span>Dashboard</span>
                </Link>
            </li>

            <hr className="sidebar-divider d-none d-md-block" />
            
            {/* Auctions Menu */}
            <li className="nav-item">
                <Link className="nav-link" to="/admin/auctions">
                    <span>Auctions</span>
                </Link>
            </li>

            <hr className="sidebar-divider d-none d-md-block" />
            
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

            <hr className="sidebar-divider d-none d-md-block" />

            <li className="nav-item">
                <Link className="nav-link" to="/users">
                    <span>Users</span>
                </Link>
            </li>

            <hr className="sidebar-divider d-none d-md-block" />

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