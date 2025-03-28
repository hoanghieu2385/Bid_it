import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/client/home.css';
import Banner from '../../components/client/home/Banner.jsx';


const Home = () => {
    // Sample data for featured auctions
    const featuredAuctions = [
        {
            id: 1,
            title: 'Vintage Rolex Watch',
            image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
            currentBid: 5000000,
            endTime: '2025-03-30T15:00:00',
        },
        {
            id: 2,
            title: '19th Century Oil Painting',
            image: 'https://images.unsplash.com/photo-1579154204601-89788f2217a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
            currentBid: 12000000,
            endTime: '2025-03-28T10:00:00',
        },
        {
            id: 3,
            title: 'High-End Mountain Bike',
            image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
            currentBid: 3000000,
            endTime: '2025-03-29T18:00:00',
        },
    ];

    // Sample data for categories
    const categories = [
        { id: 1, name: 'Electronics', icon: 'bi bi-laptop' },
        { id: 2, name: 'Fashion', icon: 'bi bi-handbag' },
        { id: 3, name: 'Home & Garden', icon: 'bi bi-house-door' },
        { id: 4, name: 'Collectibles', icon: 'bi bi-star' },
        { id: 5, name: 'Sports', icon: 'bi bi-bicycle' },
        { id: 6, name: 'Jewelry', icon: 'bi bi-gem' },
        { id: 7, name: 'Art', icon: 'bi bi-brush' },
        { id: 8, name: 'Books', icon: 'bi bi-book' }
    ];

    // Reference for the categories container to handle auto-scroll
    const categoriesRef = useRef(null);

    // Auto-scroll effect (optional)
    useEffect(() => {
        const container = categoriesRef.current;
        if (!container) return;

        let scrollAmount = 0;
        const scrollSpeed = 1; // Adjust speed of auto-scroll
        const scrollInterval = setInterval(() => {
            scrollAmount += scrollSpeed;
            container.scrollLeft = scrollAmount;

            // Reset scroll when reaching the end
            if (scrollAmount >= container.scrollWidth - container.clientWidth) {
                scrollAmount = 0;
            }
        }, 30); // Adjust interval for smoother scrolling

        return () => clearInterval(scrollInterval); // Cleanup on unmount
    }, []);

    return (
        <div className="client-home">
            {/* Banner Section */}
            <Banner />

            {/* Categories Section with Horizontal Scroll */}
            <section className="categories-section py-5 bg-white">
                <div className="container">
                    <h2 className="client-section-title text-center mb-4">Explore Categories</h2>
                    <div className="categories-scroll-container" ref={categoriesRef}>
                        <div className="categories-scroll d-flex">
                            {categories.map((category) => (
                                <div key={category.id} className="category-wrapper">
                                    <Link
                                        to={`/category/${category.id}`}
                                        className="category-item d-flex flex-column align-items-center text-decoration-none"
                                    >
                                        <div className="category-icon mb-2 text-secondary d-flex align-items-center justify-content-center">
                                            <i className={`${category.icon} fs-4`}></i>
                                        </div>
                                        <span className="category-name small text-center text-secondary">
                                            {category.name}
                                        </span>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Auctions Section */}
            <section className="client-home-auctions py-5">
                <div className="container">
                    <h2 className="client-section-title text-center mb-5">Featured Auctions</h2>
                    <div className="row">
                        {featuredAuctions.map((auction) => (
                            <div key={auction.id} className="col-12 col-md-6 col-lg-4 mb-4">
                                <div className="card client-auction-card h-100">
                                    <img
                                        src={auction.image}
                                        className="card-img-top client-auction-img"
                                        alt={auction.title}
                                    />
                                    <div className="card-body">
                                        <h5 className="card-title client-auction-title">{auction.title}</h5>
                                        <p className="card-text client-auction-bid">
                                            Current Bid: <span>{auction.currentBid.toLocaleString('vi-VN')} VNĐ</span>
                                        </p>
                                        <p className="card-text client-auction-time">
                                            Ends: {new Date(auction.endTime).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                    <div className="card-footer text-center border-0">
                                        <Link
                                            to={`/auctions/${auction.id}`}
                                            className="btn btn-outline-primary client-auction-btn"
                                        >
                                            Bid Now
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-4">
                        <Link to="/auctions" className="btn btn-link client-view-all">
                            View All Auctions
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;