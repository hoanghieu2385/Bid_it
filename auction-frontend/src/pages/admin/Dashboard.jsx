import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner, Alert, Button } from "react-bootstrap";
import "../../assets/styles/admin/Dashboard.css";
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";
import WelcomeCard from "../../components/admin/Dashboard/WelcomeCard";
import RevenueCard from "../../components/admin/Dashboard/RevenueCard";
import AuctionTableCard from "../../components/admin/Dashboard/AuctionTableCard";
import CategoryCard from "../../components/admin/Dashboard/CategoryCard";

// Import API services
import { getAllUsers, getVerifyRequests } from "../../services/admin-user-api";
import adminAuctionAPI from "../../services/admin-auction-api";
import paymentAPI from "../../services/admin-payment-api";

const Dashboard = () => {
  // State for active tabs
  const [categoryTimeFrame, setCategoryTimeFrame] = useState("All");
  const [auctionFilter, setAuctionFilter] = useState("Opening");
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [displayedAuctions, setDisplayedAuctions] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    username: "Admin",
    tasks: 0,
    stats: {
      users: { count: 0, status: "Waiting to be verified" },
      auctions: { count: 0, status: "Currently happening" },
      sold: { count: 0, status: "And ready to be shipped" },
      disputes: { count: 0, status: "Waiting to be resolved" }
    },
    revenue: {
      current: "0",
      percentage: 0,
      successfulPayments: { count: 0, percentage: 0 }
    },
    categories: [],
    auctions: []
  });

  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const results = await Promise.allSettled([
          getAllUsers().catch([]),
          getVerifyRequests().catch([]),
          adminAuctionAPI.getAllAuctions().catch([]),
          paymentAPI.getAllPayments().catch([]),
          adminAuctionAPI.getAuctionStats().catch(({ all:0, active:0, draft:0, delivered:0, pending:0, completed:0 }))
        ]);

        const users = results[0].status === 'fulfilled' ? results[0].value : [];
        const verifyRequests = results[1].status === 'fulfilled' ? results[1].value : [];
        const auctions = results[2].status === 'fulfilled' ? results[2].value : [];
        const payments = results[3].status === 'fulfilled' ? results[3].value : [];

        const usersMap = new Map(users.map(u => [u.id, u]));

        // Stats
        const totalUsers = users.length;
        const pendingVerifications = verifyRequests.length;
        const activeAuctions = auctions.filter(a => a.status === 'OPENED' || a.status === 'ACTIVE').length;
        const soldAuctions = auctions.filter(a => 
          a.status === 'COMPLETED' || a.status === 'DELIVERED' || a.status === 'SOLD'
        ).length;
        const disputedAuctions = auctions.filter(a => a.status === 'DISPUTED').length;

        // Revenue
        const successfulPayments = payments.filter(p => p.status === 'COMPLETED' || p.status === 'SUCCESS');
        const totalRevenue = successfulPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        // Category revenue
        const categoryRevenue = {};
        auctions.forEach(a => {
          if (a.category && (a.status === 'COMPLETED' || a.status === 'SOLD')) {
            const name = a.category.name || a.category;
            const revenue = payments
              .filter(p => p.auctionId === a.id && (p.status === 'COMPLETED' || p.status === 'SUCCESS'))
              .reduce((sum, p) => sum + (p.amount || 0), 0);
            categoryRevenue[name] = (categoryRevenue[name] || 0) + revenue;
          }
        });

        const topCategories = Object.entries(categoryRevenue)
          .sort(([,a], [,b]) => b - a)
          .slice(0,5)
          .map(([name, revenue]) => ({ name, revenue }));

        if (topCategories.length === 0) {
          topCategories.push(
            { name: "Luxury Watches", revenue: 0 },
            { name: "Jewelry", revenue: 0 },
            { name: "Electronics", revenue: 0 },
            { name: "Fashion", revenue: 0 },
            { name: "Automobiles", revenue: 0 }
          );
        }

        // Update
        setDashboardData({
          username: "Admin",
          tasks: pendingVerifications + disputedAuctions,
          stats: {
            users: { count: totalUsers, status: `${pendingVerifications} waiting to be verified` },
            auctions: { count: activeAuctions, status: "Currently happening" },
            sold: { count: soldAuctions, status: "Completed auctions" },
            disputes: { count: disputedAuctions, status: "Waiting to be resolved" }
          },
          revenue: {
            current: totalRevenue.toLocaleString(),
            percentage: 100,
            successfulPayments: { count: successfulPayments.length, percentage: 100 }
          },
          categories: topCategories,
          auctions: auctions.map(a => {
            const sellerUser = usersMap.get(a.sellerId);  // hoặc a.seller_id, tuỳ API trả về
            return {
              id: a.id,
              name: a.title || a.name || `Auction #${a.id}`,
              category: a.category?.name || a.category || "Unknown",
              seller: {
                name: sellerUser
                  ? `${sellerUser.firstName} ${sellerUser.lastName}`
                  : "Unknown Seller",
                email: sellerUser
                  ? sellerUser.email
                  : "No email",
                verified: sellerUser?.verified || false
              },
              startDate: a.startTime ? new Date(a.startTime).toLocaleString() : "Not set",
              endDate:   a.endTime   ? new Date(a.endTime).toLocaleString()   : "Not set",
              currentPrice: a.currentPrice?.toLocaleString() || a.startingPrice?.toLocaleString() || "0",
              startPrice:   a.startingPrice?.toLocaleString() || "0",
              status: mapAuctionStatus(a.status)
            };
          })
        });

      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Unable to load dashboard data. Some services may be unavailable.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Map backend auction status to frontend display
  const mapAuctionStatus = (status) => {
    const statusMap = {
      'OPENED': 'Opened',
      'ACTIVE': 'Opened',
      'COMPLETED': 'Sold',
      'DELIVERED': 'Sold',
      'SOLD': 'Sold',
      'DISPUTED': 'Disputed',
      'PENDING': 'Pending',
      'DRAFT': 'Draft'
    };
    return statusMap[status] || status;
  };

  // Filter auctions by status
  useEffect(() => {
    if (!dashboardData.auctions) return;

    const filteredByStatus = dashboardData.auctions.filter(auction => {
      if (auctionFilter === "Opening") return auction.status === "Opened";
      if (auctionFilter === "Sold") return auction.status === "Sold";
      if (auctionFilter === "Disputing") return auction.status === "Disputed";
      return true;
    });
    
    setFilteredAuctions(filteredByStatus);
    setCurrentPage(1);
  }, [auctionFilter, dashboardData.auctions]);

  // Apply search filter on filteredAuctions
  useEffect(() => {
    if (!searchTerm.trim()) {
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const searchFiltered = filteredAuctions.filter(auction => 
      auction.name.toLowerCase().includes(term) || 
      auction.category.toLowerCase().includes(term) ||
      auction.seller.name.toLowerCase().includes(term) ||
      auction.id.toString().includes(term)
    );
    
    setFilteredAuctions(searchFiltered);
    setCurrentPage(1);
  }, [searchTerm]);

  // Update displayed auctions and total pages when filteredAuctions or page changes
  useEffect(() => {
    const newTotalPages = Math.max(1, Math.ceil(filteredAuctions.length / itemsPerPage));
    setTotalPages(newTotalPages);
    
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredAuctions.length);
    
    setDisplayedAuctions(filteredAuctions.slice(startIndex, endIndex));
  }, [filteredAuctions, currentPage, itemsPerPage]);

  // Search handler
  const handleSearch = (term) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      const resetFiltered = dashboardData.auctions.filter(auction => {
        if (auctionFilter === "Opening") return auction.status === "Opened";
        if (auctionFilter === "Sold") return auction.status === "Sold";
        if (auctionFilter === "Disputing") return auction.status === "Disputed";
        return true;
      });
      
      setFilteredAuctions(resetFiltered);
    }
  };

  // Toggle search input
  const toggleSearchInput = () => {
    setShowSearchInput(!showSearchInput);
    if (showSearchInput) {
      setSearchTerm("");
      const resetFiltered = dashboardData.auctions.filter(auction => {
        if (auctionFilter === "Opening") return auction.status === "Opened";
        if (auctionFilter === "Sold") return auction.status === "Sold";
        if (auctionFilter === "Disputing") return auction.status === "Disputed";
        return true;
      });
      
      setFilteredAuctions(resetFiltered);
    }
  };

  // Pagination logic
  const goToPage = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Get pagination range
  const getPaginationRange = () => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    if (currentPage <= 2) {
      return [1, 2, 3];
    }
    
    if (currentPage >= totalPages - 1) {
      return [totalPages - 2, totalPages - 1, totalPages];
    }
    
    return [currentPage - 1, currentPage, currentPage + 1];
  };

  if (loading) {
    return (
      <div id="wrapper">
        <Sidebar />
        <div id="content-wrapper" className="d-flex flex-column">
          <Topbar />
          <div className="dashboard-content">
            <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
              <div className="text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading dashboard data...</p>
              </div>
            </Container>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="wrapper">
        <Sidebar />
        <div id="content-wrapper" className="d-flex flex-column">
          <Topbar />
          <div className="dashboard-content">
            <Container fluid>
              <Alert variant="danger">
                <Alert.Heading>Error Loading Dashboard</Alert.Heading>
                <p>{error}</p>
                <Button variant="outline-danger" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </Alert>
            </Container>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="wrapper">
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column">
        <Topbar />
        <div className="dashboard-content">
          <Container fluid>
            <Row>
              <Col xl={7}>
                {/* Welcome Card with Stats */}
                <WelcomeCard dashboardData={dashboardData} />
              </Col>
              <Col xl={5}>
                {/* Category Card */}
                <CategoryCard 
                  dashboardData={dashboardData}
                  categoryTimeFrame={categoryTimeFrame}
                  setCategoryTimeFrame={setCategoryTimeFrame}
                />
              </Col>

            </Row>
            
            <Row className="mt-4">
              <Col xl={12}>
                {/* Auction Table Card */}
                <AuctionTableCard 
                  displayedAuctions={displayedAuctions}
                  auctionFilter={auctionFilter}
                  setAuctionFilter={setAuctionFilter}
                  searchTerm={searchTerm}
                  showSearchInput={showSearchInput}
                  filteredAuctions={filteredAuctions}
                  handleSearch={handleSearch}
                  toggleSearchInput={toggleSearchInput}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  goToPage={goToPage}
                  getPaginationRange={getPaginationRange}
                />
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;