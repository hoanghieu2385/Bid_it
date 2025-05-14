// src/components/common/Header.jsx
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import logoImage from '../../assets/images/Logo2.png';
import '../../assets/styles/client/header.css';
import { UserContext } from '../../contexts/UserContext.jsx';

const Header = () => {
	const [expanded, setExpanded] = useState(false);
	const { user, logoutUser } = useContext(UserContext);

	const handleLogout = () => {
		logoutUser();
		window.location.href = '/login';
	};

	return (
		<header className="client-header">
			<nav className="navbar navbar-expand-lg">
				<div className="container-fluid">
					<Link to="/" className="client-header-logo navbar-brand">
						<div className="d-flex align-items-center">
							<img src={logoImage} alt="Logo" className="logo-image me-1" />
							<span className="text-primary fw-bold fs-5">Bid</span>
							<span className="fw-bold fs-5">it</span>
						</div>
					</Link>

					<button
						className="navbar-toggler border-0"
						type="button"
						onClick={() => setExpanded(!expanded)}
						aria-controls="client-navbar-nav"
						aria-expanded={expanded}
					>
						{expanded ? <FaTimes /> : <FaBars />}
					</button>

					<div className={`collapse navbar-collapse ${expanded ? 'show' : ''}`} id="client-navbar-nav">
						<ul className="client-header-nav navbar-nav mx-lg-auto mb-3 mb-lg-0">
							<li className="nav-item">
								<Link to="/" className="client-nav-link nav-link" onClick={() => setExpanded(false)}>
									Home
								</Link>
							</li>
							<li className="nav-item">
								<Link to="/about" className="client-nav-link nav-link" onClick={() => setExpanded(false)}>
									About Us
								</Link>
							</li>
							<li className="nav-item">
								<Link to="/auctions" className="client-nav-link nav-link" onClick={() => setExpanded(false)}>
									Browse Auctions
								</Link>
							</li>
							<li className="nav-item">
								<Link to="/contact" className="client-nav-link nav-link" onClick={() => setExpanded(false)}>
									Contact
								</Link>
							</li>
						</ul>

						<div className="client-header-actions d-flex align-items-center gap-3">
							<div className="input-group w-auto d-none d-lg-flex">
								<span className="input-group-text bg-white border-end-0">
									<FaSearch className="text-muted" />
								</span>
								<input type="text" className="form-control border-start-0" placeholder="Search" />
							</div>

							{user ? (
								<div className="dropdown user-dropdown">
									<button
										className="btn user-dropdown-toggle d-flex align-items-center"
										type="button"
										id="userDropdown"
										data-bs-toggle="dropdown"
										aria-expanded="false"
									>
										<div className="user-initial bg-primary text-white rounded-circle me-2">
											{user.firstName?.charAt(0).toUpperCase()}
										</div>
										<span className="fw-medium">{user.firstName}</span>
									</button>
									<ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
										<li>
											<Link to="/profile" className="dropdown-item" onClick={() => setExpanded(false)}>
												<i className="fas fa-user me-2"></i> Profile
											</Link>
										</li>
										<li><hr className="dropdown-divider" /></li>
										<li>
											<button className="dropdown-item text-danger" onClick={handleLogout}>
												<i className="fas fa-sign-out-alt me-2"></i> Logout
											</button>
										</li>
									</ul>
								</div>
							) : (
								<>
									<Link to="/login" className="client-btn-login btn d-none d-sm-inline-block" onClick={() => setExpanded(false)}>
										Login
									</Link>
									<Link to="/register" className="client-btn-register btn" onClick={() => setExpanded(false)}>
										Register
									</Link>
								</>
							)}
						</div>
					</div>
				</div>
			</nav>
		</header>
	);
};

export default Header;