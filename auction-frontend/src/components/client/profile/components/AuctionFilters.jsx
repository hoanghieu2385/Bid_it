// src/components/client/profile/components/AuctionFilters.jsx
import React from 'react';

const AuctionFilters = ({ activeFilter, filterCounts, onFilterChange }) => {
  const filters = [
    {
      key: 'all',
      label: 'All Auctions',
      icon: 'fas fa-list',
      count: filterCounts.all,
      color: 'primary'
    },
    {
      key: 'won',
      label: 'Won',
      icon: 'fas fa-trophy',
      count: filterCounts.won,
      color: 'success'
    },
    {
      key: 'active',
      label: 'Active',
      icon: 'fas fa-play-circle',
      count: filterCounts.active,
      color: 'warning'
    },
    {
      key: 'ended',
      label: 'Ended',
      icon: 'fas fa-stop-circle',
      count: filterCounts.ended,
      color: 'secondary'
    }
  ];

  return (
    <div className="participated-auction-filters">
      <div className="participated-filter-header">
        <h6>
          <i className="fas fa-filter me-2"></i>
          Filter by Status
        </h6>
      </div>
      
      <div className="participated-filter-buttons">
        {filters.map(filter => (
          <button
            key={filter.key}
            className={`participated-filter-btn ${activeFilter === filter.key ? 'participated-active' : ''} participated-btn-${filter.color}`}
            onClick={() => onFilterChange(filter.key)}
          >
            <i className={`${filter.icon} me-2`}></i>
            <span className="participated-filter-label">{filter.label}</span>
            <span className="participated-filter-count">({filter.count})</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(AuctionFilters);