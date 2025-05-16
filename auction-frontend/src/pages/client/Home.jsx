// src/pages/client/Home.jsx
import {React, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/client/home.css';
import Banner from '../../components/client/home/Banner.jsx';
import Categories from '../../components/client/home/Category.jsx';

const Home = () => {
    useEffect(() => {
		document.title = 'Home | Bid it';
	}, []);

    const featuredAuctions = [
        {
            id: 1,
            title: 'Vintage Rolex Watch',
            image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=500&q=60',
            currentBid: 5000000,
            endTime: '2025-03-30T15:00:00',
        },
        {
            id: 2,
            title: '19th Century Oil Painting',
            image: 'https://www.science.org/do/10.1126/science.aal0591/full/sn-oilpainting-1644958447837.png',
            currentBid: 12000000,
            endTime: '2025-03-28T10:00:00',
        },
        {
            id: 3,
            title: 'High-End Mountain Bike',
            image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=500&q=60',
            currentBid: 3000000,
            endTime: '2025-03-29T18:00:00',
        },
        {
            id: 4,
            title: 'MacBook Pro 2023',
            image: 'https://sm.pcmag.com/t/pcmag_au/review/a/apple-macb/apple-macbook-pro-16-inch-2023-m2-max_7zsb.3840.jpg',
            currentBid: 21000000,
            endTime: '2025-04-01T22:00:00',
        },
        {
            id: 5,
            title: 'Limited Edition Sneakers',
            image: 'https://i.ebayimg.com/images/g/BakAAOSwaM1hpYXW/s-l500.jpg',
            currentBid: 3500000,
            endTime: '2025-04-02T20:00:00',
        },
        {
            id: 6,
            title: 'Antique Vase',
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2PqHXjOQGyWAhvMsm7cjcB3jjzPQtnqVqpA&s',
            currentBid: 8900000,
            endTime: '2025-04-05T09:30:00',
        },
    ];

    return (
        <div className="home-container">
            {/* Banner Section */}
            <Banner />

            {/* Categories Section */}
            <Categories />

            {/* Featured Auctions Section */}
            <section className="home-auctions py-5">
                <div className="container">
                    <h2 className="home-section-title text-center mb-5">Featured Auctions</h2>
                    <div className="row">
                        {featuredAuctions.map((auction) => (
                            <div key={auction.id} className="col-12 col-md-6 col-lg-4 mb-4">
                                <div className="card home-auction-card h-100">
                                    <img
                                        src={auction.image}
                                        className="card-img-top home-auction-img"
                                        alt={auction.title}
                                    />
                                    <div className="card-body">
                                        <h5 className="card-title home-auction-title">{auction.title}</h5>
                                        <p className="card-text home-auction-bid">
                                            Current Bid: <span>{auction.currentBid.toLocaleString('vi-VN')} VNĐ</span>
                                        </p>
                                        <p className="card-text home-auction-time">
                                            Ends: {new Date(auction.endTime).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                    <div className="card-footer text-center border-0">
                                        <Link
                                            to={`/auctions/${auction.id}`}
                                            className="btn btn-outline-primary home-auction-btn"
                                        >
                                            Bid Now
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-4">
                        <Link to="/auctions" className="btn btn-link home-view-all">
                            View All Auctions
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;