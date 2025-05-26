import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";
import "../../assets/styles/admin/User.css";
import { getAllUsers } from "../../services/admin-user-api";
import { FaSearch, FaEye, FaCheckCircle } from "react-icons/fa";

const User = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [verifyFilter, setVerifyFilter] = useState("All Verify Status");
  const [statusFilter, setStatusFilter] = useState("All Lock Status");
  const [sortBy, setSortBy] = useState("Newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Function để tạo tên đầy đủ từ firstName và lastName
  const getFullName = (user) => {
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else {
      return "Unknown User";
    }
  };

  useEffect(() => {
    fetchUsers();
    
    if (location.state?.message) {
      setSuccess(location.state.message);
      setTimeout(() => {
        setSuccess(null);
        navigate(location.pathname, { replace: true });
      }, 3000);
    }
  }, [location, navigate]);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, verifyFilter, statusFilter, sortBy]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      
      // Debug: Kiểm tra dữ liệu trả về
      console.log("API Response:", data);
      if (data.length > 0) {
        console.log("First user:", data[0]);
        console.log("Available fields:", Object.keys(data[0]));
      }
      
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Không thể tải danh sách người dùng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let result = [...users];

    // Search by firstName, lastName, email or phone
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phoneNumber?.includes(searchTerm)
      );
    }

    // Filter by verification status
    if (verifyFilter !== "All Verify Status") {
      const isVerified = verifyFilter === "Verified";
      result = result.filter((user) => user.verified === isVerified);
    }

    // Filter by lock status
    if (statusFilter !== "All Lock Status") {
      const isLocked = statusFilter === "Locked";
      result = result.filter((user) => user.locked === isLocked);
    }

    // Sort users
    switch (sortBy) {
      case "Newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "Oldest":
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default:
        break;
    }

    setFilteredUsers(result);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewUser = (userId) => {
    console.log("Navigating to user ID:", userId);
    
    if (!userId) {
      console.error("User ID is missing");
      return;
    }
    
    if (userId === undefined || userId === null) {
      console.error("Invalid user ID");
      return;
    }
    
    navigate(`/admin/user/${userId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "22 Jul, 2024 - 17:48";
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()} - ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const formatMoney = (amount) => {
    if (!amount) return "₫ 0";
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('₫', '₫ ');
  };

  const getUserVerificationStatus = (verified) => {
    return verified ? "Verified" : "Unverified";
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "#10B981"; // Green
    if (score >= 50) return "#F59E0B"; // Orange
    return "#EF4444"; // Red
  };

  // Pagination logic
  const indexOfLastUser = currentPage * rowsPerPage;
  const indexOfFirstUser = indexOfLastUser - rowsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  return (
    <div id="wrapper">
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column" style={{ flex: 1 }}>
        <div id="content">
          <Topbar />
          
          <div className="container-fluid user-management-container">
            
            {success && (
              <div className="alert alert-success" style={{ 
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#d4edda',
                color: '#155724',
                border: '1px solid #c3e6cb',
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FaCheckCircle /> {success}
              </div>
            )}

            <div className="filters-container">
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search user"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              
              <div className="filters-right">
                <button
                  className="refresh-btn"
                  onClick={handleRefresh}
                  title="Refresh data"
                  style={{
                    padding: '8px 15px',
                    backgroundColor: '#4e73df',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginRight: '10px'
                  }}
                >
                  ⟳ Refresh
                </button>
                
                <select
                  className="filter-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="Newest">Newest</option>
                  <option value="Oldest">Oldest</option>
                </select>
                
                <select
                  className="filter-select"
                  value={verifyFilter}
                  onChange={(e) => {
                    setVerifyFilter(e.target.value);
                  }}
                >
                  <option value="All Verify Status">All Verify Status</option>
                  <option value="Verified">Verified</option>
                  <option value="Unverified">Unverified</option>
                </select>
                
                <select
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                  }}
                >
                  <option value="All Lock Status">All Lock Status</option>
                  <option value="Active">Active</option>
                  <option value="Locked">Locked</option>
                </select>
              </div>
            </div>

            <div className="table-card">
              {loading ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : error ? (
                <div className="error-container">
                  <p>{error}</p>
                  <button 
                    className="btn-retry"
                    onClick={handleRefresh}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#4e73df',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      marginTop: '10px'
                    }}
                  >
                    Thử lại
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>USER</th>
                        <th>PHONE NUMBER</th>
                        <th>LISTED AUCTIONS</th>
                        <th>BID HISTORY</th>
                        <th>SCORE</th>
                        <th>JOINED DATE</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="no-data">
                            Không tìm thấy người dùng nào
                          </td>
                        </tr>
                      ) : (
                        currentUsers.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <div className="user-info">
                                <div className="user-avatar">
                                  {user.avatar ? (
                                    <img
                                      src={user.avatar}
                                      alt={getFullName(user)}
                                      className="avatar-img"
                                    />
                                  ) : (
                                    <div className="avatar-placeholder">
                                      {user.firstName?.charAt(0).toUpperCase() || 
                                       user.lastName?.charAt(0).toUpperCase() || 
                                       'U'}
                                    </div>
                                  )}
                                </div>
                                <div className="user-details">
                                  <div className="user-name">{getFullName(user)}</div>
                                  <div className="user-email">{user.email || "No email"}</div>
                                  <div className="user-status">
                                    <span className={`status-badge ${user.verified ? 'verified' : 'unverified'}`}>
                                      {getUserVerificationStatus(user.verified)}
                                    </span>
                                    {user.locked && (
                                      <span className="status-badge locked">
                                        Locked
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="phone-number">
                              {user.phoneNumber || "No phone number"}
                            </td>
                            <td>
                              <div className="auctions-info">
                                <div className="auctions-count">
                                  <strong>{user.totalAuctions || 0} auctions listed</strong>
                                </div>
                                <div className="earnings">
                                  Earned: <span className="earnings-amount">{formatMoney(user.auctionEarnings)}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="bid-history">
                                <div className="bid-stats">
                                  <strong>{user.totalBids || 0} bids / {user.bidsWon || 0} won</strong>
                                </div>
                                <div className="total-paid">
                                  Total Paid: <span className="paid-amount">{formatMoney(user.totalPaid)}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="score-badge" style={{ color: getScoreColor(user.points) }}>
                                <strong>{user.points || 0} / 100 points</strong>
                              </div>
                            </td>
                            <td className="joined-date">
                              {formatDate(user.createdAt)}
                            </td>
                            <td>
                              <button 
                                className="action-btn view-btn"
                                onClick={() => {
                                  console.log("User object:", user);
                                  handleViewUser(user.id);
                                }}
                                title="Xem chi tiết"
                              >
                                <FaEye /> View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              
              {filteredUsers.length > 0 && (
                <div className="pagination-container">
                  <div className="rows-per-page">
                    <span>Hiển thị:</span>
                    <select 
                      className="rows-select"
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span>
                      / {filteredUsers.length} người dùng
                    </span>
                  </div>
                  
                  <div className="pagination">
                    <button 
                      className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`} 
                      onClick={prevPage}
                      disabled={currentPage === 1}
                    >
                      ‹
                    </button>
                    
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = index + 1;
                      } else if (currentPage <= 3) {
                        pageNum = index + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + index;
                      } else {
                        pageNum = currentPage - 2 + index;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                          onClick={() => paginate(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button 
                      className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`} 
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;