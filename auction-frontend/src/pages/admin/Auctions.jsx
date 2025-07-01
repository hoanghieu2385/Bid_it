// Auctions.jsx - Updated to display correct stats numbers
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../assets/styles/admin/Auctions.css";
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import adminAuctionAPI from "../../services/admin-auction-api";
import { getUserById } from "../../services/admin-user-api";
import { getAllCategories } from "../../services/category-api";

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCategory, setCurrentCategory] = useState("All Categories");
  const [currentStatus, setCurrentStatus] = useState("All Statuses");
  const [sortOrder, setSortOrder] = useState("Newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [stats, setStats] = useState({
    all: 0,
    upcoming: 0,
    opened: 0,
    cancelled: 0,
    closed: 0,
    sold: 0,
    failed: 0,
    shipping: 0,
    delivered: 0,
    disputed: 0,
    pending_return: 0,
    returning: 0,
    completed: 0,
  });
  const [failedImages, setFailedImages] = useState(new Set());
  const userCache = new Map();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [auctions, searchQuery, currentCategory, currentStatus, sortOrder]);

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

  // Calculate stats from auctions data
  const calculateStats = (auctionsData) => {
    const statusCounts = {
      all: auctionsData.length,
      upcoming: 0,
      opened: 0,
      cancelled: 0,
      closed: 0,
      sold: 0,
      failed: 0,
      shipping: 0,
      delivered: 0,
      disputed: 0,
      pending_return: 0,
      returning: 0,
      completed: 0,
    };

    auctionsData.forEach((auction) => {
      const status = auction.status?.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(statusCounts, status)) {
        statusCounts[status]++;
      }
    });

    return statusCounts;
  };

  // Load initial data and calculate stats
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Loading initial data...");

      // Load auctions and categories
      const [auctionsData, categoriesData] = await Promise.all([
        adminAuctionAPI.getAllAuctions(),
        getAllCategories(),
      ]);

      console.log("Categories loaded:", categoriesData);
      console.log("Auctions loaded:", auctionsData.length);

      const auctionsWithUsers = await fetchUsersForAuctions(auctionsData);

      // Calculate stats from actual data
      const calculatedStats = calculateStats(auctionsData);

      console.log("Calculated stats:", calculatedStats);

      setAuctions(auctionsWithUsers);
      setStats(calculatedStats);
      setCategories(categoriesData || []);

      // Reset filters when loading new data
      setCurrentCategory("All Categories");
      setCurrentStatus("All Statuses");
      setCurrentPage(1);
    } catch (err) {
      console.error("Error loading initial data:", err);
      setError("Unable to load data. Please try again later.");

      // Set empty stats in case of error
      setStats({
        all: 0,
        upcoming: 0,
        opened: 0,
        cancelled: 0,
        closed: 0,
        sold: 0,
        failed: 0,
        shipping: 0,
        delivered: 0,
        disputed: 0,
        pending_return: 0,
        returning: 0,
        completed: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = async () => {
    try {
      let filtered = [...auctions];

      // Apply search filter
      if (searchQuery.trim()) {
        filtered = filtered.filter(
          (auction) =>
            auction.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            auction.id?.toString().includes(searchQuery) ||
            getSellerName(auction)
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
      }

      // Apply category filter
      if (currentCategory !== "All Categories") {
        filtered = filtered.filter((auction) => {
          const categoryName = getCategoryName(auction.categoryId);
          return categoryName === currentCategory;
        });
      }

      // Apply status filter
      if (currentStatus !== "All Statuses") {
        filtered = filtered.filter(
          (auction) => auction.status === currentStatus
        );
      }

      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortOrder) {
          case "Newest":
            return new Date(b.createdAt) - new Date(a.createdAt);
          case "Oldest":
            return new Date(a.createdAt) - new Date(b.createdAt);
          case "Price: High to Low":
            return (b.startingPrice || 0) - (a.startingPrice || 0);
          case "Price: Low to High":
            return (a.startingPrice || 0) - (b.startingPrice || 0);
          case "Bids: High to Low":
            return (b.bidCount || 0) - (a.bidCount || 0);
          case "Bids: Low to High":
            return (a.bidCount || 0) - (b.bidCount || 0);
          default:
            return 0;
        }
      });

      setFilteredAuctions(filtered);
    } catch (error) {
      console.error("Error applying filters:", error);
      setFilteredAuctions(auctions);
    }
  };

  // Function to get category name by ID
  const getCategoryName = (categoryId) => {
    if (!categoryId) return "Uncategorized";

    const category = categories.find((cat) => cat.id === categoryId);
    if (category) {
      return category.name;
    }

    console.warn(`Category with ID ${categoryId} not found`);
    return `Category ${categoryId}`;
  };

  // Function to get seller name
  const getSellerName = (auction) => {
    console.log(
      "Getting seller name for auction:",
      auction?.id,
      "User data:",
      auction?.user
    );

    if (!auction?.user) {
      console.log("No user data found for auction:", auction?.id);
      return `Seller #${auction?.sellerId || "Unknown"}`;
    }

    const user = auction.user;

    if (user.firstName || user.lastName) {
      const firstName = user.firstName || "";
      const lastName = user.lastName || "";
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) {
        console.log("Using firstName + lastName:", fullName);
        return fullName;
      }
    }

    if (user.fullName && user.fullName.trim()) {
      console.log("Using fullName:", user.fullName);
      return user.fullName.trim();
    }

    if (user.name && user.name.trim()) {
      console.log("Using name:", user.name);
      return user.name.trim();
    }

    if (user.displayName && user.displayName.trim()) {
      console.log("Using displayName:", user.displayName);
      return user.displayName.trim();
    }

    if (user.username && user.username.trim()) {
      console.log("Using username:", user.username);
      return user.username.trim();
    }

    if (user.email && user.email.trim()) {
      const emailName = user.email.split("@")[0];
      console.log("Using email name:", emailName);
      return emailName;
    }

    console.log("Using fallback seller ID");
    return `Seller #${auction.sellerId || "Unknown"}`;
  };

  // Function to get seller email
  const getSellerEmail = (auction) => {
    return auction?.user?.email || "";
  };

  // Function to check if seller is verified
  const isSellerVerified = (auction) => {
    return auction?.user?.verified === true;
  };

  // Function to get complete seller information for tooltip
  const getSellerInfo = (auction) => {
    if (!auction?.user) return `Seller ID: ${auction?.sellerId || "Unknown"}`;

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

    return info.join("\n");
  };

  // Function to check and return valid image URL
  const getValidImageUrl = (auction) => {
    const imageUrls = [
      auction.thumbnailUrl,
      auction.media?.[0]?.url,
      auction.imageUrl,
    ].filter(Boolean);

    if (imageUrls.length === 0) {
      return "";
    }

    for (const url of imageUrls) {
      if (!failedImages.has(url)) {
        return url;
      }
    }

    return "";
  };

  // Function to handle image error
  const handleImageError = (e, auctionId, imageUrl) => {
    setFailedImages((prev) => new Set([...prev, imageUrl]));

    if (e.target.src !== "/default-auction-image.jpg") {
      e.target.src = "/default-auction-image.jpg";
    }
  };

  // Function to handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Function to filter auctions by status from stats cards
  const filterByStatus = (status) => {
    console.log("Filtering by status:", status);

    let statusFilter;
    switch (status) {
      case "All":
        statusFilter = "All Statuses";
        break;
      case "Upcoming":
        statusFilter = "UPCOMING";
        break;
      case "Opened":
        statusFilter = "OPENED";
        break;
      case "Cancelled":
        statusFilter = "CANCELLED";
        break;
      case "Closed":
        statusFilter = "CLOSED";
        break;
      case "Sold":
        statusFilter = "SOLD";
        break;
      case "Expired Payment":
        statusFilter = "EXPIRED_PAYMENT";
        break;
      case "Failed":
        statusFilter = "FAILED";
        break;
      case "Shipping":
        statusFilter = "SHIPPING";
        break;
      case "Delivered":
        statusFilter = "DELIVERED";
        break;
      case "Disputed":
        statusFilter = "DISPUTED";
        break;
      case "Pending Return":
        statusFilter = "PENDING_RETURN";
        break;
      case "Returning":
        statusFilter = "RETURNING";
        break;
      case "Completed":
        statusFilter = "COMPLETED";
        break;
      default:
        statusFilter = "All Statuses";
    }

    setCurrentStatus(statusFilter);
    setCurrentPage(1);

    // Reset other filters to show all results for the selected status
    setSearchQuery("");
    setCurrentCategory("All Categories");
  };

  // Function to handle category change
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    console.log("Category changed to:", selectedCategory);
    setCurrentCategory(selectedCategory);
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
    if (!amount) return "₫0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get status display name
  const getStatusDisplayName = (status) => {
    const statusMap = {
      UPCOMING: "Upcoming",
      OPENED: "Opened",
      CANCELLED: "Cancelled",
      CLOSED: "Closed",
      SOLD: "Sold",
      EXPIRED_PAYMENT: "Expired Payment",
      FAILED: "Failed",
      SHIPPING: "Shipping",
      DELIVERED: "Delivered",
      DISPUTED: "Disputed",
      PENDING_RETURN: "Pending Return",
      RETURNING: "Returning",
      COMPLETED: "Completed",
    };
    return statusMap[status] || status;
  };

  // Get status CSS class
  const getStatusClass = (status) => {
    const statusClassMap = {
      UPCOMING: "upcoming",
      OPENED: "opened",
      CANCELLED: "cancelled",
      CLOSED: "closed",
      SOLD: "sold",
      EXPIRED_PAYMENT: "expired-payment",
      FAILED: "failed",
      SHIPPING: "shipping",
      DELIVERED: "delivered",
      DISPUTED: "disputed",
      PENDING_RETURN: "pending-return",
      RETURNING: "returning",
      COMPLETED: "completed",
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
      <div
        id="content-wrapper"
        className="d-flex flex-column"
        style={{ flex: 1 }}
      >
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

          {/* Stats Cards section - Updated to show correct numbers */}
          <div className="stats-cards">
            <div
              className="stat-card all"
              onClick={() => filterByStatus("All")}
            >
              <div className="stat-number">{stats.all}</div>
              <div className="stat-tag">ALL</div>
            </div>
            <div
              className="stat-card upcoming"
              onClick={() => filterByStatus("Upcoming")}
            >
              <div className="stat-number">{stats.upcoming}</div>
              <div className="stat-tag">UPCOMING</div>
            </div>
            <div
              className="stat-card opened"
              onClick={() => filterByStatus("Opened")}
            >
              <div className="stat-number">{stats.opened}</div>
              <div className="stat-tag">OPENED</div>
            </div>
            <div
              className="stat-card closed"
              onClick={() => filterByStatus("Closed")}
            >
              <div className="stat-number">{stats.closed}</div>
              <div className="stat-tag">CLOSED</div>
            </div>
            <div
              className="stat-card sold"
              onClick={() => filterByStatus("Sold")}
            >
              <div className="stat-number">{stats.sold}</div>
              <div className="stat-tag">SOLD</div>
            </div>
            <div
              className="stat-card failed"
              onClick={() => filterByStatus("Failed")}
            >
              <div className="stat-number">{stats.failed}</div>
              <div className="stat-tag">FAILED</div>
            </div>
            <div
              className="stat-card shipping"
              onClick={() => filterByStatus("Shipping")}
            >
              <div className="stat-number">{stats.shipping}</div>
              <div className="stat-tag">SHIPPING</div>
            </div>
            <div
              className="stat-card delivered"
              onClick={() => filterByStatus("Delivered")}
            >
              <div className="stat-number">{stats.delivered}</div>
              <div className="stat-tag">DELIVERED</div>
            </div>
            <div
              className="stat-card completed"
              onClick={() => filterByStatus("Completed")}
            >
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
                <select onChange={handleCategoryChange} value={currentCategory}>
                  <option value="All Categories">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-dropdown">
                <span>
                  {currentStatus === "All Statuses"
                    ? "All Statuses"
                    : getStatusDisplayName(currentStatus)}
                </span>
                <ChevronDown size={16} />
                <select onChange={handleStatusChange} value={currentStatus}>
                  <option value="All Statuses">All Statuses</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="OPENED">Opened</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="CLOSED">Closed</option>
                  <option value="SOLD">Sold</option>
                  <option value="FAILED">Failed</option>
                  <option value="SHIPPING">Shipping</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="DISPUTED">Disputed</option>
                  <option value="PENDING_RETURN">Pending Return</option>
                  <option value="RETURNING">Returning</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="filter-dropdown">
                <span>{sortOrder}</span>
                <ChevronDown size={16} />
                <select onChange={handleSortChange} value={sortOrder}>
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
                      {error
                        ? "An error occurred while loading data"
                        : "No auctions found"}
                    </td>
                  </tr>
                ) : (
                  currentAuctions.map((auction) => {
                    const imageUrl = getValidImageUrl(auction);

                    return (
                      <tr key={auction.id}>
                        <td className="auction-title-cell">
                          <Link
                            to={`/admin/auction/${auction.id}`}
                            className="auction-image"
                          >
                            <img
                              src={imageUrl}
                              alt={auction.title}
                              onError={(e) =>
                                handleImageError(e, auction.id, imageUrl)
                              }
                              loading="lazy"
                            />
                          </Link>
                          <div className="auction-info">
                            <Link
                              to={`/admin/auction/${auction.id}`}
                              className="auction-title"
                            >
                              {auction.title}
                            </Link>
                            <div className="auction-category">
                              ID #{auction.id} |{" "}
                              {getCategoryName(auction.categoryId)}
                            </div>
                          </div>
                        </td>
                        <td
                          className="seller-cell"
                          title={getSellerInfo(auction)}
                        >
                          <div className="seller-name">
                            {getSellerName(auction)}
                            {isSellerVerified(auction) && (
                              <span
                                className="verified-badge"
                                style={{ marginLeft: "5px", color: "#10b981" }}
                              >
                                ✓
                              </span>
                            )}
                          </div>
                          {getSellerEmail(auction) && (
                            <div
                              className="seller-email"
                              style={{
                                fontSize: "12px",
                                color: "#666",
                                marginTop: "2px",
                              }}
                            >
                              {getSellerEmail(auction)}
                            </div>
                          )}
                          <div
                            className="seller-id"
                            style={{
                              fontSize: "11px",
                              color: "#888",
                              marginTop: "2px",
                            }}
                          >
                            ID: {auction.sellerId}
                          </div>
                        </td>
                        <td className="dates-cell">
                          <div>Start: {formatDate(auction.startTime)}</div>
                          <div>End: {formatDate(auction.endTime)}</div>
                        </td>
                        <td className="price-cell">
                          <div className="price">
                            {formatCurrency(auction.startingPrice)}
                          </div>
                          <div className="price-detail">Original Starting</div>
                        </td>
                        <td className="bid-cell">
                          <div className="bid">
                            {formatCurrency(
                              auction.currentBid || auction.startingPrice
                            )}
                          </div>
                          <div className="bid-count">
                            {auction.bidCount || 0} bids
                          </div>
                        </td>
                        <td
                          className={`status-cell ${getStatusClass(
                            auction.status
                          )}`}
                        >
                          <span className="status-badge">
                            {getStatusDisplayName(auction.status)}
                          </span>
                        </td>
                        <td className="created-at-cell">
                          <div>{formatDate(auction.createdAt)}</div>
                          <div className="time-detail">
                            Updated: {formatDate(auction.updatedAt)}
                          </div>
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
                Showing <span>{Math.min(endIndex, totalItems)}</span> of{" "}
                <span>{totalItems}</span> entries
              </div>
              <div className="pagination-controls">
                <button
                  className={`pagination-button ${
                    currentPage === 1 ? "disabled" : ""
                  }`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>

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
                      className={`pagination-number ${
                        currentPage === pageNumber ? "active" : ""
                      }`}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  className={`pagination-button ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
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
