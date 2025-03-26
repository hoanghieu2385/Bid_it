import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../assets/styles/client/header.css';

const Header = () => {
	return (
		<header className="client-header">
			<nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
				<div className="container-fluid px-4">
					{/* Logo */}
					<Link className="navbar-brand client-header-logo" to="/">
						<img src="/assets/images/logo.png" alt="Auction Platform Logo" className="client-logo-img" />
					</Link>

					{/* Toggle button for mobile */}
					<button
						className="navbar-toggler"
						type="button"
						data-bs-toggle="collapse"
						data-bs-target="#navbarNav"
						aria-controls="navbarNav"
						aria-expanded="false"
						aria-label="Toggle navigation"
					>
						<span className="navbar-toggler-icon"></span>
					</button>

					{/* Menu items */}
					<div className="collapse navbar-collapse" id="navbarNav">
						<ul className="navbar-nav mx-auto client-header-nav">
							<li className="nav-item">
								<Link className="nav-link client-nav-link" to="/">
									Home
								</Link>
							</li>
							<li className="nav-item">
								<Link className="nav-link client-nav-link" to="/auctions">
									Auctions
								</Link>
							</li>
							<li className="nav-item">
								<Link className="nav-link client-nav-link" to="/profile">
									Profile
								</Link>
							</li>
						</ul>

						{/* Action buttons */}
						<div className="client-header-actions">
							<Link to="/login" className="btn btn-outline-primary client-btn-login me-2">
								Login
							</Link>
							<Link to="/register" className="btn btn-primary client-btn-register">
								Register
							</Link>
						</div>
					</div>
				</div>
			</nav>
		</header>
	);
};

export default Header;
