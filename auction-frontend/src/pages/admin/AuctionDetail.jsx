import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";
import adminAuctionAPI from "../../services/admin-auction-api";
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
  Tag
} from "lucide-react";

const AuctionDetail = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchAuctionDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Call API to get auction information
        const auctionData = await adminAuctionAPI.getAuctionById(id);
        
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
          
          // Get seller information from user object
          seller: auctionData.user ? {
            name: auctionData.user.fullName || auctionData.user.username,
            email: auctionData.user.email,
            verified: auctionData.user.verified
          } : null,
          
          // Handle media list
          media: auctionData.media || [],
          
          // Mock data for other tabs (can create separate APIs later)
          deposits: [],
          bidHistory: [],
          disputeInfo: auctionData.status === 'DISPUTED' ? {
            reason: "Currently in dispute resolution process",
            requestedBy: "N/A",
            requestDate: "N/A",
            status: "Processing"
          } : null
        };
        
        setAuction(formattedAuction);
      } catch (error) {
        console.error('Error fetching auction detail:', error);
        setError('Unable to load auction information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAuctionDetail();
    }
  }, [id]);

  // Helper functions to format data
  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusInEnglish = (status) => {
    const statusMap = {
      'DRAFT': 'Draft',
      'OPENED': 'Open',
      'COMPLETED': 'Completed',
      'PENDING': 'Pending',
      'DELIVERED': 'Delivered',
      'DISPUTED': 'Disputed'
    };
    return statusMap[status] || status;
  };

  const getCategoryName = (categoryId) => {
    const categoryMap = {
      1: 'Luxury Watches',
      2: 'Jewelry',
      3: 'Electronics',
      4: 'Fashion',
      5: 'Cars',
      6: 'Motorcycles',
      7: 'Optical Equipment'
    };
    return categoryMap[categoryId] || `Category ${categoryId}`;
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
              <div className="detail-value">{getCategoryName(auction.categoryId)}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">Description</div>
              <div className="detail-value description">{auction.description}</div>
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
                          e.target.src = '/placeholder-image.jpg'; // Fallback image
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
          </div>
        );
      
      case "deposits":
        return (
          <div className="deposits-section">
            <h3>Security Deposits</h3>
            {auction.deposits && auction.deposits.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Bidder</th>
                    <th>Deposit Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {auction.deposits.map((deposit) => (
                    <tr key={deposit.id}>
                      <td>{deposit.userName}</td>
                      <td>{deposit.amount}</td>
                      <td>
                        <span className={`status-badge ${deposit.status.toLowerCase()}`}>
                          {deposit.status}
                        </span>
                      </td>
                      <td>{deposit.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data-message">
                No deposit information available.
              </div>
            )}
          </div>
        );
      
      case "bidHistory":
        return (
          <div className="bid-history-section">
            <h3>Bid History</h3>
            {auction.bidHistory && auction.bidHistory.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Bidder</th>
                    <th>Amount</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {auction.bidHistory.map((bid) => (
                    <tr key={bid.id}>
                      <td>{bid.userName}</td>
                      <td>{bid.amount}</td>
                      <td>{bid.date}</td>
                      <td>
                        <span className={`status-badge ${bid.status.toLowerCase()}`}>
                          {bid.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data-message">
                No bid history available.
              </div>
            )}
          </div>
        );
      
      case "winnerPayment":
        return (
          <div className="winner-payment-section">
            <h3>Winner & Payment</h3>
            {auction.winnerId ? (
              <div className="winner-info">
                <div className="detail-row">
                  <div className="detail-label">Winner:</div>
                  <div className="detail-value">ID #{auction.winnerId}</div>
                </div>
                {auction.winnerPaymentDeadline && (
                  <div className="detail-row">
                    <div className="detail-label">Payment Deadline:</div>
                    <div className="detail-value">{formatDateTime(auction.winnerPaymentDeadline)}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-data-message">
                No winner yet.
              </div>
            )}
          </div>
        );
      
      case "dispute":
        return (
          <div className="dispute-section">
            <h3>Dispute Information</h3>
            {auction.disputeInfo ? (
              <div className="dispute-card">
                <div className="dispute-header">
                  <div className="dispute-status">{auction.disputeInfo.status}</div>
                </div>
                <div className="dispute-body">
                  <div className="dispute-row">
                    <div className="dispute-label">Requested by:</div>
                    <div className="dispute-value">{auction.disputeInfo.requestedBy}</div>
                  </div>
                  <div className="dispute-row">
                    <div className="dispute-label">Request Date:</div>
                    <div className="dispute-value">{auction.disputeInfo.requestDate}</div>
                  </div>
                  <div className="dispute-row">
                    <div className="dispute-label">Reason:</div>
                    <div className="dispute-value">{auction.disputeInfo.reason}</div>
                  </div>
                  {auction.disputeRequestDeadline && (
                    <div className="dispute-row">
                      <div className="dispute-label">Dispute Deadline:</div>
                      <div className="dispute-value">{formatDateTime(auction.disputeRequestDeadline)}</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-data-message">
                No dispute information available.
              </div>
            )}
          </div>
        );
      
      case "sellerPayment":
        return (
          <div className="seller-payment-section">
            <h3>Seller Payment</h3>
            <div className="no-data-message">
              No payment information available.
            </div>
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
        <div id="content-wrapper" className="d-flex flex-column" style={{ flex: 1 }}>
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
        <div id="content-wrapper" className="d-flex flex-column" style={{ flex: 1 }}>
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
        <div id="content-wrapper" className="d-flex flex-column" style={{ flex: 1 }}>
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
      <div id="content-wrapper" className="d-flex flex-column" style={{ flex: 1 }}>
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
                    e.target.src = '/placeholder-image.jpg'; // Fallback image
                  }}
                />
              ) : (
                <div className="no-image-placeholder">
                  No image available
                </div>
              )}
            </div>
            
            <div className="auction-header-content">
              <div className="auction-title-section">
                <h3>{auction.title}</h3>
                <span className={`status-badge ${auction.status.toLowerCase()}`}>
                  {getStatusInEnglish(auction.status)}
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
                  <div className="stat-value price-value">{auction.startingPrice}</div>
                  <div className="stat-label">Starting Price</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-value increment-value">{auction.incrementAmount}</div>
                  <div className="stat-label">Increment Amount</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-value bid-value">{auction.currentBid}</div>
                  <div className="stat-label">Current Bid</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-value count-value">{auction.bidCount || 0}</div>
                  <div className="stat-label">Number of Bids</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="auction-tabs">
            <button 
              className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => handleTabChange("overview")}
            >
              Overview
            </button>
            <button 
              className={`tab-button ${activeTab === "deposits" ? "active" : ""}`}
              onClick={() => handleTabChange("deposits")}
            >
              Deposits
            </button>
            <button 
              className={`tab-button ${activeTab === "bidHistory" ? "active" : ""}`}
              onClick={() => handleTabChange("bidHistory")}
            >
              Bid History
            </button>
            <button 
              className={`tab-button ${activeTab === "winnerPayment" ? "active" : ""}`}
              onClick={() => handleTabChange("winnerPayment")}
            >
              Winner & Payment
            </button>
            <button 
              className={`tab-button ${activeTab === "dispute" ? "active" : ""}`}
              onClick={() => handleTabChange("dispute")}
            >
              Dispute
            </button>
            <button 
              className={`tab-button ${activeTab === "sellerPayment" ? "active" : ""}`}
              onClick={() => handleTabChange("sellerPayment")}
            >
              Seller Payment
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="tab-content">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;