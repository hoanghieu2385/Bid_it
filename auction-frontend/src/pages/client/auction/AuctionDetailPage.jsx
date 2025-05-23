// src/pages/client/auction/AuctionDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAuctionById } from '../../../services/auction-api';

const AuctionDetailPage = () => {
	const { id } = useParams();
	const [auction, setAuction] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [remainingTime, setRemainingTime] = useState('');

	useEffect(() => {
		document.title = 'Auction Details | Bid it';

		const fetchAuction = async () => {
			try {
				const data = await getAuctionById(id);
				setAuction(data);
				startCountdown(data.endTime);
			} catch {
				setError('Failed to load auction.');
			} finally {
				setLoading(false);
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
				setRemainingTime('Auction ended');
				clearInterval(interval);
			} else {
				const hours = Math.floor(diff / (1000 * 60 * 60));
				const minutes = Math.floor((diff / (1000 * 60)) % 60);
				const seconds = Math.floor((diff / 1000) % 60);
				setRemainingTime(`${hours}h ${minutes}m ${seconds}s`);
			}
		}, 1000);
	};

	if (loading) return <div className="text-center py-5">Loading auction...</div>;
	if (error) return <div className="text-danger text-center">{error}</div>;
	if (!auction) return null;

	return (
		<div className="container py-5">
			<h2 className="mb-4 text-center">{auction.title}</h2>

			{/* Carousel */}
			{auction.media?.length > 0 && (
				<div id="auctionCarousel" className="carousel slide mb-4" data-bs-ride="carousel">
					<div className="carousel-inner">
						{auction.media.map((img, index) => (
							<div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={img.id}>
								<img
									src={img.url}
									className="d-block w-100 rounded shadow"
									alt={`Slide ${index}`}
									style={{ maxHeight: '400px', objectFit: 'cover' }}
								/>
							</div>
						))}
					</div>
					<button className="carousel-control-prev" type="button" data-bs-target="#auctionCarousel" data-bs-slide="prev">
						<span className="carousel-control-prev-icon"></span>
					</button>
					<button className="carousel-control-next" type="button" data-bs-target="#auctionCarousel" data-bs-slide="next">
						<span className="carousel-control-next-icon"></span>
					</button>
				</div>
			)}

			<div className="mx-auto" style={{ maxWidth: '700px' }}>
				{/* Description */}
				<div className="mb-4">
					<label className="form-label fw-bold">Description:</label>
					<textarea
						className="form-control"
						rows="5"
						value={auction.description}
						readOnly
						style={{ whiteSpace: 'pre-wrap' }}
					/>
				</div>

				{/* Info grid */}
				<div className="row g-3">
					<div className="col-md-6">
						<div className="bg-light rounded p-3 shadow-sm">
							<strong className="text-muted">Start Time:</strong>
							<br />
							{new Date(auction.startTime).toLocaleString('vi-VN')}
						</div>
					</div>
					<div className="col-md-6">
						<div className="bg-light rounded p-3 shadow-sm">
							<strong className="text-muted">End Time:</strong>
							<br />
							{new Date(auction.endTime).toLocaleString('vi-VN')}
						</div>
					</div>
					<div className="col-md-6">
						<div className="bg-light rounded p-3 shadow-sm">
							<strong className="text-muted">Starting Price:</strong>
							<br />
							{Number(auction.startingPrice).toLocaleString('vi-VN')}₫
						</div>
					</div>
					<div className="col-md-6">
						<div className="bg-light rounded p-3 shadow-sm">
							<strong className="text-muted">Increment:</strong>
							<br />
							{Number(auction.incrementAmount).toLocaleString('vi-VN')}₫
						</div>
					</div>
					<div className="col-md-6">
						<div className="bg-light rounded p-3 shadow-sm">
							<strong className="text-muted">Status:</strong>
							<br />
							<span className="badge bg-primary">{auction.status}</span>
						</div>
					</div>
					<div className="col-md-6">
						<div className="bg-light rounded p-3 shadow-sm">
							<strong className="text-muted">Deposit Required:</strong>
							<br />
							{auction.requiresDeposit
								? `Yes — ${Number(auction.securityDeposit).toLocaleString('vi-VN')}₫`
								: 'No'}
						</div>
					</div>
					<div className="col-12">
						<div className="bg-warning bg-opacity-25 rounded p-3 shadow-sm">
							<strong className="text-muted">⏳ Time remaining:</strong>
							<br />
							<span className="fs-5">{remainingTime}</span>
						</div>
					</div>
				</div>

				{/* Join auction button */}
				<div className="text-center mt-4">
					<button className="btn btn-success px-5 py-2 fs-5">Join Auction</button>
				</div>
			</div>
		</div>
	);
};

export default AuctionDetailPage;
