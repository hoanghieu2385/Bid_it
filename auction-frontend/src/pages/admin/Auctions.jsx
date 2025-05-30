// Auctions.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../assets/styles/admin/Auctions.css";
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";
import { Search, ChevronDown, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import adminAuctionAPI from "../../services/admin-auction-api";
import { getUserById } from "../../services/admin-user-api";

const Auctions = () => {
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
  const [stats, setStats] = useState({ all: 0, active: 0, draft: 0, delivered: 0, pending: 0, completed: 0 });
  const [failedImages, setFailedImages] = useState(new Set());
  const userCache = new Map();

  useEffect(() => { loadInitialData(); }, []);
  useEffect(() => { applyFiltersAndSort(); }, [auctions, searchQuery, currentCategory, currentStatus, sortOrder]);

  const fetchUsersForAuctions = async (auctionList) => {
    return await Promise.all(
      auctionList.map(async (auction) => {
        if (!auction.sellerId) return auction;
        try {
          if (!userCache.has(auction.sellerId)) {
            const user = await getUserById(auction.sellerId);
            userCache.set(auction.sellerId, user);
          }
          return { ...auction, user: userCache.get(auction.sellerId) };
        } catch {
          return { ...auction, user: null };
        }
      })
    );
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [auctionsData, statsData] = await Promise.all([
        adminAuctionAPI.getAllAuctions(),
        adminAuctionAPI.getAuctionStats()
      ]);
      const auctionsWithUsers = await fetchUsersForAuctions(auctionsData);
      setAuctions(auctionsWithUsers);
      setStats(statsData);
    } catch {
      setError("Unable to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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
      const dataWithUsers = await fetchUsersForAuctions(filteredData);
      setFilteredAuctions(dataWithUsers);
    } catch {
      setFilteredAuctions([]);
    }
  };

  // Function to get seller name - IMPROVED
  const getSellerName = (auction) => {
    console.log('Getting seller name for auction:', auction?.id, 'User data:', auction?.user); // Debug log
    
    // Check if user information exists
    if (!auction?.user) {
      console.log('No user data found for auction:', auction?.id);
      return `Seller #${auction?.sellerId || 'Unknown'}`;
    }

    const user = auction.user;

    // Try different ways to get name in priority order
    // 1. firstName + lastName
    if (user.firstName || user.lastName) {
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) {
        console.log('Using firstName + lastName:', fullName);
        return fullName;
      }
    }

    // 2. fullName (if available)
    if (user.fullName && user.fullName.trim()) {
      console.log('Using fullName:', user.fullName);
      return user.fullName.trim();
    }

    // 3. name (if available)
    if (user.name && user.name.trim()) {
      console.log('Using name:', user.name);
      return user.name.trim();
    }

    // 4. displayName or username
    if (user.displayName && user.displayName.trim()) {
      console.log('Using displayName:', user.displayName);
      return user.displayName.trim();
    }

    if (user.username && user.username.trim()) {
      console.log('Using username:', user.username);
      return user.username.trim();
    }

    // 5. email (get part before @)
    if (user.email && user.email.trim()) {
      const emailName = user.email.split('@')[0];
      console.log('Using email name:', emailName);
      return emailName;
    }

    // Final fallback
    console.log('Using fallback seller ID');
    return `Seller #${auction.sellerId || 'Unknown'}`;
  };

  // Function to get seller email
  const getSellerEmail = (auction) => {
    return auction?.user?.email || '';
  };

  // Function to check if seller is verified
  const isSellerVerified = (auction) => {
    return auction?.user?.verified === true;
  };

  // Function to get complete seller information for tooltip
  const getSellerInfo = (auction) => {
    if (!auction?.user) return `Seller ID: ${auction?.sellerId || 'Unknown'}`;
    
    const user = auction.user;
    const info = [];
    
    if (user.firstName || user.lastName) {
      info.push(`Name: ${getSellerName(auction)}`);
    }
    if (user.email) {
      info.push(`Email: ${user.email}`);
    }
    if (user.phoneNumber) {
      info.push(`Phone: ${user.phoneNumber}`);
    }
    info.push(`Seller ID: ${auction.sellerId}`);
    
    return info.join('\n');
  };

  // Function to check and return valid image URL
  const getValidImageUrl = (auction) => {
    // Check image sources in priority order
    const imageUrls = [
      auction.thumbnailUrl,
      auction.media?.[0]?.url,
      auction.imageUrl
    ].filter(Boolean); // Remove null/undefined/empty values

    // If no valid images, return default image
    if (imageUrls.length === 0) {
      return '';
    }

    // Find first URL that hasn't failed before
    for (const url of imageUrls) {
      if (!failedImages.has(url)) {
        return url;
      }
    }

    // If all failed, return default image
    return '';
  };

  // Function to handle image error
  const handleImageError = (e, auctionId, imageUrl) => {
    // Add failed URL to list
    setFailedImages(prev => new Set([...prev, imageUrl]));
    
    // Only change to default image if not already default
    if (e.target.src !== '/default-auction-image.jpg') {
      e.target.src = '/default-auction-image.jpg';
    }
  };

  // Function to handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Function to filter auctions by status from stats cards
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
      setError('Unable to filter by status. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle category change
  const handleCategoryChange = (e) => {
    setCurrentCategory(e.target.value);
    setCurrentPage(1);
  };

  // Function to handle status change
  const handleStatusChange = (e) => {
    setCurrentStatus(e.target.value);
    setCurrentPage(1);
  };

  // Function to handle sort order change
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    setCurrentPage(1);
  };

  // Function to handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "đ0";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
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
                Try Again
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
                      <div className="centered-loading">
                        <span>Loading auctions, please wait...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentAuctions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data-row">
                      {error ? 'An error occurred while loading data' : 'No auctions found'}
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
                        {/* SELLER CELL - IMPROVED */}
                        <td className="seller-cell" title={getSellerInfo(auction)}>
                          <div className="seller-name">
                            {getSellerName(auction)}
                            {isSellerVerified(auction) && (
                              <span className="verified-badge" style={{marginLeft: '5px', color: '#10b981'}}>
                                ✓
                              </span>
                            )}
                          </div>
                          {getSellerEmail(auction) && (
                            <div className="seller-email" style={{fontSize: '12px', color: '#666', marginTop: '2px'}}>
                              {getSellerEmail(auction)}
                            </div>
                          )}
                          <div className="seller-id" style={{fontSize: '11px', color: '#888', marginTop: '2px'}}>
                            ID: {auction.sellerId}
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
                
                {/* Generate page number buttons */}
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