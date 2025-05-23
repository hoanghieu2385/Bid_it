// src/pages/client/Auctions.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/client/Auction.css";
import {
  FaSearch,
  FaRegClock,
  FaRegEye,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
import { getAllAuctions } from "../../services/auction-api.js";

const Auctions = () => {
  const itemsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("");
  const [timeLeft, setTimeLeft] = useState({});
  const [likedItems, setLikedItems] = useState({});
  const [auctions, setAuctions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Browse Auctions | Bid it";
  }, []);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const data = await getAllAuctions();
        setAuctions(data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách đấu giá:", err);
      }
    };
    fetchAuctions();
  }, []);

  const handleLikeClick = (index, event) => {
    event.preventDefault();
    setLikedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const calculateTimeLeft = () => {
    const now = new Date();
    const newTimeLeft = {};

    auctions.forEach((auction, index) => {
      const endTime = new Date(auction.endTime);
      const difference = endTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        newTimeLeft[index] = { days, hours, minutes, seconds };
      } else {
        newTimeLeft[index] = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    });

    setTimeLeft(newTimeLeft);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      calculateTimeLeft();
    }, 1000);

    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [auctions]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterClick = (filter) => {
    if (activeFilter === filter) {
      setActiveFilter("");
    } else {
      setActiveFilter(filter);
    }
  };

  const getFilterClass = (filter) => {
    return activeFilter === filter ? `filter-btn active-${filter}` : "filter-btn";
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = auctions.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(auctions.length / itemsPerPage);

  const getPageNumbers = () => {
    const pageNumbers = [];
    pageNumbers.push(1);

    if (currentPage > 3) pageNumbers.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 2);
      i++
    ) {
      pageNumbers.push(i);
    }
    if (currentPage < totalPages - 2) pageNumbers.push("...");
    if (totalPages > 1) pageNumbers.push(totalPages);

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

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

      <div className="auction-search-filter-container">
        <div className="auction-search">
          <input type="text" placeholder="Search Here" className="search-input" />
          <div className="search-icon">
            <FaSearch />
          </div>
        </div>
        <div className="auction-filter">
          <button className={getFilterClass("new")} onClick={() => handleFilterClick("new")}>
            Newly Listed
          </button>
          <button className={getFilterClass("ending")} onClick={() => handleFilterClick("ending")}>
            Ending Soon
          </button>
          <button className={getFilterClass("bids")} onClick={() => handleFilterClick("bids")}>
            Most Bids
          </button>
          <button className={getFilterClass("watches")} onClick={() => handleFilterClick("watches")}>
            Most Watches
          </button>
          <button className={getFilterClass("past")} onClick={() => handleFilterClick("past")}>
            Past Result
          </button>
        </div>
      </div>

      <div className="auction-list">
        {currentItems.map((auction, index) => (
          <div key={auction.id} className="auction-card">
            <div className="auction-img-container">
              <img
                src={auction.media?.[0]?.url || "/default-image.jpg"}
                alt={auction.title}
                className="auction-img"
              />

              <div className="auction-timer">
                {timeLeft[index] && (
                  <div className="auction-countdown">
                    <div className="countdown-unit">
                      <div className="countdown-value">{timeLeft[index].days}</div>
                      <div className="countdown-label">Days</div>
                    </div>
                    <div className="countdown-unit">
                      <div className="countdown-value">{timeLeft[index].hours}</div>
                      <div className="countdown-label">Hours</div>
                    </div>
                    <div className="countdown-unit">
                      <div className="countdown-value">{timeLeft[index].minutes}</div>
                      <div className="countdown-label">Mins</div>
                    </div>
                    <div className="countdown-unit">
                      <div className="countdown-value">{timeLeft[index].seconds}</div>
                      <div className="countdown-label">Secs</div>
                    </div>
                  </div>
                )}
                <div className="auction-end-time text-center mt-2">
                  Kết thúc: {formatDateToDisplay(auction.endTime)}
                </div>
              </div>
            </div>

            <div className="auction-category-icon">
              {auction.category === "Đồng hồ" ? (
                <span className="category-tag">
                  <FaRegClock /> Watches
                </span>
              ) : (
                <span className="category-tag">
                  <FaRegEye /> Jewelry
                </span>
              )}
            </div>

            <div className="auction-info">
              <h2 className="auction-item-title">{auction.title}</h2>

              <div className="auction-price-details">
                <div className="price-row">
                  <span className="price-label">Starting Price:</span>
                  <span className="price-value">
                    {auction.startingPrice?.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="price-row">
                  <span className="price-label">Current Bid:</span>
                  <span className="price-value">
                    {(auction.currentBid || auction.startingPrice)?.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="price-row">
                  <span className="price-label">Bid Count:</span>
                  <span className="price-value">{auction.bidCount} bids</span>
                </div>
              </div>

              <div className="action-buttons">
                <button className="view-details-btn" onClick={() => navigate(`/auctions/${auction.id}`)}>
                  View
                </button>
                <button className="watch-btn" onClick={(e) => handleLikeClick(index, e)}>
                  {likedItems[index] ? <FaHeart style={{ color: "red" }} /> : <FaRegHeart />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination-container">
        <button className="pagination-btn" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
          Prev
        </button>

        {pageNumbers.map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="page-number">...</span>
          ) : (
            <button
              key={`page-${page}`}
              className={`pagination-btn ${currentPage === page ? "active" : ""}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          )
        )}

        <button className="pagination-btn" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Auctions;
