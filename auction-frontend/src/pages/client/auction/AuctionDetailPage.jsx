// src/pages/client/auction/AuctionDetailPage.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAllAuctions, getAuctionDetailById } from '../../../services/auction-api';
import { getBidsByAuctionId } from '../../../services/bid_api';
import { createBid } from '../../../services/bid_api';
import defaultAvatar from '../../../assets/images/default-avatar.png';
import useToastMessage from '../../../hooks/useToastMessage';
import { UserContext } from '../../../contexts/UserContext';
import {getSellerById} from "../../../services/user-api.js";


const AuctionDetailPage = () => {
	// React router and user context
	const {id} = useParams();
	const {user} = useContext(UserContext);

	// Local state management
	const [auction, setAuction] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [remainingTime, setRemainingTime] = useState('');
	const [seller, setSeller] = useState(null);
	const [activeImage, setActiveImage] = useState(0);
	const [showFullDesc, setShowFullDesc] = useState(false);
	const [relatedAuctions, setRelatedAuctions] = useState([]);
	const [bidAmount, setBidAmount] = useState('');
	const [bidHistory, setBidHistory] = useState([]);


	// Toast message hook
	const {showSuccess, showError} = useToastMessage();

	// Calculate minimum bid amount
	const getMinimumBid = () => {
		return auction.currentBid
			? auction.currentBid + auction.incrementAmount
			: auction.startingPrice + auction.incrementAmount;
	};

	// Update bid amount when auction data changes
	useEffect(() => {
		if (auction) {
			setBidAmount(getMinimumBid().toString());
		}
	}, [auction]);

	// Fetch auction by ID
	const fetchAuction = async () => {
		try {
			const data = await getAuctionDetailById(id);
			setAuction(data);
			startCountdown(data.endTime);
			fetchSeller(data.sellerId);
			fetchRelatedAuctions(data);
		} catch {
			setError('Failed to load auction.');
		} finally {
			setLoading(false);
		}
	};

	const fetchBids = async () => {
		try {
			const wrapper = await getBidsByAuctionId(id);
			const bids = Array.isArray(wrapper)
				? wrapper
				: Array.isArray(wrapper.data)
					? wrapper.data
					: [];

			bids.sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));
			setBidHistory(bids);
		} catch (err) {
			console.error('Failed to load bid history', err);
		}
	};
	useEffect(() => {
		const init = async () => {
			await fetchAuction();
			await fetchBids();
		};
		init();
	}, [id]);

	// Fetch seller info
	const fetchSeller = async (sellerId) => {
		try {
			const res = await getSellerById(sellerId);
			setSeller(res);
		} catch (err) {
			console.error('Failed to load seller info:', err);
		}
	};

	// Fetch related auctions (same category, different ID)
	const fetchRelatedAuctions = async (currentAuction) => {
		try {
			const all = await getAllAuctions();
			const filtered = all.filter(
				(a) =>
					a.id !== currentAuction.id &&
					a.categoryId === currentAuction.categoryId &&
					['UPCOMING', 'ONGOING'].includes(a.status),
			);
			setRelatedAuctions(filtered.slice(0, 4));
		} catch (err) {
			console.error('Failed to load related auctions:', err);
		}
	};

	// Countdown logic
	const startCountdown = (endTime) => {
		const interval = setInterval(() => {
			const now = new Date();
			const end = new Date(endTime);
			const diff = end - now;

			if (diff <= 0) {
				setRemainingTime('Auction started or ended');
				clearInterval(interval);
			} else {
				const days = Math.floor(diff / (1000 * 60 * 60 * 24));
				const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
				const minutes = Math.floor((diff / (1000 * 60)) % 60);
				const seconds = Math.floor((diff / 1000) % 60);
				setRemainingTime(`${days} Days ${hours} Hours ${minutes} Mins ${seconds} Secs`);
			}
		}, 1000);
	};

	// Handle bid input change
	const handleBidAmountChange = (e) => {
		setBidAmount(e.target.value);
	};

	// Handle bid submission
	const handlePlaceBid = async (e) => {
		e.preventDefault();
		const bidValue = parseInt(bidAmount);

		// Check if user is logged in
		if (!user || !user.id) {
			showError('Please log in before placing a bid.');
			return;
		}

		// Validate bid amount
		const minimumBid = getMinimumBid();

		if (isNaN(bidValue) || bidValue < minimumBid) {
			showError(`Minimum bid is ${minimumBid.toLocaleString('vi-VN')} ₫`);
			return;
		}

		// Check if auction is still ongoing
		const now = new Date();
		const endTime = new Date(auction.endTime);
		if (now >= endTime) {
			showError('This auction has already ended.');
			return;
		}

		// Check if auction has started
		const startTime = new Date(auction.startTime);
		if (now < startTime) {
			showError('This auction has not started yet.');
			return;
		}

		// Prepare bid payload
		const payload = {
			auctionId: auction.id,
			bidderId: user.id,
			amount: bidValue,
		};

		try {
			await createBid(payload);
			showSuccess('Bid placed successfully!');

			// Refresh auction data
			const updatedAuction = await getAuctionDetailById(auction.id);
			setAuction(updatedAuction);
			await fetchBids();
		} catch (err) {
			console.error('Bid error:', err);
			const errorMessage =
				err?.response?.data?.message || err?.response?.data || 'Failed to place bid. Please try again.';
			showError(errorMessage);
		}
	};

	if (loading) return <div className="text-center py-5">Loading auction...</div>;
	if (error) return <div className="text-danger text-center">{error}</div>;
	if (!auction) return null;

	const truncatedDesc =
		auction.description?.length > 1000 && !showFullDesc
			? auction.description.substring(0, 1000) + '...'
			: auction.description;

	return (
		<div className="container py-4">
			<div className="row g-4">
				{/* Left: Image + Description + Bid History */}
				<div className="col-lg-7">
					{/* Image preview */}
					{auction.media?.length > 0 && (
						<>
							<div
								style={{
									height: '400px',
									width: '100%',
									backgroundColor: '#fff',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									overflow: 'hidden',
								}}
							>
								<img
									src={auction.media[activeImage].url}
									alt="main"
									className="rounded mb-3"
									style={{
										maxHeight: '100%',
										maxWidth: '100%',
										objectFit: 'contain',
									}}
								/>
							</div>
							<div className="d-flex gap-2 overflow-auto mt-2">
								{auction.media.map((img, idx) => (
									<img
										key={img.id}
										src={img.url}
										alt={`thumb-${idx}`}
										className={`rounded ${idx === activeImage ? 'border border-primary' : ''}`}
										style={{
											height: 'auto',
											width: '100px',
											objectFit: 'cover',
											cursor: 'pointer',
										}}
										onClick={() => setActiveImage(idx)}
									/>
								))}
							</div>
						</>
					)}

					{/* Countdown */}
					<div className="bg-light text-center mt-4 p-3 rounded">
						<strong className="text-muted">Time remaining:</strong>
						<div className="fs-4 fw-bold">{remainingTime}</div>
					</div>

					{/* Description */}
					<div className="mt-3">
						<label className="form-label fw-bold">Description:</label>
						<p style={{whiteSpace: 'pre-wrap'}} className="border rounded p-3 bg-white">
							{truncatedDesc}
						</p>
						{auction.description?.length > 1000 && (
							<button className="btn btn-link p-0" onClick={() => setShowFullDesc(!showFullDesc)}>
								{showFullDesc ? 'Show less' : 'Read more'}
							</button>
						)}
					</div>

					{/* ✅ Bid History - nằm dưới mô tả, không lấn sang phải */}
					{bidHistory.length > 0 && (
						<div className="bg-white mt-3 p-2 rounded shadow-sm border">
							<h6 className="fw-bold mb-2">Bid History</h6>
							<ul className="list-group list-group-flush small">
								{bidHistory.map((bid, index) => (
									<li key={index}
										className="list-group-item px-2 py-1 d-flex justify-content-between align-items-center">
										<div>
											<strong>{bid.bidderName}</strong>
											<br/>
											<small
												className="text-muted">{new Date(bid.bidTime).toLocaleString('vi-VN')}</small>
										</div>
										<span
											className="fw-bold text-success">{Number(bid.amount).toLocaleString('vi-VN')} ₫</span>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>

				{/* Right: Seller + Bidding Form */}
				<div className="col-lg-5">
					<h2 className="fw-bold mb-3">{auction.title}</h2>

					{/* Seller Info */}
					{seller && (
						<div className="d-flex align-items-center bg-white rounded p-3 shadow-sm mb-3">
							<img
								src={defaultAvatar}
								alt="Seller"
								className="rounded-circle me-3"
								style={{width: '50px', height: '50px', objectFit: 'cover'}}
							/>
							<div className="flex-grow-1">
								<div className="fw-semibold">Seller: {seller.fullName}</div>
								<small className="text-muted">{seller.address}</small>
							</div>
							<div className="text-end">
								<span className="badge bg-success rounded-pill fs-6">{seller.score || 1}</span>
								<br/>
								<small className="text-muted">Very Good</small>
							</div>
						</div>
					)}

					{/* Auction Price Info + Bidding Form */}
					<div className="bg-white rounded p-4 shadow-sm">
						{/* Current bid */}
						<div className="d-flex justify-content-between mb-2">
							<span><strong>Current Bid:</strong></span>
							<span className="text-success fw-bold">
							{auction.currentBid ? Number(auction.currentBid).toLocaleString('vi-VN') : '0'} ₫
						</span>
						</div>
						<hr className="my-2"/>
						<div className="d-flex justify-content-between mb-1">
							<span>Starting Price:</span>
							<span>{Number(auction.startingPrice).toLocaleString('vi-VN')} ₫</span>
						</div>
						<div className="d-flex justify-content-between mb-1">
							<span>Increment Amount:</span>
							<span>{Number(auction.incrementAmount).toLocaleString('vi-VN')} ₫</span>
						</div>
						<div className="d-flex justify-content-between mb-3">
							<span>Security Deposit:</span>
							<span>{Number(auction.securityDeposit).toLocaleString('vi-VN')} ₫</span>
						</div>

						{/* Bid form */}
						{new Date() < new Date(auction.startTime) ? (
							<div className="alert alert-info text-center py-2 mb-2">Auction hasn't started yet. Please
								wait...</div>
						) : new Date() >= new Date(auction.endTime) ? (
							<div className="alert alert-secondary text-center py-2 mb-2">This auction has ended.</div>
						) : (
							<form onSubmit={handlePlaceBid}>
								<div className="mb-3">
									<label className="form-label fw-semibold mb-2">
										Your bid amount (minimum: {getMinimumBid().toLocaleString('vi-VN')} ₫)
									</label>
									<div className="input-group">
										<input
											type="number"
											className="form-control rounded-start"
											value={bidAmount}
											onChange={handleBidAmountChange}
											min={getMinimumBid()}
											step={auction.incrementAmount}
											required
										/>
										<span className="input-group-text rounded-end bg-light fw-bold">₫</span>
									</div>
									<div className="mt-2">
										<button type="submit" className="btn btn-success fw-semibold py-2"
												disabled={!user}>
											{user ? 'Place Bid' : 'Login to Bid'}
										</button>
									</div>
								</div>

								{/* Quick bid buttons */}
								<div className="d-flex gap-2 flex-wrap">
									<button type="button" className="btn btn-outline-primary btn-sm"
											onClick={() => setBidAmount(getMinimumBid().toString())}>
										Min: {getMinimumBid().toLocaleString('vi-VN')} ₫
									</button>
									<button type="button" className="btn btn-outline-primary btn-sm"
											onClick={() => setBidAmount((getMinimumBid() + auction.incrementAmount).toString())}>
										+{auction.incrementAmount.toLocaleString('vi-VN')} ₫
									</button>
									<button type="button" className="btn btn-outline-primary btn-sm"
											onClick={() => setBidAmount((getMinimumBid() + auction.incrementAmount * 2).toString())}>
										+{(auction.incrementAmount * 2).toLocaleString('vi-VN')} ₫
									</button>
								</div>
							</form>
						)}

						{/* Deposit notice */}
						{auction.requiresDeposit && (
							<div className="alert alert-warning mt-3 d-flex justify-content-between align-items-center">
								<span>This auction requires a deposit</span>
								<button className="btn btn-outline-success btn-sm">Pay Deposit</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Related auctions */}
			{relatedAuctions.length > 0 && (
				<div className="mt-5">
					<h4 className="mb-3">Other auctions you may like</h4>
					<div className="row g-4">
						{relatedAuctions.map((item) => (
							<div className="col-md-3" key={item.id}>
								<Link to={`/auctions/${item.id}`} className="text-decoration-none">
									<div className="card h-100 shadow-sm">
										<div
											style={{
												height: '160px',
												backgroundColor: '#fff',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												overflow: 'hidden',
											}}
										>
											<img
												src={item.media?.[0]?.url || '/default-image.jpg'}
												onError={(e) => (e.target.src = '/default-image.jpg')}
												alt={item.title}
												style={{
													maxHeight: '100%',
													maxWidth: '100%',
													objectFit: 'contain',
												}}
											/>
										</div>
										<div className="card-body">
											<h6 className="card-title mb-1 text-dark">{item.title}</h6>
											<small
												className="text-muted">Starting: {new Date(item.startTime).toLocaleString('vi-VN')}</small>
											<small className="text-muted">
												<br/>End: {new Date(item.endTime).toLocaleString('vi-VN')}
											</small>
										</div>
									</div>
								</Link>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default AuctionDetailPage;
