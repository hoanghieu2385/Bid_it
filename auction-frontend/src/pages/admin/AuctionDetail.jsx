import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";
import adminAuctionAPI from "../../services/admin-auction-api";
import bidAPI from "../../services/bid-admin-api";
import { getUserById } from "../../services/admin-user-api";
import { getCategoryById } from "../../services/category-api";
import "../../assets/styles/admin/AuctionDetail.css";
import {
  Calendar,
  Clock,
  ChevronRight,
  User,
  Mail,
  Award,
  DollarSign,
  TrendingUp,
  Hash,
  Check,
  Tag,
  Crown,
  Activity,
} from "lucide-react";

const AuctionDetail = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [categoryName, setCategoryName] = useState("");

  // Bid data states
  const [bidHistory, setBidHistory] = useState([]);
  const [bidStatistics, setBidStatistics] = useState(null);
  const [highestBid, setHighestBid] = useState(null);
  const [bidLoading, setBidLoading] = useState(false);
  const [bidError, setBidError] = useState(null);

  // User cache for bidders
  const [userCache, setUserCache] = useState({});

  useEffect(() => {
    const fetchAuctionDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Call API to get auction information
        const auctionData = await adminAuctionAPI.getAuctionById(id);

        // Fetch category name if categoryId exists
        let categoryNameResult = "";
        if (auctionData.categoryId) {
          try {
            const categoryData = await getCategoryById(auctionData.categoryId);
            categoryNameResult =
              categoryData.name || `Category ${auctionData.categoryId}`;
          } catch (categoryError) {
            console.error("Error fetching category:", categoryError);
            categoryNameResult = `Category ${auctionData.categoryId}`;
          }
        }
        setCategoryName(categoryNameResult);

        // Format data to fit the component
        const formattedAuction = {
          ...auctionData,
          // Format time if needed
          startTime: formatDateTime(auctionData.startTime),
          endTime: formatDateTime(auctionData.endTime),
          createdAt: formatDate(auctionData.createdAt),
          updatedAt: formatDate(auctionData.updatedAt),

          // Format currency
          startingPrice: formatCurrency(auctionData.startingPrice),
          incrementAmount: formatCurrency(auctionData.incrementAmount),
          currentBid: formatCurrency(auctionData.currentBid),
          securityDeposit: formatCurrency(auctionData.securityDeposit),

          // Get seller information from user object - UPDATED
          seller: auctionData.user
            ? {
                name:
                  [auctionData.user.firstName, auctionData.user.lastName]
                    .filter((name) => name && name.trim())
                    .join(" ")
                    .trim() ||
                  auctionData.user.username ||
                  "Unknown Seller",
                email: auctionData.user.email,
                verified: auctionData.user.verified,
              }
            : null,

          // Handle media list
          media: auctionData.media || [],

          // Keep raw data for bid APIs
          rawData: auctionData,
        };

        setAuction(formattedAuction);

        // Fetch bid data
        await fetchBidData(id);
      } catch (error) {
        console.error("Error fetching auction detail:", error);
        setError("Unable to load auction information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAuctionDetail();
    }
  }, [id]);

  // Fetch user information by ID
  const fetchUserInfo = async (userId) => {
    if (userCache[userId]) {
      return userCache[userId];
    }

    try {
      const userData = await getUserById(userId);

      // Kết hợp firstName và lastName thành fullName
      const fullName = [userData.firstName, userData.lastName]
        .filter((name) => name && name.trim()) // Loại bỏ giá trị null/undefined/empty
        .join(" ")
        .trim();

      const userInfo = {
        name: fullName || userData.username || `User ${userId}`,
        email: userData.email || "N/A",
      };

      // Cache the user info
      setUserCache((prev) => ({
        ...prev,
        [userId]: userInfo,
      }));

      return userInfo;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      const fallbackInfo = {
        name: `User ${userId}`,
        email: "N/A",
      };

      // Cache the fallback info to avoid repeated requests
      setUserCache((prev) => ({
        ...prev,
        [userId]: fallbackInfo,
      }));

      return fallbackInfo;
    }
  };

  // Fetch bid-related data
  const fetchBidData = async (auctionId) => {
    try {
      setBidLoading(true);
      setBidError(null);

      // Fetch bid history, statistics, and highest bid in parallel
      const [historyData, statisticsData, highestBidData] =
        await Promise.allSettled([
          bidAPI.getBidHistory(auctionId),
          bidAPI.getBidStatistics(auctionId),
          bidAPI.getHighestBid(auctionId),
        ]);

      // Handle bid history
      if (historyData.status === "fulfilled") {
        const bids = historyData.value || [];

        // Fetch user info for all bidders
        const bidsWithUserInfo = await Promise.all(
          bids.map(async (bid) => {
            const userInfo = await fetchUserInfo(bid.userId);
            return {
              ...bid,
              userName: userInfo.name,
              userEmail: userInfo.email,
            };
          })
        );

        setBidHistory(bidsWithUserInfo);
      } else {
        console.error("Error fetching bid history:", historyData.reason);
      }

      // Handle bid statistics
      if (statisticsData.status === "fulfilled") {
        const stats = statisticsData.value;

        // If statistics has highest bidder info, fetch user details
        if (stats && stats.highestBidderId) {
          const userInfo = await fetchUserInfo(stats.highestBidderId);
          setBidStatistics({
            ...stats,
            highestBidderName: userInfo.name,
            highestBidderEmail: userInfo.email,
          });
        } else {
          setBidStatistics(stats);
        }
      } else {
        console.error("Error fetching bid statistics:", statisticsData.reason);
      }

      // Handle highest bid
      if (highestBidData.status === "fulfilled") {
        setHighestBid(highestBidData.value);
      } else {
        console.error("Error fetching highest bid:", highestBidData.reason);
      }
    } catch (error) {
      console.error("Error fetching bid data:", error);
      setBidError("Unable to load bid information");
    } finally {
      setBidLoading(false);
    }
  };

  // Helper functions to format data
  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    const date = new Date(dateTime);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatCurrencyFromNumber = (amount) => {
    if (!amount && amount !== 0) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusInEnglish = (status) => {
    const statusMap = {
      DRAFT: "Draft",
      OPENED: "Open",
      COMPLETED: "Completed",
      PENDING: "Pending",
      DELIVERED: "Delivered",
      DISPUTED: "Disputed",
    };
    return statusMap[status] || status;
  };

  const getBidStatusInEnglish = (status) => {
    const statusMap = {
      ACTIVE: "Active",
      WINNING: "Winning",
      OUTBID: "Outbid",
    };
    return statusMap[status] || status;
  };

  // Handle tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Component to display tab content
  const renderTabContent = () => {
    if (!auction) return null;

    switch (activeTab) {
      case "overview":
        return (
          <div className="auction-details">
            <h3>Auction Details</h3>

            <div className="detail-row">
              <div className="detail-label">Auction ID</div>
              <div className="detail-value">#{auction.id}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Title</div>
              <div className="detail-value">{auction.title}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Category</div>
              <div className="detail-value">{categoryName}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Description</div>
              <div className="detail-value description">
                {auction.description}
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Start Time</div>
              <div className="detail-value">{auction.startTime}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">End Time</div>
              <div className="detail-value">{auction.endTime}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Created Date</div>
              <div className="detail-value">{auction.createdAt}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Last Updated</div>
              <div className="detail-value">{auction.updatedAt}</div>
            </div>

            {auction.media && auction.media.length > 0 && (
              <div className="detail-row">
                <div className="detail-label">Images</div>
                <div className="detail-value media-grid">
                  {auction.media.map((item) => (
                    <div className="media-item" key={item.id}>
                      <img
                        src={item.url}
                        alt={`Image ${item.id}`}
                        onError={(e) => {
                          e.target.src = "/placeholder-image.jpg";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-row">
              <div className="detail-label">Starting Price</div>
              <div className="detail-value">{auction.startingPrice}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Increment Amount</div>
              <div className="detail-value">{auction.incrementAmount}</div>
            </div>

            <div className="detail-row">
              <div className="detail-label">Current Bid</div>
              <div className="detail-value">{auction.currentBid}</div>
            </div>

            {auction.requiresDeposit && (
              <div className="detail-row">
                <div className="detail-label">Security Deposit</div>
                <div className="detail-value">{auction.securityDeposit}</div>
              </div>
            )}

            <div className="detail-row">
              <div className="detail-label">Number of Bids</div>
              <div className="detail-value">{auction.bidCount || 0}</div>
            </div>

            {/* Bid Statistics Section */}
            {bidStatistics && (
              <div className="bid-statistics-section">
                <h4>Bid Statistics</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">Total Bids</div>
                    <div className="stat-value">{bidStatistics.totalBids}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Highest Bid</div>
                    <div className="stat-value">
                      {formatCurrencyFromNumber(bidStatistics.highestBid)}
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Highest Bidder</div>
                    <div className="stat-value">
                      {bidStatistics.highestBidderName ||
                        bidStatistics.highestBidder ||
                        "N/A"}
                    </div>
                  </div>
                  {bidStatistics.highestBidTime && (
                    <div className="stat-item">
                      <div className="stat-label">Highest Bid Time</div>
                      <div className="stat-value">
                        {formatDateTime(bidStatistics.highestBidTime)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case "deposits":
        return (
          <div className="deposits-section">
            <h3>Security Deposits</h3>
            <div className="no-data-message">
              Deposit information will be available when deposit management is
              implemented.
            </div>
          </div>
        );

      case "bidHistory":
        return (
          <div className="bid-history-section">
            <h3>Bid History</h3>
            {bidLoading ? (
              <div className="loading-message">Loading bid history...</div>
            ) : bidError ? (
              <div className="error-message">{bidError}</div>
            ) : bidHistory && bidHistory.length > 0 ? (
              <div className="bid-history-container">
                <div className="bid-history-header">
                  <p>Recent {bidHistory.length} bids (showing latest first)</p>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Bidder</th>
                      <th>Email</th>
                      <th>Amount</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bidHistory.map((bid) => (
                      <tr key={bid.id}>
                        <td>
                          <div className="bidder-info">
                            <span className="bidder-name">{bid.userName}</span>
                          </div>
                        </td>
                        <td>
                          <span className="bidder-email">{bid.userEmail}</span>
                        </td>
                        <td className="bid-amount">
                          {formatCurrencyFromNumber(bid.bidAmount)}
                        </td>
                        <td>{formatDateTime(bid.bidTime)}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              bid.status ? bid.status.toLowerCase() : "active"
                            }`}
                          >
                            {getBidStatusInEnglish(bid.status || "ACTIVE")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-data-message">No bid history available.</div>
            )}
          </div>
        );

      case "winnerPayment":
        return (
          <div className="winner-payment-section">
            <h3>Winner & Payment</h3>

            {/* Current Highest Bid Info */}
            {highestBid && (
              <div className="highest-bid-info">
                <h4>Current Highest Bid</h4>
                <div className="highest-bid-card">
                  <div className="highest-bid-amount">
                    {formatCurrencyFromNumber(highestBid.highestBid)}
                  </div>
                  <div className="highest-bid-time">
                    Last updated: {formatDateTime(highestBid.timestamp)}
                  </div>
                </div>
              </div>
            )}

            {/* Winner Information */}
            {auction.rawData && auction.rawData.winnerId ? (
              <div className="winner-info">
                <h4>Winner Information</h4>
                <div className="winner-card">
                  <div className="winner-icon">
                    <Crown size={24} />
                  </div>
                  <div className="winner-details">
                    <div className="detail-row">
                      <div className="detail-label">Winner ID:</div>
                      <div className="detail-value">
                        #{auction.rawData.winnerId}
                      </div>
                    </div>

                    {/* Display winner name and email from bid statistics */}
                    {bidStatistics && bidStatistics.highestBidderName && (
                      <div className="detail-row">
                        <div className="detail-label">Winner Name:</div>
                        <div className="detail-value">
                          {bidStatistics.highestBidderName}
                        </div>
                      </div>
                    )}

                    {bidStatistics && bidStatistics.highestBidderEmail && (
                      <div className="detail-row">
                        <div className="detail-label">Winner Email:</div>
                        <div className="detail-value">
                          {bidStatistics.highestBidderEmail}
                        </div>
                      </div>
                    )}

                    {bidStatistics && bidStatistics.highestBid && (
                      <div className="detail-row">
                        <div className="detail-label">Winning Bid:</div>
                        <div className="detail-value winning-amount">
                          {formatCurrencyFromNumber(bidStatistics.highestBid)}
                        </div>
                      </div>
                    )}

                    {auction.rawData.winnerPaymentDeadline && (
                      <div className="detail-row">
                        <div className="detail-label">Payment Deadline:</div>
                        <div className="detail-value">
                          {formatDateTime(
                            auction.rawData.winnerPaymentDeadline
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-winner-message">
                <div className="no-winner-icon">
                  <Activity size={48} />
                </div>
                <div className="no-winner-text">
                  {auction.rawData && auction.rawData.status === "OPENED"
                    ? "Auction is still active - no winner yet"
                    : "No winner determined yet"}
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div id="wrapper">
        <Sidebar />
        <div
          id="content-wrapper"
          className="d-flex flex-column"
          style={{ flex: 1 }}
        >
          <Topbar />
          <div className="container-fluid">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <div>Loading auction information...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="wrapper">
        <Sidebar />
        <div
          id="content-wrapper"
          className="d-flex flex-column"
          style={{ flex: 1 }}
        >
          <Topbar />
          <div className="container-fluid">
            <div className="error-container">
              <div className="error-message">{error}</div>
              <button
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div id="wrapper">
        <Sidebar />
        <div
          id="content-wrapper"
          className="d-flex flex-column"
          style={{ flex: 1 }}
        >
          <Topbar />
          <div className="container-fluid">
            <div className="not-found-container">
              <div>Auction information not found.</div>
              <Link to="/admin/auctions" className="back-link">
                Back to list
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Content Container */}
        <div className="container-fluid auction-detail-container">
          {/* Breadcrumb */}
          <div className="detail-header">
            <div className="breadcrumb">
              <Link to="/admin/auctions">Auctions</Link>
              <ChevronRight size={16} />
              <span>Details</span>
            </div>
          </div>

          {/* Auction Header Card */}
          <div className="auction-header-card">
            <div className="auction-header-left">
              {auction.media && auction.media.length > 0 ? (
                <img
                  src={auction.thumbnailUrl || auction.media[0].url}
                  alt={auction.title}
                  className="auction-main-image"
                  onError={(e) => {
                    e.target.src = "/placeholder-image.jpg";
                  }}
                />
              ) : (
                <div className="no-image-placeholder">No image available</div>
              )}
            </div>

            <div className="auction-header-content">
              <div className="auction-title-section">
                <h3>{auction.title}</h3>
                <span
                  className={`status-badge ${
                    auction.rawData.status
                      ? auction.rawData.status.toLowerCase()
                      : "unknown"
                  }`}
                >
                  {getStatusInEnglish(auction.rawData.status || "UNKNOWN")}
                </span>
              </div>

              <div className="auction-seller-info">
                {auction.seller && (
                  <>
                    <div className="seller-tag">
                      <User size={14} />
                      <span>Seller: {auction.seller.name}</span>
                      {auction.seller.verified && (
                        <Check size={12} className="verified-icon" />
                      )}
                    </div>

                    <div className="auction-meta">
                      <div className="meta-item">
                        <Mail size={14} />
                        <span>{auction.seller.email}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Stats Cards */}
              <div className="auction-stats">
                <div className="stat-card">
                  <div className="stat-value price-value">
                    {auction.startingPrice}
                  </div>
                  <div className="stat-label">Starting Price</div>
                </div>

                <div className="stat-card">
                  <div className="stat-value increment-value">
                    {auction.incrementAmount}
                  </div>
                  <div className="stat-label">Increment Amount</div>
                </div>

                <div className="stat-card">
                  <div className="stat-value bid-value">
                    {bidStatistics
                      ? formatCurrencyFromNumber(bidStatistics.highestBid)
                      : auction.currentBid}
                  </div>
                  <div className="stat-label">Current Bid</div>
                </div>

                <div className="stat-card">
                  <div className="stat-value count-value">
                    {bidStatistics
                      ? bidStatistics.totalBids
                      : auction.bidCount || 0}
                  </div>
                  <div className="stat-label">Number of Bids</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="auction-tabs">
            <button
              className={`tab-button ${
                activeTab === "overview" ? "active" : ""
              }`}
              onClick={() => handleTabChange("overview")}
            >
              Overview
            </button>
            <button
              className={`tab-button ${
                activeTab === "deposits" ? "active" : ""
              }`}
              onClick={() => handleTabChange("deposits")}
            >
              Deposits
            </button>
            <button
              className={`tab-button ${
                activeTab === "bidHistory" ? "active" : ""
              }`}
              onClick={() => handleTabChange("bidHistory")}
            >
              Bid History
            </button>
            <button
              className={`tab-button ${
                activeTab === "winnerPayment" ? "active" : ""
              }`}
              onClick={() => handleTabChange("winnerPayment")}
            >
              Winner & Payment
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;
