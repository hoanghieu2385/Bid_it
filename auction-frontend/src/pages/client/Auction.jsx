import React, { useState, useEffect } from "react";
import "../../assets/styles/client/Auction.css";
import {
  FaSearch,
  FaRegClock,
  FaRegEye,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa"; // Import thêm icons

const auctions = [
  {
    title: "Patek Philippe Complications Chronograph (S17060001)",
    category: "Đồng hồ",
    startBid: "50,000,000 đ",
    currentBid: "0 đ",
    bidCount: 0,
    endDate: "2024-07-24T19:00:00",
    startText: "Starts at:",
    image: "../../assets/images/logo.jpg",
    watchCount: 0,
  },
  {
    title: "Watercolor Special Lighter 2.2 Cho Mua Bán",
    category: "Trang sức",
    startBid: "50,000 đ",
    currentBid: "65,000 đ",
    bidCount: 3,
    endDate: "2024-07-20T15:30:00",
    status: "ongoing", // Đang đấu giá
    image: "https://via.placeholder.com/150",
    watchCount: 5,
  },
  {
    title: "Michael Korian Gold Special Watch 2016",
    category: "Đồng hồ",
    startBid: "2,500,000 đ",
    currentBid: "0 đ",
    bidCount: 0,
    endDate: "2024-07-28T18:00:00",
    status: "upcoming", // Sắp đấu giá
    image: "https://via.placeholder.com/150",
    watchCount: 2,
  },
  {
    title: "Giày Da Cao Cấp Tất Cả Các Biến Thể",
    category: "Thời trang",
    startBid: "700,000 đ",
    currentBid: "0 đ",
    bidCount: 0,
    endDate: "2024-07-05T12:30:00",
    status: "ongoing", // Đang đấu giá
    image: "https://via.placeholder.com/150",
    watchCount: 1,
  },
];

const Auction = () => {
  const itemsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState(""); // State để lưu trữ filter đang active
  const [timeLeft, setTimeLeft] = useState({});
  const [likedItems, setLikedItems] = useState({}); // Thêm state này vào component

  const handleLikeClick = (index, event) => {
    event.preventDefault(); // Ngăn chặn hành vi mặc định
    setLikedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Hàm tính thời gian còn lại
  const calculateTimeLeft = () => {
    const now = new Date();
    const newTimeLeft = {};

    auctions.forEach((auction, index) => {
      const endTime = new Date(auction.endDate);
      const difference = endTime - now;

      if (difference > 0) {
        // Tính toán các giá trị ngày, giờ, phút, giây
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        newTimeLeft[index] = { days, hours, minutes, seconds };
      } else {
        newTimeLeft[index] = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    });

    setTimeLeft(newTimeLeft);
  };

  // Chạy useEffect để cập nhật thời gian mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      calculateTimeLeft();
    }, 1000);

    // Khi component mount, tính toán thời gian ngay lập tức
    calculateTimeLeft();

    // Dọn dẹp timer khi component unmount
    return () => clearInterval(timer);
  }, []);

  // Function to handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Function to handle filter clicks
  const handleFilterClick = (filter) => {
    if (activeFilter === filter) {
      setActiveFilter(""); // Bỏ active nếu click vào filter đang active
    } else {
      setActiveFilter(filter); // Set active filter mới
    }
  };

  // Function để xác định class cho button filter
  const getFilterClass = (filter) => {
    if (activeFilter === filter) {
      return `filter-btn active-${filter}`;
    }
    return "filter-btn";
  };

  // Calculate the auctions to display based on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = auctions.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate total pages
  const totalPages = Math.ceil(auctions.length / itemsPerPage);

  const getPageNumbers = () => {
    const pageNumbers = [];

    pageNumbers.push(1);

    if (currentPage > 3) {
      pageNumbers.push("...");
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 2);
      i++
    ) {
      if (i !== 1 && i !== totalPages) {
        pageNumbers.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      pageNumbers.push("...");
    }

    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  // Hàm format ngày giờ theo định dạng trong ảnh
  const formatDateToDisplay = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <div className="auction-page">
      <div className="auction-header">
        <h1 className="auction-title">Browse Auctions</h1>
      </div>

      {/* Phần Tìm kiếm và Bộ lọc */}
      <div className="auction-search-filter-container">
        <div className="auction-search">
          <input
            type="text"
            placeholder="Search Here"
            className="search-input"
          />
          <div className="search-icon">
            <FaSearch />
          </div>
        </div>
        <div className="auction-filter">
          <button
            className={getFilterClass("new")}
            onClick={() => handleFilterClick("new")}
          >
            Newly Listed
          </button>
          <button
            className={getFilterClass("ending")}
            onClick={() => handleFilterClick("ending")}
          >
            Ending Soon
          </button>
          <button
            className={getFilterClass("bids")}
            onClick={() => handleFilterClick("bids")}
          >
            Most Bids
          </button>
          <button
            className={getFilterClass("watches")}
            onClick={() => handleFilterClick("watches")}
          >
            Most Watches
          </button>
          <button
            className={getFilterClass("past")}
            onClick={() => handleFilterClick("past")}
          >
            Past Result
          </button>
        </div>
      </div>

      {/* Hiển thị danh sách sản phẩm đấu giá */}
      <div className="auction-list">
        {currentItems.map((auction, index) => (
          <div key={index} className="auction-card">
            <div className="auction-img-container">
              <img
                src={auction.image}
                alt={auction.title}
                className="auction-img"
              />

              {/* Hiển thị thời gian bắt đầu hoặc thời gian còn lại */}
              <div className="auction-timer">
                {auction.startText ? (
                  <div className="auction-start-time">
                    <span>Starts at:</span>
                    <span>{formatDateToDisplay(auction.endDate)}</span>
                  </div>
                ) : (
                  timeLeft[index] && (
                    <div className="auction-countdown">
                      <div className="countdown-unit">
                        <div className="countdown-value">
                          {timeLeft[index].days}
                        </div>
                        <div className="countdown-label">Days</div>
                      </div>
                      <div className="countdown-unit">
                        <div className="countdown-value">
                          {timeLeft[index].hours}
                        </div>
                        <div className="countdown-label">Hours</div>
                      </div>
                      <div className="countdown-unit">
                        <div className="countdown-value">
                          {timeLeft[index].minutes}
                        </div>
                        <div className="countdown-label">Mins</div>
                      </div>
                      <div className="countdown-unit">
                        <div className="countdown-value">
                          {timeLeft[index].seconds}
                        </div>
                        <div className="countdown-label">Secs</div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="auction-category-icon">
              {auction.category === "Đồng hồ" ? (
                <span className="category-tag">
                  <FaRegClock /> Watches
                </span>
              ) : (
                <span className="category-tag">
                  <FaRegEye />{" "}
                  {auction.category === "Trang sức" ? "Jewelry" : "Fashion"}
                </span>
              )}
            </div>

            <div className="auction-info">
              <h2 className="auction-item-title">{auction.title}</h2>

              <div className="auction-price-details">
                <div className="price-row">
                  <span className="price-label">Starting Price:</span>
                  <span className="price-value">{auction.startBid}</span>
                </div>
                <div className="price-row">
                  <span className="price-label">Current Bid:</span>
                  <span className="price-value">
                    {auction.currentBid === "0 đ"
                      ? auction.startBid
                      : auction.currentBid}
                  </span>
                </div>
                <div className="price-row">
                  <span className="price-label">Bid Count:</span>
                  <span className="price-value">{auction.bidCount} bids</span>
                </div>
              </div>

              <div className="action-buttons">
                <button className="view-details-btn">View Details</button>
                <button
                  className="watch-btn"
                  onClick={(e) => handleLikeClick(index, e)}
                >
                  {likedItems[index] ? (
                    <FaHeart style={{ color: "red" }} />
                  ) : (
                    <FaRegHeart />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Phần chuyển trang */}
      <div className="pagination-container">
        <button
          className="pagination-btn"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Prev
        </button>

        {pageNumbers.map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="page-number">
              ...
            </span>
          ) : (
            <button
              key={`page-${page}`}
              className={`pagination-btn ${
                currentPage === page ? "active" : ""
              }`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          )
        )}

        <button
          className="pagination-btn"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Auction;
