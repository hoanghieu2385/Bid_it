// src/components/client/profile/ParticipatedAuctions.jsx
// import React, { useEffect, useState } from 'react';
// import { getCurrentUser } from '../../../utils/auth';
// import { getParticipatedAuctions } from '../../../services/auctionService';

/*
 * File: src/components/client/profile/ParticipatedAuctions.jsx
 * Chức năng: Hiển thị các phiên đấu giá mà user đã tham gia đặt giá
 */

const ParticipatedAuctions = () => {
	// const [auctions, setAuctions] = useState([]);
	// const [loading, setLoading] = useState(true);
	// const [error, setError] = useState(null);

	// useEffect(() => {
	// 	const fetchData = async () => {
	// 		try {
	// 			const user = getCurrentUser();
	// 			const response = await getParticipatedAuctions(user.id);
	// 			setAuctions(response);
	// 		} catch {
	// 			setError('Failed to load participated auctions.');
	// 		} finally {
	// 			setLoading(false);
	// 		}
	// 	};

	// 	fetchData();
	// }, []);

	// if (loading) return <div>Loading your bidding history...</div>;
	// if (error) return <div className="text-danger">{error}</div>;
	// if (auctions.length === 0) return <div>You have not participated in any auctions yet.</div>;

	// return (
	// 	<div>
	// 		<h4 className="mb-3">Participated Auctions</h4>
	// 		<ul className="list-group">
	// 			{auctions.map((auction) => (
	// 				<li key={auction.id} className="list-group-item">
	// 					<strong>{auction.title}</strong> - Highest bid: ${auction.highestBid}
	// 				</li>
	// 			))}
	// 		</ul>
	// 	</div>
	// );

    return ( 
        <div>
            <h4 className="mb-3">Participated Auctions</h4>
            <ul className="list-group">
                <li className="list-group-item">
                    <strong>Sample Auction Title</strong> - Highest bid: $150
                </li>
            </ul>
        </div>
    )
};

export default ParticipatedAuctions;
