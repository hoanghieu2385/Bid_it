import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../../assets/styles/client/home/categories.css'; 

const Categories = () => {
    // Sample data for categories
    const categories = [
        { id: 1, name: 'Electronics', icon: 'bi-laptop' },
        { id: 2, name: 'Fashion', icon: 'bi-handbag' },
        { id: 3, name: 'Home & Garden', icon: 'bi-house-door' },
        { id: 4, name: 'Collectibles', icon: 'bi-star' },
        { id: 5, name: 'Sports', icon: 'bi-bicycle' },
        { id: 7, name: 'Jewelry', icon: 'bi-gem' },
        { id: 8, name: 'Art', icon: 'bi-brush' },
        { id: 9, name: 'Books', icon: 'bi-book' },
    ];

    // Reference for the categories container
    const categoriesRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // Handle mouse down (start dragging)
    const handleMouseDown = (e) => {
        const container = categoriesRef.current;
        if (!container) return;

        setIsDragging(true);
        setStartX(e.pageX - container.offsetLeft);
        setScrollLeft(container.scrollLeft);
        container.style.cursor = 'grabbing'; // Change cursor to grabbing
    };

    // Handle mouse leave (stop dragging)
    const handleMouseLeave = () => {
        const container = categoriesRef.current;
        if (!container) return;

        setIsDragging(false);
        container.style.cursor = 'grab'; // Reset cursor
    };

    // Handle mouse up (stop dragging)
    const handleMouseUp = () => {
        const container = categoriesRef.current;
        if (!container) return;

        setIsDragging(false);
        container.style.cursor = 'grab'; // Reset cursor
    };

    // Handle mouse move (drag to scroll)
    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault(); // Prevent text selection while dragging

        const container = categoriesRef.current;
        if (!container) return;

        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2; // Multiply by 2 for faster scrolling
        container.scrollLeft = scrollLeft - walk;
    };

    // Handle touch start (for mobile devices)
    const handleTouchStart = (e) => {
        const container = categoriesRef.current;
        if (!container) return;

        setIsDragging(true);
        setStartX(e.touches[0].pageX - container.offsetLeft);
        setScrollLeft(container.scrollLeft);
    };

    // Handle touch move (for mobile devices)
    const handleTouchMove = (e) => {
        if (!isDragging) return;

        const container = categoriesRef.current;
        if (!container) return;

        const x = e.touches[0].pageX - container.offsetLeft;
        const walk = (x - startX) * 2; // Multiply by 2 for faster scrolling
        container.scrollLeft = scrollLeft - walk;
    };

    // Handle touch end (for mobile devices)
    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    return (
        <section className="categories-section py-5 bg-white">
            <div className="container">
                <h2 className="categories-section-title text-center mb-4">Explore Categories</h2>
                <div
                    className="categories-scroll-wrapper"
                    ref={categoriesRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="categories-scroll-content">
                        {categories.map((category) => (
                            <div key={category.id} className="categories-item-wrapper">
                                <Link
                                    to={`/category/${category.id}`}
                                    className="categories-item d-flex flex-column align-items-center text-decoration-none"
                                >
                                    <div className="categories-item-icon mb-2 text-secondary d-flex align-items-center justify-content-center">
                                        <i className={category.icon}></i>
                                    </div>
                                    <span className="categories-item-name small text-center text-secondary">
                                        {category.name}
                                    </span>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Categories;