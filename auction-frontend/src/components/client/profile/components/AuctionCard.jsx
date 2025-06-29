// src/components/client/profile/components/AuctionCard.jsx
import React, { memo, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuctionImage from './AuctionImage';
import PaymentStatusBadge from './PaymentStatusBadge';
import OrderDetailModal from './OrderDetailModal';
import { formatPrice, formatDateTime } from '../../../../utils/formatters';
import { createAuctionPayment } from '../../../../services/payment-api';
import { UserContext } from '../../../../contexts/UserContext';

const AuctionCard = ({ auction, currentUser, onShowBidHistory }) => {
  const {
    id,
    title,
    status,
    currentBid,
    startingPrice,
    userHighestBid,
    endTime,
    isWinner,
    isPaid,
    shouldShowPayButton,
    canRetryPayment,
    isPaymentCritical,
    statusColor,
    timeRemaining,
    paymentStatus
  } = auction;

  const { user } = useContext(UserContext);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const isActive = status === 'OPENED' || status === 'UPCOMING';
  const isEnded = !isActive;

  const handlePayNow = async () => {
    if (!user || !auction) return;
    setIsProcessingPayment(true);

    try {
      const paymentRequest = {
        winnerId: user.id,
        auctionId: auction.id,
        finalAmount: auction.currentBid,
        depositAmount: auction.depositAmount || 0,
        paymentMethod: "PAYPAL",
        returnUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
      };

      const data = await createAuctionPayment(paymentRequest);

      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        alert("No approval URL returned.");
      }
    } catch (err) {
      console.error("Payment creation error:", err);
      alert("Payment initiation failed:\n" + (err?.response?.data?.message || err.message));
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="participated-auction-card-horizontal">
      {/* Auction Image */}
      <div className="participated-auction-image-section">
        <AuctionImage auction={auction} />
        {/* Status badges overlay */}
        <div className="participated-status-badges-overlay">
          <span className={`participated-status-badge participated-status-${statusColor}`}>
            {status}
          </span>
          {isWinner && isEnded && status !== 'CANCELLED' && status !== 'FAILED' && (
            <span className="participated-winner-badge">
              <i className="fas fa-crown me-1"></i>
              Winner
            </span>
          )}
          <PaymentStatusBadge 
            paymentStatus={paymentStatus}
            isPaid={isPaid}
            isWinner={isWinner}
            isPaymentCritical={isPaymentCritical}
          />
        </div>
      </div>

      {/* Card Content */}
      <div className="participated-auction-content">
        {/* Top Section: Title and Description */}
        <div className="participated-auction-top-section">
          {/* Title and Status */}
          <div className="participated-auction-header">
            <h5 className="participated-auction-title-horizontal" title={title || 'Untitled Auction'}>
              {title || 'Untitled Auction'}
            </h5>
          </div>

          {/* Description */}
          <div className="participated-auction-description">
            <p className="participated-description-text">
              {auction.description || 'No description available for this auction item.'}
            </p>
          </div>
        </div>

        {/* Bottom Section: Prices, Timing, Alerts */}
        <div className="participated-auction-bottom-section">
          {/* Price Information */}
          <div className="participated-price-section-horizontal">
            <div className="participated-price-item-horizontal">
              <span className="participated-price-label-horizontal">Current Price</span>
              <span className="participated-price-value-horizontal participated-current-price">
                {formatPrice(currentBid || startingPrice)}
              </span>
            </div>
            <div className="participated-price-item-horizontal">
              <span className="participated-price-label-horizontal">Your Highest Bid</span>
              <span className="participated-price-value-horizontal participated-user-bid">
                {formatPrice(userHighestBid)}
              </span>
            </div>
          </div>

          {/* Auction Timing */}
          <div className="participated-auction-timing-horizontal">
            <i className="fas fa-clock me-2"></i>
            {isActive ? (
              <span className="participated-time-remaining">
                Time Remaining: {timeRemaining || 'Calculating...'}
              </span>
            ) : (
              <span className="participated-end-time">
                Ended: {formatDateTime(endTime)}
              </span>
            )}
          </div>

          {/* End Time for Active Auctions */}
          {isActive && (
            <div className="participated-auction-end-time">
              <i className="fas fa-calendar me-2"></i>
              <span className="participated-end-time">
                Ends: {formatDateTime(endTime)}
              </span>
            </div>
          )}

          {/* Winner Alert */}
          {isWinner && isEnded && status !== 'CANCELLED' && status !== 'FAILED' && (
            <div className="participated-winner-alert-horizontal">
              <i className="fas fa-trophy me-2"></i>
              <strong>
                {status === 'COMPLETED' ? 'Transaction completed!' :
                 status === 'DELIVERED' ? 'Item delivered!' :
                 status === 'SHIPPING' ? 'Your item is being shipped!' :
                 status === 'SOLD' ? 'Payment confirmed!' :
                 'Congratulations! You won this auction!'}
              </strong>
            </div>
          )}

          {/* Payment Alert */}
          {isPaymentCritical && (
            <div className="participated-payment-alert-horizontal">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <span>Payment action required</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="participated-auction-actions">
        <button
          className="participated-action-btn-horizontal participated-btn-secondary"
          onClick={() => onShowBidHistory(auction)}
        >
          <i className="fas fa-history me-1"></i>
          Bid History
        </button>

        {isActive && (
          <Link to={`/auctions/${id}`} className="participated-action-link-horizontal">
            <button className="participated-action-btn-horizontal participated-btn-primary">
              <i className="fas fa-gavel me-1"></i>
              Bid Now
            </button>
          </Link>
        )}

        {isWinner && isEnded && status !== 'CANCELLED' && status !== 'FAILED' && (
          <button 
            className="participated-action-btn-horizontal participated-btn-info"
            onClick={() => setShowOrderModal(true)}
          >
            <i className="fas fa-receipt me-1"></i>
            View Order
          </button>
        )}

        {shouldShowPayButton && (
          <button
            className="participated-action-btn-horizontal participated-btn-success"
            onClick={handlePayNow}
            disabled={isProcessingPayment}
          >
            <i className="fas fa-credit-card me-1"></i>
            {isProcessingPayment ? "Redirecting..." : "Pay Now"}
          </button>
        )}

        {canRetryPayment && (
          <button
            className="participated-action-btn-horizontal participated-btn-warning"
            onClick={handlePayNow}
            disabled={isProcessingPayment}
          >
            <i className="fas fa-redo me-1"></i>
            {isProcessingPayment ? "Redirecting..." : "Retry Payment"}
          </button>
        )}
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && (
        <OrderDetailModal
          auctionId={id}
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
        />
      )}
    </div>
  );
};

export default memo(AuctionCard);