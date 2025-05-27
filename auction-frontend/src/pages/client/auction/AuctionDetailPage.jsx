// src/pages/client/auction/AuctionDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAllAuctions } from '../../../services/auction-api';
import { getSellerById } from '../../../services/user-api';
// import '../../../assets/styles/client/auction-detail.css'; // chưa có

const AuctionDetailPage = () => {
	const { id } = useParams();
	const [auction, setAuction] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [remainingTime, setRemainingTime] = useState('');
	const [seller, setSeller] = useState(null);
	const [activeImage, setActiveImage] = useState(0);
	const [showFullDesc, setShowFullDesc] = useState(false);
	const [relatedAuctions, setRelatedAuctions] = useState([]);

	useEffect(() => {
		document.title = 'Auction Details | Bid it';

		const fetchAuction = async () => {
			try {
				const data = await getSellerById(id);
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

		const fetchSeller = async (sellerId) => {
			try {
				const res = await getSellerById(sellerId);
				setSeller(res);
			} catch (err) {
				console.error('Failed to load seller info:', err);
			}
		};

		const fetchRelatedAuctions = async (currentAuction) => {
			try {
				const all = await getAllAuctions();
				const filtered = all.filter(a =>
					a.id !== currentAuction.id &&
					a.categoryId === currentAuction.categoryId &&
					['UPCOMING', 'ONGOING'].includes(a.status)
				);
				setRelatedAuctions(filtered.slice(0, 4));
			} catch (err) {
				console.error('Failed to load related auctions:', err);
			}
		};

		fetchAuction();
	}, [id]);

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

	if (loading) return <div className="text-center py-5">Loading auction...</div>;
	if (error) return <div className="text-danger text-center">{error}</div>;
	if (!auction) return null;

	const truncatedDesc = auction.description?.length > 1000 && !showFullDesc
		? auction.description.substring(0, 1000) + '...'
		: auction.description;

	return (
		<div className="container py-4">
			<div className="row g-4">
				{/* Left: Image section */}
				<div className="col-lg-7">
					{auction.media?.length > 0 && (
						<div>
							<img
								src={auction.media[activeImage].url}
								alt="main"
								className="w-100 rounded shadow mb-3"
								style={{ maxHeight: '400px', objectFit: 'cover' }}
							/>
							<div className="d-flex gap-2 overflow-auto">
								{auction.media.map((img, idx) => (
									<img
										key={img.id}
										src={img.url}
										alt={`thumb-${idx}`}
										className={`rounded ${idx === activeImage ? 'border border-primary' : ''}`}
										style={{ height: '80px', width: '100px', objectFit: 'cover', cursor: 'pointer' }}
										onClick={() => setActiveImage(idx)}
									/>
								))}
							</div>
						</div>
					)}

					<div className="bg-light text-center mt-4 p-3 rounded">
						<strong className="text-muted">Time remaining:</strong>
						<div className="fs-4 fw-bold">{remainingTime}</div>
					</div>

					<div className="mt-3">
						<label className="form-label fw-bold">Description:</label>
						<p style={{ whiteSpace: 'pre-wrap' }} className="border rounded p-3 bg-white">
							{truncatedDesc}
						</p>
						{auction.description?.length > 1000 && (
							<button className="btn btn-link p-0" onClick={() => setShowFullDesc(!showFullDesc)}>
								{showFullDesc ? 'Show less' : 'Read more'}
							</button>
						)}
					</div>
				</div>

				{/* Right: Product & Seller Info */}
				<div className="col-lg-5">
					<h2 className="fw-bold mb-3">{auction.title}</h2>

					{seller && (
						<div className="d-flex align-items-center bg-white rounded p-3 shadow-sm mb-3">
							<div>
								<div className="fw-semibold">Seller: {seller.fullName}</div>
								<small className="text-muted">{seller.address}</small>
							</div>
							<div className="ms-auto text-center">
								<div className="badge bg-success rounded-pill fs-6">{seller.score || 75}</div>
								<small className="text-muted d-block">Very Good</small>
							</div>
						</div>
					)}

					<div className="bg-light rounded p-3 shadow-sm">
						<div className="mb-2">
							<strong>Current Bid:</strong>
							<span className="text-success float-end">0 ₫</span>
						</div>
						<div>Starting Price: {Number(auction.startingPrice).toLocaleString('vi-VN')} ₫</div>
						<div>Increment Amount: {Number(auction.incrementAmount).toLocaleString('vi-VN')} ₫</div>
						<div>Security Deposit: {Number(auction.securityDeposit).toLocaleString('vi-VN')} ₫</div>

						{new Date() < new Date(auction.startTime) ? (
							<div className="alert alert-info mt-3">Auction hasn't started yet. Please wait...</div>
						) : (
							<button className="btn btn-success w-100 mt-3">Join Auction</button>
						)}

						{auction.requiresDeposit && (
							<div className="alert alert-warning mt-2">
								This auction requires deposit
								<button className="btn btn-outline-success btn-sm float-end">Pay Deposit</button>
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
						{relatedAuctions.map(item => (
							<div className="col-md-3" key={item.id}>
								<Link to={`/auctions/${item.id}`} className="text-decoration-none">
									<div className="card h-100">
										{item.media?.[0]?.url && (
											<img src={item.media[0].url} className="card-img-top" alt="..." style={{ height: '160px', objectFit: 'cover' }} />
										)}
										<div className="card-body">
											<h6 className="card-title mb-1 text-dark">{item.title}</h6>
											<small className="text-muted">Starting: {new Date(item.startTime).toLocaleString('vi-VN')}</small>
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
