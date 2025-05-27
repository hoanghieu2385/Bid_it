// src/components/client/home/Category.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCategories } from '../../../services/category-api';
import '../../../assets/styles/client/home/categories.css';

const Categories = () => {
	const [categories, setCategories] = useState([]);
	const categoriesRef = useRef(null);
	const [isDragging, setIsDragging] = useState(false);
	const [startX, setStartX] = useState(0);
	const [scrollLeft, setScrollLeft] = useState(0);

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const data = await getAllCategories();
				setCategories(data);
			} catch (error) {
				console.error('Error fetching categories:', error);
			}
		};
		fetchCategories();
	}, []);

	const handleMouseDown = (e) => {
		const container = categoriesRef.current;
		if (!container) return;
		setIsDragging(true);
		setStartX(e.pageX - container.offsetLeft);
		setScrollLeft(container.scrollLeft);
		container.style.cursor = 'grabbing';
	};

	const handleMouseLeave = () => {
		const container = categoriesRef.current;
		if (!container) return;
		setIsDragging(false);
		container.style.cursor = 'grab';
	};

	const handleMouseUp = () => {
		const container = categoriesRef.current;
		if (!container) return;
		setIsDragging(false);
		container.style.cursor = 'grab';
	};

	const handleMouseMove = (e) => {
		if (!isDragging) return;
		e.preventDefault();
		const container = categoriesRef.current;
		if (!container) return;
		const x = e.pageX - container.offsetLeft;
		const walk = (x - startX) * 2;
		container.scrollLeft = scrollLeft - walk;
	};

	const handleTouchStart = (e) => {
		const container = categoriesRef.current;
		if (!container) return;
		setIsDragging(true);
		setStartX(e.touches[0].pageX - container.offsetLeft);
		setScrollLeft(container.scrollLeft);
	};

	const handleTouchMove = (e) => {
		if (!isDragging) return;
		const container = categoriesRef.current;
		if (!container) return;
		const x = e.touches[0].pageX - container.offsetLeft;
		const walk = (x - startX) * 2;
		container.scrollLeft = scrollLeft - walk;
	};

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
									to={`/auctions?categoryId=${category.id}`}
									className="categories-item d-flex flex-column align-items-center text-decoration-none"
								>
									<div className="categories-item-icon mb-2 text-secondary d-flex align-items-center justify-content-center">
										<i className={`bi ${category.icon}`}></i>
									</div>
									<span className="categories-item-name small text-center text-secondary">{category.name}</span>
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