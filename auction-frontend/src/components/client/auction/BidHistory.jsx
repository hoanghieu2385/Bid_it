import React, { useEffect, useState } from "react";
import { getAuctionBidHistory } from "../../../services/auction-api";
import { getUserByIdInternal } from "../../../services/admin-user-api";
import "../../../assets/styles/client/BidHistory.css";

const BidHistoryModal = ({ auctionId, auctionTitle, isOpen, onClose }) => {
  const [bidHistory, setBidHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userCache, setUserCache] = useState({}); // Cache user info

  useEffect(() => {
    if (isOpen && auctionId) {
      fetchBidHistory();
    }
  }, [isOpen, auctionId]);

  const fetchBidHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAuctionBidHistory(auctionId);

      // Handle different response formats
      let bidsData = data;
      if (data && typeof data === "object" && !Array.isArray(data)) {
        bidsData = data.data || data.bids || data.content || [];
      }

      if (!Array.isArray(bidsData)) {
        setBidHistory([]);
        return;
      }

      // Sort by bid time descending (newest first)
      const sortedBids = bidsData.sort(
        (a, b) =>
          new Date(b.createdAt || b.bidTime) -
          new Date(a.createdAt || a.bidTime)
      );

      // Fetch user info for each bid
      const bidsWithUserInfo = await Promise.all(
        sortedBids.map(async (bid) => {
          const userId = bid.userId || bid.bidderId;
          if (userId && !userCache[userId]) {
            try {
              const userInfo = await getUserByIdInternal(userId);
              setUserCache((prev) => ({
                ...prev,
                [userId]: userInfo,
              }));
              return {
                ...bid,
                userInfo,
              };
            } catch (error) {
              console.error(
                `Error fetching user info for user ${userId}:`,
                error
              );
              return bid;
            }
          } else if (userCache[userId]) {
            return {
              ...bid,
              userInfo: userCache[userId],
            };
          }
          return bid;
        })
      );

      setBidHistory(bidsWithUserInfo);
    } catch (err) {
      console.error("Error fetching bid history:", err);
      setError("Failed to load bid history. Please try again.");
      setBidHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return "N/A";
    }

    const numericPrice = typeof price === "string" ? parseFloat(price) : price;

    if (isNaN(numericPrice)) {
      return "N/A";
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numericPrice);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";

    try {
      return new Date(dateString).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const maskEmail = (email) => {
    if (!email) return "N/A";
    const [username, domain] = email.split("@");
    if (!username || !domain) return email;

    const maskedUsername =
      username.length > 2
        ? username.substring(0, 2) + "*".repeat(username.length - 2)
        : username;

    return `${maskedUsername}@${domain}`;
  };

  const getBidderName = (bid) => {
    // Ưu tiên lấy từ userInfo được fetch
    if (bid.userInfo) {
      const firstName = bid.userInfo.firstName || "";
      const lastName = bid.userInfo.lastName || "";
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
    }

    // Fallback to original fields
    return bid.bidderName || bid.userName || "Anonymous";
  };

  const getBidderEmail = (bid) => {
    // Ưu tiên lấy từ userInfo được fetch
    if (bid.userInfo && bid.userInfo.email) {
      return bid.userInfo.email;
    }

    // Fallback to original fields
    return bid.bidderEmail || bid.userEmail || "";
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content bid-history-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h5 className="modal-title">
            <i className="fas fa-history me-2"></i>
            Bid History - {auctionTitle}
          </h5>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-container text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="mt-2">Loading bid history...</div>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          ) : bidHistory.length === 0 ? (
            <div className="empty-state text-center py-4">
              <i className="fas fa-gavel fa-3x text-muted mb-3"></i>
              <h6 className="text-muted">No bids yet</h6>
              <p className="text-muted mb-0">
                Be the first to place a bid on this auction!
              </p>
            </div>
          ) : (
            <div className="bid-history-list">
              <div className="bid-summary mb-3">
                <div className="row">
                  <div className="col-6">
                    <div className="summary-item">
                      <span className="summary-label">Total Bids:</span>
                      <span className="summary-value">{bidHistory.length}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="summary-item">
                      <span className="summary-label">Highest Bid:</span>
                      <span className="summary-value text-success">
                        {bidHistory.length > 0
                          ? formatPrice(
                              bidHistory[0].bidAmount || bidHistory[0].amount
                            )
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Bidder</th>
                      <th scope="col">Email</th>
                      <th scope="col">Bid Amount</th>
                      <th scope="col">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bidHistory.map((bid, index) => (
                      <tr
                        key={bid.id || index}
                        className={index === 0 ? "table-success" : ""}
                      >
                        <td>
                          {index === 0 && (
                            <i
                              className="fas fa-crown text-warning me-1"
                              title="Highest Bid"
                            ></i>
                          )}
                          {index + 1}
                        </td>
                        <td>
                          <div className="bidder-info">
                            <i className="fas fa-user me-2 text-muted"></i>
                            <span className="bidder-name">
                              {getBidderName(bid)}
                            </span>
                            {bid.userInfo && (
                              <i
                                className="fas fa-check-circle text-success ms-1"
                                title="Verified User"
                              ></i>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="email-info">
                            <i className="fas fa-envelope me-2 text-muted"></i>
                            {maskEmail(getBidderEmail(bid))}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`bid-amount ${
                              index === 0 ? "text-success fw-bold" : ""
                            }`}
                          >
                            {formatPrice(bid.bidAmount || bid.amount)}
                          </span>
                        </td>
                        <td>
                          <div className="bid-time">
                            <i className="fas fa-clock me-2 text-muted"></i>
                            {formatDateTime(bid.createdAt || bid.bidTime)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            <i className="fas fa-times me-1"></i>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BidHistoryModal;
