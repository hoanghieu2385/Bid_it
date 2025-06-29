// src/components/client/profile/components/OrderDetailModal.jsx
import React, { useEffect, useState, useContext } from 'react';
import { getProtectedAuctionDetailById } from '../../../../services/auction-api';
import { createAuctionPayment } from '../../../../services/payment-api';
import { UserContext } from '../../../../contexts/UserContext';
import dayjs from 'dayjs';
import '../../../../assets/styles/client/profile/OrderDetailModal.css';

const OrderDetailModal = ({ auctionId, isOpen, onClose }) => {
  const { user } = useContext(UserContext);
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (isOpen && auctionId) {
      // Add class to body to prevent hover issues
      document.body.classList.add('modal-open');
      fetchAuctionDetails();
    }

    // Cleanup function
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, auctionId]);

  const fetchAuctionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProtectedAuctionDetailById(auctionId);
      setAuction(data);
      setMainImage(data.thumbnailUrl || data.media?.[0]?.url || "/assets/default-thumbnail.jpg");
    } catch (err) {
      console.error('Error fetching auction details:', err);
      setError('Unable to load order details.');
    } finally {
      setLoading(false);
    }
  };

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

  if (!isOpen) return null;

  const isWinner = user?.id === auction?.winnerId;

  return (
    <>
      {isOpen && (
        <div className="order-modal-container">
          <div className="order-modal-overlay" onClick={onClose}>
            <div className="order-modal-content" onClick={e => e.stopPropagation()}>
              <div className="order-modal-header">
                <h5 className="order-modal-title">
                  <i className="fas fa-receipt me-2"></i>
                  Order Details - {auction?.title || 'Loading...'}
                </h5>
                <button 
                  type="button" 
                  className="order-modal-close" 
                  onClick={onClose}
                  aria-label="Close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="order-modal-body">
                {loading ? (
                  <div className="loading-container text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="mt-2">Loading order details...</div>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                ) : auction ? (
                  <div className="order-detail-content">
                    <div className="row">
                      {/* Images Section */}
                      <div className="col-md-6">
                        <div className="order-images-section">
                          <div className="main-image-container">
                            <img 
                              src={mainImage} 
                              alt={auction.title} 
                              className="main-image"
                            />
                          </div>
                          {auction.media && auction.media.length > 1 && (
                            <div className="thumbnails-container">
                              {auction.media.map((item, index) => (
                                <img
                                  key={index}
                                  src={item.url}
                                  alt={`${auction.title} ${index + 1}`}
                                  className={`thumbnail ${mainImage === item.url ? 'active' : ''}`}
                                  onClick={() => setMainImage(item.url)}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Info Section */}
                      <div className="col-md-6">
                        <div className="order-info-section">
                          {/* Description */}
                          <div className="description-section mb-4">
                            <h6 className="section-title">Description</h6>
                            <p className="description-text">
                              {auction.description || 'No description available.'}
                            </p>
                          </div>

                          {/* Details */}
                          <div className="details-section mb-4">
                            <h6 className="section-title">Auction Details</h6>
                            <div className="detail-item">
                              <span className="detail-label">Status:</span>
                              <span className={`detail-value status-${auction.status.toLowerCase()}`}>
                                {auction.status}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Final Price:</span>
                              <span className="detail-value text-success fw-bold">
                                ${auction.currentBid}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Auction Period:</span>
                              <span className="detail-value">
                                {dayjs(auction.startTime).format('MMM D, HH:mm')} - 
                                {dayjs(auction.endTime).format('MMM D, HH:mm')}
                              </span>
                            </div>
                            {auction.shippingInfo && (
                              <div className="detail-item">
                                <span className="detail-label">Shipping:</span>
                                <span className="detail-value">{auction.shippingInfo}</span>
                              </div>
                            )}
                          </div>

                          {/* Winner Section */}
                          {isWinner && (
                            <div className="winner-section">
                              <div className="winner-badge mb-3">
                                <i className="fas fa-trophy text-warning me-2"></i>
                                <span className="text-success fw-bold">
                                  You won this auction!
                                </span>
                              </div>
                              
                              {auction.winnerPaymentDeadline && (
                                <div className="payment-deadline mb-3">
                                  <i className="fas fa-clock text-warning me-2"></i>
                                  <span>
                                    Payment Deadline: {dayjs(auction.winnerPaymentDeadline).format('YYYY-MM-DD HH:mm')}
                                  </span>
                                </div>
                              )}

                              {auction.status === 'CLOSED' && !auction.isPaid && (
                                <button
                                  className="btn btn-success w-100"
                                  onClick={handlePayNow}
                                  disabled={isProcessingPayment}
                                >
                                  <i className="fas fa-credit-card me-2"></i>
                                  {isProcessingPayment ? "Redirecting to PayPal..." : "Pay Now"}
                                </button>
                              )}

                              {(auction.status === 'SOLD' || auction.isPaid) && (
                                <div className="payment-complete text-success">
                                  <i className="fas fa-check-circle me-2"></i>
                                  <span>Payment Complete</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p>Auction not found</p>
                  </div>
                )}
              </div>

              <div className="order-modal-footer">
                <button 
                  type="button" 
                  className="order-btn order-btn-secondary" 
                  onClick={onClose}
                >
                  <i className="fas fa-times me-1"></i>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetailModal;