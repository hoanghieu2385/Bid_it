// src/components/client/profile/components/AuctionStats.jsx
import React, { memo } from 'react';

const AuctionStats = ({ auctions, filteredAuctions, currentUser }) => {
  const stats = {
    total: filteredAuctions.length,
    won: auctions.filter(a => a.isWinner && ['CLOSED', 'SOLD', 'SHIPPING', 'DELIVERED', 'COMPLETED'].includes(a.status)).length,
    active: auctions.filter(a => a.status === 'OPENED' || a.status === 'UPCOMING').length,
    totalBids: auctions.reduce((sum, a) => sum + (a.userBidCount || 0), 0),
    paid: auctions.filter(a => a.isWinner && a.isPaid).length,
    pendingPayment: auctions.filter(a => 
      a.isWinner && 
      a.status === 'CLOSED' && 
      !a.isPaid && 
      !a.isPaymentOverdue &&
      a.paymentStatus !== 'FAILED'
    ).length,
    paymentIssues: auctions.filter(a => 
      a.isWinner && 
      !a.isPaid && 
      (a.isPaymentOverdue || a.paymentStatus === 'FAILED')
    ).length
  };

  return (
    <div className="participated-auction-statistics">
      <div className="participated-statistics-header">
        <h6>
          <i className="fas fa-chart-bar me-2"></i>
          Participation Statistics
        </h6>
      </div>
      
      <div className="participated-statistics-grid">
        <div className="participated-statistics-item">
          <div className="participated-statistics-value text-primary">{stats.total}</div>
          <div className="participated-statistics-label">Shown Auctions</div>
        </div>
        
        <div className="participated-statistics-item">
          <div className="participated-statistics-value text-success">{stats.won}</div>
          <div className="participated-statistics-label">Auctions Won</div>
        </div>
        
        <div className="participated-statistics-item">
          <div className="participated-statistics-value text-warning">{stats.active}</div>
          <div className="participated-statistics-label">Currently Active</div>
        </div>
        
        <div className="participated-statistics-item">
          <div className="participated-statistics-value text-info">{stats.totalBids}</div>
          <div className="participated-statistics-label">Total Bids</div>
        </div>

        {currentUser && stats.won > 0 && (
          <>
            <div className="participated-statistics-item">
              <div className="participated-statistics-value text-success">{stats.paid}</div>
              <div className="participated-statistics-label">Paid Auctions</div>
            </div>
            
            <div className="participated-statistics-item">
              <div className="participated-statistics-value text-warning">{stats.pendingPayment}</div>
              <div className="participated-statistics-label">Pending Payment</div>
            </div>
            
            {stats.paymentIssues > 0 && (
              <div className="participated-statistics-item">
                <div className="participated-statistics-value text-danger">{stats.paymentIssues}</div>
                <div className="participated-statistics-label">Payment Issues</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default memo(AuctionStats);