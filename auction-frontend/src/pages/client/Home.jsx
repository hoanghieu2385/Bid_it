import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
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
	const [timeLeft, setTimeLeft] = useState({});
	const [likedItems, setLikedItems] = useState({});

	useEffect(() => {
		const fetchAuctions = async () => {
			try {
				const data = await getAllAuctions();
				const now = new Date();

				const validAuctions = data.filter((auction) => auction.status !== 'CANCELLED');

				const upcoming = validAuctions
					.filter((a) => new Date(a.startTime) > now)
					.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

				const ongoing = validAuctions.filter((a) => {
					const start = new Date(a.startTime);
					const end = new Date(a.endTime);
					return start <= now && end >= now && a.status === 'OPENED';
				});

				const latest = validAuctions
					.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
					.slice(0, 8);

				setLatestAuctions(latest);
				setUpcomingAuctions(upcoming);
				setOngoingAuctions(ongoing);
			} catch (error) {
				console.error('Failed to fetch auctions:', error);
			}
		};
		fetchAuctions();
	}, []);

	useEffect(() => {
		const timer = setInterval(() => {
			calculateTimeLeft();
		}, 1000);
		calculateTimeLeft();
		return () => clearInterval(timer);
	}, [ongoingAuctions, upcomingAuctions, latestAuctions]);

	const calculateTimeLeft = () => {
		const now = new Date();
		const newTimeLeft = {};

		const allAuctions = [...ongoingAuctions, ...upcomingAuctions, ...latestAuctions];
		allAuctions.forEach((auction) => {
			const endTime = new Date(auction.endTime);
			const difference = endTime - now;
			if (difference > 0) {
				const days = Math.floor(difference / (1000 * 60 * 60 * 24));
				const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
				const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
				const seconds = Math.floor((difference % (1000 * 60)) / 1000);
				newTimeLeft[auction.id] = { days, hours, minutes, seconds };
			} else {
				newTimeLeft[auction.id] = { days: 0, hours: 0, minutes: 0, seconds: 0 };
			}
		});
		setTimeLeft(newTimeLeft);
	};

	const handleLikeClick = (auctionId, event) => {
		event.preventDefault();
		event.stopPropagation();
		setLikedItems((prev) => ({ ...prev, [auctionId]: !prev[auctionId] }));
	};

	const formatDateToDisplay = (dateString) => {
		const date = new Date(dateString);
		return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
	};

	const renderStatusBadge = (auction) => {
		const now = new Date();
		const start = new Date(auction.startTime);
		const end = new Date(auction.endTime);

		if (auction.status === 'CANCELLED') {
			return <span className="badge bg-danger mb-2">Auction Cancelled</span>;
		} else if (start > now) {
			return <span className="badge bg-warning text-dark mb-2">Auction Upcoming</span>;
		} else if (start <= now && end >= now && auction.status === 'OPENED') {
			return <span className="badge bg-success mb-2">Auction is Live</span>;
		} else if (end < now) {
			return <span className="badge bg-secondary mb-2">Auction Ended</span>;
		} else {
			return <span className="badge bg-secondary mb-2">Auction {auction.status}</span>;
		}
	};

	const renderAuctionCard = (auction) => (
		<div key={auction.id} className="col-12 col-md-6 col-lg-3 mb-4">
			<Link to={`/auctions/${auction.id}`} className="text-decoration-none text-dark">
				<div className="card h-100 hover-shadow">
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

					<div className="card-body">
						<h5 className="card-title">{auction.title}</h5>
						<p className="card-text">
							{renderStatusBadge(auction)}
							<br />
							Ends at: {formatDateToDisplay(auction.endTime)}
							<br />
							Starting Price: $ {auction.startingPrice.toLocaleString('vi-VN')}<br />
							Current Bid: $ {(auction.currentBid || auction.startingPrice).toLocaleString('vi-VN')}<br />
							Bids: {auction.bidCount || 0}
							<br />
							{timeLeft[auction.id] && (
								<small className="text-muted">
									Time left: {timeLeft[auction.id].days}d {timeLeft[auction.id].hours}h{' '}
									{timeLeft[auction.id].minutes}m {timeLeft[auction.id].seconds}s
								</small>
							)}
						</p>
						<div className="d-flex justify-content-end">
							<button
								className="btn btn-light"
								onClick={(e) => handleLikeClick(auction.id, e)}
							>
								{likedItems[auction.id] ? <FaHeart className="text-danger" /> : <FaRegHeart />}
							</button>
						</div>
					</div>
				</div>
			</Link>
		</div>
	);

	return (
		<div className="home-container">
			<Banner />
			<Categories />

			{/* Ongoing Auctions */}
			<section className="py-5 bg-light">
				<div className="container">
					<h2 className="text-center mb-4">Ongoing Auctions</h2>
					<div className="row">
						{ongoingAuctions.length > 0 ? (
							ongoingAuctions.slice(0, 8).map(renderAuctionCard)
						) : (
							<p className="text-center">No ongoing auctions right now.</p>
						)}
					</div>
					<div className="text-center mt-4">
						<Link to="/auctions?status=OPENED" className="btn btn-primary">
							View All Ongoing Auctions
						</Link>
					</div>
				</div>
			</section>

			{/* Upcoming Auctions */}
			<section className="py-5">
				<div className="container">
					<h2 className="text-center mb-4">Upcoming Auctions</h2>
					<div className="row">
						{upcomingAuctions.length > 0 ? (
							upcomingAuctions.slice(0, 8).map(renderAuctionCard)
						) : (
							<p className="text-center">No upcoming auctions.</p>
						)}
					</div>
					<div className="text-center mt-4">
						<Link to="/auctions?status=UPCOMING" className="btn btn-primary">
							View All Upcoming Auctions
						</Link>
					</div>
				</div>
			</section>

			{/* Latest Auctions */}
			<section className="py-5 bg-light">
				<div className="container">
					<h2 className="text-center mb-4">Latest Auctions</h2>
					<div className="row">
						{latestAuctions.length > 0 ? (
							latestAuctions.slice(0, 8).map(renderAuctionCard)
						) : (
							<p className="text-center">No recent auctions found.</p>
						)}
					</div>
					<div className="text-center mt-4">
						<Link to="/auctions" className="btn btn-primary">
							View All Auctions
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Home;
