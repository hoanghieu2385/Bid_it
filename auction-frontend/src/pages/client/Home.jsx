// File: src/pages/client/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/client/home.css';
import Banner from '../../components/client/home/Banner.jsx';
import Categories from '../../components/client/home/Category.jsx';
import { getAllAuctions } from '../../services/auction-api.js';

const Home = () => {
	useEffect(() => {
		document.title = 'Home | Bid it';
	}, []);

	const [latestAuctions, setLatestAuctions] = useState([]);
	const [upcomingAuctions, setUpcomingAuctions] = useState([]);
	const [ongoingAuctions, setOngoingAuctions] = useState([]);

	useEffect(() => {
		const fetchAuctions = async () => {
			try {
				const data = await getAllAuctions();
				const now = new Date();

				// Upcoming: startTime in future
				const upcoming = data
					.filter((a) => new Date(a.startTime) > now)
					.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

				const ongoing = data.filter((a) => {
					const start = new Date(a.startTime);
					const end = new Date(a.endTime);
					return start <= now && end >= now;
				});

				const latest = data.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)).slice(0, 6);

				setLatestAuctions(latest);
				setUpcomingAuctions(upcoming.slice(0, 6));
				setOngoingAuctions(ongoing.slice(0, 6));
			} catch (error) {
				console.error('Failed to fetch auctions:', error);
			}
		};
		fetchAuctions();
	}, []);

	const renderAuctionCard = (auction) => (
		<div key={auction.id} className="col-12 col-md-6 col-lg-4 mb-4">
			<div className="card h-100 shadow-sm border-0">
				<div
					style={{
						height: '200px',
						backgroundColor: '#fff',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						overflow: 'hidden',
					}}
				>
					<img
						src={auction.media?.[0]?.url || '/default-image.jpg'}
						onError={(e) => (e.target.src = '/default-image.jpg')}
						alt={auction.title}
						style={{
							maxHeight: '100%',
							maxWidth: '100%',
							objectFit: 'contain',
						}}
					/>
				</div>

				<div className="card-body d-flex flex-column">
					<h5 className="card-title">{auction.title}</h5>
					<p className="mb-1">
						<b>Current Bid:</b> {auction.currentBid?.toLocaleString('vi-VN')}₫
					</p>
					<p className="mb-1">
						<b>Ends:</b> {new Date(auction.endTime).toLocaleString('vi-VN')}
					</p>
					<div className="mt-auto">
						<Link to={`/auctions/${auction.id}`} className="btn btn-outline-primary btn-sm w-100">
							View Details
						</Link>
					</div>
				</div>
			</div>
		</div>
	);

	return (
		<div className="home-container">
			{/* Banner Section */}
			<Banner />

			{/* Categories Section */}
			<Categories />

			{/* Ongoing Auctions Section */}
			<section className="py-5 bg-light">
				<div className="container">
					<h2 className="text-center mb-4">Ongoing Auctions</h2>
					<div className="row">
						{ongoingAuctions.length > 0 ? (
							ongoingAuctions.map(renderAuctionCard)
						) : (
							<p className="text-center">No ongoing auctions right now.</p>
						)}
					</div>
				</div>
			</section>

			{/* Upcoming Auctions Section */}
			<section className="py-5">
				<div className="container">
					<h2 className="text-center mb-4">Upcoming Auctions</h2>
					<div className="row">
						{upcomingAuctions.length > 0 ? (
							upcomingAuctions.map(renderAuctionCard)
						) : (
							<p className="text-center">No upcoming auctions.</p>
						)}
					</div>
				</div>
			</section>

			{/* Latest Auctions Section */}
			<section className="py-5 bg-light">
				<div className="container">
					<h2 className="text-center mb-4">Latest Auctions</h2>
					<div className="row">
						{latestAuctions.length > 0 ? (
							latestAuctions.map(renderAuctionCard)
						) : (
							<p className="text-center">No recent auctions found.</p>
						)}
					</div>
					<div className="text-center mt-3">
						<Link to="/auctions" className="btn btn-link">
							View All Auctions
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Home;
