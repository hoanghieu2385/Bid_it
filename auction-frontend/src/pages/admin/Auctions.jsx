import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../assets/styles/admin/Auctions.css";
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";
import { Search, ChevronDown, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";

const Auctions = () => {
  // State cho dữ liệu đấu giá
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCategory, setCurrentCategory] = useState("All Categories");
  const [currentStatus, setCurrentStatus] = useState("All Statuses");
  const [sortOrder, setSortOrder] = useState("Newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // State cho các thẻ thống kê
  const [stats] = useState({
    all: 13,
    active: 11,
    draft: 0,
    delivered: 0,
    pending: 1,
    completed: 1
  });

  // Mock data cho danh sách đấu giá - sẽ được thay thế bằng API calls
  useEffect(() => {
    // Giả lập việc gọi API
    const fetchAuctions = () => {
      setTimeout(() => {
        const mockData = [
          {
            id: 1,
            title: "Patek Philippe Complications Chronograph (5170G001)",
            seller: "Tran Hung",
            sellerEmail: "tranhung@example.com",
            sellerVerified: true,
            startDate: "23 Jul 2024 - 09:45",
            endDate: "23 Jul 2024 - 22:45",
            startingPrice: "50,000,000 đ",
            currentBid: "51,000,000 đ",
            totalBids: 3,
            status: "Completed",
            image: "/auction-images/watch-patek.jpg",
            category: "Luxury Watches",
            createdAt: "23 Jul 2024 - 08:45",
            updatedAt: "23 Jul 2024 - 08:45"
          },
          {
            id: 2,
            title: "BMW A100 A Class Hatch M20 Motor Bike",
            seller: "Christopher Anderson",
            sellerEmail: "christopher.anderson@example.com",
            sellerVerified: true,
            startDate: "22 Jul 2024 - 02:01",
            endDate: "26 Jul 2024 - 02:01",
            startingPrice: "60,000,000 đ",
            currentBid: "60,500,000 đ",
            totalBids: 1,
            status: "Opened",
            image: "/auction-images/bmw-motorbike.jpg",
            category: "Luxury Motorcycles",
            createdAt: "22 Jul 2024 - 02:01",
            updatedAt: "22 Jul 2024 - 02:01"
          },
          {
            id: 3,
            title: "Watchlader Special Lighter 2.2 For Sailing Offer",
            seller: "Christopher Anderson",
            sellerEmail: "christopher.anderson@example.com",
            sellerVerified: true,
            startDate: "21 Jul 2024 - 02:01",
            endDate: "26 Jul 2024 - 02:01",
            startingPrice: "50,000 đ",
            currentBid: "0 đ",
            totalBids: 0,
            status: "Opened",
            image: "/auction-images/lighter.jpg",
            category: "Jewelry",
            createdAt: "21 Jul 2024 - 02:01",
            updatedAt: "21 Jul 2024 - 02:01"
          },
          {
            id: 4,
            title: "Minisun Korean Gold Specie Watch 20.6",
            seller: "Christopher Anderson",
            sellerEmail: "christopher.anderson@example.com",
            sellerVerified: true,
            startDate: "20 Jul 2024 - 02:01",
            endDate: "25 Jul 2024 - 02:01",
            startingPrice: "2,500,000 đ",
            currentBid: "0 đ",
            totalBids: 0,
            status: "Opened",
            image: "/auction-images/watch-korean.jpg",
            category: "Watches",
            createdAt: "20 Jul 2024 - 02:01",
            updatedAt: "20 Jul 2024 - 02:01"
          },
          {
            id: 5,
            title: "Water resist All Variants Available For Sale",
            seller: "Christopher Anderson",
            sellerEmail: "christopher.anderson@example.com",
            sellerVerified: true,
            startDate: "19 Jul 2024 - 02:01",
            endDate: "27 Jul 2024 - 02:01",
            startingPrice: "4,500,000 đ",
            currentBid: "0 đ",
            totalBids: 0,
            status: "Opened",
            image: "/auction-images/water-resist.jpg",
            category: "Jewelry",
            createdAt: "19 Jul 2024 - 02:01",
            updatedAt: "19 Jul 2024 - 02:01"
          },
          {
            id: 6,
            title: "Pure leather All Variants Available For Sale",
            seller: "Christopher Anderson",
            sellerEmail: "christopher.anderson@example.com",
            sellerVerified: true,
            startDate: "18 Jul 2024 - 02:01",
            endDate: "25 Jul 2024 - 02:01",
            startingPrice: "700,000 đ",
            currentBid: "0 đ",
            totalBids: 0,
            status: "Opened",
            image: "/auction-images/leather.jpg",
            category: "Fashion",
            createdAt: "18 Jul 2024 - 02:01",
            updatedAt: "18 Jul 2024 - 02:01"
          },
          {
            id: 7,
            title: "Blue ray filter All Variants Available For Sale",
            seller: "Christopher Anderson",
            sellerEmail: "christopher.anderson@example.com",
            sellerVerified: true,
            startDate: "17 Jul 2024 - 02:01",
            endDate: "25 Jul 2024 - 02:01",
            startingPrice: "950,000 đ",
            currentBid: "0 đ",
            totalBids: 0,
            status: "Opened",
            image: "/auction-images/blueray-filter.jpg",
            category: "Optics",
            createdAt: "17 Jul 2024 - 02:01",
            updatedAt: "17 Jul 2024 - 02:01"
          },
          {
            id: 8,
            title: "iPhone 11 Pro Max All Variants Available For Sale",
            seller: "Christopher Anderson",
            sellerEmail: "christopher.anderson@example.com",
            sellerVerified: true,
            startDate: "16 Jul 2024 - 02:01",
            endDate: "26 Jul 2024 - 02:01",
            startingPrice: "14,000,000 đ",
            currentBid: "0 đ",
            totalBids: 0,
            status: "Opened",
            image: "/auction-images/iphone-11.jpg",
            category: "Electronics",
            createdAt: "16 Jul 2024 - 02:01",
            updatedAt: "16 Jul 2024 - 02:01"
          },
          {
            id: 9,
            title: "Hard HV-G01 USB Black Double Game Pad With Virtual",
            seller: "Christopher Anderson",
            sellerEmail: "christopher.anderson@example.com",
            sellerVerified: true,
            startDate: "15 Jul 2024 - 02:01",
            endDate: "25 Jul 2024 - 02:01",
            startingPrice: "120,000 đ",
            currentBid: "0 đ",
            totalBids: 0,
            status: "Opened",
            image: "/auction-images/gamepad.jpg",
            category: "Electronics",
            createdAt: "15 Jul 2024 - 02:01",
            updatedAt: "15 Jul 2024 - 02:01"
          },
          {
            id: 10,
            title: "Toyota A100 A Class Hatchback Sale (2017 - 2021)",
            seller: "Christopher Anderson",
            sellerEmail: "christopher.anderson@example.com",
            sellerVerified: true,
            startDate: "14 Jul 2024 - 02:01",
            endDate: "28 Jul 2024 - 02:01",
            startingPrice: "960,000,000 đ",
            currentBid: "0 đ",
            totalBids: 0,
            status: "Opened",
            image: "/auction-images/toyota-hatchback.jpg",
            category: "Automobiles",
            createdAt: "14 Jul 2024 - 02:01",
            updatedAt: "14 Jul 2024 - 02:01"
          }
        ];
        
        setAuctions(mockData);
        setTotalItems(mockData.length);
        setLoading(false);
      }, 800);
    };

    fetchAuctions();
  }, []);

  // Hàm xử lý tìm kiếm
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Trong thực tế, bạn có thể muốn debounce trước khi thực hiện tìm kiếm
    // hoặc gọi API tìm kiếm từ backend
  };

  // Hàm lọc auctions dựa theo trạng thái
  const filterByStatus = (status) => {
    console.log(`Filtering by status: ${status}`);
    setCurrentStatus(status);
    // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu theo trạng thái
  };

  // Hàm xử lý khi thay đổi danh mục
  const handleCategoryChange = (e) => {
    setCurrentCategory(e.target.value);
    // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu theo danh mục
  };

  // Hàm xử lý khi thay đổi trạng thái
  const handleStatusChange = (e) => {
    setCurrentStatus(e.target.value);
    // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu theo trạng thái
  };

  // Hàm xử lý khi thay đổi thứ tự sắp xếp
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu theo thứ tự sắp xếp
  };

  // Hàm xử lý khi thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu của trang đó
  };

  // Tính số trang dựa trên tổng số mục và số mục trên mỗi trang
  const totalPages = Math.ceil(totalItems / itemsPerPage);

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
        
        {/* Container content */}
        <div className="container-fluid auctions-container">
          {/* Header */}
          <div className="auctions-header">
            <div className="title-section">
              <h1>Auctions List</h1>
            </div>
          </div>

          {/* Cards section */}
          <div className="stats-cards">
            <div className="stat-card all" onClick={() => filterByStatus("All")}>
              <div className="stat-number">{stats.all}</div>
              <div className="stat-tag">ALL</div>
            </div>
            <div className="stat-card active" onClick={() => filterByStatus("Active")}>
              <div className="stat-number">{stats.active}</div>
              <div className="stat-tag">ACTIVE</div>
            </div>
            <div className="stat-card draft" onClick={() => filterByStatus("Draft")}>
              <div className="stat-number">{stats.draft}</div>
              <div className="stat-tag">DRAFT</div>
            </div>
            <div className="stat-card delivered" onClick={() => filterByStatus("Delivered")}>
              <div className="stat-number">{stats.delivered}</div>
              <div className="stat-tag">DELIVERED</div>
            </div>
            <div className="stat-card pending" onClick={() => filterByStatus("Pending")}>
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-tag">PENDING</div>
            </div>
            <div className="stat-card completed" onClick={() => filterByStatus("Completed")}>
              <div className="stat-number">{stats.completed}</div>
              <div className="stat-tag">COMPLETED</div>
            </div>
          </div>

          {/* Search and filter section */}
          <div className="search-filter-section">
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search Auctions" 
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div className="filters">
              <div className="filter-dropdown">
                <span>{currentCategory}</span>
                <ChevronDown size={16} />
                <select 
                  onChange={handleCategoryChange}
                  value={currentCategory}
                >
                  <option value="All Categories">All Categories</option>
                  <option value="Luxury Watches">Luxury Watches</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Automobiles">Automobiles</option>
                  <option value="Motorcycles">Motorcycles</option>
                  <option value="Optics">Optics</option>
                </select>
              </div>
              <div className="filter-dropdown">
                <span>{currentStatus}</span>
                <ChevronDown size={16} />
                <select 
                  onChange={handleStatusChange}
                  value={currentStatus}
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="Opened">Opened</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Draft">Draft</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              <div className="filter-dropdown">
                <span>{sortOrder}</span>
                <ChevronDown size={16} />
                <select 
                  onChange={handleSortChange}
                  value={sortOrder}
                >
                  <option value="Newest">Newest</option>
                  <option value="Oldest">Oldest</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Bids: High to Low">Bids: High to Low</option>
                  <option value="Bids: Low to High">Bids: Low to High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Auctions Table */}
          <div className="auctions-table-container">
            <table className="auctions-table">
              <thead>
                <tr>
                  <th>Auction</th>
                  <th>Seller</th>
                  <th>Start / End</th>
                  <th>Starting Price</th>
                  <th>Current Bid</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="loading-row">Loading auctions...</td>
                  </tr>
                ) : auctions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data-row">No auctions found</td>
                  </tr>
                ) : (
                  auctions.map((auction) => (
                    <tr key={auction.id}>
                      <td className="auction-title-cell">
                      <Link to={`/admin/auction/${auction.id}`} className="auction-image">
                        <img src={auction.image} alt={auction.title} />
                      </Link>
                        <div className="auction-info">
                        <Link to={`/admin/auction/${auction.id}`} className="auction-title">
                          {auction.title}
                        </Link>
                          <div className="auction-category">
                            ID #{auction.id} | Category: {auction.category}
                          </div>
                        </div>
                      </td>
                      <td className="seller-cell">
                        <div className="seller-name">{auction.seller}</div>
                        {auction.sellerVerified && <div className="seller-verified">Verified</div>}
                        <div className="seller-email">{auction.sellerEmail}</div>
                      </td>
                      <td className="dates-cell">
                        <div>Start: {auction.startDate}</div>
                        <div>End: {auction.endDate}</div>
                      </td>
                      <td className="price-cell">
                        <div className="price">{auction.startingPrice}</div>
                        <div className="price-detail">Original Starting</div>
                      </td>
                      <td className="bid-cell">
                        <div className="bid">{auction.currentBid}</div>
                        <div className="bid-count">{auction.totalBids} bids</div>
                      </td>
                      <td className={`status-cell ${auction.status.toLowerCase()}`}>
                        <span className="status-badge">{auction.status}</span>
                      </td>
                      <td className="created-at-cell">
                        <div>{auction.createdAt}</div>
                        <div className="time-detail">Updated: {auction.updatedAt}</div>
                      </td>
                      <td className="action-cell">
                        <button className="action-button">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <div className="pagination-info">
              Showing <span>{auctions.length}</span> of <span>{totalItems}</span> entries
            </div>
            <div className="pagination-controls">
              <button 
                className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              
              {/* Tạo các nút số trang */}
              {Array.from({ length: totalPages }, (_, index) => (
                <button 
                  key={index + 1}
                  className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              
              <button 
                className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auctions;