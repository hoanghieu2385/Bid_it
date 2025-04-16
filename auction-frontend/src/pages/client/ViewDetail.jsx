import React, { useState } from 'react';
import '../../assets/styles/client/ViewDetail.css';
import { FaChevronLeft, FaChevronRight, FaRegClock, FaCheck } from 'react-icons/fa';

const ViewDetail = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [tabSelected, setTabSelected] = useState('description');

  // Mock data for the motorcycle auction
  const auctionData = {
    title: "Brand New royal Enfield 250 CC For Sale",
    seller: {
      name: "Christopher Anderson",
      username: "@chris145",
      location: "Giang Da District, Ha Noi"
    },
    rating: {
      score: 98,
      label: "Very Good"
    },
    auction: {
      currentBid: 0,
      startingPrice: 60000000,
      incrementAmount: 1000000,
      securityDeposit: 3000000,
      days: 3,
      hours: 16,
      minutes: 58,
      seconds: 23
    },
    description: "How can have anything you ant in life if you ?\n\nIf you've been following the crypto space, you've likely heard of Non-Fungible Tokens (Biddings), more popularly known as 'Crypto Collectibles.' The world of Biddings is growing rapidly. It seems there is no slowing down of these assets as they continue to go up in price. This growth comes with the opportunity for people to start new businesses to create and capture value. The market is open to players in every kind of field. Are you a collector?\n\nBut getting your own auction site up and running has always required learning complex coding languages, or hiring an expensive design firm for thousands of dollars and months of work.",
    otherListings: [
      {
        title: "BMW A161D A Class Hatch M26 Motor Bike",
        image: "bmw-bike.jpg",
        startingPrice: 80000000,
        currentBid: 0,
        bidCount: 0,
        timeLeft: "02D:16H:58M:23S"
      },
      {
        title: "Watercolor Special Lighter 2.2 For Saleing Offer",
        image: "lighter.jpg",
        startingPrice: 60000,
        currentBid: 0,
        bidCount: 0,
        timeLeft: "00D:16H:58M:23S"
      }
    ],
    images: [
      "motorcycle-main.jpg",
      "motorcycle-angle1.jpg",
      "motorcycle-angle2.jpg",
      "motorcycle-angle3.jpg",
      "motorcycle-angle4.jpg",
      "motorcycle-angle5.jpg",
      "motorcycle-angle6.jpg"
    ]
  };

  const handleImageChange = (index) => {
    setSelectedImage(index);
  };

  const handlePrevImage = () => {
    setSelectedImage((prev) => 
      prev === 0 ? auctionData.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => 
      prev === auctionData.images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="view-detail-container">
      <div className="auction-content">
        <div className="image-gallery">
          <div className="main-image-container">
            <button className="nav-button prev" onClick={handlePrevImage}>
              <FaChevronLeft />
            </button>
            <img 
              src={`/assets/${auctionData.images[selectedImage]}`} 
              alt={auctionData.title} 
              className="main-image" 
            />
            <button className="nav-button next" onClick={handleNextImage}>
              <FaChevronRight />
            </button>
          </div>
          <div className="thumbnail-container">
            {auctionData.images.map((img, index) => (
              <div 
                key={index} 
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => handleImageChange(index)}
              >
                <img src={`/assets/${img}`} alt={`Thumbnail ${index}`} />
              </div>
            ))}
          </div>
          <div className="countdown">
            <div className="time-unit">
              <div className="time-value">{String(auctionData.auction.days).padStart(2, '0')}</div>
              <div className="time-label">Days</div>
            </div>
            <div className="time-unit">
              <div className="time-value">{String(auctionData.auction.hours).padStart(2, '0')}</div>
              <div className="time-label">Hours</div>
            </div>
            <div className="time-unit">
              <div className="time-value">{String(auctionData.auction.minutes).padStart(2, '0')}</div>
              <div className="time-label">Mins</div>
            </div>
            <div className="time-unit">
              <div className="time-value">{String(auctionData.auction.seconds).padStart(2, '0')}</div>
              <div className="time-label">Secs</div>
            </div>
          </div>
        </div>

        <div className="auction-details">
          <div className="auction-header-details">
            <h2>{auctionData.title}</h2>
            <div className="seller-info">
              <div className="seller-avatar">
                <img src="/assets/avatar.jpg" alt="Seller" />
              </div>
              <div className="seller-details">
                <div className="seller-name">{auctionData.seller.name}</div>
                <div className="seller-username">{auctionData.seller.username}</div>
                <div className="seller-location">{auctionData.seller.location}</div>
              </div>
              <div className="seller-rating">
                <div className="rating-circle">
                  <span>{auctionData.rating.score}</span>
                </div>
                <div className="rating-label">{auctionData.rating.label}</div>
              </div>
            </div>
          </div>

          <div className="bid-section">
            <div className="bid-row">
              <div className="bid-label">Current Bid:</div>
              <div className="bid-value green">{auctionData.auction.currentBid.toLocaleString()} ₫</div>
            </div>
            <div className="bid-row">
              <div className="bid-label">Starting Price:</div>
              <div className="bid-value">{auctionData.auction.startingPrice.toLocaleString()} ₫</div>
            </div>
            <div className="bid-row">
              <div className="bid-label">Increment Amount:</div>
              <div className="bid-value">{auctionData.auction.incrementAmount.toLocaleString()} ₫</div>
            </div>
            <div className="bid-row">
              <div className="bid-label">Security Deposit:</div>
              <div className="bid-value">{auctionData.auction.securityDeposit.toLocaleString()} ₫</div>
            </div>
            <div className="deposit-notice">
              This auction requires deposit
            </div>
            <button className="deposit-button">Pay Deposit</button>
          </div>
        </div>
      </div>

      <div className="tab-section">
        <div className="tabs">
          <button 
            className={`tab ${tabSelected === 'description' ? 'active' : ''}`}
            onClick={() => setTabSelected('description')}
          >
            Description
          </button>
          <button 
            className={`tab ${tabSelected === 'bidding' ? 'active' : ''}`}
            onClick={() => setTabSelected('bidding')}
          >
            Bidding History (0)
          </button>
          <button 
            className={`tab ${tabSelected === 'comments' ? 'active' : ''}`}
            onClick={() => setTabSelected('comments')}
          >
            Comments (04)
          </button>
        </div>

        <div className="tab-content">
          {tabSelected === 'description' && (
            <div className="description-content">
              <p>{auctionData.description}</p>
              <ul>
                <li>
                  <FaCheck className="list-icon" />
                  Amet consectetur adipiscing elit. Maxime reprehenderit quaerat, velit rem atque voluptatibus!
                  <br />
                  Expensive Design.
                </li>
                <li>
                  <FaCheck className="list-icon" />
                  Consectetur adipiscing elit. Maxime reprehenderit quaerat!
                </li>
                <li>
                  <FaCheck className="list-icon" />
                  Fuga magni vertiatis ad temporibus atque adipisci nisi rerum...
                </li>
              </ul>
            </div>
          )}
          {tabSelected === 'bidding' && (
            <div className="bidding-content">
              <p>No bidding history available yet.</p>
            </div>
          )}
          {tabSelected === 'comments' && (
            <div className="comments-content">
              <p>4 comments available for this auction.</p>
            </div>
          )}
        </div>
      </div>

      <div className="related-section">
        <h3>Newest from the Seller</h3>
        <div className="related-items">
          {auctionData.otherListings.map((item, index) => (
            <div className="related-item" key={index}>
              <div className="related-image">
                <img src={`/assets/${item.image}`} alt={item.title} />
                <div className="time-remaining">{item.timeLeft}</div>
              </div>
              <div className="related-details">
                <h4>{item.title}</h4>
                <div className="related-price">
                  <div className="price-row">
                    <span>Starting Price:</span>
                    <span className="price-value">{item.startingPrice.toLocaleString()} ₫</span>
                  </div>
                  <div className="price-row">
                    <span>Current Bid:</span>
                    <span className="price-value">{item.currentBid} ₫</span>
                  </div>
                  <div className="price-row">
                    <span>Bid Count:</span>
                    <span className="price-value">{item.bidCount} bids</span>
                  </div>
                </div>
                <button className="join-auction">Join Auction</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewDetail;