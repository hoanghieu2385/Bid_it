import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";
import paymentAPI from "../../services/admin-payment-api";
import adminAuctionAPI from "../../services/admin-auction-api";
import { getUserById } from "../../services/admin-user-api";

const PaymentAndDeposit = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('Newest');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [totalDeposits, setTotalDeposits] = useState(0);

  // Fetch deposits data
  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const depositsData = await paymentAPI.getAllPayments();
      
      // Enrich data với thông tin user và auction
      const enrichedDeposits = await Promise.all(
        depositsData.map(async (deposit) => {
          try {
            const [user, auction] = await Promise.all([
              getUserById(deposit.userId),
              adminAuctionAPI.getAuctionById(deposit.auctionId)
            ]);
            return {
              ...deposit,
              user,
              auction
            };
          } catch (error) {
            console.error('Error enriching deposit data:', error);
            return deposit;
          }
        })
      );

      setDeposits(enrichedDeposits);
      setTotalDeposits(enrichedDeposits.length);
    } catch (error) {
      console.error('Error fetching deposits:', error);
      setDeposits([]);
      setTotalDeposits(0);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort deposits
  const filteredAndSortedDeposits = () => {
    let filtered = deposits;

    // Filter by status
    if (statusFilter !== 'All Status') {
      filtered = filtered.filter(deposit => 
        deposit.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Sort
    const sortedDeposits = [...filtered];
    switch (sortBy) {
      case 'Newest':
        return sortedDeposits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'Oldest':
        return sortedDeposits.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'Amount: High to Low':
        return sortedDeposits.sort((a, b) => b.amount - a.amount);
      case 'Amount: Low to High':
        return sortedDeposits.sort((a, b) => a.amount - b.amount);
      default:
        return sortedDeposits;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: 'badge-success',
      pending: 'badge-warning',
      refunded: 'badge-info',
      failed: 'badge-danger'
    };
    
    return (
      <span className={`badge ${statusClasses[status.toLowerCase()] || 'badge-secondary'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getVerificationBadge = (verified) => {
    return verified ? (
      <span className="badge badge-success badge-sm">Verified</span>
    ) : (
      <span className="badge badge-warning badge-sm">Unverified</span>
    );
  };

  if (loading) {
    return (
      <div id="wrapper">
        <Sidebar />
        <div id="content-wrapper" className="d-flex flex-column" style={{ flex: 1 }}>
          <Topbar />
          <div className="container-fluid">
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
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
        
        {/* Page Content */}
        <div className="container-fluid">
          {/* Page Heading */}
          <div className="d-sm-flex align-items-center justify-content-between mb-4">
            <h1 className="h3 mb-0 text-gray-800">Payment & Deposit Management</h1>
          </div>

          {/* Deposit Table Card */}
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="m-0 font-weight-bold text-primary">Deposit</h6>
                  <small className="text-muted">Total {totalDeposits} deposits</small>
                </div>
                <div className="d-flex gap-2">
                  {/* Sort Dropdown */}
                  <select 
                    className="form-control form-control-sm"
                    style={{ width: 'auto' }}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="Newest">Newest</option>
                    <option value="Oldest">Oldest</option>
                    <option value="Amount: High to Low">Amount: High to Low</option>
                    <option value="Amount: Low to High">Amount: Low to High</option>
                  </select>
                  
                  {/* Status Filter */}
                  <select 
                    className="form-control form-control-sm"
                    style={{ width: 'auto' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All Status">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="refunded">Refunded</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered" width="100%" cellSpacing="0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>USER</th>
                      <th>FOR AUCTION</th>
                      <th>AMOUNT</th>
                      <th>TRANSACTION INFO</th>
                      <th>STATUS</th>
                      <th>CREATED AT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedDeposits().map((deposit, index) => (
                      <tr key={deposit.id}>
                        <td>#{index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="mr-3">
                              <div className="icon-circle bg-primary">
                                <i className="fas fa-user text-white"></i>
                              </div>
                            </div>
                            <div>
                              <div className="d-flex align-items-center">
                                <strong>{deposit.user?.fullName || 'Unknown User'}</strong>
                                {deposit.user?.verified && (
                                  <span className="ml-1">
                                    {getVerificationBadge(deposit.user.verified)}
                                  </span>
                                )}
                              </div>
                              <small className="text-muted">{deposit.user?.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{deposit.auction?.title || 'Unknown Auction'}</strong>
                            <br />
                            <small className="text-muted">
                              Listing ID: {deposit.auction?.listingId || 'N/A'}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{formatCurrency(deposit.amount)}</strong>
                            <br />
                            <small className="text-muted">Method: {deposit.method}</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <small>
                              <strong>Transaction ID:</strong> {deposit.transactionId}
                              <br />
                              <strong>Capture ID:</strong> {deposit.captureId}
                              {deposit.refundId && (
                                <>
                                  <br />
                                  <strong>Refund ID:</strong> {deposit.refundId}
                                </>
                              )}
                            </small>
                          </div>
                        </td>
                        <td>
                          {getStatusBadge(deposit.status)}
                        </td>
                        <td>
                          <small>{formatDate(deposit.createdAt)}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredAndSortedDeposits().length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted">No deposits found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentAndDeposit;