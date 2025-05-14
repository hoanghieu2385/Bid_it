import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/admin/Sidebar.css';

const Sidebar = () => {
    // State để quản lý trạng thái mở/đóng của các menu
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);
    const [isAuctionOpen, setIsAuctionOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false); // Thêm state mới cho Categories
    
    // Refs để quản lý chiều cao của các dropdown
    const paymentRef = useRef(null);
    const categoryRef = useRef(null); // Thêm ref mới cho Categories
    
    // State để quản lý hiệu ứng animation của các dropdown
    const [paymentHeight, setPaymentHeight] = useState("0px");
    const [categoryHeight, setCategoryHeight] = useState("0px"); // Thêm state mới cho chiều cao của Categories
    
    // Dùng useEffect để tính toán chiều cao thực của các dropdown
    useEffect(() => {
        if (isPaymentOpen && paymentRef.current) {
            setPaymentHeight(`${paymentRef.current.scrollHeight}px`);
        } else {
            setPaymentHeight("0px");
        }
        
        if (isCategoryOpen && categoryRef.current) {
            setCategoryHeight(`${categoryRef.current.scrollHeight}px`);
        } else {
            setCategoryHeight("0px");
        }
    }, [isDashboardOpen, isAuctionOpen, isPaymentOpen, isCategoryOpen]);
    
    // Hàm xử lý việc toggle các dropdown
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
                setIsCategoryOpen(!isCategoryOpen); // Sử dụng state mới cho Categories
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

            {/* Categories Menu - Sửa lại sử dụng state và ref riêng */}
            <li className="nav-item">
                <a 
                    className={`nav-link ${isCategoryOpen ? '' : 'collapsed'}`}
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        toggleCollapse('category');
                    }}
                    data-toggle="collapse"
                    data-target="#collapseCategory" // Đổi ID thành mới
                    aria-expanded={isCategoryOpen}
                    aria-controls="collapseCategory" // Đổi aria-controls thành mới
                >
                    <span>Categories</span>
                </a>
                <div 
                    id="collapseCategory" // Đổi ID thành mới
                    ref={categoryRef} // Sử dụng ref mới
                    className="collapse-container"
                    style={{ 
                        maxHeight: categoryHeight, // Sử dụng state mới
                        overflow: 'hidden',
                        transition: 'max-height 0.3s ease'
                    }}
                >
                    <div className="bg-white py-2 collapse-inner rounded">
                        <Link 
                            className={`collapse-item ${isCategoryOpen ? 'animate-item' : ''}`} 
                            to="/admin/categories-list" // Thay đổi đường dẫn cho phù hợp
                            style={{ 
                                transitionDelay: '0.1s',
                                opacity: isCategoryOpen ? 1 : 0,
                                transform: isCategoryOpen ? 'translateY(0)' : 'translateY(-10px)',
                                transition: 'opacity 0.3s ease, transform 0.3s ease'
                            }}
                        >
                            List
                        </Link>
                        <Link 
                            className={`collapse-item ${isCategoryOpen ? 'animate-item' : ''}`} 
                            to="/admin/categories-delete" // Thay đổi đường dẫn cho phù hợp
                            style={{ 
                                transitionDelay: '0.2s',
                                opacity: isCategoryOpen ? 1 : 0,
                                transform: isCategoryOpen ? 'translateY(0)' : 'translateY(-10px)',
                                transition: 'opacity 0.3s ease, transform 0.3s ease'
                            }}
                        >
                            Delete
                        </Link>
                    </div>
                </div>
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
        </ul>
    );
};

export default Sidebar;