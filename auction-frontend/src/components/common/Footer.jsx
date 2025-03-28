import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../assets/styles/client/footer.css';

const Footer = () => {
	return (
		<footer className="client-footer text-white py-5 mt-auto">
			<div className="container">
				<div className="row">
					{/* Contact Info */}
					<div className="col-md-4 mb-4 mb-md-0">
						<h5 className="client-footer-title">Contact Us</h5>
						<ul className="list-unstyled client-footer-links">
							<li>Email: support@auction.com</li>
							<li>Phone: +84 123-456-789</li>
							<li>Address: 123 Auction Street, Ho Chi Minh City</li>
						</ul>
					</div>

					{/* Quick Links */}
					<div className="col-md-4 mb-4 mb-md-0">
						<h5 className="client-footer-title">Quick Links</h5>
						<ul className="list-unstyled client-footer-links">
							<li>
								<a href="/auctions" className="client-footer-link">
									Auctions
								</a>
							</li>
							<li>
								<a href="/profile" className="client-footer-link">
									Profile
								</a>
							</li>
							<li>
								<a href="/terms" className="client-footer-link">
									Terms & Conditions
								</a>
							</li>
						</ul>
					</div>

					{/* Social Media */}
					<div className="col-md-4">
						<h5 className="client-footer-title">Follow Us</h5>
						<div className="client-footer-social">
							<a href="#" className="client-social-icon me-3">
								<i className="bi bi-facebook"></i>
							</a>
							<a href="#" className="client-social-icon me-3">
								<i className="bi bi-twitter"></i>
							</a>
							<a href="#" className="client-social-icon">
								<i className="bi bi-instagram"></i>
							</a>
						</div>
					</div>
				</div>

				{/* Copyright */}
				<div className="text-center mt-4 pt-4 border-top client-footer-copyright">
					<p className="mb-0">© {new Date().getFullYear()} Auction Platform. All Rights Reserved.</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
