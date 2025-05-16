import React, { useState } from "react";
import { 
  Container, Row, Col, Card, Badge, Table, 
  Pagination, ButtonGroup, Button 
} from "react-bootstrap";
import { 
  FaUsers, FaGavel, FaBoxOpen, FaExclamationTriangle, 
  FaSearch, FaEye 
} from "react-icons/fa";
import "../../assets/styles/admin/Dashboard.css";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Dashboard = () => {
  // State for active tabs
  const [revenueTimeFrame, setRevenueTimeFrame] = useState("Month");
  const [categoryTimeFrame, setCategoryTimeFrame] = useState("All");
  const [auctionFilter, setAuctionFilter] = useState("Opening");
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data
  const dashboardData = {
    username: "John",
    tasks: 4,
    stats: {
      users: { count: 5, status: "Waiting to be verified" },
      auctions: { count: 11, status: "Currently happening" },
      sold: { count: 0, status: "And ready to be shipped" },
      disputes: { count: 1, status: "Waiting to be resolved" }
    },
    revenue: {
      current: "1.530.000",
      percentage: 100,
      successfulPayments: { count: 1, percentage: 100 }
    },
    categories: [
      { name: "Watches", revenue: 1530000 },
      { name: "Electronics", revenue: 980000 },
      { name: "Clothing", revenue: 720000 },
      { name: "Jewelry", revenue: 540000 },
      { name: "Art", revenue: 350000 }
    ],
    auctions: [
      {
        id: 812,
        name: "BMW A100D A Class Hatch Premium",
        category: "Motorcycles",
        seller: {
          name: "Christopher Anderson",
          email: "christopher.anderson@example.com",
          verified: true
        },
        startDate: "23 Jul, 2024 - 02:01",
        endDate: "26 Jul, 2024 - 02:01",
        currentPrice: "80.000.000",
        startPrice: "80.500.000",
        status: "Opened"
      },
      {
        id: 811,
        name: "Watercolor Special Lighter Collection",
        category: "Jewelry",
        seller: {
          name: "Christopher Anderson",
          email: "christopher.anderson@example.com",
          verified: true
        },
        startDate: "23 Jul, 2024 - 02:01",
        endDate: "24 Jul, 2024 - 02:01",
        currentPrice: "50.000",
        startPrice: "0",
        status: "Opened"
      },
      {
        id: 810,
        name: "Michael Korian Gold Special Edition",
        category: "Watches",
        seller: {
          name: "Christopher Anderson",
          email: "christopher.anderson@example.com",
          verified: true
        },
        startDate: "23 Jul, 2024 - 02:01",
        endDate: "29 Jul, 2024 - 02:01",
        currentPrice: "2.500.000",
        startPrice: "0",
        status: "Opened"
      },
      {
        id: 809,
        name: "Water resist All Variants Available",
        category: "Watches",
        seller: {
          name: "Christopher Anderson",
          email: "christopher.anderson@example.com",
          verified: true
        },
        startDate: "23 Jul, 2024 - 02:01",
        endDate: "27 Jul, 2024 - 02:01",
        currentPrice: "4.500.000",
        startPrice: "0",
        status: "Opened"
      },
      {
        id: 808,
        name: "Pure leather All Variants Available",
        category: "Clothes",
        seller: {
          name: "Christopher Anderson",
          email: "christopher.anderson@example.com",
          verified: true
        },
        startDate: "23 Jul, 2024 - 02:01",
        endDate: "30 Jul, 2024 - 02:01",
        currentPrice: "700.000",
        startPrice: "0",
        status: "Opened"
      }
    ],
    chartData: {
      months: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', '2024-07'],
      values: [0, 0, 0, 0, 0, 300000, 1530000]
    }
  };

  // Pagination calculation
  const itemsPerPage = 5;
  const totalPages = Math.ceil(dashboardData.auctions.length / itemsPerPage);
  
  // Navigation functions
  const goToPage = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div id="wrapper">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div id="content-wrapper" className="d-flex flex-column">
        <Topbar />
        
        {/* Dashboard Content */}
        <div className="dashboard-content">
          <Container fluid>
            {/* Page Heading */}
            <div className="page-heading mb-4">
              <h2>Dashboard</h2>
            </div>

            {/* Welcome Card & Stats */}
            <Row>
              {/* Welcome Card */}
              <Col lg={6} className="mb-4">
                <Card className="welcome-card">
                  <Card.Body>
                    <h3>Hello, {dashboardData.username}</h3>
                    <p>You have {dashboardData.tasks} tasks to pay attention too</p>
                    
                    <Row className="mt-4">
                      <Col md={6} className="mb-3">
                        <Card className="stats-card">
                          <Card.Body>
                            <div className="stats-icon user-icon">
                              <FaUsers />
                            </div>
                            <h2>{dashboardData.stats.users.count} users</h2>
                            <p>{dashboardData.stats.users.status}</p>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Card className="stats-card">
                          <Card.Body>
                            <div className="stats-icon auction-icon">
                              <FaGavel />
                            </div>
                            <h2>{dashboardData.stats.auctions.count} auctions</h2>
                            <p>{dashboardData.stats.auctions.status}</p>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Card className="stats-card">
                          <Card.Body>
                            <div className="stats-icon sold-icon">
                              <FaBoxOpen />
                            </div>
                            <h2>{dashboardData.stats.sold.count} sold</h2>
                            <p>{dashboardData.stats.sold.status}</p>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Card className="stats-card">
                          <Card.Body>
                            <div className="stats-icon dispute-icon">
                              <FaExclamationTriangle />
                            </div>
                            <h2>{dashboardData.stats.disputes.count} disputes</h2>
                            <p>{dashboardData.stats.disputes.status}</p>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
              
              {/* Revenue Chart */}
              <Col lg={6} className="mb-4">
                <Card className="revenue-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h5 className="mb-0">Revenue</h5>
                        <small className="text-muted">Collected fee from succeed seller payments</small>
                      </div>
                      <div className="time-selector">
                        <ButtonGroup size="sm">
                          <Button 
                            variant={revenueTimeFrame === "Day" ? "primary" : "outline-secondary"}
                            onClick={() => setRevenueTimeFrame("Day")}
                          >
                            Day
                          </Button>
                          <Button 
                            variant={revenueTimeFrame === "Month" ? "primary" : "outline-secondary"}
                            onClick={() => setRevenueTimeFrame("Month")}
                          >
                            Month
                          </Button>
                          <Button 
                            variant={revenueTimeFrame === "Quarter" ? "primary" : "outline-secondary"}
                            onClick={() => setRevenueTimeFrame("Quarter")}
                          >
                            Quarter
                          </Button>
                          <Button 
                            variant={revenueTimeFrame === "Year" ? "primary" : "outline-secondary"}
                            onClick={() => setRevenueTimeFrame("Year")}
                          >
                            Year
                          </Button>
                        </ButtonGroup>
                      </div>
                    </div>
                    
                    <Row className="mt-4">
                      <Col md={6}>
                        <div className="revenue-stats">
                          <h2 className="revenue-amount">{dashboardData.revenue.current} đ</h2>
                          <Badge bg="success" className="revenue-badge">
                            +{dashboardData.revenue.percentage}%
                          </Badge>
                          <p className="text-muted">Collected this month</p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="revenue-stats">
                          <h2 className="revenue-amount">{dashboardData.revenue.successfulPayments.count}</h2>
                          <Badge bg="success" className="revenue-badge">
                            +{dashboardData.revenue.successfulPayments.percentage}%
                          </Badge>
                          <p className="text-muted">Succeed seller payments</p>
                        </div>
                      </Col>
                    </Row>
                    
                    {/* Simple Revenue Chart */}
                    <div className="revenue-chart mt-3">
                      <svg className="w-100" height="200" viewBox="0 0 800 200">
                        {/* X-axis */}
                        <line x1="40" y1="170" x2="780" y2="170" stroke="#e0e0e0" strokeWidth="1" />
                        
                        {/* Y-axis */}
                        <line x1="40" y1="10" x2="40" y2="170" stroke="#e0e0e0" strokeWidth="1" />
                        
                        {/* X-axis labels */}
                        {dashboardData.chartData.months.map((month, index) => (
                          <text 
                            key={`month-${index}`} 
                            x={40 + (index * (740/6))} 
                            y="190" 
                            textAnchor="middle" 
                            fontSize="10"
                            fill="#9aa0ac"
                          >
                            {month}
                          </text>
                        ))}
                        
                        {/* Y-axis labels */}
                        <text x="35" y="170" textAnchor="end" fontSize="10" fill="#9aa0ac">0</text>
                        <text x="35" y="130" textAnchor="end" fontSize="10" fill="#9aa0ac">400000</text>
                        <text x="35" y="90" textAnchor="end" fontSize="10" fill="#9aa0ac">800000</text>
                        <text x="35" y="50" textAnchor="end" fontSize="10" fill="#9aa0ac">1200000</text>
                        <text x="35" y="10" textAnchor="end" fontSize="10" fill="#9aa0ac">1600000</text>
                        
                        {/* Revenue line */}
                        <path 
                          d={`M40,${170 - (dashboardData.chartData.values[0] / 10000)} 
                             L${40 + (740/6)},${170 - (dashboardData.chartData.values[1] / 10000)} 
                             L${40 + (740/6) * 2},${170 - (dashboardData.chartData.values[2] / 10000)} 
                             L${40 + (740/6) * 3},${170 - (dashboardData.chartData.values[3] / 10000)} 
                             L${40 + (740/6) * 4},${170 - (dashboardData.chartData.values[4] / 10000)} 
                             L${40 + (740/6) * 5},${170 - (dashboardData.chartData.values[5] / 10000)} 
                             L${40 + (740/6) * 6},${170 - (dashboardData.chartData.values[6] / 10000)}`} 
                          fill="none" 
                          stroke="#7c4dff" 
                          strokeWidth="3" 
                        />
                      </svg>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row>
              {/* Current Auctions */}
              <Col lg={8} className="mb-4">
                <Card className="table-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h5 className="mb-0">Current Auctions</h5>
                        <small className="text-muted">Go to auctions page for more</small>
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
                            <th>Start-End</th>
                            <th>Price</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.auctions.map((auction, index) => (
                            <tr key={auction.id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="auction-image mr-3">
                                    <img 
                                      src={`/assets/images/placeholders/item${index + 1}.jpg`} 
                                      alt={auction.name}
                                      onError={(e) => {
                                        e.target.src = "";
                                      }}
                                    />
                                  </div>
                                  <div className="auction-details">
                                    <div className="auction-name">{auction.name}</div>
                                    <div className="auction-meta">
                                      ID: #{auction.id} | Category: {auction.category}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="seller-info">
                                  <div className="seller-name">{auction.seller.name}</div>
                                  <div className="seller-meta">
                                    {auction.seller.verified && (
                                      <span className="verified-badge">Verified</span>
                                    )}
                                    <div className="seller-email">{auction.seller.email}</div>
                                  </div>
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
                                  <div className="current-price">{auction.currentPrice} đ</div>
                                  {auction.startPrice !== "0" && (
                                    <div className="start-price">{auction.startPrice} đ</div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="auction-status">
                                  <span className={`status-badge status-${auction.status.toLowerCase()}`}>
                                    {auction.status}
                                  </span>
                                  <button className="view-btn">
                                    <FaEye />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                    
                    <div className="pagination-container d-flex justify-content-between align-items-center mt-3">
                      <div className="showing-entries">
                        <span>5</span>
                        <FaSearch className="ml-2" />
                      </div>
                      <Pagination size="sm">
                        <Pagination.Prev 
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        />
                        {Array.from({ length: Math.min(totalPages, 3) }).map((_, index) => (
                          <Pagination.Item
                            key={index + 1}
                            active={currentPage === index + 1}
                            onClick={() => goToPage(index + 1)}
                          >
                            {index + 1}
                          </Pagination.Item>
                        ))}
                        <Pagination.Next 
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        />
                      </Pagination>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              
              {/* Top Categories */}
              <Col lg={4} className="mb-4">
                <Card className="category-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h5 className="mb-0">Top Categories</h5>
                        <small className="text-muted">Categories which bring in the most revenue</small>
                      </div>
                    </div>
                    
                    <div className="category-filter mt-3 mb-4">
                      <ButtonGroup size="sm" className="w-100">
                        <Button 
                          variant={categoryTimeFrame === "All" ? "danger" : "light"}
                          className="flex-fill"
                          onClick={() => setCategoryTimeFrame("All")}
                        >
                          All
                        </Button>
                        <Button 
                          variant={categoryTimeFrame === "Year" ? "danger" : "light"}
                          className="flex-fill"
                          onClick={() => setCategoryTimeFrame("Year")}
                        >
                          Year
                        </Button>
                        <Button 
                          variant={categoryTimeFrame === "Quarter" ? "danger" : "light"}
                          className="flex-fill"
                          onClick={() => setCategoryTimeFrame("Quarter")}
                        >
                          Quarter
                        </Button>
                        <Button 
                          variant={categoryTimeFrame === "Month" ? "danger" : "light"}
                          className="flex-fill"
                          onClick={() => setCategoryTimeFrame("Month")}
                        >
                          Month
                        </Button>
                      </ButtonGroup>
                    </div>
                    
                    <div className="categories-chart">
                      {dashboardData.categories.map((category, index) => (
                        <div key={index} className="category-item mb-4">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="category-name">{category.name}</div>
                            <div className="category-revenue">{category.revenue.toLocaleString()} đ</div>
                          </div>
                          <div className="progress" style={{ height: "8px" }}>
                            <div 
                              className="progress-bar" 
                              role="progressbar" 
                              style={{ 
                                width: `${(category.revenue / dashboardData.categories[0].revenue) * 100}%`,
                                backgroundColor: ['#ff6b8a', '#36b9cc', '#1cc88a', '#f6c23e', '#e74a3b'][index % 5]
                              }}
                              aria-valuenow={(category.revenue / dashboardData.categories[0].revenue) * 100} 
                              aria-valuemin="0" 
                              aria-valuemax="100"
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;