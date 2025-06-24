import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";
import paymentAPI from "../../services/admin-payment-api";
import adminAuctionAPI from "../../services/admin-auction-api";
import { getUserById } from "../../services/admin-user-api";
import '../../assets/styles/admin/Payment.css';

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter, paymentTypeFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      // Get all payments from auctions
      const auctions = await adminAuctionAPI.getAllAuctions();
      let allPayments = [];

      // Get payments for each auction
      for (const auction of auctions) {
        try {
          const auctionPayments = await paymentAPI.getPaymentsByAuctionId(
            auction.id
          );
          allPayments = [...allPayments, ...auctionPayments];
        } catch {
          console.warn(`Failed to fetch payments for auction ${auction.id}`);
        }
      }

      // Enrich payments with user and auction information
      const enrichedPayments = await Promise.all(
        allPayments.map(async (payment) => {
          try {
            // Get user information
            const user = await getUserById(payment.userId);
            // Find corresponding auction
            const auction = auctions.find((a) => a.id === payment.auctionId);

            return {
              ...payment,
              user: user || {
                firstName: "Unknown",
                lastName: "User",
                email: "N/A",
              },
              auction: auction || {
                title: "Unknown Auction",
                id: payment.auctionId,
              },
            };
          } catch {
            console.warn(`Failed to enrich payment ${payment.id}`);
            return {
              ...payment,
              user: { firstName: "Unknown", lastName: "User", email: "N/A" },
              auction: { title: "Unknown Auction", id: payment.auctionId },
            };
          }
        })
      );

      setPayments(enrichedPayments);
      calculateStats(enrichedPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentsData) => {
    const stats = {
      total: paymentsData.length,
      completed: paymentsData.filter((p) => p.status === "COMPLETED").length,
      pending: paymentsData.filter((p) => p.status === "PENDING").length,
      failed: paymentsData.filter((p) => p.status === "FAILED").length,
      totalAmount: paymentsData
        .filter((p) => p.status === "COMPLETED")
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
    };
    setStats(stats);
  };

  const filterPayments = () => {
    let filtered = [...payments];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          `${payment.user?.firstName} ${payment.user?.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          payment.user?.email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          payment.auction?.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          payment.id?.toString().includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }

    // Filter by payment type
    if (paymentTypeFilter !== "all") {
      filtered = filtered.filter(
        (payment) => payment.paymentType === paymentTypeFilter
      );
    }

    setFilteredPayments(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="status-icon" style={{ color: '#38a169' }} />;
      case "PENDING":
        return <Clock className="status-icon" style={{ color: '#d69e2e' }} />;
      case "FAILED":
        return <XCircle className="status-icon" style={{ color: '#e53e3e' }} />;
      default:
        return <Clock className="status-icon" style={{ color: '#718096' }} />;
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      COMPLETED: "badge completed",
      PENDING: "badge pending",
      FAILED: "badge failed",
      CANCELLED: "badge cancelled",
    };

    return (
      <span className={statusClasses[status] || "badge cancelled"}>
        {status}
      </span>
    );
  };

  const getPaymentTypeBadge = (type) => {
    const typeClasses = {
      DEPOSIT: "badge deposit",
      AUCTION_PAYMENT: "badge auction-payment",
      REFUND: "badge refund",
    };

    return (
      <span className={typeClasses[type] || "badge cancelled"}>
        {type?.replace("_", " ")}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetails(true);
  };

  const updatePaymentStatus = async (paymentId, newStatus) => {
    try {
      await paymentAPI.updatePaymentStatus(paymentId, newStatus);
      await fetchPayments(); // Refresh data
      setShowDetails(false);
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Error updating payment status");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div id="wrapper">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content */}
      <div
        id="content-wrapper"
        className="d-flex flex-column"
        style={{ flex: 1 }}
      >
        <Topbar />
        <div className="payment-container">
          <div className="payment-content">
            {/* Header */}
            <div className="payment-header">
              <h1 className="payment-title">Payment Management</h1>
              <p className="payment-subtitle">
                Monitor and manage all payment transactions
              </p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-icon total">
                    <DollarSign size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>Total Transactions</h3>
                    <p className="total">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-icon completed">
                    <CheckCircle size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>Completed</h3>
                    <p className="completed">{stats.completed}</p>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-icon pending">
                    <Clock size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>Pending</h3>
                    <p className="pending">{stats.pending}</p>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-icon failed">
                    <XCircle size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>Failed</h3>
                    <p className="failed">{stats.failed}</p>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-icon revenue">
                    <DollarSign size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>Total Revenue</h3>
                    <p className="revenue">{formatCurrency(stats.totalAmount)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="filters-card">
              <div className="filters-grid">
                <div className="search-input-wrapper">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by name, email, auction..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>

                <select
                  className="filter-select"
                  value={paymentTypeFilter}
                  onChange={(e) => setPaymentTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="DEPOSIT">Deposit</option>
                  <option value="AUCTION_PAYMENT">Auction Payment</option>
                  <option value="REFUND">Refund</option>
                </select>
              </div>
            </div>

            {/* Payments Table */}
            <div className="table-card">
              <div className="table-wrapper">
                <table className="payments-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Auction</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Created Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td>
                          <span className="payment-id">#{payment.id}</span>
                        </td>
                        <td>
                          <div className="user-info">
                            <div className="user-name">
                              {payment.user?.firstName} {payment.user?.lastName}
                            </div>
                            <div className="user-email">
                              {payment.user?.email}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="auction-info">
                            <div className="auction-title">
                              {payment.auction?.title}
                            </div>
                            <div className="auction-id">
                              ID: {payment.auctionId}
                            </div>
                          </div>
                        </td>
                        <td>
                          {getPaymentTypeBadge(payment.paymentType)}
                        </td>
                        <td>
                          <span className="payment-amount">
                            {formatCurrency(payment.amount)}
                          </span>
                        </td>
                        <td>
                          <div className="status-cell">
                            {getStatusIcon(payment.status)}
                            {getStatusBadge(payment.status)}
                          </div>
                        </td>
                        <td>{formatDate(payment.createdAt)}</td>
                        <td>
                          <button
                            onClick={() => handleViewDetails(payment)}
                            className="view-details-btn"
                          >
                            <Eye size={16} />
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredPayments.length === 0 && (
                      <tr>
                        <td colSpan="8" className="empty-state">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Details Modal */}
            {showDetails && selectedPayment && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <h3 className="modal-title">
                      Payment Details #{selectedPayment.id}
                    </h3>
                  </div>

                  <div className="modal-body">
                    <div className="detail-item">
                      <span className="detail-label">User:</span>
                      <p className="detail-value">
                        {selectedPayment.user?.firstName}{" "}
                        {selectedPayment.user?.lastName}
                      </p>
                      <p className="detail-value secondary">
                        {selectedPayment.user?.email}
                      </p>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Auction:</span>
                      <p className="detail-value">{selectedPayment.auction?.title}</p>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Amount:</span>
                      <p className="detail-value amount">
                        {formatCurrency(selectedPayment.amount)}
                      </p>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Payment Method:</span>
                      <p className="detail-value">{selectedPayment.paymentMethod}</p>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <div style={{ marginTop: '0.25rem' }}>
                        {getStatusBadge(selectedPayment.status)}
                      </div>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">External Transaction ID:</span>
                      <p className="detail-value">{selectedPayment.externalTransactionId || "N/A"}</p>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Created Date:</span>
                      <p className="detail-value">{formatDate(selectedPayment.createdAt)}</p>
                    </div>

                    {selectedPayment.completedAt && (
                      <div className="detail-item">
                        <span className="detail-label">Completed Date:</span>
                        <p className="detail-value">{formatDate(selectedPayment.completedAt)}</p>
                      </div>
                    )}

                    {selectedPayment.description && (
                      <div className="detail-item">
                        <span className="detail-label">Description:</span>
                        <p className="detail-value">{selectedPayment.description}</p>
                      </div>
                    )}

                    {/* Action buttons for admin */}
                    {selectedPayment.status === "PENDING" && (
                      <div className="modal-actions">
                        <button
                          onClick={() =>
                            updatePaymentStatus(selectedPayment.id, "COMPLETED")
                          }
                          className="btn btn-success"
                        >
                          Mark as Completed
                        </button>
                        <button
                          onClick={() =>
                            updatePaymentStatus(selectedPayment.id, "FAILED")
                          }
                          className="btn btn-danger"
                        >
                          Mark as Failed
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="modal-footer">
                    <button
                      onClick={() => setShowDetails(false)}
                      className="btn btn-secondary"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;