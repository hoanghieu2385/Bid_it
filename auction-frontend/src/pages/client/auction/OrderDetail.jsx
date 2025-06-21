import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getProtectedAuctionDetailById } from '../../../services/auction-api';
import { UserContext } from '../../../contexts/UserContext';
import dayjs from 'dayjs';

const OrderDetail = () => {
  const { auctionId } = useParams();
  const { user } = useContext(UserContext);

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const data = await getProtectedAuctionDetailById(auctionId);
        setAuction(data);
      } catch (err) {
        console.error('Failed to fetch auction:', err);cl
        setError('Unable to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [auctionId]);

  if (loading) return <p className="text-center">Loading order details...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;
  if (!auction) return <p className="text-center">Auction not found.</p>;

  const isWinner = user?.id === auction.winnerId;
  const statusLabel = auction.status?.replace('_', ' ') ?? 'Unknown';

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-xl mt-6">
      <h1 className="text-2xl font-bold mb-4">Order Detail</h1>

      <div className="mb-6">
        <img
          src={auction.thumbnailUrl}
          alt="Auction Thumbnail"
          className="w-full h-64 object-cover rounded"
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{auction.title}</h2>
        <p className="text-gray-700">{auction.description}</p>
        <p>Status: <span className="font-medium">{statusLabel}</span></p>
        <p>Start Time: {dayjs(auction.startTime).format('YYYY-MM-DD HH:mm')}</p>
        <p>End Time: {dayjs(auction.endTime).format('YYYY-MM-DD HH:mm')}</p>
        <p>Starting Price: ${auction.startingPrice}</p>
        <p>Current Bid: ${auction.currentBid}</p>
        <p>Increment: ${auction.incrementAmount}</p>
        <p>Seller: {auction.user?.firstName} ({auction.user?.email})</p>
        <p>Seller Score: {auction.user?.score ?? 0}</p>
      </div>

      {isWinner && (
        <div className="mt-6 p-4 border border-green-400 rounded bg-green-50">
          <p className="text-green-800 font-medium">🎉 You won this auction!</p>
          {auction.winnerPaymentDeadline && (
            <p>Payment Deadline: <strong>{dayjs(auction.winnerPaymentDeadline).format('YYYY-MM-DD HH:mm')}</strong></p>
          )}
          <button
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => alert('Redirect to payment gateway (TODO)')}
          >
            Pay Now
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
