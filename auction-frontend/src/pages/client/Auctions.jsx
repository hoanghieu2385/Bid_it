// src/pages/client/Auctions.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import '../../assets/styles/client/Auction.css';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { getAllAuctions, getAuctionsByCategory } from '../../services/auction-api';
import { getAllCategories } from '../../services/category-api';

const Auctions = () => {
	const itemsPerPage = 12;
	const [currentPage, setCurrentPage] = useState(1);
	const [auctions, setAuctions] = useState([]);
	const [timeLeft, setTimeLeft] = useState({});
	const [likedItems, setLikedItems] = useState({});
	const [statusFilter, setStatusFilter] = useState('');
	const [categoryFilter, setCategoryFilter] = useState('');
	const [categories, setCategories] = useState([]);
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const categoryNameFromURL = searchParams.get('category');

	useEffect(() => {
		getAllCategories().then(setCategories).catch(console.error);
	}, []);

	useEffect(() => {
		const fetchAuctions = async () => {
			try {
				if (categoryNameFromURL) {
					const selectedCategory = categories.find((c) => c.name === categoryNameFromURL);
					if (selectedCategory) {
						const data = await getAuctionsByCategory(selectedCategory.id);
						setAuctions(data);
						setCategoryFilter(selectedCategory.name);
					} else {
						setAuctions([]); // Không tìm thấy danh mục → không hiển thị gì
					}
					return;
				}

				const data = await getAllAuctions();
				setAuctions(data);
			} catch (err) {
				console.error('Failed to load auctions:', err);
			}
		};

		fetchAuctions();
	}, [categoryNameFromURL, categories]);

	useEffect(() => {
		const timer = setInterval(() => {
			calculateTimeLeft();
		}, 1000);
		calculateTimeLeft();
		return () => clearInterval(timer);
	}, [auctions]);

	const calculateTimeLeft = () => {
		const now = new Date();
		const newTimeLeft = {};
		auctions.forEach((auction, index) => {
			const endTime = new Date(auction.endTime);
			const difference = endTime - now;
			if (difference > 0) {
				const days = Math.floor(difference / (1000 * 60 * 60 * 24));
				const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
				const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
				const seconds = Math.floor((difference % (1000 * 60)) / 1000);
				newTimeLeft[index] = { days, hours, minutes, seconds };
			} else {
				newTimeLeft[index] = { days: 0, hours: 0, minutes: 0, seconds: 0 };
			}
		});
		setTimeLeft(newTimeLeft);
	};

	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = auctions.slice(indexOfFirstItem, indexOfLastItem);
	const totalPages = Math.ceil(auctions.length / itemsPerPage);

	const getPageNumbers = () => {
		const pageNumbers = [1];
		if (currentPage > 3) pageNumbers.push('...');
		for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
			pageNumbers.push(i);
		}
		if (currentPage < totalPages - 2) pageNumbers.push('...');
		if (totalPages > 1) pageNumbers.push(totalPages);
		return pageNumbers;
	};

	const handleLikeClick = (auctionId, event) => {
		event.preventDefault();
		setLikedItems((prev) => ({ ...prev, [auctionId]: !prev[auctionId] }));
	};

	const formatDateToDisplay = (dateString) => {
		const date = new Date(dateString);
		return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
	};

	const handleCategoryChange = (e) => {
		const selectedName = e.target.value;
		setCategoryFilter(selectedName);

		if (selectedName) {
			navigate(`/auctions?category=${encodeURIComponent(selectedName)}`);
		} else {
			navigate('/auctions');
		}
	};

	return (
		<div className="auction-page container">
			<h2 className="my-4">Browse Auctions</h2>

			<div className="row g-3 mb-4">
				<div className="col-md-4">
					<label>Status</label>
					<select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
						<option value="">All Status</option>
						<option value="UPCOMING">Upcoming</option>
						<option value="OPENED">Opened</option>
					</select>
				</div>
				<div className="col-md-4">
					<label>Category</label>
					<select className="form-select" value={categoryFilter} onChange={handleCategoryChange}>
						<option value="">All Categories</option>
						{categories.map((cat) => (
							<option key={cat.id} value={cat.name}>
								{cat.name}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="row g-4">
				{currentItems.map((auction) => (
					<div className="col-md-3" key={auction.id}>
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
										{auction.status === 'OPENED' ? (
											<span className="badge bg-success mb-2">Auction is live</span>
										) : (
											<span className="badge bg-warning text-dark mb-2">Auction upcoming</span>
										)}
										<br />
										Ends at: {formatDateToDisplay(auction.endTime)}
										<br />
										Starting Price: {auction.startingPrice?.toLocaleString('vi-VN')} đ<br />
										Current Bid: {(auction.currentBid || auction.startingPrice)?.toLocaleString('vi-VN')} đ<br />
										Bids: {auction.bidCount}
									</p>
									<div className="d-flex justify-content-end">
										<button className="btn btn-light" onClick={(e) => handleLikeClick(auction.id, e)}>
											{likedItems[auction.id] ? <FaHeart className="text-danger" /> : <FaRegHeart />}
										</button>
									</div>
								</div>
							</div>
						</Link>
					</div>
				))}
			</div>

			<div className="d-flex justify-content-center mt-4">
				<nav>
					<ul className="pagination">
						<li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
							<button className="page-link" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
								Prev
							</button>
						</li>
						{getPageNumbers().map((page, idx) => (
							<li key={idx} className={`page-item ${currentPage === page ? 'active' : ''}`}>
								{page === '...' ? (
									<span className="page-link">...</span>
								) : (
									<button className="page-link" onClick={() => setCurrentPage(page)}>
										{page}
									</button>
								)}
							</li>
						))}
						<li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
							<button className="page-link" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}>
								Next
							</button>
						</li>
					</ul>
				</nav>
			</div>
		</div>
	);
};

export default Auctions;
