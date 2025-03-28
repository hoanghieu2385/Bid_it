import React from 'react';
import '../../../assets/styles/client/home/banner.css';

const Banner = () => {
    return (
        <section className="banner-section position-relative bg-light">
            {/* Background Image with Overlay */}
            <div className="banner-bg position-absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
                    alt="City buildings backdrop"
                    className="w-100 h-100 object-fit-cover"
                />
                <div className="position-absolute top-0 start-0 end-0 bottom-0 bg-dark opacity-50"></div>
            </div>

            {/* Content */}
            <div className="container h-100 d-flex align-items-center position-relative">
                <div className="banner-content col-12 col-md-8 col-lg-6 col-xl-5">
                    <h1 className="banner-title display-4 fw-bold text-white mb-4">
                        Discover, Collect & Sell Items
                    </h1>
                    <p className="banner-text fs-5 text-white opacity-90 mb-4">
                        Bid it: Discover a world of treasures waiting to be yours! Browse through our extensive collection and
                        find your dream items at the best prices.
                    </p>
                    <button className="banner-btn btn btn-primary btn-lg fw-semibold px-4 py-2">
                        Start Exploring
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Banner;