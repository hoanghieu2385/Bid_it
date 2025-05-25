// src/pages/client/Home.jsx
import { React, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/client/home.css';
import Banner from '../../components/client/home/Banner.jsx';
import Categories from '../../components/client/home/Category.jsx';
import { getAllAuctions } from '../../services/auction-api.js';

const Home = () => {
    useEffect(() => {
        document.title = 'Home | Bid it';
    }, []);

    const [featuredAuctions, setFeaturedAuctions] = useState([]);

    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                const data = await getAllAuctions();
                setFeaturedAuctions(data);
            } catch (error) {
                console.error('Failed to fetch auctions:', error);
            }
        };
        fetchAuctions();
    }, []);

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
                                        src={auction.media?.[0]?.url || '/default-image.jpg'}
                                        onError={(e) => { e.target.src = '/default-image.jpg'; }}
                                        className="card-img-top home-auction-img"
                                        alt={auction.title}
                                    />
                                    <div className="card-body">
                                        <h5 className="card-title home-auction-title">{auction.title}</h5>
                                        <p className="card-text home-auction-bid">
                                            Current Bid: <span>{auction.currentBid?.toLocaleString('vi-VN')} VNĐ</span>
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
                                            View
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
