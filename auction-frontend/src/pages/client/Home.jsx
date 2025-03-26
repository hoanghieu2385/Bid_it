import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../assets/styles/client/home.css'; // Import CSS riêng

const Home = () => {
	// Dữ liệu giả định cho các bài đấu giá nổi bật
	const featuredAuctions = [
		{
			id: 1,
			title: 'Đồng hồ Rolex cổ',
			image: '/assets/images/auction1.jpg',
			currentBid: 5000000,
			endTime: '2025-03-30 15:00:00',
		},
		{
			id: 2,
			title: 'Tranh sơn dầu thế kỷ 19',
			image: '/assets/images/auction2.jpg',
			currentBid: 12000000,
			endTime: '2025-03-28 10:00:00',
		},
		{
			id: 3,
			title: 'Xe đạp địa hình cao cấp',
			image: '/assets/images/auction3.jpg',
			currentBid: 3000000,
			endTime: '2025-03-29 18:00:00',
		},
	];

	return (
		<div className="client-home">
			{/* Banner */}
			<section className="client-home-banner text-center text-white py-5">
				<div className="container">
					<h1 className="client-banner-title">Chào mừng đến với Auction Platform</h1>
					<p className="client-banner-subtitle">Nơi bạn tìm thấy những món hàng độc đáo và cơ hội đấu giá hấp dẫn!</p>
					<Link to="/auctions" className="btn btn-primary client-banner-btn">
						Khám phá ngay
					</Link>
				</div>
			</section>

			{/* Danh sách đấu giá nổi bật */}
			<section className="client-home-auctions py-5">
				<div className="container">
					<h2 className="client-section-title text-center mb-4">Đấu giá nổi bật</h2>
					<div className="row">
						{featuredAuctions.map((auction) => (
							<div key={auction.id} className="col-md-4 mb-4">
								<div className="card client-auction-card h-100">
									<img src={auction.image} className="card-img-top client-auction-img" alt={auction.title} />
									<div className="card-body">
										<h5 className="card-title client-auction-title">{auction.title}</h5>
										<p className="card-text client-auction-bid">
											Giá hiện tại: <span>{auction.currentBid.toLocaleString('vi-VN')} VNĐ</span>
										</p>
										<p className="card-text client-auction-time">
											Kết thúc: {new Date(auction.endTime).toLocaleString('vi-VN')}
										</p>
									</div>
									<div className="card-footer text-center">
										<Link to={`/auctions/${auction.id}`} className="btn btn-outline-primary client-auction-btn">
											Đặt giá ngay
										</Link>
									</div>
								</div>
							</div>
						))}
					</div>
					<div className="text-center mt-4">
						<Link to="/auctions" className="btn btn-link client-view-all">
							Xem tất cả đấu giá
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Home;
