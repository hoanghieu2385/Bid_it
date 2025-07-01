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
  Calculator,
  ArrowRight,
} from "lucide-react";

const AuctionDetail = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [categoryName, setCategoryName] = useState("");
  const [categoryCommissionRate, setCategoryCommissionRate] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const [bidHistory, setBidHistory] = useState([]);
  const [bidStatistics, setBidStatistics] = useState(null);
  const [highestBid, setHighestBid] = useState(null);
  const [bidLoading, setBidLoading] = useState(false);
  const [bidError, setBidError] = useState(null);

  const [userCache, setUserCache] = useState({});

  const fetchCategoryCommissionRate = async (categoryId) => {
    try {
      const categoryData = await getCategoryById(categoryId);
      console.log("Category API response:", categoryData); // ← Thêm dòng này
      return categoryData.commissionRate || categoryData.commission_rate || 0;
    } catch (error) {
      console.error("Error fetching category commission rate:", error);
      return 0;
    }
  };

  // Helper function to calculate payment details
  const calculatePaymentDetails = () => {
    const winningAmount = bidStatistics?.highestBid || auction?.rawData?.currentBid || 0;
    const commissionRate = categoryCommissionRate || 0;
    
    const commissionFee = winningAmount * (commissionRate / 100);
    const sellerAmount = winningAmount - commissionFee;
    
    return {
      winningAmount,
      commissionRate,
      commissionFee,
      sellerAmount,
    };
  };

  // Check if payment calculation should be shown
  const shouldShowPaymentCalculation = () => {
    const hasWinner = auction?.rawData?.winnerId;
    const isPaid = paymentStatus === 'SOLD' || 
                  paymentStatus === 'COMPLETED' ||
                  paymentStatus === 'SHIPPING' ||
                  paymentStatus === 'DELIVERED' ||
                  auction?.rawData?.isPaid === true;
    
    return hasWinner && isPaid;
  };


  useEffect(() => {
    const fetchAuctionDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const auctionData = await adminAuctionAPI.getAuctionById(id);

        let categoryNameResult = "";
        if (auctionData.categoryId) {
          const commission = await fetchCategoryCommissionRate(
            auctionData.categoryId
          );
          setCategoryCommissionRate(commission);
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
        setPaymentStatus(auctionData.paymentStatus || auctionData.status);

        const formattedAuction = {
          ...auctionData,
          startTime: formatDateTime(auctionData.startTime),
          endTime: formatDateTime(auctionData.endTime),
          createdAt: formatDate(auctionData.createdAt),
          updatedAt: formatDate(auctionData.updatedAt),

          startingPrice: formatCurrency(auctionData.startingPrice),
          incrementAmount: formatCurrency(auctionData.incrementAmount),
          currentBid: formatCurrency(auctionData.currentBid),
          securityDeposit: formatCurrency(auctionData.securityDeposit),

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

          media: auctionData.media || [],

          rawData: auctionData,
        };

        setAuction(formattedAuction);

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

  const fetchUserInfo = async (userId) => {
    if (userCache[userId]) {
      return userCache[userId];
    }

    try {
      const userData = await getUserById(userId);

      const fullName = [userData.firstName, userData.lastName]
        .filter((name) => name && name.trim())
        .join(" ")
        .trim();

      const userInfo = {
        name: fullName || userData.username || `User ${userId}`,
        email: userData.email || "N/A",
      };

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

      setUserCache((prev) => ({
        ...prev,
        [userId]: fallbackInfo,
      }));

      return fallbackInfo;
    }
  };

  const fetchBidData = async (auctionId) => {
    try {
      setBidLoading(true);
      setBidError(null);

      const [historyData, statisticsData, highestBidData] =
        await Promise.allSettled([
          bidAPI.getBidHistory(auctionId),
          bidAPI.getBidStatistics(auctionId),
          bidAPI.getHighestBid(auctionId),
        ]);

      if (historyData.status === "fulfilled") {
        const bids = historyData.value || [];

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

      if (statisticsData.status === "fulfilled") {
        const stats = statisticsData.value;

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
    if (!amount) return "0 $";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatCurrencyFromNumber = (amount) => {
    if (!amount && amount !== 0) return "0 $";
    return new Intl.NumberFormat("vi-VN", {
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderPaymentCalculationSection = () => {
    if (!shouldShowPaymentCalculation()) {
      return null;
    }

    const paymentDetails = calculatePaymentDetails();

    return (
      <div className="payment-calculation-section">
        <div className="section-header">
          <Calculator size={20} />
          <h4>Payment Calculation</h4>
        </div>
        
        <div className="payment-calculation-card">
          <div className="calculation-details">
            <div className="calculation-row main-amount">
              <div className="calculation-label">
                <DollarSign size={16} />
                Winning Bid Amount:
              </div>
              <div className="calculation-value primary">
                {formatCurrencyFromNumber(paymentDetails.winningAmount)}
              </div>
            </div>

            <div className="calculation-separator">
              <ArrowRight size={16} />
            </div>

            <div className="calculation-row commission-row">
              <div className="calculation-label">
                <Tag size={16} />
                Commission Fee ({categoryName} - {paymentDetails.commissionRate}%):
              </div>
              <div className="calculation-value negative">
                -{formatCurrencyFromNumber(paymentDetails.commissionFee)}
              </div>
            </div>

            <div className="calculation-divider"></div>

            <div className="calculation-row total-row">
              <div className="calculation-label">
                <Crown size={16} />
                Amount to Transfer to Seller:
              </div>
              <div className="calculation-value total-amount">
                {formatCurrencyFromNumber(paymentDetails.sellerAmount)}
              </div>
            </div>

            <div className="payment-summary">
              <div className="summary-item">
                <span className="summary-label">Commission Rate:</span>
                <span className="summary-value">{paymentDetails.commissionRate}%</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Platform Fee:</span>
                <span className="summary-value">{formatCurrencyFromNumber(paymentDetails.commissionFee)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Seller Receives:</span>
                <span className="summary-value highlight">{formatCurrencyFromNumber(paymentDetails.sellerAmount)}</span>
              </div>
            </div>

            <div className="payment-note">
              <div className="note-icon">ℹ️</div>
              <div className="note-text">
                This amount will be transferred to the seller after successful delivery confirmation.
                Commission fee is automatically deducted based on the category rate.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

            {highestBid && (
              <div className="highest-bid-info">
                <h4>
                  Current Highest Bid :{" "}
                  {formatCurrencyFromNumber(highestBid.highestBid)}
                </h4>
                <div className="highest-bid-card">
                  <div className="highest-bid-time">
                    Last updated: {formatDateTime(highestBid.timestamp)}
                  </div>
                </div>
              </div>
            )}

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

            {/* Always show payment calculation if there's bid data */}
            {renderPaymentCalculationSection()}
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
      <Sidebar />

      <div
        id="content-wrapper"
        className="d-flex flex-column"
        style={{ flex: 1 }}
      >
        <Topbar />

        <div className="container-fluid auction-detail-container">
          <div className="detail-header">
            <div className="breadcrumb">
              <Link to="/admin/auctions">Auctions</Link>
              <ChevronRight size={16} />
              <span>Details</span>
            </div>
          </div>

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

          <div className="tab-content">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;