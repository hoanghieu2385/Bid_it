// src/components/client/profile/ParticipatedAuctionsNew.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useParticipatedAuctions } from '../../../hooks/useParticipatedAuctions';
import useToastMessage from '../../../hooks/useToastMessage';
import BidHistoryModal from '../auction/BidHistory';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorAlert from '../../common/ErrorAlert';
import EmptyState from '../../common/EmptyState';
import AuctionFilters from './components/AuctionFilters';
import AuctionCard from './components/AuctionCard';
import AuctionStats from './components/AuctionStats';
import '../../../assets/styles/client/profile/ParticipatedAuctionsNew.css';

const ParticipatedAuctionsNew = () => {
  // Data fetching with custom hook
  const {
    auctions,
    loading,
    error,
    currentUser,
    refetch
  } = useParticipatedAuctions();

  // Local state
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [showBidHistory, setShowBidHistory] = useState(false);

  // Toast notifications
  const toast = useToastMessage();

  // Memoized filtered auctions
  const filteredAuctions = useMemo(() => {
    if (!auctions.length) return [];

    switch (activeFilter) {
      case 'won':
        return auctions.filter(auction => 
          auction.winnerId === currentUser?.id && 
          ['CLOSED', 'SOLD', 'SHIPPING', 'DELIVERED', 'COMPLETED'].includes(auction.status)
        );
      case 'active':
        return auctions.filter(auction => 
          auction.status === 'OPENED' || auction.status === 'UPCOMING'
        );
      case 'ended':
        return auctions.filter(auction => 
          ['CLOSED', 'SOLD', 'EXPIRED_PAYMENT', 'FAILED', 'CANCELLED', 
           'SHIPPING', 'DELIVERED', 'DISPUTED', 'PENDING_RETURN', 
           'RETURNING', 'COMPLETED'].includes(auction.status)
        );
      default:
        return auctions;
    }
  }, [auctions, activeFilter, currentUser?.id]);

  // Memoized filter counts
  const filterCounts = useMemo(() => {
    if (!auctions.length) return { all: 0, won: 0, active: 0, ended: 0 };

    return {
      all: auctions.length,
      won: auctions.filter(a => 
        a.winnerId === currentUser?.id && 
        ['CLOSED', 'SOLD', 'SHIPPING', 'DELIVERED', 'COMPLETED'].includes(a.status)
      ).length,
      active: auctions.filter(a => 
        a.status === 'OPENED' || a.status === 'UPCOMING'
      ).length,
      ended: auctions.filter(a => 
        ['CLOSED', 'SOLD', 'EXPIRED_PAYMENT', 'FAILED', 'CANCELLED',
         'SHIPPING', 'DELIVERED', 'DISPUTED', 'PENDING_RETURN', 
         'RETURNING', 'COMPLETED'].includes(a.status)
      ).length
    };
  }, [auctions, currentUser?.id]);

  // Handlers
  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
  }, []);

  const handleShowBidHistory = useCallback((auction) => {
    setSelectedAuction(auction);
    setShowBidHistory(true);
  }, []);

  const handleCloseBidHistory = useCallback(() => {
    setShowBidHistory(false);
    setSelectedAuction(null);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
    toast.showInfo('Refreshing auction data...');
  }, [refetch, toast]);

  // Error retry handler
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Loading state
  if (loading) {
    return (
      <div className="participated-auctions-new">
        <LoadingSpinner 
          message="Loading your auction history..." 
          size="lg"
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="participated-auctions-new">
        <ErrorAlert 
          message={error}
          onRetry={handleRetry}
          showRetry
        />
      </div>
    );
  }

  // Empty state
  if (!auctions.length) {
    return (
      <div className="participated-auctions-new">
        <EmptyState
          icon="fas fa-gavel"
          title="No Auction Participation Yet"
          description="You haven't placed any bids in auction sessions. Start bidding to see your participation history here!"
          actionText="Browse Auctions"
          actionLink="/auctions"
        />
      </div>
    );
  }

  return (
    <div className="participated-auctions-new">
      {/* Page Header */}
      <div className="participated-page-header">
        <div className="participated-header-content">
          <div className="participated-header-text">
            <h2>
              <i className="fas fa-history me-2"></i>
              Participated Auctions
            </h2>
            <p className="participated-header-description">
              Track your auction participation and bidding history
            </p>
          </div>
          <button 
            className="participated-refresh-btn"
            onClick={handleRefresh}
            disabled={loading}
          >
            <i className="fas fa-sync-alt me-1"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <AuctionFilters
        activeFilter={activeFilter}
        filterCounts={filterCounts}
        onFilterChange={handleFilterChange}
      />

      {/* Results Count */}
      <div className="participated-results-info">
        <span className="participated-results-count">
          Showing {filteredAuctions.length} of {auctions.length} auctions
        </span>
      </div>

      {/* Auction List */}
      {filteredAuctions.length > 0 ? (
        <div className="participated-auction-list">
          {filteredAuctions.map(auction => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              currentUser={currentUser}
              onShowBidHistory={handleShowBidHistory}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="fas fa-filter"
          title={`No ${activeFilter === 'all' ? '' : activeFilter} auctions found`}
          description="Try adjusting your filters to see more results."
          size="sm"
        />
      )}

      {/* Statistics */}
      <AuctionStats 
        auctions={auctions}
        filteredAuctions={filteredAuctions}
        currentUser={currentUser}
      />

      {/* Bid History Modal */}
      {selectedAuction && (
        <BidHistoryModal
          auctionId={selectedAuction.id}
          auctionTitle={selectedAuction.title}
          isOpen={showBidHistory}
          onClose={handleCloseBidHistory}
        />
      )}
    </div>
  );
};

export default ParticipatedAuctionsNew;