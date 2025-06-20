import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

// CRITICAL: Import crypto polyfill FIRST and IMMEDIATELY
import '../../../utils/crypto-polyfill.js';

// Add a small delay to ensure polyfill is fully loaded
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
import { getAllAuctions, getAuctionDetailById } from '../../../services/auction-api';
import { getBidsByAuctionId } from '../../../services/bid_api';
import { createBid } from '../../../services/bid_api';
import defaultAvatar from '../../../assets/images/default-avatar.png';
import useToastMessage from '../../../hooks/useToastMessage';
import { UserContext } from '../../../contexts/UserContext';
import { getSellerById } from '../../../services/user-api.js';

// Import WebSocket libraries AFTER ensuring crypto is available
let Client, SockJS;

const loadWebSocketLibraries = async () => {
	// Small delay to ensure crypto polyfill is fully initialized
	await delay(50);

	// Verify crypto is available before importing
	if (typeof window !== 'undefined' && (window.crypto?.randomBytes || window.cryptoPolyfill?.randomBytes)) {
		console.log('✅ Crypto verified, importing WebSocket libraries...');

		try {
			// Dynamic imports to ensure they load after crypto polyfill
			const [stompModule, sockjsModule] = await Promise.all([import('@stomp/stompjs'), import('sockjs-client')]);

			// Sửa lại cách lấy Client
			Client = stompModule.Client || stompModule.default?.Client || stompModule.default;
			SockJS = sockjsModule.default || sockjsModule;

			console.log('✅ WebSocket libraries loaded successfully');
			console.log('Client:', typeof Client);
			console.log('SockJS:', typeof SockJS);

			return { Client, SockJS };
		} catch (error) {
			console.error('❌ Failed to load WebSocket libraries:', error);
			throw error;
		}
	} else {
		console.error('❌ Crypto not available, WebSocket libraries may fail');
		throw new Error('Crypto polyfill not properly loaded');
	}
};

// Connection Status Component
const ConnectionStatusBadge = ({ status }) => {
	const statusConfig = {
		connecting: { color: 'warning', text: 'Connecting to live updates...', icon: '🔄' },
		connected: { color: 'success', text: 'Live updates active', icon: '🟢' },
		disconnected: { color: 'secondary', text: 'Live updates disconnected', icon: '🔴' },
		error: { color: 'danger', text: 'Connection error - refreshing page recommended', icon: '❌' },
	};

	const config = statusConfig[status] || statusConfig.connecting;

	return (
		<div className={`alert alert-${config.color} d-flex align-items-center py-2 mb-3`}>
			<span className="me-2">{config.icon}</span>
			<small>{config.text}</small>
			{status === 'error' && (
				<button className="btn btn-sm btn-outline-primary ms-auto" onClick={() => window.location.reload()}>
					Refresh Page
				</button>
			)}
		</div>
	);
};

const AuctionDetailPage = () => {
	// React router and user context
	const { id } = useParams();
	const { user } = useContext(UserContext);
	const [showVerifyPopup, setShowVerifyPopup] = useState(false);

	// WebSocket client ref
	const wsUrl = '/bid-service/ws'; // Proxied through Vite to API Gateway
	const stompClientRef = useRef(null);
	const reconnectTimeoutRef = useRef(null);
	const connectionAttemptsRef = useRef(0);
	const maxAttempts = 5;
	const isConnectingRef = useRef(false);

	// Local state management
	const [auction, setAuction] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [remainingTime, setRemainingTime] = useState('');
	const [seller, setSeller] = useState(null);
	const [activeImage, setActiveImage] = useState(0);
	const [showFullDesc, setShowFullDesc] = useState(false);
	const [relatedAuctions, setRelatedAuctions] = useState([]);
	const [bidAmount, setBidAmount] = useState('');
	const [bidHistory, setBidHistory] = useState([]);
	const [connectionStatus, setConnectionStatus] = useState('connecting');

	// Toast message hook
	const { showSuccess, showError, showWarning } = useToastMessage();

	// Calculate minimum bid amount
	const getMinimumBid = () => {
		return auction.currentBid
			? auction.currentBid + auction.incrementAmount
			: auction.startingPrice + auction.incrementAmount;
	};

	// Load WebSocket libraries first
	useEffect(() => {
		loadWebSocketLibraries().catch(console.error);
	}, []);

	// WebSocket connection effect
	useEffect(() => {
		if (!Client || !SockJS) {
			console.log('⏳ Waiting for WebSocket libraries to load...');
			return;
		}

		const connectWebSocket = () => {
			// Prevent multiple concurrent connections
			if (isConnectingRef.current) {
				console.log('🔄 Connection already in progress, skipping...');
				return;
			}

			if (connectionAttemptsRef.current >= maxAttempts) {
				console.error('❌ Max connection attempts reached. Giving up.');
				setConnectionStatus('error');
				return;
			}

			isConnectingRef.current = true;
			connectionAttemptsRef.current++;

			console.log(`🔄 Attempting to connect to: ${wsUrl} - attempt ${connectionAttemptsRef.current}`);

			try {
				// Lấy token từ localStorage
				const token = localStorage.getItem('jwt');
				console.log('🔑 Token from localStorage:', token);

				const client = new Client({
					webSocketFactory: () => new SockJS(wsUrl),
					reconnectDelay: 0,
					heartbeatIncoming: 10000,
					heartbeatOutgoing: 10000,
					connectionTimeout: 15000,
					debug: (str) => console.log('🔧 STOMP Debug:', str),

					// Gửi token trong connect headers
					connectHeaders: {
						Authorization: token ? `Bearer ${token}` : undefined,
					},
				});

				// Connection handlers
				client.onConnect = (frame) => {
					console.log('✅ Connected to WebSocket', frame);
					setConnectionStatus('connected');
					connectionAttemptsRef.current = 0;
					isConnectingRef.current = false;

					// Subscribe to auction bid updates
					const subscription = client.subscribe(`/topic/auction/${id}/bids`, (message) => {
						try {
							const notification = JSON.parse(message.body);

							if (notification.type === 'NEW_BID' && notification.bidInfo) {
								const newBid = notification.bidInfo;
								console.log('📥 Received bid info:', newBid);

								// Update bid history
								setBidHistory((prev) => {
									const existingBid = prev.find(
										(bid) =>
											bid.id === newBid.id ||
											(bid.userId === newBid.userId &&
												Math.abs((bid.bidAmount || bid.amount) - (newBid.bidAmount || newBid.amount)) < 0.01),
									);

									if (existingBid) return prev;
									return [newBid, ...prev];
								});

								// Update current bid
								setAuction((prev) => ({
									...prev,
									currentBid: notification.currentHighestBid || newBid.bidAmount || newBid.amount || prev.currentBid,
								}));

								// Show notification
								showSuccess(`New bid: ${(newBid.bidAmount || newBid.amount || 0).toLocaleString('vi-VN')} ₫`);
							}
						} catch (err) {
							console.error('❌ Failed to parse bid from WebSocket:', err);
						}
					});


					// Subscribe to auction statistics updates
					client.subscribe(`/topic/auction/${id}/stats`, (message) => {
						try {
							const stats = JSON.parse(message.body);
							console.log('📊 Received auction stats:', stats);

							setAuction((prev) => ({
								...prev,
								currentBid: stats.currentBid || prev.currentBid,
								bidCount: stats.bidCount || prev.bidCount,
							}));
						} catch (err) {
							console.error('❌ Failed to parse stats from WebSocket:', err);
						}
					});

					// Subscribe to error messages
					if (user?.id) {
						client.subscribe(`/user/queue/auction/${id}/errors`, (message) => {
							try {
								const error = JSON.parse(message.body);
								console.error('❌ Received bid error:', error);
								showError(error.message || 'Bid failed');
							} catch (err) {
								console.error('❌ Failed to parse error from WebSocket:', err);
							}
						});

						// Subscribe to outbid notifications
						client.subscribe(`/user/queue/auction/${id}/outbid`, (message) => {
							try {
								const notification = JSON.parse(message.body);
								console.log('📢 Received outbid notification:', notification);
								showWarning(
									`You have been outbid! New highest bid: ${notification.currentHighestBid?.toLocaleString('vi-VN')} ₫`,
								);
							} catch (err) {
								console.error('❌ Failed to parse outbid notification:', err);
							}
						});
					}

					console.log('🎯 Subscribed to auction updates:', subscription);

					// Send join message if user is logged in
					if (user?.id) {
						client.publish({
							destination: `/app/auction/${id}/join`,
							body: JSON.stringify({
								userId: user.id,
								username: user.username || user.fullName || 'Anonymous',
							}),
						});
					}
				};

				client.onStompError = (frame) => {
					console.error('❌ STOMP error:', frame.headers['message'], frame.body);
					isConnectingRef.current = false;
					setConnectionStatus('error');
					tryReconnect();
				};

				client.onWebSocketError = (error) => {
					console.error('❌ WebSocket error:', error);
					isConnectingRef.current = false;
					setConnectionStatus('error');
					tryReconnect();
				};

				client.onDisconnect = (frame) => {
					console.log('🔌 Disconnected from WebSocket:', frame);
					isConnectingRef.current = false;
					setConnectionStatus('disconnected');
					tryReconnect();
				};

				client.onWebSocketClose = (event) => {
					console.log('🔌 WebSocket closed:', event);
					isConnectingRef.current = false;
					setConnectionStatus('disconnected');
					tryReconnect();
				};

				stompClientRef.current = client;
				client.activate();
			} catch (error) {
				console.error('❌ Failed to create WebSocket connection:', error);
				isConnectingRef.current = false;
				setConnectionStatus('error');
				tryReconnect();
			}
		};

		const tryReconnect = () => {
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}

			if (connectionAttemptsRef.current < maxAttempts) {
				const delay = Math.min(3000 * connectionAttemptsRef.current, 15000);
				console.log(`🔄 Scheduling reconnection in ${delay}ms...`);

				reconnectTimeoutRef.current = setTimeout(() => {
					console.log('🔄 Attempting to reconnect...');
					setConnectionStatus('connecting');
					connectWebSocket();
				}, delay);
			} else {
				console.error('❌ All connection attempts failed.');
				setConnectionStatus('error');
			}
		};

		// Initial connection
		connectWebSocket();

		// Cleanup function
		return () => {
			console.log('🛑 Cleaning up WebSocket connection...');
			isConnectingRef.current = false;

			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}

			if (stompClientRef.current && stompClientRef.current.connected) {
				// Send leave message before disconnect
				try {
					if (user?.id) {
						stompClientRef.current.publish({
							destination: `/app/auction/${id}/leave`,
							body: JSON.stringify({
								userId: user.id,
								username: user.username || user.fullName || 'Anonymous',
							}),
						});
					}
				} catch (err) {
					console.log('Could not send leave message:', err);
				}

				stompClientRef.current.deactivate();
			}
		};
	}, [Client, SockJS, id, user]);

	// Fetch auction by ID
	const fetchAuction = async () => {
		try {
			const data = await getAuctionDetailById(id);
			setAuction(data);
			startCountdown(data.endTime);
			fetchSeller(data.sellerId);
			fetchRelatedAuctions(data);
		} catch {
			setError('Failed to load auction.');
		} finally {
			setLoading(false);
		}
	};

	const fetchBids = async () => {
		try {
			const wrapper = await getBidsByAuctionId(id);

			// Handle different response structures
			let bids = [];
			if (Array.isArray(wrapper)) {
				bids = wrapper;
			} else if (wrapper && Array.isArray(wrapper.data)) {
				bids = wrapper.data;
			} else if (wrapper && wrapper.data && Array.isArray(wrapper.data.data)) {
				bids = wrapper.data.data;
			}

			// Sort by bid time (newest first) and remove duplicates
			const uniqueBids = bids.filter((bid, index, self) => index === self.findIndex((b) => b.id === bid.id));

			uniqueBids.sort((a, b) => {
				const timeA = new Date(a.bidTime || a.createdAt || a.timestamp || 0);
				const timeB = new Date(b.bidTime || b.createdAt || b.timestamp || 0);
				return timeB - timeA;
			});

			setBidHistory(uniqueBids);
		} catch (err) {
			console.error('Failed to load bid history', err);
		}
	};

	// Load initial data
	useEffect(() => {
		fetchAuction();
		fetchBids();
	}, [id]);

	// Fetch seller info
	const fetchSeller = async (sellerId) => {
		try {
			const res = await getSellerById(sellerId);
			setSeller(res);
		} catch (err) {
			console.error('Failed to load seller info:', err);
		}
	};

	// Fetch related auctions
	const fetchRelatedAuctions = async (currentAuction) => {
		try {
			const all = await getAllAuctions();
			const filtered = all.filter(
				(a) =>
					a.id !== currentAuction.id &&
					a.categoryId === currentAuction.categoryId &&
					['UPCOMING', 'ONGOING'].includes(a.status),
			);
			setRelatedAuctions(filtered.slice(0, 4));
		} catch (err) {
			console.error('Failed to load related auctions:', err);
		}
	};

	// Countdown logic
	const startCountdown = (endTime) => {
		const interval = setInterval(() => {
			const now = new Date();
			const end = new Date(endTime);
			const diff = end - now;

			if (diff <= 0) {
				setRemainingTime('Auction started or ended');
				clearInterval(interval);
			} else {
				const days = Math.floor(diff / (1000 * 60 * 60 * 24));
				const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
				const minutes = Math.floor((diff / (1000 * 60)) % 60);
				const seconds = Math.floor((diff / 1000) % 60);
				setRemainingTime(`${days} Days ${hours} Hours ${minutes} Mins ${seconds} Secs`);
			}
		}, 1000);
	};

	// Handle bid input change
	const handleBidAmountChange = (e) => {
		setBidAmount(e.target.value);
	};

	const handlePlaceBid = async (e) => {
		e.preventDefault();
		const bidValue = parseInt(bidAmount);

		// Check if user is logged in
		if (!user || !user.id) {
			showError('Please log in before placing a bid.');
			return;
		}

		// ✅ Check if account is verified
		if (user.verifiedAccount === 0) {
			setShowVerifyPopup(true);
			return;
		}

		// (các phần xử lý khác giữ nguyên...)

		// Validate bid amount
		const minimumBid = getMinimumBid();

		if (isNaN(bidValue) || bidValue < minimumBid) {
			showError(`Minimum bid is ${minimumBid.toLocaleString('vi-VN')} ₫`);
			return;
		}

		// Check if auction is still ongoing
		const now = new Date();
		const endTime = new Date(auction.endTime);
		if (now >= endTime) {
			showError('This auction has already ended.');
			return;
		}

		// Check if auction has started
		const startTime = new Date(auction.startTime);
		if (now < startTime) {
			showError('This auction has not started yet.');
			return;
		}

		// Prepare bid payload
		const payload = {
			auctionId: auction.id,
			userId: user.id,
			bidAmount: bidValue,
		};

		try {
			// Option 1: Use WebSocket for real-time bidding (if connected)
			if (stompClientRef.current && stompClientRef.current.connected && connectionStatus === 'connected') {
				stompClientRef.current.publish({
					destination: `/app/auction/${auction.id}/bid`,
					body: JSON.stringify({
						userId: user.id,
						bidAmount: bidValue,
						timestamp: new Date().toISOString(),
					}),
				});

				// Show immediate feedback
				showSuccess('Bid submitted! Waiting for confirmation...');
				console.log('📤 Bid sent via WebSocket');
			} else {
				// Option 2: Fallback to REST API
				console.log('📤 Using REST API fallback for bidding');
				const result = await createBid(payload);

				if (result && result.success !== false) {
					showSuccess('Bid placed successfully!');

					// Refresh auction data
					const updatedAuction = await getAuctionDetailById(auction.id);
					setAuction(updatedAuction);
					await fetchBids();
				} else {
					showError(result?.message || 'Failed to place bid');
				}
			}
		} catch (err) {
			console.error('Bid error:', err);
			const errorMessage =
				err?.response?.data?.message || err?.response?.data || err?.message || 'Failed to place bid. Please try again.';
			showError(errorMessage);
		}
	};

	if (loading) return <div className="text-center py-5">Loading auction...</div>;
	if (error) return <div className="text-danger text-center">{error}</div>;
	if (!auction) return null;

	const truncatedDesc =
		auction.description?.length > 1000 && !showFullDesc
			? auction.description.substring(0, 1000) + '...'
			: auction.description;

	return (
		<div className="container py-4">
			{/* Connection Status */}
			<ConnectionStatusBadge status={connectionStatus} />

			<div className="row g-4">
				{/* Left: Image + Description + Bid History */}
				<div className="col-lg-7">
					{/* Image preview */}
					{auction.media?.length > 0 && (
						<>
							<div
								style={{
									height: '400px',
									width: '100%',
									backgroundColor: '#fff',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									overflow: 'hidden',
								}}
							>
								<img
									src={auction.media[activeImage].url}
									alt="main"
									className="rounded mb-3"
									style={{
										maxHeight: '100%',
										maxWidth: '100%',
										objectFit: 'contain',
									}}
								/>
							</div>
							<div className="d-flex gap-2 overflow-auto mt-2">
								{auction.media.map((img, idx) => (
									<img
										key={img.id}
										src={img.url}
										alt={`thumb-${idx}`}
										className={`rounded ${idx === activeImage ? 'border border-primary' : ''}`}
										style={{
											height: 'auto',
											width: '100px',
											objectFit: 'cover',
											cursor: 'pointer',
										}}
										onClick={() => setActiveImage(idx)}
									/>
								))}
							</div>
						</>
					)}

					{/* Countdown */}
					<div className="bg-light text-center mt-4 p-3 rounded">
						<strong className="text-muted">Time remaining:</strong>
						<div className="fs-4 fw-bold">{remainingTime}</div>
					</div>

					{/* Description */}
					<div className="mt-3">
						<label className="form-label fw-bold">Description:</label>
						<p style={{ whiteSpace: 'pre-wrap' }} className="border rounded p-3 bg-white">
							{truncatedDesc}
						</p>
						{auction.description?.length > 1000 && (
							<button className="btn btn-link p-0" onClick={() => setShowFullDesc(!showFullDesc)}>
								{showFullDesc ? 'Show less' : 'Read more'}
							</button>
						)}
					</div>

					{/* Bid History */}
					{bidHistory.length > 0 && (
						<div className="bg-white mt-3 p-2 rounded shadow-sm border">
							<h6 className="fw-bold mb-2 d-flex align-items-center">
								Bid History ({bidHistory.length} bids)
								{connectionStatus === 'connected' && <span className="badge bg-success ms-2">Live</span>}
							</h6>
							<ul className="list-group list-group-flush small">
								{bidHistory.map((bid, index) => {
									const bidderName = bid.bidderName || bid.userName || bid.user?.name || 'Anonymous';
									const bidAmount = bid.amount || bid.bidAmount || 0;
									const bidTime = bid.bidTime || bid.createdAt || bid.timestamp;

									return (
										<li
											key={bid.id || `bid-${index}`}
											className="list-group-item px-2 py-1 d-flex justify-content-between align-items-center"
										>
											<div>
												<strong>{bidderName}</strong>
												<br />
												<small className="text-muted">
													{bidTime ? new Date(bidTime).toLocaleString('vi-VN') : 'Unknown time'}
												</small>
											</div>
											<span className="fw-bold text-success">
												{bidAmount && !isNaN(bidAmount) ? Number(bidAmount).toLocaleString('vi-VN') + ' ₫' : '0 ₫'}
											</span>
										</li>
									);
								})}
							</ul>
						</div>
					)}
				</div>

				{/* Right: Seller + Bidding Form */}
				<div className="col-lg-5">
					<h2 className="fw-bold mb-3">{auction.title}</h2>

					{/* Seller Info */}
					{seller && (
						<div className="d-flex align-items-center bg-white rounded p-3 shadow-sm mb-3">
							<img
								src={defaultAvatar}
								alt="Seller"
								className="rounded-circle me-3"
								style={{ width: '50px', height: '50px', objectFit: 'cover' }}
							/>
							<div className="flex-grow-1">
								<div className="fw-semibold">Seller: {seller.fullName}</div>
								<small className="text-muted">{seller.address}</small>
							</div>
							<div className="text-end">
								<span className="badge bg-success rounded-pill fs-6">{seller.score || 1}</span>
								<br />
								<small className="text-muted">Very Good</small>
							</div>
						</div>
					)}

					{/* Auction Price Info + Bidding Form */}
					<div className="bg-white rounded p-4 shadow-sm">
						{/* Current bid */}
						<div className="d-flex justify-content-between mb-2">
							<span>
								<strong>Current Bid:</strong>
							</span>
							<span className="text-success fw-bold">
								{auction.currentBid ? Number(auction.currentBid).toLocaleString('vi-VN') : '0'} ₫
							</span>
						</div>
						<hr className="my-2" />
						<div className="d-flex justify-content-between mb-1">
							<span>Starting Price:</span>
							<span>{Number(auction.startingPrice).toLocaleString('vi-VN')} ₫</span>
						</div>
						<div className="d-flex justify-content-between mb-1">
							<span>Increment Amount:</span>
							<span>{Number(auction.incrementAmount).toLocaleString('vi-VN')} ₫</span>
						</div>
						<div className="d-flex justify-content-between mb-3">
							<span>Security Deposit:</span>
							<span>{Number(auction.securityDeposit).toLocaleString('vi-VN')} ₫</span>
						</div>

						{/* Bid form */}
						{user?.id === auction.sellerId ? (
							<div className="alert alert-warning text-center py-2 mb-2">
								You cannot bid on your own auction.
							</div>
						) : new Date() < new Date(auction.startTime) ? (
							<div className="alert alert-info text-center py-2 mb-2">Auction hasn't started yet. Please wait...</div>
						) : new Date() >= new Date(auction.endTime) ? (
							<div className="alert alert-secondary text-center py-2 mb-2">This auction has ended.</div>
						) : (
							<form onSubmit={handlePlaceBid}>
								<div className="mb-3">
									<label className="form-label fw-semibold mb-2">
										Your bid amount (minimum: {getMinimumBid().toLocaleString('vi-VN')} ₫)
									</label>
									<div className="input-group">
										<input
											type="number"
											className="form-control rounded-start"
											value={bidAmount}
											onChange={handleBidAmountChange}
											min={getMinimumBid()}
											step={auction.incrementAmount}
											required
										/>
										<span className="input-group-text rounded-end bg-light fw-bold">₫</span>
									</div>
									<div className="mt-2">
										<button type="submit" className="btn btn-success fw-semibold py-2 w-100" disabled={!user}>
											{user
												? connectionStatus === 'connected'
													? '⚡ Place Bid (Live)'
													: '📤 Place Bid (API)'
												: 'Login to Bid'}
										</button>
									</div>
								</div>

								{/* Quick bid buttons */}
								<div className="d-flex gap-2 flex-wrap">
									<button
										type="button"
										className="btn btn-outline-primary btn-sm"
										onClick={() => setBidAmount(getMinimumBid().toString())}
									>
										Min: {getMinimumBid().toLocaleString('vi-VN')} ₫
									</button>
									<button
										type="button"
										className="btn btn-outline-primary btn-sm"
										onClick={() => setBidAmount((getMinimumBid() + auction.incrementAmount).toString())}
									>
										+{auction.incrementAmount.toLocaleString('vi-VN')} ₫
									</button>
									<button
										type="button"
										className="btn btn-outline-primary btn-sm"
										onClick={() => setBidAmount((getMinimumBid() + auction.incrementAmount * 2).toString())}
									>
										+{(auction.incrementAmount * 2).toLocaleString('vi-VN')} ₫
									</button>
								</div>
							</form>
						)}

						{/* Deposit notice */}
						{auction.requiresDeposit && (
							<div className="alert alert-warning mt-3 d-flex justify-content-between align-items-center">
								<span>This auction requires a deposit</span>
								<button className="btn btn-outline-success btn-sm">Pay Deposit</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Related auctions */}
			{relatedAuctions.length > 0 && (
				<div className="mt-5">
					<h4 className="mb-3">Other auctions you may like</h4>
					<div className="row g-4">
						{relatedAuctions.map((item) => (
							<div className="col-md-3" key={item.id}>
								<Link to={`/auctions/${item.id}`} className="text-decoration-none">
									<div className="card h-100 shadow-sm">
										<div
											style={{
												height: '160px',
												backgroundColor: '#fff',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												overflow: 'hidden',
											}}
										>
											<img
												src={item.media?.[0]?.url || '/default-image.jpg'}
												onError={(e) => (e.target.src = '/default-image.jpg')}
												alt={item.title}
												style={{
													maxHeight: '100%',
													maxWidth: '100%',
													objectFit: 'contain',
												}}
											/>
										</div>
										<div className="card-body">
											<h6 className="card-title mb-1 text-dark">{item.title}</h6>
											<small className="text-muted">Starting: {new Date(item.startTime).toLocaleString('vi-VN')}</small>
											<small className="text-muted">
												<br />
												End: {new Date(item.endTime).toLocaleString('vi-VN')}
											</small>
										</div>
									</div>
								</Link>
							</div>
						))}
					</div>
				</div>
			)}
			{showVerifyPopup && (
				<div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
					<div className="modal-dialog modal-dialog-centered">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Account Verification Required</h5>
								<button type="button" className="btn-close" onClick={() => setShowVerifyPopup(false)}></button>
							</div>
							<div className="modal-body">
								<p>You must verify your identity before placing a bid.</p>
							</div>
							<div className="modal-footer">
								<button className="btn btn-secondary" onClick={() => setShowVerifyPopup(false)}>
									Not Now
								</button>
								<Link to="/profile?tab=ekyc" className="btn btn-primary">
									Go to Verification Page
								</Link>
							</div>
						</div>
					</div>
				</div>
			)}

		</div>
	);
};

export default AuctionDetailPage;
