import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getProtectedAuctionDetailById } from '../../../services/auction-api';
import { UserContext } from '../../../contexts/UserContext';
import dayjs from 'dayjs';
import "../../../assets/styles/client/OrderDetail.css";

const OrderDetail = () => {
  const { auctionId } = useParams();
  const { user } = useContext(UserContext);

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const data = await getProtectedAuctionDetailById(auctionId);
        setAuction(data);
        setMainImage(data.thumbnailUrl || data.media?.[0]?.url || "/assets/default-thumbnail.jpg");
      } catch (err) {
        setError('Unable to load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAuction();
  }, [auctionId]);

  if (loading) return <p>Loading...</p>;
  if (error || !auction) return <p>{error || 'Auction not found'}</p>;

  const isWinner = user?.id === auction.winnerId;

  return (
    <div className="order-page-wrapper">
      <div className="order-detail-flex">
        <div className="image-section">
          <img src={mainImage} alt="Main" className="main-thumbnail" />
          <div className="image-carousel">
            {auction.media?.map((item, index) => (
              <img
                key={index}
                src={item.url}
                alt={`Preview ${index + 1}`}
                className={`carousel-thumb ${mainImage === item.url ? 'active' : ''}`}
                onClick={() => setMainImage(item.url)}
              />
            ))}
          </div>
        </div>

        <div className="info-section">
          <h2 className="order-title">{auction.title}</h2>
          <p className="order-description">{auction.description}</p>

          <div className="order-section">
            <p><strong>Status:</strong> {auction.status}</p>
            <p><strong>Current Bid:</strong> ${auction.currentBid}</p>
            <p><strong>Auction Period:</strong><br />
              {dayjs(auction.startTime).format('MMM D, HH:mm')} → {dayjs(auction.endTime).format('MMM D, HH:mm')}
            </p>
          </div>

          {isWinner && (
            <div className="order-winner-box">
              <p>🎉 <strong>You won this auction!</strong></p>
              <p>Payment Deadline: <strong>{dayjs(auction.winnerPaymentDeadline).format('YYYY-MM-DD HH:mm')}</strong></p>
              <button className="pay-now-button" onClick={() => alert('Redirect to payment (TODO)')}>
                Pay Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
