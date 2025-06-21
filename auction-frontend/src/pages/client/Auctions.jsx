// src/pages/client/Auctions.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import '../../assets/styles/client/Auction.css';
import { FaHeart, FaRegHeart, FaSearch } from 'react-icons/fa';
import { getAllAuctions, getAuctionsByCategory } from '../../services/auction-api';
import { getAllCategories } from '../../services/category-api';

const Auctions = () => {
	const itemsPerPage = 12;
	const [currentPage, setCurrentPage] = useState(1);
	const [auctions, setAuctions] = useState([]);
	const [filteredAuctions, setFilteredAuctions] = useState([]);
	const [timeLeft, setTimeLeft] = useState({});
	const [likedItems, setLikedItems] = useState({});
	const [statusFilter, setStatusFilter] = useState('');
	const [categoryFilter, setCategoryFilter] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [categories, setCategories] = useState([]);
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const categoryNameFromURL = searchParams.get('category');
	const statusFromURL = searchParams.get('status');
	const searchFromURL = searchParams.get('search');

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
						setAuctions([]);
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

	// Set initial filters from URL
	useEffect(() => {
		if (statusFromURL) {
			setStatusFilter(statusFromURL);
		}
		if (searchFromURL) {
			setSearchQuery(searchFromURL);
		}
	}, [statusFromURL, searchFromURL]);

	// Filter auctions based on status, category, and search query
	useEffect(() => {
		let filtered = auctions;

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			filtered = filtered.filter(auction => 
				auction.title.toLowerCase().includes(query) ||
				auction.description?.toLowerCase().includes(query) ||
				auction.category?.name?.toLowerCase().includes(query)
			);
		}

		// Filter by status
		if (statusFilter) {
			const now = new Date();
			filtered = filtered.filter(auction => {
				const startTime = new Date(auction.startTime);
				const endTime = new Date(auction.endTime);

				switch (statusFilter) {
					case 'UPCOMING':
						return startTime > now;
					case 'OPENED':
						return startTime <= now && endTime > now;
					case 'ENDED':
						return endTime <= now;
					default:
						return true;
				}
			});
		}

		// Filter out ended auctions by default (unless specifically filtering for ended)
		if (!statusFilter || statusFilter !== 'ENDED') {
			const now = new Date();
			filtered = filtered.filter(auction => new Date(auction.endTime) > now);
		}

		setFilteredAuctions(filtered);
		setCurrentPage(1); // Reset to first page when filter changes
	}, [auctions, statusFilter, searchQuery]);

	useEffect(() => {
		const timer = setInterval(() => {
			calculateTimeLeft();
		}, 1000);
		calculateTimeLeft();
		return () => clearInterval(timer);
	}, [filteredAuctions]);

	const calculateTimeLeft = () => {
		const now = new Date();
		const newTimeLeft = {};
		filteredAuctions.forEach((auction) => {
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

	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = filteredAuctions.slice(indexOfFirstItem, indexOfLastItem);
	const totalPages = Math.ceil(filteredAuctions.length / itemsPerPage);

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
		event.stopPropagation();
		setLikedItems((prev) => ({ ...prev, [auctionId]: !prev[auctionId] }));
	};

	const formatDateToDisplay = (dateString) => {
		const date = new Date(dateString);
		return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
	};

	const handleCategoryChange = (e) => {
		const selectedName = e.target.value;
		setCategoryFilter(selectedName);
		updateURL({ category: selectedName });
	};

	const handleStatusChange = (e) => {
		const selectedStatus = e.target.value;
		setStatusFilter(selectedStatus);
		updateURL({ status: selectedStatus });
	};

	const handleSearchChange = (e) => {
		const query = e.target.value;
		setSearchQuery(query);
		updateURL({ search: query });
	};

	const handleSearchSubmit = (e) => {
		e.preventDefault();
		// Search is handled by handleSearchChange, this is just to prevent form submission
	};

	const updateURL = (newParams) => {
		const params = new URLSearchParams(searchParams);
		
		// Update or remove parameters
		Object.entries(newParams).forEach(([key, value]) => {
			if (value && value.trim()) {
				params.set(key, value);
			} else {
				params.delete(key);
			}
		});

		// Keep existing parameters that aren't being updated
		if (!Object.prototype.hasOwnProperty.call(newParams, 'category') && categoryFilter) {
			params.set('category', categoryFilter);
		}
		if (!Object.prototype.hasOwnProperty.call(newParams, 'status') && statusFilter) {
			params.set('status', statusFilter);
		}
		if (!Object.prototype.hasOwnProperty.call(newParams, 'search') && searchQuery) {
			params.set('search', searchQuery);
		}

		const queryString = params.toString();
		navigate(`/auctions${queryString ? '?' + queryString : ''}`);
	};

	const clearFilters = () => {
		setSearchQuery('');
		setStatusFilter('');
		setCategoryFilter('');
		navigate('/auctions');
	};

	return (
		<div className="auction-page container">
			{/* Search and Filters Container */}
			<div className="search-filter-container">
			<div className="filter-row">
				{/* Search Bar */}
				<div className="search-group">
				<label>Search</label>
				<form onSubmit={handleSearchSubmit}>
					<div className="input-group">
					<span className="input-group-text">
						<FaSearch />
					</span>
					<input
						type="text"
						className="form-control"
						placeholder="Search auctions"
						value={searchQuery}
						onChange={handleSearchChange}
					/>
					</div>
				</form>
				</div>

				{/* Status Filter */}
				<div className="filter-group">
				<label>Status</label>
				<select className="form-select" value={statusFilter} onChange={handleStatusChange}>
					<option value="">All Status</option>
					<option value="UPCOMING">Upcoming</option>
					<option value="OPENED">Opened</option>
					<option value="ENDED">Ended</option>
				</select>
				</div>
				
				{/* Category Filter */}
				<div className="filter-group">
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

				{/* Clear Button */}
				{(searchQuery || statusFilter || categoryFilter) && (
				<button
					type="button"
					className="btn btn-outline-secondary"
					onClick={clearFilters}
					style={{marginBottom: '0'}}
				>
					Clear
				</button>
				)}
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
										) : auction.status === 'ENDED' ? (
											<span className="badge bg-secondary mb-2">Auction ended</span>
										) : (
											<span className="badge bg-warning text-dark mb-2">Auction upcoming</span>
										)}
										<br />
										Ends at: {formatDateToDisplay(auction.endTime)}
										<br />
										Starting Price: {auction.startingPrice?.toLocaleString('vi-VN')} đ<br />
										Current Bid: {(auction.currentBid || auction.startingPrice)?.toLocaleString('vi-VN')} đ<br />
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
				))}
			</div>

			{filteredAuctions.length === 0 && (
				<div className="text-center py-5">
					<p className="text-muted">
						{searchQuery || statusFilter || categoryFilter 
							? 'No auctions found matching your criteria.' 
							: 'No auctions found.'
						}
					</p>
				</div>
			)}

			{totalPages > 1 && (
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
			)}
		</div>
	);
};

export default Auctions;