import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
// Thay đổi ở đây: import cancelAuction thay vì deleteAuction
import { cancelAuction, getAuctionsBySeller } from '../../../services/auction-api';
import { UserContext } from '../../../contexts/UserContext';
import useToastMessage from '../../../hooks/useToastMessage';
import Swal from 'sweetalert2';

const DISPLAY_STATUSES = ['UPCOMING', 'OPENED', 'CANCELLED', 'CLOSED', 'SOLD', 'FAILED', 'COMPLETED'];
const ITEMS_PER_PAGE = 6;
const getStatusBadgeClass = (status) => {
	switch (status) {
		case 'UPCOMING':
			return 'bg-info';
		case 'OPENED':
			return 'bg-success';
		case 'CANCELLED':
			return 'bg-warning text-dark';
		case 'CLOSED':
			return 'bg-secondary';
		case 'SOLD':
			return 'bg-primary';
		case 'FAILED':
			return 'bg-danger';
		case 'COMPLETED':
			return 'bg-dark';
		default:
			return 'bg-light text-dark';
	}
};

const MyAuctions = () => {
	const { user } = useContext(UserContext);
	const { showSuccess, showError } = useToastMessage();

	const [auctions, setAuctions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filterStatus, setFilterStatus] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
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
				showError('Failed to load your auctions.');
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [user?.id, showError]);

	const filteredAuctions = filterStatus ? auctions.filter((a) => a.status === filterStatus) : auctions;

	const totalPages = Math.ceil(filteredAuctions.length / ITEMS_PER_PAGE);
	const paginatedAuctions = filteredAuctions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

	const handlePageChange = (page) => setCurrentPage(page);

	if (loading) return <div>Loading your auctions...</div>;
	if (!loading && auctions.length === 0) return <div>You have not created any auctions yet.</div>;

	const handleCancel = async (auctionId) => {
		const result = await Swal.fire({
			title: 'Confirm Cancel',
			text: 'Are you sure you want to cancel this auction?',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, cancel it',
			cancelButtonText: 'Keep it',
		});

		if (!result.isConfirmed) return;

		try {
			// gọi API đổi trạng thái
			const updated = await cancelAuction(auctionId, user.id);
			// cập nhật state: thay status của auction thành CANCELLED
			setAuctions((prev) => prev.map((a) => (a.id === auctionId ? { ...a, status: updated.status } : a)));
			showSuccess('Auction has been cancelled.');
		} catch (err) {
			console.error('Cancel error:', err);
			showError('Failed to cancel auction.');
		}
	};

	return (
		<div>
			<h4 className="mb-4 text-primary fw-bold">My Auctions</h4>

			<div className="mb-3">
				<label className="form-label fw-bold">Filter by Status</label>
				<select
					className="form-select"
					value={filterStatus}
					onChange={(e) => {
						setFilterStatus(e.target.value);
						setCurrentPage(1);
					}}
				>
					<option value="">All</option>
					{DISPLAY_STATUSES.map((status) => (
						<option key={status} value={status}>
							{status}
						</option>
					))}
				</select>
			</div>

			<div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
				{paginatedAuctions.map((auction) => {
					const imageUrl = auction.media?.[0]?.url || '/default-image.jpg';
					const now = new Date();
					const startTime = new Date(auction.startTime);
					// chỉ cho cancel nếu auction chưa bắt đầu quá 60 phút
					const canCancel = (startTime - now) / (1000 * 60) > 60;

					return (
						<div key={auction.id} className="col">
							<div className="card h-100 shadow-sm border-0">
								<div className="position-relative">
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
											src={imageUrl}
											onError={(e) => {
												e.target.onerror = null;
												e.target.src = '/default-image.jpg';
											}}
											alt={auction.title}
											style={{
												maxHeight: '100%',
												maxWidth: '100%',
												objectFit: 'contain',
											}}
										/>
									</div>

									<span className={`badge position-absolute top-0 start-0 m-2 ${getStatusBadgeClass(auction.status)}`}>
										{auction.status}
									</span>
								</div>
								<div className="card-body d-flex flex-column">
									<h5 className="card-title fw-bold">{auction.title}</h5>
									<p className="mb-1 text-muted">
										<b>Start:</b> {new Date(auction.startTime).toLocaleString('vi-VN')}
									</p>
									<p className="mb-1 text-muted">
										<b>End:</b> {new Date(auction.endTime).toLocaleString('vi-VN')}
									</p>
									<p className="mb-1">
										<b>Price:</b> {Number(auction.startingPrice).toLocaleString('vi-VN')}₫
									</p>
									<p className="mb-1">
										<b>Bids:</b> {auction.bidCount ?? 0}
									</p>
									<div className="mt-auto">
										<Link to={`/auctions/${auction.id}`} className="btn btn-outline-primary btn-sm w-100 mb-2">
											View Details
										</Link>
										{canCancel && auction.status === 'UPCOMING' && (
											<button className="btn btn-outline-danger btn-sm w-100" onClick={() => handleCancel(auction.id)}>
												Cancel
											</button>
										)}
										{canCancel && auction.status === 'UPCOMING' && (
											<Link to={`/auctions/${auction.id}/edit`} className="btn btn-outline-warning btn-sm w-100 mt-2">
												Edit
											</Link>
										)}
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{totalPages > 1 && (
				<nav className="mt-4">
					<ul className="pagination justify-content-center">
						{Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
							<li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
								<button className="page-link" onClick={() => handlePageChange(page)}>
									{page}
								</button>
							</li>
						))}
					</ul>
				</nav>
			)}
		</div>
	);
};

export default MyAuctions;
