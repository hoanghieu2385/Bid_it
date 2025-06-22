// src/components/client/profile/ParticipatedAuctions.jsx
import React, { useEffect, useState } from "react";
import { getCurrentUser } from "../../../services/user-api";
import { Link } from "react-router-dom";
import { getParticipatedAuctions } from "../../../services/auction-api";
import {
  getPaymentsByUserId,
  isAuctionPaid,
} from "../../../services/payment-api";
import BidHistoryModal from "../../../components/client/auction/BidHistory";
import "../../../assets/styles/client/profile/ParticipatedAuctions.css";

const ParticipatedAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState("all"); // all, won, active, ended

  // State for BidHistory Modal
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [isBidHistoryModalOpen, setIsBidHistoryModalOpen] = useState(false);

  useEffect(() => {
    const fetchParticipatedAuctions = async () => {
      try {
        setLoading(true);

        const user = await getCurrentUser();
        if (!user || !user.id) {
          setError("User not authenticated");
          return;
        }

        setCurrentUser(user);
        console.log("Current user:", user);

        const [participatedAuctions, payments] = await Promise.all([
          getParticipatedAuctions(user.id),
          getPaymentsByUserId(user.id).catch((err) => {
            console.warn("Failed to fetch payments:", err);
            return [];
          }),
        ]);

        console.log("Participated auctions:", participatedAuctions);
        console.log("User payments:", payments);

        // Add payment info to auctions
        const auctionsWithPaymentInfo = await Promise.all(
          participatedAuctions.map(async (auction) => {
            try {
              // Check if auction is paid
              const isPaid = await isAuctionPaid(auction.id);

              // Find auction payment for this auction
              const auctionPayment = payments.find(
                (payment) =>
                  payment.auctionId === auction.id &&
                  payment.paymentType === "AUCTION_PAYMENT"
              );

              return {
                ...auction,
                isPaid,
                auctionPayment,
                paymentStatus: auctionPayment ? auctionPayment.status : null,
              };
            } catch (err) {
              console.warn(
                `Failed to check payment for auction ${auction.id}:`,
                err
              );
              return {
                ...auction,
                isPaid: false,
                auctionPayment: null,
                paymentStatus: null,
              };
            }
          })
        );

        setAuctions(auctionsWithPaymentInfo);
      } catch (err) {
        console.error("Error fetching participated auctions:", err);
        setError(
          "Failed to load participated auctions. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchParticipatedAuctions();
  }, []);

  // Filter auctions based on selected filter
  useEffect(() => {
    let filtered = auctions;

    switch (filter) {
      case "won":
        filtered = auctions.filter((auction) => isWinner(auction, currentUser));
        break;
      case "active":
        filtered = auctions.filter((auction) => auction.status === "ACTIVE");
        break;
      case "ended":
        filtered = auctions.filter(
          (auction) =>
            auction.status === "ENDED" ||
            auction.status === "CLOSED" ||
            auction.status === "SOLD"
        );
        break;
      default:
        filtered = auctions;
    }

    setFilteredAuctions(filtered);
  }, [auctions, filter, currentUser]);

  // Handle bid history modal
  const handleShowBidHistory = (auction) => {
    setSelectedAuction(auction);
    setIsBidHistoryModalOpen(true);
  };

  const handleCloseBidHistory = () => {
    setIsBidHistoryModalOpen(false);
    setSelectedAuction(null);
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) return "N/A";
    const numericPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numericPrice)) return "N/A";
    return `$${numericPrice.toLocaleString("en-US", {
      minimumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    if (!paymentStatus) return null;

    const statusMap = {
      PENDING: { class: "bg-warning", text: "Payment Pending" },
      COMPLETED: { class: "bg-success", text: "Paid" },
      FAILED: { class: "bg-danger", text: "Payment Failed" },
      CANCELLED: { class: "bg-secondary", text: "Payment Cancelled" },
    };

    const statusInfo = statusMap[paymentStatus] || {
      class: "bg-secondary",
      text: paymentStatus,
    };
    return (
      <span className={`badge ${statusInfo.class} text-white ms-1`}>
        {statusInfo.text}
      </span>
    );
  };

  const isWinner = (auction, user) => {
    return auction.winnerId === user?.id;
  };

  // Check if notification should be shown (within 1 day of auction end)
  const shouldShowNotification = (auction) => {
    if (!auction.endTime) return false;

    const auctionEndTime = new Date(auction.endTime);
    const currentTime = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000; // 1 day in milliseconds

    return currentTime - auctionEndTime <= oneDayInMs;
  };

  // Improved logic to check if user truly won the auction
  const isValidWinner = (auction, user) => {
    // Must be the winner
    if (!isWinner(auction, user)) return false;

    // Auction must be in appropriate status (CLOSED or SOLD)
    if (!["CLOSED", "SOLD"].includes(auction.status)) return false;

    // If payment failed, not a valid winner
    if (
      auction.paymentStatus === "FAILED" ||
      auction.paymentStatus === "CANCELLED"
    ) {
      return false;
    }

    // If payment is overdue and not paid, might not be valid winner
    if (!auction.isPaid && isPaymentOverdue(auction)) {
      return false;
    }

    return true;
  };

  const isPaymentOverdue = (auction) => {
    if (!auction.winnerPaymentDeadline) return false;
    return new Date() > new Date(auction.winnerPaymentDeadline);
  };

  // Check if should show Pay Now button (winner and not paid and within payment deadline)
  const shouldShowPayNowButton = (auction, user) => {
    if (!isWinner(auction, user)) return false;
    if (auction.isPaid) return false;
    if (auction.status !== "CLOSED") return false;
    if (auction.auctionPayment?.status === "PENDING") return false;
    if (auction.paymentStatus === "CANCELLED") return false;

    // Show Pay Now button until payment deadline expires
    return !isPaymentOverdue(auction);
  };

  // Check if should show Retry Payment button
  const shouldShowRetryPaymentButton = (auction, user) => {
    if (!isWinner(auction, user)) return false;
    if (auction.isPaid) return false;
    if (auction.status !== "CLOSED") return false;

    return auction.paymentStatus === "FAILED" && !isPaymentOverdue(auction);
  };

  // Fixed image loading with proper API base URL
  const getImageUrl = (url) => {
    if (!url) return null;

    // If it's already a full URL, return as is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // If it starts with /api or similar, prepend base URL
    if (url.startsWith("/") || url.startsWith("api/")) {
      return `http://localhost:8080${url.startsWith("/") ? "" : "/"}${url}`;
    }

    // Otherwise, construct full URL
    return `http://localhost:8080/${url}`;
  };

  // Improved image error handling
  const handleImageError = (e) => {
    console.warn("Image failed to load:", e.target.src);
    e.target.style.display = "none";
    if (e.target.nextSibling) {
      e.target.nextSibling.style.display = "flex";
    }
  };

  // Improved image loading
  const handleImageLoad = (e) => {
    console.log("Image loaded successfully:", e.target.src);
    if (e.target.nextSibling) {
      e.target.nextSibling.style.display = "none";
    }
  };

  // Enhanced auction image rendering
  const renderAuctionImage = (auction) => {
    // Check if auction has media URLs
    if (auction.mediaUrls && auction.mediaUrls.length > 0) {
      const imageUrl = getImageUrl(auction.mediaUrls[0]);

      return (
        <div className="auction-image-container">
          <img
            src={imageUrl}
            className="card-img-top auction-image"
            alt={auction.title}
            onError={handleImageError}
            onLoad={handleImageLoad}
            crossOrigin="anonymous"
          />
          <div
            className="auction-image-placeholder"
            style={{ display: "none" }}
          >
            <i className="fas fa-image"></i>
            <span>No Image</span>
          </div>
        </div>
      );
    }

    // Check if auction has media array (alternative structure)
    if (auction.media && auction.media.length > 0) {
      const media = auction.media[0];
      const imageUrl = getImageUrl(media.url || media.mediaUrl);

      return (
        <div className="auction-image-container">
          <img
            src={imageUrl}
            className="card-img-top auction-image"
            alt={auction.title}
            onError={handleImageError}
            onLoad={handleImageLoad}
            crossOrigin="anonymous"
          />
          <div
            className="auction-image-placeholder"
            style={{ display: "none" }}
          >
            <i className="fas fa-image"></i>
            <span>No Image</span>
          </div>
        </div>
      );
    }

    // No image available
    return (
      <div className="auction-image-placeholder">
        <i className="fas fa-image"></i>
        <span>No Image Available</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="participated-auctions">
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-2">Loading auction history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="participated-auctions">
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  if (auctions.length === 0) {
    return (
      <div className="participated-auctions">
        <div className="empty-state">
          <i className="fas fa-gavel fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">No auctions participated yet</h5>
          <p className="text-muted">
            You haven't placed any bids in any auction sessions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="participated-auctions">
      <div className="page-header text-center">
        <h4>
          <i className="fas fa-history me-2"></i>
          Participated Auctions
        </h4>
        <p className="mb-0">
          Track your auction participation and bidding history
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="filter-section">
        <h6>Filter auctions by status:</h6>
        <div className="d-flex flex-wrap">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({auctions.length})
          </button>
          <button
            className={`filter-btn ${filter === "won" ? "active" : ""}`}
            onClick={() => setFilter("won")}
          >
            <i className="fas fa-trophy me-1"></i>
            Won (
            {currentUser
              ? auctions.filter((a) => isValidWinner(a, currentUser)).length
              : 0}
            )
          </button>
          <button
            className={`filter-btn ${filter === "active" ? "active" : ""}`}
            onClick={() => setFilter("active")}
          >
            <i className="fas fa-play-circle me-1"></i>
            Active ({auctions.filter((a) => a.status === "ACTIVE").length})
          </button>
          <button
            className={`filter-btn ${filter === "ended" ? "active" : ""}`}
            onClick={() => setFilter("ended")}
          >
            <i className="fas fa-stop-circle me-1"></i>
            Ended (
            {
              auctions.filter(
                (a) =>
                  a.status === "ENDED" ||
                  a.status === "CLOSED" ||
                  a.status === "SOLD"
              ).length
            }
            )
          </button>
        </div>
      </div>

      <div className="row">
        {filteredAuctions.map((auction) => (
          <div key={auction.id} className="col-md-6 col-lg-4 mb-4">
            <div className="auction-card card h-100">
              {/* Auction Image */}
              {renderAuctionImage(auction)}

              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h6 className="auction-title" title={auction.title}>
                    {auction.title}
                  </h6>
                  <div className="d-flex flex-wrap gap-1">
                    <span
                      className={`status-badge status-${auction.status?.toLowerCase()}`}
                    >
                      {auction.status}
                    </span>
                    {getPaymentStatusBadge(auction.paymentStatus)}
                  </div>
                </div>

                {/* Price Section */}
                <div className="price-section">
                  <div className="row">
                    <div className="col-6">
                      <div className="price-label">Current Price</div>
                      <div className="price-value price-current">
                        {formatPrice(
                          auction.currentBid || auction.startingPrice
                        )}
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="price-label">Your Highest Bid</div>
                      <div className="price-value price-bid">
                        {formatPrice(auction.userHighestBid)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Auction Meta */}
                <div className="auction-meta">
                  <div className="mt-1">
                    <i className="fas fa-clock me-1"></i>
                    Ends: {formatDate(auction.endTime)}
                  </div>
                </div>

                {/* Winner Status - Only show within 1 day of auction end */}
                {currentUser &&
                  isValidWinner(auction, currentUser) &&
                  shouldShowNotification(auction) && (
                    <div className="winner-alert">
                      <i className="fas fa-trophy me-2"></i>
                      <strong>Congratulations! You won this auction!</strong>
                    </div>
                  )}

                {/* Payment Failed or Cancelled Alert - Only show within 1 day */}
                {currentUser &&
                  isWinner(auction, currentUser) &&
                  (auction.paymentStatus === "FAILED" ||
                    auction.paymentStatus === "CANCELLED") &&
                  shouldShowNotification(auction) && (
                    <div className="alert alert-danger small mt-2">
                      <i className="fas fa-exclamation-triangle me-1"></i>
                      Payment {auction.paymentStatus.toLowerCase()}. Auction win
                      may be forfeited.
                    </div>
                  )}

                {/* Payment Overdue Alert - Only show within 1 day */}
                {currentUser &&
                  isWinner(auction, currentUser) &&
                  !auction.isPaid &&
                  isPaymentOverdue(auction) &&
                  shouldShowNotification(auction) && (
                    <div className="alert alert-warning small mt-2">
                      <i className="fas fa-clock me-1"></i>
                      Payment overdue. Please complete payment to secure your
                      win.
                    </div>
                  )}

                {/* Payment Information for Winners */}
                {currentUser &&
                  isWinner(auction, currentUser) &&
                  auction.status === "CLOSED" && (
                    <div
                      className={`payment-info ${
                        auction.isPaid
                          ? "paid"
                          : isPaymentOverdue(auction)
                          ? "overdue"
                          : ""
                      }`}
                    >
                      <h6 className="mb-2">
                        <i className="fas fa-credit-card me-1"></i>
                        Payment Status
                      </h6>

                      {auction.isPaid ? (
                        <div className="text-success">
                          <i className="fas fa-check-circle me-1"></i>
                          Payment completed successfully
                        </div>
                      ) : (
                        <div>
                          {auction.winnerPaymentDeadline && (
                            <div className="payment-deadline">
                              <i
                                className={`fas ${
                                  isPaymentOverdue(auction)
                                    ? "fa-exclamation-triangle"
                                    : "fa-clock"
                                } me-1`}
                              ></i>
                              Deadline:{" "}
                              {formatDate(auction.winnerPaymentDeadline)}
                              {isPaymentOverdue(auction) && (
                                <span className="ms-2 text-danger fw-bold">
                                  (OVERDUE)
                                </span>
                              )}
                            </div>
                          )}

                          {auction.auctionPayment?.status === "PENDING" ? (
                            <div className="text-info">
                              <i className="fas fa-hourglass-half me-1"></i>
                              Payment processing...
                            </div>
                          ) : auction.paymentStatus === "FAILED" ? (
                            <div className="text-danger">
                              <i className="fas fa-times-circle me-1"></i>
                              Payment failed - please retry
                            </div>
                          ) : (
                            <div className="text-warning">
                              <i className="fas fa-exclamation-circle me-1"></i>
                              Payment required to complete purchase
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
              </div>

              <div className="card-footer">
                <div className="d-flex justify-content-between gap-2">
                  <button
                    className="action-btn btn-view"
                    onClick={() => handleShowBidHistory(auction)}
                  >
                    Bid history
                  </button>

                  {auction.status === "ACTIVE" && (
                    <button
                      className="action-btn btn-bid"
                      onClick={() =>
                        (window.location.href = `/auctions/${auction.id}`)
                      }
                    >
                      Bid Now
                    </button>
                  )}

                  {currentUser &&
                    isWinner(auction, currentUser) &&
                    ["CLOSED", "SOLD"].includes(auction.status) && (
                      <Link
                        to={`/orders/${auction.id}`}
                        className="participated-order-link"
                      >
                        <button className="action-btn participated-btn-order">
                          View Order
                        </button>
                      </Link>
                    )}

                  {/* Pay Now Button - Show immediately when won and not paid */}
                  {currentUser &&
                    shouldShowPayNowButton(auction, currentUser) && (
                      <button
                        className={`action-btn btn-pay ${
                          isPaymentOverdue(auction) ? "overdue" : ""
                        }`}
                        onClick={() =>
                          (window.location.href = `/payment/auction/${auction.id}`)
                        }
                      >
                        Pay Now
                      </button>
                    )}

                  {/* Retry Payment Button for Failed Payments */}
                  {currentUser &&
                    shouldShowRetryPaymentButton(auction, currentUser) && (
                      <button
                        className="action-btn btn-retry"
                        onClick={() =>
                          (window.location.href = `/payment/auction/${auction.id}`)
                        }
                      >
                        Retry Payment
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="stats-section">
        <h6>
          <i className="fas fa-chart-bar me-2"></i>
          Participation Statistics
        </h6>
        <div className="row">
          <div className="col-md-3 col-sm-6">
            <div className="stat-item">
              <div className="stat-value text-primary">
                {filteredAuctions.length}
              </div>
              <div className="stat-label">Total Auctions</div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="stat-item">
              <div className="stat-value text-success">
                {currentUser
                  ? filteredAuctions.filter((a) =>
                      isValidWinner(a, currentUser)
                    ).length
                  : 0}
              </div>
              <div className="stat-label">Auctions Won</div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="stat-item">
              <div className="stat-value text-warning">
                {filteredAuctions.filter((a) => a.status === "ACTIVE").length}
              </div>
              <div className="stat-label">Currently Active</div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="stat-item">
              <div className="stat-value text-info">
                {filteredAuctions.reduce(
                  (total, auction) => total + (auction.userBidCount || 0),
                  0
                )}
              </div>
              <div className="stat-label">Total Bids</div>
            </div>
          </div>
        </div>

        {currentUser && (
          <div className="row mt-3 pt-3 border-top">
            <div className="col-md-4">
              <div className="stat-item">
                <div className="stat-value text-success">
                  {
                    auctions.filter((a) => isWinner(a, currentUser) && a.isPaid)
                      .length
                  }
                </div>
                <div className="stat-label">Paid Auctions</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-item">
                <div className="stat-value text-warning">
                  {
                    auctions.filter(
                      (a) =>
                        isWinner(a, currentUser) &&
                        a.status === "CLOSED" &&
                        !a.isPaid &&
                        !isPaymentOverdue(a) &&
                        a.paymentStatus !== "FAILED" &&
                        a.paymentStatus !== "CANCELLED"
                    ).length
                  }
                </div>
                <div className="stat-label">Pending Payment</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-item">
                <div className="stat-value text-danger">
                  {
                    auctions.filter(
                      (a) =>
                        isWinner(a, currentUser) &&
                        a.status === "CLOSED" &&
                        !a.isPaid &&
                        (isPaymentOverdue(a) ||
                          a.paymentStatus === "FAILED" ||
                          a.paymentStatus === "CANCELLED")
                    ).length
                  }
                </div>
                <div className="stat-label">Failed/Overdue</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bid History Modal */}
      {selectedAuction && (
        <BidHistoryModal
          auctionId={selectedAuction.id}
          auctionTitle={selectedAuction.title}
          isOpen={isBidHistoryModalOpen}
          onClose={handleCloseBidHistory}
        />
      )}
    </div>
  );
};

export default ParticipatedAuctions;
