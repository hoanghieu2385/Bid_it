// src/components/client/profile/components/OrderDetailModal.jsx
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getProtectedAuctionDetailById } from '../../../../services/auction-api';
import { createAuctionPayment } from '../../../../services/payment-api';
import { UserContext } from '../../../../contexts/UserContext';
import dayjs from 'dayjs';

const OrderDetailModal = ({ auctionId, isOpen, onClose }) => {
  const { user } = useContext(UserContext);
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [modalRoot, setModalRoot] = useState(null);

  // Create modal root element
  useEffect(() => {
    if (isOpen) {
      const root = document.createElement('div');
      root.id = 'auction-order-modal-root';
      root.style.position = 'fixed';
      root.style.top = '0';
      root.style.left = '0';
      root.style.right = '0';
      root.style.bottom = '0';
      root.style.zIndex = '999999';
      root.style.pointerEvents = 'auto';
      
      document.body.appendChild(root);
      setModalRoot(root);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.removeChild(root);
        document.body.style.overflow = 'unset';
        setModalRoot(null);
      };
    }
  }, [isOpen]);

  // Fetch auction data
  useEffect(() => {
    if (isOpen && auctionId) {
      fetchAuctionDetails();
    }
  }, [isOpen, auctionId]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

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

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const isWinner = user?.id === auction?.winnerId;

  if (!isOpen || !modalRoot) return null;

  const modalContent = (
    <div style={overlayStyles} onClick={handleOverlayClick}>
      <div style={contentStyles} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyles}>
          <h5 style={titleStyles}>
            📋 Order Details - {auction?.title || 'Loading...'}
          </h5>
          <button style={closeButtonStyles} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={bodyStyles}>
          {loading ? (
            <div style={loadingStyles}>
              <div style={spinnerStyles}></div>
              <div>Loading order details...</div>
            </div>
          ) : error ? (
            <div style={errorStyles}>
              ⚠️ {error}
            </div>
          ) : auction ? (
            <div style={contentLayoutStyles}>
              {/* Images Section */}
              <div style={imagesSectionStyles}>
                <div style={mainImageContainerStyles}>
                  <img 
                    src={mainImage} 
                    alt={auction.title} 
                    style={mainImageStyles}
                    onError={(e) => {
                      e.target.src = "/assets/default-thumbnail.jpg";
                    }}
                  />
                </div>
                {auction.media && auction.media.length > 1 && (
                  <div style={thumbnailsContainerStyles}>
                    {auction.media.map((item, index) => (
                      <img
                        key={index}
                        src={item.url}
                        alt={`${auction.title} ${index + 1}`}
                        style={{
                          ...thumbnailStyles,
                          border: mainImage === item.url ? '3px solid #667eea' : '2px solid transparent'
                        }}
                        onClick={() => setMainImage(item.url)}
                        onError={(e) => {
                          e.target.src = "/assets/default-thumbnail.jpg";
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div style={infoSectionStyles}>
                {/* Description */}
                <div style={sectionStyles}>
                  <h6 style={sectionTitleStyles}>📝 Description</h6>
                  <p style={descriptionStyles}>
                    {auction.description || 'No description available.'}
                  </p>
                </div>

                {/* Details */}
                <div style={detailsSectionStyles}>
                  <h6 style={sectionTitleStyles}>📊 Auction Details</h6>
                  
                  <div style={detailItemStyles}>
                    <span style={detailLabelStyles}>Status:</span>
                    <span style={{
                      ...detailValueStyles,
                      ...getStatusStyles(auction.status)
                    }}>
                      {auction.status}
                    </span>
                  </div>
                  
                  <div style={detailItemStyles}>
                    <span style={detailLabelStyles}>Final Price:</span>
                    <span style={{...detailValueStyles, color: '#28a745', fontWeight: 'bold'}}>
                      ${auction.currentBid}
                    </span>
                  </div>
                  
                  <div style={detailItemStyles}>
                    <span style={detailLabelStyles}>Auction Period:</span>
                    <span style={detailValueStyles}>
                      {dayjs(auction.startTime).format('MMM D, HH:mm')} - 
                      {dayjs(auction.endTime).format('MMM D, HH:mm')}
                    </span>
                  </div>
                  
                  {auction.shippingInfo && (
                    <div style={detailItemStyles}>
                      <span style={detailLabelStyles}>Shipping:</span>
                      <span style={detailValueStyles}>{auction.shippingInfo}</span>
                    </div>
                  )}
                </div>

                {/* Winner Section */}
                {isWinner && (
                  <div style={winnerSectionStyles}>
                    <div style={winnerBadgeStyles}>
                      🏆 <strong>You won this auction!</strong>
                    </div>
                    
                    {auction.winnerPaymentDeadline && (
                      <div style={paymentDeadlineStyles}>
                        ⏰ Payment Deadline: {dayjs(auction.winnerPaymentDeadline).format('YYYY-MM-DD HH:mm')}
                      </div>
                    )}

                    {auction.status === 'CLOSED' && !auction.isPaid && (
                      <button
                        style={payButtonStyles}
                        onClick={handlePayNow}
                        disabled={isProcessingPayment}
                      >
                        💳 {isProcessingPayment ? "Redirecting to PayPal..." : "Pay Now"}
                      </button>
                    )}

                    {(auction.status === 'SOLD' || auction.isPaid) && (
                      <div style={paymentCompleteStyles}>
                        ✅ Payment Complete
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{textAlign: 'center', padding: '40px'}}>
              <p>Auction not found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={footerStyles}>
          <button style={closeFooterButtonStyles} onClick={onClose}>
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, modalRoot);
};

// Inline styles to avoid CSS conflicts completely
const overlayStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px',
  overflowY: 'auto',
  zIndex: 999999
};

const contentStyles = {
  position: 'relative',
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  width: '90%',
  maxWidth: '1000px',
  maxHeight: '90vh',
  minHeight: '400px',
  display: 'flex',
  flexDirection: 'column',
  animation: 'modalFadeIn 0.3s ease-out'
};

const headerStyles = {
  padding: '24px',
  borderBottom: '1px solid #dee2e6',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: '12px 12px 0 0'
};

const titleStyles = {
  margin: 0,
  fontSize: '1.4rem',
  fontWeight: '600'
};

const closeButtonStyles = {
  background: 'transparent',
  border: 'none',
  color: 'white',
  fontSize: '1.5rem',
  cursor: 'pointer',
  padding: '8px',
  width: '40px',
  height: '40px',
  borderRadius: '6px',
  transition: 'background-color 0.2s'
};

const bodyStyles = {
  padding: '24px',
  overflowY: 'auto',
  flex: 1
};

const contentLayoutStyles = {
  display: 'flex',
  gap: '24px',
  flexWrap: 'wrap'
};

const imagesSectionStyles = {
  flex: '0 0 45%',
  minWidth: '300px'
};

const infoSectionStyles = {
  flex: '1',
  minWidth: '300px'
};

const mainImageContainerStyles = {
  width: '100%',
  height: '350px',
  backgroundColor: '#f8f9fa',
  borderRadius: '12px',
  overflow: 'hidden',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const mainImageStyles = {
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain'
};

const thumbnailsContainerStyles = {
  display: 'flex',
  gap: '12px',
  overflowX: 'auto',
  padding: '8px 0'
};

const thumbnailStyles = {
  width: '70px',
  height: '70px',
  objectFit: 'cover',
  borderRadius: '8px',
  cursor: 'pointer',
  flexShrink: 0,
  transition: 'transform 0.2s'
};

const sectionStyles = {
  marginBottom: '24px'
};

const sectionTitleStyles = {
  fontSize: '1.1rem',
  fontWeight: '600',
  color: '#333',
  marginBottom: '12px'
};

const descriptionStyles = {
  color: '#666',
  lineHeight: '1.6',
  fontSize: '0.95rem'
};

const detailsSectionStyles = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  borderRadius: '12px',
  marginBottom: '24px'
};

const detailItemStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: '1px solid #e9ecef'
};

const detailLabelStyles = {
  fontWeight: '600',
  color: '#6c757d',
  fontSize: '0.9rem'
};

const detailValueStyles = {
  color: '#333',
  fontWeight: '500',
  textAlign: 'right',
  maxWidth: '60%'
};

const winnerSectionStyles = {
  backgroundColor: '#e8f5e9',
  padding: '24px',
  borderRadius: '12px',
  border: '1px solid #c3e6cb'
};

const winnerBadgeStyles = {
  fontSize: '1.2rem',
  marginBottom: '16px',
  color: '#28a745'
};

const paymentDeadlineStyles = {
  backgroundColor: '#fff3cd',
  padding: '12px',
  borderRadius: '8px',
  color: '#856404',
  marginBottom: '16px'
};

const payButtonStyles = {
  backgroundColor: '#28a745',
  color: 'white',
  padding: '12px 24px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  width: '100%',
  fontSize: '1rem',
  fontWeight: '600'
};

const paymentCompleteStyles = {
  color: '#28a745',
  fontWeight: '600',
  fontSize: '1.1rem'
};

const footerStyles = {
  padding: '20px 24px',
  borderTop: '1px solid #dee2e6',
  display: 'flex',
  justifyContent: 'flex-end',
  backgroundColor: '#f8f9fa',
  borderRadius: '0 0 12px 12px'
};

const closeFooterButtonStyles = {
  padding: '10px 24px',
  borderRadius: '8px',
  fontWeight: '600',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  cursor: 'pointer'
};

const loadingStyles = {
  textAlign: 'center',
  padding: '80px 20px'
};

const spinnerStyles = {
  width: '3rem',
  height: '3rem',
  border: '3px solid #f3f3f3',
  borderTop: '3px solid #667eea',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '0 auto 16px'
};

const errorStyles = {
  backgroundColor: '#f8d7da',
  color: '#721c24',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #f5c6cb'
};

const getStatusStyles = (status) => {
  const statusMap = {
    'CLOSED': { color: '#ffc107', backgroundColor: 'rgba(255, 193, 7, 0.1)' },
    'SOLD': { color: '#28a745', backgroundColor: 'rgba(40, 167, 69, 0.1)' },
    'COMPLETED': { color: '#17a2b8', backgroundColor: 'rgba(23, 162, 184, 0.1)' },
    'SHIPPING': { color: '#007bff', backgroundColor: 'rgba(0, 123, 255, 0.1)' },
    'DELIVERED': { color: '#6f42c1', backgroundColor: 'rgba(111, 66, 193, 0.1)' }
  };
  
  return {
    ...statusMap[status] || { color: '#6c757d', backgroundColor: 'rgba(108, 117, 125, 0.1)' },
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: '600'
  };
};

export default OrderDetailModal;