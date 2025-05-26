// File: src/components/client/profile/MyAuctions.jsx
import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getAuctionsBySeller } from '../../../services/auction-api';
import { UserContext } from '../../../contexts/UserContext';

const MyAuctions = () => {
	const { user } = useContext(UserContext);
	const [auctions, setAuctions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await getAuctionsBySeller(user.id);
				setAuctions(response);
			} catch {
				setError('Failed to load your auctions.');
			} finally {
				setLoading(false);
			}
		};

		if (user) {
			fetchData();
		}
	}, [user]);

	if (loading) return <div>Loading your auctions...</div>;
	if (error) return <div className="text-danger">{error}</div>;
	if (auctions.length === 0) return <div>You have not created any auctions yet.</div>;

	return (
		<div>
			<h4 className="mb-3">My Auctions</h4>
			<div className="row row-cols-1 row-cols-md-2 g-4">
				{auctions.map((auction) => (
					<div key={auction.id} className="col">
						<div className="card h-100 shadow-sm">
							{auction.imageUrls?.length > 0 && (
								<img
									src={auction.imageUrls[0]}
									className="card-img-top"
									alt={auction.title}
									style={{ height: '200px', objectFit: 'cover' }}
								/>
							)}
							<div className="card-body">
								<h5 className="card-title">{auction.title}</h5>
								<p className="card-text mb-1">
									<b>Start:</b>{' '}
									{new Date(auction.startTime).toLocaleString('vi-VN')}
								</p>
								<p className="card-text mb-1">
									<b>Start Price:</b>{' '}
									{Number(auction.startingPrice).toLocaleString('vi-VN')}₫
								</p>
								<p className="card-text mb-1">
									<b>Bids:</b> {auction.bidCount ?? 0}
								</p>
								<Link
									to={`/auctions/${auction.id}`}
									className="btn btn-outline-primary btn-sm mt-2"
								>
									View Details
								</Link>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default MyAuctions;
