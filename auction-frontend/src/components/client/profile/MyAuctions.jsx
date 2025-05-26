// File: src/components/client/profile/MyAuctions.jsx
import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAuctionsBySeller } from '../../../services/auction-api';
import { UserContext } from '../../../contexts/UserContext';

const DISPLAY_STATUSES = ['UPCOMING', 'OPENED', 'CLOSED', 'SOLD', 'FAILED', 'COMPLETED'];

const getStatusBadgeClass = (status) => {
	switch (status) {
		case 'UPCOMING': return 'bg-info';
		case 'OPENED': return 'bg-success';
		case 'CLOSED': return 'bg-secondary';
		case 'SOLD': return 'bg-primary';
		case 'FAILED': return 'bg-danger';
		case 'COMPLETED': return 'bg-dark';
		default: return 'bg-light text-dark';
	}
};

const MyAuctions = () => {
	const { user } = useContext(UserContext);
	const [auctions, setAuctions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [filterStatus, setFilterStatus] = useState('');
	const hasFetchedRef = useRef(false);

	useEffect(() => {
		if (!user?.id || hasFetchedRef.current) return;
		hasFetchedRef.current = true;

		const fetchData = async () => {
			try {
				const response = await getAuctionsBySeller(user.id);
				const filtered = response
					.filter((a) => DISPLAY_STATUSES.includes(a.status))
					.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
				setAuctions(filtered);
			} catch (err) {
				console.error('MyAuctions fetch error:', err);
				setError('Failed to load your auctions.');
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [user?.id]);

	const filteredAuctions = filterStatus
		? auctions.filter((a) => a.status === filterStatus)
		: auctions;

	if (loading) return <div>Loading your auctions...</div>;
	if (error) return <div className="text-danger">{error}</div>;
	if (filteredAuctions.length === 0) return <div>You have not created any auctions yet.</div>;

	return (
		<div>
			<h4 className="mb-4">My Auctions</h4>

			<div className="mb-3">
				<label className="form-label fw-bold">Filter by Status</label>
				<select
					className="form-select"
					value={filterStatus}
					onChange={(e) => setFilterStatus(e.target.value)}
				>
					<option value="">All</option>
					{DISPLAY_STATUSES.map((status) => (
						<option key={status} value={status}>{status}</option>
					))}
				</select>
			</div>

			<div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
				{filteredAuctions.map((auction) => {
					const imageUrl = auction.media?.[0]?.url || '/default-image.jpg';

					return (
						<div key={auction.id} className="col">
							<div className="card h-100 shadow-sm border-0">
								<div className="position-relative">
									<img
										src={imageUrl}
										onError={(e) => {
											e.target.onerror = null;
											e.target.src = '/default-image.jpg';
										}}
										className="card-img-top"
										alt={auction.title}
										style={{ height: '200px', objectFit: 'cover' }}
									/>
									<span className={`badge position-absolute top-0 start-0 m-2 ${getStatusBadgeClass(auction.status)}`}>
										{auction.status}
									</span>
								</div>
								<div className="card-body d-flex flex-column">
									<h5 className="card-title">{auction.title}</h5>
									<p className="mb-1"><b>Start:</b> {new Date(auction.startTime).toLocaleString('vi-VN')}</p>
									<p className="mb-1"><b>End:</b> {new Date(auction.endTime).toLocaleString('vi-VN')}</p>
									<p className="mb-1"><b>Price:</b> {Number(auction.startingPrice).toLocaleString('vi-VN')}₫</p>
									<p className="mb-1"><b>Bids:</b> {auction.bidCount ?? 0}</p>
									<div className="mt-auto">
										<Link to={`/auctions/${auction.id}`} className="btn btn-outline-primary btn-sm mt-2 w-100">
											View Details
										</Link>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default MyAuctions;
