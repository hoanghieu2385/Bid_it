import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { deleteAuction, getAuctionsBySeller } from '../../../services/auction-api';
import { UserContext } from '../../../contexts/UserContext';
import useToastMessage from '../../../hooks/useToastMessage';
import Swal from 'sweetalert2';

const DISPLAY_STATUSES = ['UPCOMING', 'OPENED', 'CLOSED', 'SOLD', 'FAILED', 'COMPLETED'];
const ITEMS_PER_PAGE = 6;

const getStatusBadgeClass = (status) => {
	switch (status) {
		case 'UPCOMING':
			return 'bg-info';
		case 'OPENED':
			return 'bg-success';
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
	const { showError, showSuccess } = useToastMessage();

	const [auctions, setAuctions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filterStatus, setFilterStatus] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const hasFetchedRef = useRef(false);

	useEffect(() => {
		if (!user?.id || hasFetchedRef.current) return;
		hasFetchedRef.current = true;

		(async () => {
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
		})();
	}, [user?.id, showError]);

	const filteredAuctions = filterStatus ? auctions.filter((a) => a.status === filterStatus) : auctions;

	const totalPages = Math.ceil(filteredAuctions.length / ITEMS_PER_PAGE);
	const paginated = filteredAuctions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

	const handleDelete = async (auctionId) => {
		const result = await Swal.fire({
			title: 'Confirm Deletion',
			text: 'Are you sure you want to delete this auction?',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, delete it',
			cancelButtonText: 'Cancel',
		});
		if (!result.isConfirmed) return;

		try {
			await deleteAuction(auctionId, user.id);
			setAuctions((prev) => prev.filter((a) => a.id !== auctionId));
			showSuccess('Auction deleted successfully');
		} catch (err) {
			console.error(err);
			showError('Failed to delete auction');
		}
	};

	if (loading) return <div>Loading your auctions…</div>;
	if (!loading && auctions.length === 0) return <div>You have no auctions.</div>;

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
				{paginated.map((auction) => {
					const img = auction.media?.[0]?.url || '/default-image.jpg';
					const canEditOrDelete = (new Date(auction.startTime) - new Date()) / 60000 > 60;

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
											src={img}
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
										{canEditOrDelete && (
											<>
												<Link to={`/auctions/${auction.id}/edit`} className="btn btn-outline-warning btn-sm w-100 mb-2">
													Edit
												</Link>
												<button
													className="btn btn-outline-danger btn-sm w-100"
													onClick={() => handleDelete(auction.id)}
												>
													Delete
												</button>
											</>
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
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
								<button className="page-link" onClick={() => setCurrentPage(page)}>
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
