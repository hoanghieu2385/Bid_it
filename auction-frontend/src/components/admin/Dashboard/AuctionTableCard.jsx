import React from "react";
import { Card, Table, Pagination, ButtonGroup, Button } from "react-bootstrap";
import { FaSearch, FaEye, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

const AuctionTableCard = ({ 
  displayedAuctions,
  auctionFilter,
  setAuctionFilter,
  searchTerm,
  showSearchInput,
  filteredAuctions,
  handleSearch,
  toggleSearchInput,
  currentPage,
  totalPages,
  goToPage,
  getPaginationRange
}) => {
  
  // Render status badge with appropriate icon
  const renderStatusBadge = (status) => {
    const getStatusIcon = (status) => {
      switch (status) {
        case 'Opened':
          return <FaClock className="me-1" />;
        case 'Sold':
          return <FaCheckCircle className="me-1" />;
        case 'Disputed':
          return <FaTimesCircle className="me-1" />;
        default:
          return null;
      }
    };

    return (
      <span className={`status-badge status-${status.toLowerCase()}`}>
        {getStatusIcon(status)}
        {status}
      </span>
    );
  };

  // Render search section
  const renderSearchSection = () => {
    return (
      <div className="showing-entries d-flex align-items-center">
        <span>{filteredAuctions.length}</span>
        <FaSearch 
          className="ml-2" 
          style={{ cursor: 'pointer', marginLeft: '5px' }} 
          onClick={toggleSearchInput} 
        />
        {showSearchInput && (
          <input
            type="text"
            className="form-control form-control-sm ml-2"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: '150px', display: 'inline-block', marginLeft: '5px' }}
            autoFocus
          />
        )}
      </div>
    );
  };

  // Render pagination
  const renderPagination = () => {
    const pageNumbers = getPaginationRange();
    
    return (
      <Pagination size="sm">
        <Pagination.Prev 
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        />
        
        {pageNumbers.map(number => (
          <Pagination.Item
            key={number}
            active={currentPage === number}
            onClick={() => goToPage(number)}
          >
            {number}
          </Pagination.Item>
        ))}
        
        <Pagination.Next 
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };

  return (
    <Card className="table-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">Current Auctions</h5>
            <small className="text-muted">Go to auction page to see more</small>
          </div>
          <div className="auction-filters">
            <ButtonGroup size="sm">
              <Button 
                variant={auctionFilter === "Opening" ? "primary" : "outline-secondary"}
                onClick={() => setAuctionFilter("Opening")}
              >
                Opening
              </Button>
              <Button 
                variant={auctionFilter === "Sold" ? "primary" : "outline-secondary"}
                onClick={() => setAuctionFilter("Sold")}
              >
                Sold
              </Button>
              <Button 
                variant={auctionFilter === "Disputing" ? "primary" : "outline-secondary"}
                onClick={() => setAuctionFilter("Disputing")}
              >
                Disputing
              </Button>
            </ButtonGroup>
          </div>
        </div>
        
        <div className="auction-table-container">
          <Table responsive hover className="auction-table">
            <thead>
              <tr>
                <th>Auction</th>
                <th>Seller</th>
                <th>Time</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedAuctions.length > 0 ? (
                displayedAuctions.map((auction) => (
                  <tr key={auction.id}>
                    <td>
                      <div className="auction-details">
                        <div className="auction-name">{auction.name}</div>
                        <div className="auction-meta">
                          ID: #{auction.id}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="seller-info d-flex flex-column">
                        <div className="seller-name">{auction.seller.name}</div>
                        <div className="seller-email">{auction.seller.email}</div>
                      </div>
                    </td>
                    <td>
                      <div className="auction-dates">
                        <div className="date-from">
                          <span>From:</span> {auction.startDate}
                        </div>
                        <div className="date-to">
                          <span>To:</span> {auction.endDate}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="auction-price">
                        <div className="current-price">{auction.currentPrice} USD</div>
                      </div>
                    </td>
                    <td>
                      <div className="auction-status">
                        {renderStatusBadge(auction.status)}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <p className="text-muted mb-0">No auctions found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
        
        <div className="pagination-container d-flex justify-content-between align-items-center mt-3">
          {renderSearchSection()}
          {renderPagination()}
        </div>
      </Card.Body>
    </Card>
  );
};

export default AuctionTableCard;