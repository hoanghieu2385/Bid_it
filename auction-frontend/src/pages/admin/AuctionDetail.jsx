import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
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
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Giả lập việc gọi API dựa trên model Auction và Media
    const fetchAuctionDetail = () => {
      setTimeout(() => {
        // Mock data dựa trên model Auction.java và các field
        const mockAuction = {
          id: 1,
          title: "Brand New royal Enfield 250 CC For Sale",
          description: `How can have anything you ant in life if you ?
If you've been following the crypto space, you're likely heard of Non-Fungible Tokens (Biddings), more popularly referred to as "Crypto Collectibles." The world of Biddings is growing rapidly. It seems there is no slowing down of these assets as they continue to go up in price. This growth comes with the opportunity for people to start new businesses to create and capture value. The market is open for players in every kind of field. Are you a collector?

But getting your own auction site up and running has always required learning complex coding languages, or hiring an expensive design firm for thousands of dollars and months of work.

• Amet consectetur adipiscing elit. Maxime reprehenderit quaerat, veli rem atque vel impedit Expedita Design.
• Consectetur adipiscing elit. Maxime reprehenderit quaerat
• Fuga itaque veniam, qui temporibus atque adipisci iste rerum...`,
          sellerId: 123,
          seller: {
            name: "Christopher Anderson",
            email: "christopher.anderson@example.com",
            verified: true
          },
          categoryId: 6,
          category: "Motorcycles",
          
          // Thời gian
          startTime: "23 Jul 2024 - 02:01",
          endTime: "23 Jul 2024 - 09:15",
          createdAt: "20 Jul 2024",
          updatedAt: "22 Jul 2024",
          
          // Giá
          startingPrice: "60.000.000 đ",
          incrementAmount: "1.000.000 đ",
          currentBid: "65.000.000 đ",
          securityDeposit: "3.000.000 đ",
          
          // Thông tin đấu giá
          requiresDeposit: true,
          status: "DISPUTED",
          bidCount: 5,
          
          // Người thắng
          winnerId: null,
          winnerPaymentDeadline: null,
          disputeRequestDeadline: null,
          
          // Danh sách ảnh (dựa trên model Media.java)
          media: [
            {
              id: 1,
              auctionId: 1,
              url: "/auction-images/enfield-main.jpg",
              format: "jpg",
              resourceType: "image",
              isThumbnail: true
            },
            {
              id: 2,
              auctionId: 1,
              url: "/auction-images/enfield-side.jpg",
              format: "jpg",
              resourceType: "image",
              isThumbnail: false
            },
            {
              id: 3,
              auctionId: 1,
              url: "/auction-images/enfield-front.jpg",
              format: "jpg",
              resourceType: "image",
              isThumbnail: false
            },
            {
              id: 4,
              auctionId: 1,
              url: "/auction-images/enfield-engine.jpg",
              format: "jpg",
              resourceType: "image",
              isThumbnail: false
            },
            {
              id: 5,
              auctionId: 1,
              url: "/auction-images/enfield-meter.jpg",
              format: "jpg",
              resourceType: "image",
              isThumbnail: false
            },
            {
              id: 6,
              auctionId: 1,
              url: "/auction-images/enfield-wheel.jpg",
              format: "jpg",
              resourceType: "image",
              isThumbnail: false
            },
            {
              id: 7,
              auctionId: 1,
              url: "/auction-images/enfield-tank.jpg",
              format: "jpg",
              resourceType: "image",
              isThumbnail: false
            },
            {
              id: 8,
              auctionId: 1,
              url: "/auction-images/enfield-light.jpg",
              format: "jpg",
              resourceType: "image",
              isThumbnail: false
            },
            {
              id: 9,
              auctionId: 1,
              url: "/auction-images/enfield-break.jpg",
              format: "jpg",
              resourceType: "image",
              isThumbnail: false
            },
            {
              id: 10,
              auctionId: 1,
              url: "/auction-images/enfield-seat.jpg",
              format: "jpg",
              resourceType: "image",
              isThumbnail: false
            }
          ],
          
          // Mock data cho các tab khác
          deposits: [
            {
              id: 1,
              userId: 456,
              userName: "Nguyen Van A",
              amount: "3.000.000 đ",
              status: "Approved",
              date: "22 Jul 2024 - 14:30"
            },
            {
              id: 2,
              userId: 789,
              userName: "Tran Van B",
              amount: "3.000.000 đ",
              status: "Approved",
              date: "22 Jul 2024 - 15:45"
            }
          ],
          bidHistory: [
            {
              id: 1,
              userId: 789,
              userName: "Tran Van B",
              amount: "65.000.000 đ",
              date: "23 Jul 2024 - 03:45",
              status: "Active"
            },
            {
              id: 2,
              userId: 456,
              userName: "Nguyen Van A",
              amount: "64.000.000 đ",
              date: "23 Jul 2024 - 03:15",
              status: "Outbid"
            },
            {
              id: 3,
              userId: 789,
              userName: "Tran Van B",
              amount: "63.000.000 đ",
              date: "22 Jul 2024 - 18:30",
              status: "Outbid"
            },
            {
              id: 4,
              userId: 456,
              userName: "Nguyen Van A",
              amount: "62.000.000 đ",
              date: "22 Jul 2024 - 16:20",
              status: "Outbid"
            },
            {
              id: 5,
              userId: 789,
              userName: "Tran Van B",
              amount: "61.000.000 đ",
              date: "22 Jul 2024 - 15:50",
              status: "Outbid"
            }
          ],
          disputeInfo: {
            reason: "Tranh chấp về tình trạng xe",
            requestedBy: "Tran Van B",
            requestDate: "23 Jul 2024 - 10:20",
            status: "Đang xử lý"
          }
        };
        
        setAuction(mockAuction);
        setLoading(false);
      }, 800);
    };

    fetchAuctionDetail();
  }, [id]);

  // Xử lý chuyển tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Component hiển thị nội dung các tab
  const renderTabContent = () => {
    if (!auction) return null;

    switch (activeTab) {
      case "overview":
        return (
          <div className="auction-details">
            <h3>Auction Details</h3>
            
            <div className="detail-row">
              <div className="detail-label">Listing ID</div>
              <div className="detail-value">#{auction.id}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">Title</div>
              <div className="detail-value">{auction.title}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">Category</div>
              <div className="detail-value">{auction.category}</div>
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
              <div className="detail-label">Media</div>
              <div className="detail-value media-grid">
                {auction.media.map((item) => (
                  <div className="media-item" key={item.id}>
                    <img src={item.url} alt={`Image ${item.id}`} />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">Starting Price</div>
              <div className="detail-value">{auction.startingPrice}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">Increment Amount</div>
              <div className="detail-value">{auction.incrementAmount}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">Deposit</div>
              <div className="detail-value">{auction.securityDeposit}</div>
            </div>
          </div>
        );
      
      case "deposits":
        return (
          <div className="deposits-section">
            <h3>Security Deposits</h3>
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
          </div>
        );
      
      case "bidHistory":
        return (
          <div className="bid-history-section">
            <h3>Bid History</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bidder</th>
                  <th>Bid Amount</th>
                  <th>Date & Time</th>
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
          </div>
        );
      
      case "winnerPayment":
        return (
          <div className="winner-payment-section">
            <h3>Winner & Payment</h3>
            <div className="no-data-message">
              No winner has been declared yet.
            </div>
          </div>
        );
      
      case "dispute":
        return (
          <div className="dispute-section">
            <h3>Dispute Information</h3>
            <div className="dispute-card">
              <div className="dispute-header">
                <div className="dispute-status">{auction.disputeInfo.status}</div>
              </div>
              <div className="dispute-body">
                <div className="dispute-row">
                  <div className="dispute-label">Requested By:</div>
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
              </div>
            </div>
          </div>
        );
      
      case "sellerPayment":
        return (
          <div className="seller-payment-section">
            <h3>Seller Payment</h3>
            <div className="no-data-message">
              No payment has been processed yet.
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
              <div>Đang tải thông tin đấu giá...</div>
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
              <span>Detail</span>
            </div>
            
            <h2>Detail</h2>
          </div>
          
          {/* Auction Header Card */}
          <div className="auction-header-card">
            <div className="auction-header-left">
              <img 
                src={auction.media[0].url} 
                alt={auction.title} 
                className="auction-main-image" 
              />
            </div>
            
            <div className="auction-header-content">
              <div className="auction-title-section">
                <h3>{auction.title}</h3>
                <span className={`status-badge ${auction.status.toLowerCase()}`}>
                  {auction.status}
                </span>
              </div>
              
              <div className="auction-seller-info">
                <div className="seller-tag">
                  <User size={14} />
                  <span>Seller: {auction.seller.name}</span>
                </div>
                
                <div className="auction-meta">
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>Đang Đấu thầu: {id} giờ</span>
                  </div>
                  
                  <div className="meta-item">
                    <Mail size={14} />
                    <span>{auction.seller.email}</span>
                  </div>
                </div>
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
                  <div className="stat-value count-value">{auction.bidCount}</div>
                  <div className="stat-label">Bid Count</div>
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