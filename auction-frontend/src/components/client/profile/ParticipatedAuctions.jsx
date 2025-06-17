// src/components/client/profile/ParticipatedAuctions.jsx
import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '../../../services/user-api';
import { getParticipatedAuctions } from '../../../services/auction-api';

const ParticipatedAuctions = () => {
	const [auctions, setAuctions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [currentUser, setCurrentUser] = useState(null);

	useEffect(() => {
		const fetchParticipatedAuctions = async () => {
			try {
				setLoading(true);
				
				// Await the getCurrentUser function
				const user = await getCurrentUser();
				if (!user || !user.id) {
					setError('User not authenticated');
					return;
				}

				setCurrentUser(user);
				console.log('Current user:', user); // Debug log
				
				const participatedAuctions = await getParticipatedAuctions(user.id);
				console.log('Participated auctions:', participatedAuctions); // Debug log
				
				setAuctions(participatedAuctions);
			} catch (err) {
				console.error('Error fetching participated auctions:', err);
				setError('Failed to load participated auctions. Please try again later.');
			} finally {
				setLoading(false);
			}
		};

		fetchParticipatedAuctions();
	}, []);

	const formatPrice = (price) => {
		// Kiểm tra nếu price là null, undefined hoặc NaN
		if (price === null || price === undefined || isNaN(price)) {
			return 'N/A';
		}
		
		// Chuyển đổi về số nếu là string
		const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
		
		if (isNaN(numericPrice)) {
			return 'N/A';
		}
		
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND'
		}).format(numericPrice);
	};

	const formatDate = (dateString) => {
		if (!dateString) return 'N/A';
		
		try {
			return new Date(dateString).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch (error) {
			console.error('Error formatting date:', error);
			return 'Invalid Date';
		}
	};

	const getStatusBadge = (status) => {
		const statusMap = {
			'PENDING': { class: 'bg-warning', text: 'Pending' },
			'UPCOMING': { class: 'bg-info', text: 'Upcoming' },
			'ACTIVE': { class: 'bg-success', text: 'Active' },
			'ENDED': { class: 'bg-secondary', text: 'Ended' },
			'CLOSED': { class: 'bg-dark', text: 'Closed' },
			'SOLD': { class: 'bg-info', text: 'Sold' },
			'FAILED': { class: 'bg-danger', text: 'Failed' }
		};
		
		const statusInfo = statusMap[status] || { class: 'bg-secondary', text: status };
		return (
			<span className={`badge ${statusInfo.class} text-white`}>
				{statusInfo.text}
			</span>
		);
	};

	const isWinner = (auction, user) => {
		return auction.winnerId === user?.id;
	};

	// Helper function để debug auction data
	const debugAuctionData = (auction) => {
		console.log('Auction debug:', {
			id: auction.id,
			title: auction.title,
			userHighestBid: auction.userHighestBid,
			userHighestBidType: typeof auction.userHighestBid,
			userBidCount: auction.userBidCount,
			userBids: auction.userBids
		});
	};

	if (loading) {
		return (
			<div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
				<span className="ms-2">Loading auction history...</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="alert alert-danger" role="alert">
				<i className="fas fa-exclamation-triangle me-2"></i>
				{error}
			</div>
		);
	}

	if (auctions.length === 0) {
		return (
			<div className="text-center py-5">
				<i className="fas fa-gavel fa-3x text-muted mb-3"></i>
				<h5 className="text-muted">No auctions participated yet</h5>
				<p className="text-muted">You haven't placed any bids in any auction sessions.</p>
			</div>
		);
	}

	return (
		<div>
			<div className="d-flex justify-content-between align-items-center mb-4">
				<h4 className="mb-0">
					<i className="fas fa-history me-2"></i>
					Participated Auctions
				</h4>
				<span className="badge bg-primary">{auctions.length} sessions</span>
			</div>

			<div className="row">
				{auctions.map((auction) => {
					// Debug log cho mỗi auction
					debugAuctionData(auction);
					
					return (
						<div key={auction.id} className="col-md-6 col-lg-4 mb-4">
							<div className="card h-100 shadow-sm">
								{auction.mediaUrls && auction.mediaUrls.length > 0 && (
									<img 
										src={auction.mediaUrls[0]} 
										className="card-img-top" 
										alt={auction.title}
										style={{ height: '200px', objectFit: 'cover' }}
									/>
								)}
								
								<div className="card-body">
									<div className="d-flex justify-content-between align-items-start mb-2">
										<h6 className="card-title text-truncate" title={auction.title}>
											{auction.title}
										</h6>
										{getStatusBadge(auction.status)}
									</div>

									<div className="mb-2">
										<small className="text-muted">Current Price:</small>
										<div className="fw-bold text-success">
											{formatPrice(auction.currentBid || auction.startingPrice)}
										</div>
									</div>

									<div className="mb-2">
										<small className="text-muted">Your Highest Bid:</small>
										<div className="fw-bold text-primary">
											{formatPrice(auction.userHighestBid)}
										</div>
									</div>

									<div className="mb-2">
										<small className="text-muted">Your Bids:</small>
										<span className="ms-1 badge bg-secondary">
											{auction.userBidCount || 0}
										</span>
									</div>

									{currentUser && isWinner(auction, currentUser) && (
										<div className="alert alert-success py-1 px-2 mb-2">
											<i className="fas fa-trophy me-1"></i>
											<small>You won this auction!</small>
										</div>
									)}

									<div className="d-flex justify-content-between align-items-center text-muted small">
										<span>
											<i className="fas fa-clock me-1"></i>
											Ends: {formatDate(auction.endTime)}
										</span>
									</div>
								</div>

								<div className="card-footer bg-transparent">
									<div className="d-flex justify-content-between">
										<button 
											className="btn btn-outline-primary btn-sm"
											onClick={() => window.location.href = `/auctions/${auction.id}`}
										>
											<i className="fas fa-eye me-1"></i>
											View Details
										</button>
										
										{auction.status === 'ACTIVE' && (
											<button 
												className="btn btn-primary btn-sm"
												onClick={() => window.location.href = `/auctions/${auction.id}`}
											>
												<i className="fas fa-gavel me-1"></i>
												Continue Bidding
											</button>
										)}
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Summary Statistics */}
			<div className="mt-4 p-3 bg-light rounded">
				<h6>Participation Statistics:</h6>
				<div className="row text-center">
					<div className="col-md-3">
						<div className="h5 text-primary mb-0">{auctions.length}</div>
						<small className="text-muted">Total Participated</small>
					</div>
					<div className="col-md-3">
						<div className="h5 text-success mb-0">
							{currentUser ? auctions.filter(a => isWinner(a, currentUser)).length : 0}
						</div>
						<small className="text-muted">Auctions Won</small>
					</div>
					<div className="col-md-3">
						<div className="h5 text-warning mb-0">
							{auctions.filter(a => a.status === 'ACTIVE').length}
						</div>
						<small className="text-muted">Currently Active</small>
					</div>
					<div className="col-md-3">
						<div className="h5 text-info mb-0">
							{auctions.reduce((total, auction) => total + (auction.userBidCount || 0), 0)}
						</div>
						<small className="text-muted">Total Bids Placed</small>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ParticipatedAuctions;