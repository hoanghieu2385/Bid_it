import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../assets/styles/admin/Auctions.css";
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";
import { Search, ChevronDown, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import adminAuctionAPI from "../../services/admin-auction-api";

const Auctions = () => {
  // State cho dữ liệu đấu giá
  const [auctions, setAuctions] = useState([]);
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCategory, setCurrentCategory] = useState("All Categories");
  const [currentStatus, setCurrentStatus] = useState("All Statuses");
  const [sortOrder, setSortOrder] = useState("Newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // State cho các thẻ thống kê
  const [stats, setStats] = useState({
    all: 0,
    active: 0,
    draft: 0,
    delivered: 0,
    pending: 0,
    completed: 0
  });

  // State để theo dõi ảnh lỗi - tránh load lại nhiều lần
  const [failedImages, setFailedImages] = useState(new Set());

  // Load dữ liệu ban đầu
  useEffect(() => {
    loadInitialData();
  }, []);

  // Apply filters khi có thay đổi
  useEffect(() => {
    applyFiltersAndSort();
  }, [auctions, searchQuery, currentCategory, currentStatus, sortOrder]);

  // Load dữ liệu ban đầu
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load auctions và stats đồng thời
      const [auctionsData, statsData] = await Promise.all([
        adminAuctionAPI.getAllAuctions(),
        adminAuctionAPI.getAuctionStats()
      ]);
      
      setAuctions(auctionsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters và sorting
  const applyFiltersAndSort = async () => {
    try {
      const filters = {
        searchQuery: searchQuery.trim(),
        category: currentCategory,
        status: currentStatus,
        sortBy: sortOrder,
        page: currentPage,
        size: itemsPerPage
      };

      const filteredData = await adminAuctionAPI.searchAuctions(filters);
      setFilteredAuctions(filteredData);
    } catch (err) {
      console.error('Error applying filters:', err);
      setFilteredAuctions([]);
    }
  };

  // Hàm lấy tên seller - SỬA ĐỔI CHÍNH TẠI ĐÂY
  const getSellerName = (auction) => {
    // Debug để xem cấu trúc dữ liệu
    if (process.env.NODE_ENV === 'development') {
      console.log('Auction seller data:', {
        sellerId: auction.sellerId,
        user: auction.user,
        userKeys: auction.user ? Object.keys(auction.user) : 'No user object'
      });
    }

    // Thử các cách khác nhau để lấy tên
    if (auction.user) {
      // Trường hợp 1: firstName + lastName
      if (auction.user.firstName || auction.user.lastName) {
        const firstName = auction.user.firstName || '';
        const lastName = auction.user.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        if (fullName) return fullName;
      }

      // Trường hợp 2: fullName
      if (auction.user.fullName) {
        return auction.user.fullName;
      }

      // Trường hợp 3: name
      if (auction.user.name) {
        return auction.user.name;
      }

      // Trường hợp 4: displayName hoặc username
      if (auction.user.displayName) {
        return auction.user.displayName;
      }

      if (auction.user.username) {
        return auction.user.username;
      }

      // Trường hợp 5: email (nếu không có tên)
      if (auction.user.email) {
        return auction.user.email.split('@')[0]; // Lấy phần trước @ của email
      }
    }

    // Fallback cuối cùng
    return `Seller #${auction.sellerId}`;
  };

  // Hàm lấy email seller
  const getSellerEmail = (auction) => {
    return auction.user?.email || '';
  };

  // Hàm kiểm tra seller verified
  const isSellerVerified = (auction) => {
    return auction.user?.verified === true;
  };

  // Hàm kiểm tra và trả về URL ảnh hợp lệ
  const getValidImageUrl = (auction) => {
    // Kiểm tra các nguồn ảnh theo thứ tự ưu tiên
    const imageUrls = [
      auction.thumbnailUrl,
      auction.media?.[0]?.url,
      auction.imageUrl
    ].filter(Boolean); // Loại bỏ các giá trị null/undefined/empty

    // Nếu không có ảnh hợp lệ, trả về ảnh mặc định
    if (imageUrls.length === 0) {
      return '';
    }

    // Tìm URL đầu tiên chưa từng lỗi
    for (const url of imageUrls) {
      if (!failedImages.has(url)) {
        return url;
      }
    }

    // Nếu tất cả đều lỗi, trả về ảnh mặc định
    return '';
  };

  // Hàm xử lý khi ảnh bị lỗi
  const handleImageError = (e, auctionId, imageUrl) => {
    // Thêm URL lỗi vào danh sách
    setFailedImages(prev => new Set([...prev, imageUrl]));
    
    // Chỉ đổi sang ảnh mặc định nếu chưa phải là ảnh mặc định
    if (e.target.src !== '/default-auction-image.jpg') {
      e.target.src = '/default-auction-image.jpg';
    }
  };

  // Hàm xử lý tìm kiếm
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset về trang đầu khi search
  };

  // Hàm lọc auctions dựa theo trạng thái từ stats cards
  const filterByStatus = async (status) => {
    try {
      setLoading(true);
      setError(null);
      
      let statusFilter;
      switch (status) {
        case "All":
          statusFilter = "All Statuses";
          break;
        case "Active":
          statusFilter = "Opened";
          break;
        case "Draft":
          statusFilter = "Draft";
          break;
        case "Delivered":
          statusFilter = "Delivered";
          break;
        case "Pending":
          statusFilter = "Pending";
          break;
        case "Completed":
          statusFilter = "Completed";
          break;
        default:
          statusFilter = "All Statuses";
      }
      
      setCurrentStatus(statusFilter);
      setCurrentPage(1);
      
      if (status === "All") {
        const allAuctions = await adminAuctionAPI.getAllAuctions();
        setFilteredAuctions(allAuctions);
      } else {
        const filteredData = await adminAuctionAPI.searchAuctionsByStatus(statusFilter);
        setFilteredAuctions(filteredData);
      }
    } catch (err) {
      console.error('Error filtering by status:', err);
      setError('Không thể lọc theo trạng thái. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi thay đổi danh mục
  const handleCategoryChange = (e) => {
    setCurrentCategory(e.target.value);
    setCurrentPage(1);
  };

  // Hàm xử lý khi thay đổi trạng thái
  const handleStatusChange = (e) => {
    setCurrentStatus(e.target.value);
    setCurrentPage(1);
  };

  // Hàm xử lý khi thay đổi thứ tự sắp xếp
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setCurrentPage(1);
  };

  // Hàm xử lý khi thay đổi trang
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "0 đ";
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get status display name
  const getStatusDisplayName = (status) => {
    const statusMap = {
      'OPENED': 'Active',
      'COMPLETED': 'Completed', 
      'PENDING': 'Pending',
      'DRAFT': 'Draft',
      'DELIVERED': 'Delivered'
    };
    return statusMap[status] || status;
  };

  // Get status CSS class
  const getStatusClass = (status) => {
    const statusClassMap = {
      'OPENED': 'active',
      'COMPLETED': 'completed',
      'PENDING': 'pending', 
      'DRAFT': 'draft',
      'DELIVERED': 'delivered'
    };
    return statusClassMap[status] || status.toLowerCase();
  };

  // Pagination calculations
  const totalItems = filteredAuctions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAuctions = filteredAuctions.slice(startIndex, endIndex);

  return (
    <div id="wrapper">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div id="content-wrapper" className="d-flex flex-column" style={{ flex: 1 }}>
        <Topbar />
        
        {/* Container content */}
        <div className="container-fluid auctions-container">
          {/* Header */}
          <div className="auctions-header">
            <div className="title-section">
              <h1>Auctions List</h1>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
              <button 
                className="btn btn-sm btn-outline-danger ml-2"
                onClick={loadInitialData}
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Cards section */}
          <div className="stats-cards">
            <div className="stat-card all" onClick={() => filterByStatus("All")}>
              <div className="stat-number">{stats.all}</div>
              <div className="stat-tag">ALL</div>
            </div>
            <div className="stat-card active" onClick={() => filterByStatus("Active")}>
              <div className="stat-number">{stats.active}</div>
              <div className="stat-tag">ACTIVE</div>
            </div>
            <div className="stat-card draft" onClick={() => filterByStatus("Draft")}>
              <div className="stat-number">{stats.draft}</div>
              <div className="stat-tag">DRAFT</div>
            </div>
            <div className="stat-card delivered" onClick={() => filterByStatus("Delivered")}>
              <div className="stat-number">{stats.delivered}</div>
              <div className="stat-tag">DELIVERED</div>
            </div>
            <div className="stat-card pending" onClick={() => filterByStatus("Pending")}>
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-tag">PENDING</div>
            </div>
            <div className="stat-card completed" onClick={() => filterByStatus("Completed")}>
              <div className="stat-number">{stats.completed}</div>
              <div className="stat-tag">COMPLETED</div>
            </div>
          </div>

          {/* Search and filter section */}
          <div className="search-filter-section">
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search Auctions" 
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div className="filters">
              <div className="filter-dropdown">
                <span>{currentCategory}</span>
                <ChevronDown size={16} />
                <select 
                  onChange={handleCategoryChange}
                  value={currentCategory}
                >
                  <option value="All Categories">All Categories</option>
                  <option value="Luxury Watches">Luxury Watches</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Automobiles">Automobiles</option>
                  <option value="Motorcycles">Motorcycles</option>
                  <option value="Optics">Optics</option>
                </select>
              </div>
              <div className="filter-dropdown">
                <span>{currentStatus}</span>
                <ChevronDown size={16} />
                <select 
                  onChange={handleStatusChange}
                  value={currentStatus}
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="Opened">Opened</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Draft">Draft</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              <div className="filter-dropdown">
                <span>{sortOrder}</span>
                <ChevronDown size={16} />
                <select 
                  onChange={handleSortChange}
                  value={sortOrder}
                >
                  <option value="Newest">Newest</option>
                  <option value="Oldest">Oldest</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Bids: High to Low">Bids: High to Low</option>
                  <option value="Bids: Low to High">Bids: Low to High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Auctions Table */}
          <div className="auctions-table-container">
            <table className="auctions-table">
              <thead>
                <tr>
                  <th>Auction</th>
                  <th>Seller</th>
                  <th>Start / End</th>
                  <th>Starting Price</th>
                  <th>Current Bid</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="loading-row">
                      <div className="loading-spinner">Đang tải...</div>
                    </td>
                  </tr>
                ) : currentAuctions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data-row">
                      {error ? 'Có lỗi xảy ra khi tải dữ liệu' : 'Không tìm thấy đấu giá nào'}
                    </td>
                  </tr>
                ) : (
                  currentAuctions.map((auction) => {
                    const imageUrl = getValidImageUrl(auction);
                    
                    return (
                      <tr key={auction.id}>
                        <td className="auction-title-cell">
                          <Link to={`/admin/auction/${auction.id}`} className="auction-image">
                            <img 
                              src={imageUrl}
                              alt={auction.title}
                              onError={(e) => handleImageError(e, auction.id, imageUrl)}
                              loading="lazy" 
                            />
                          </Link>
                          <div className="auction-info">
                            <Link to={`/admin/auction/${auction.id}`} className="auction-title">
                              {auction.title}
                            </Link>
                            <div className="auction-category">
                              ID #{auction.id} | Category ID: {auction.categoryId}
                            </div>
                          </div>
                        </td>
                        {/* SELLER CELL - ĐÃ CẬP NHẬT */}
                        <td className="seller-cell">
                          <div className="seller-name" title={getSellerName(auction)}>
                            {getSellerName(auction)}
                          </div>
                          {isSellerVerified(auction) && (
                            <div className="seller-verified">✓ Verified</div>
                          )}
                          {getSellerEmail(auction) && (
                            <div className="seller-email" title={getSellerEmail(auction)}>
                              {getSellerEmail(auction)}
                            </div>
                          )}
                          <div className="seller-id" style={{fontSize: '11px', color: '#888'}}>
                            Seller ID: {auction.sellerId}
                          </div>
                        </td>
                        <td className="dates-cell">
                          <div>Start: {formatDate(auction.startTime)}</div>
                          <div>End: {formatDate(auction.endTime)}</div>
                        </td>
                        <td className="price-cell">
                          <div className="price">{formatCurrency(auction.startingPrice)}</div>
                          <div className="price-detail">Original Starting</div>
                        </td>
                        <td className="bid-cell">
                          <div className="bid">{formatCurrency(auction.currentBid || auction.startingPrice)}</div>
                          <div className="bid-count">{auction.bidCount || 0} bids</div>
                        </td>
                        <td className={`status-cell ${getStatusClass(auction.status)}`}>
                          <span className="status-badge">{getStatusDisplayName(auction.status)}</span>
                        </td>
                        <td className="created-at-cell">
                          <div>{formatDate(auction.createdAt)}</div>
                          <div className="time-detail">Updated: {formatDate(auction.updatedAt)}</div>
                        </td>
                        <td className="action-cell">
                          <button className="action-button">
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && currentAuctions.length > 0 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing{' '}
                <span>{Math.min(endIndex, totalItems)}</span> of{' '}
                <span>{totalItems}</span> entries
              </div>
              <div className="pagination-controls">
                <button 
                  className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>
                
                {/* Tạo các nút số trang */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = index + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = index + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + index;
                  } else {
                    pageNumber = currentPage - 2 + index;
                  }
                  
                  return (
                    <button 
                      key={pageNumber}
                      className={`pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button 
                  className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auctions;