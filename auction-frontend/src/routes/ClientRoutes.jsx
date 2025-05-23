// src/routes/ClientRoutes.jsx
import React, { useContext } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext.jsx';
import ClientLayout from '../layout/ClientLayout.jsx';
import Home from '../pages/client/Home.jsx';
import Login from '../pages/common/Login.jsx';
import Register from '../pages/common/Register.jsx';
import ForgotPassword from '../pages/common/ForgotPassword.jsx';
import ResetPassword from '../pages/common/ResetPassword.jsx';
import About from '../pages/client/About.jsx';
import Contact from '../pages/client/Contact.jsx';
import HowItWork from '../pages/client/HowItWork.jsx';
import Auction from '../pages/client/Auction.jsx';
import ViewDetail from '../pages/client/ViewDetail.jsx';
import Blog from '../pages/client/Blog.jsx';
import BlogPostDetail from '../pages/client/BlogPostDetail.jsx';
import UserProfile from '../pages/client/UserProfile.jsx';
import CreateAuctionPage from '../pages/client/auction/CreateAuctionPage.jsx';
import AuctionDetailPage from '../pages/client/auction/AuctionDetailPage.jsx';

function ClientRoutes() {
	const location = useLocation();
	const { loading } = useContext(UserContext);

	if (loading) return null;

	return (
		<Routes location={location} key={location.pathname}>
			<Route element={<ClientLayout />}>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/forgot-password" element={<ForgotPassword />} />
				<Route path="/reset-password" element={<ResetPassword />} />
				<Route path="/profile" element={<UserProfile />} />
				<Route path="/about" element={<About />} />
				<Route path="/contact" element={<Contact />} />
				<Route path="/how-it-works" element={<HowItWork />} />
				<Route path="/auctions" element={<Auction />} />
				<Route path="/auctions/viewdetail" element={<ViewDetail />} />
				<Route path="/blog" element={<Blog />} />
				<Route path="/blog/:id" element={<BlogPostDetail />} />
				<Route path="/auctions/create" element={<CreateAuctionPage />} />
				<Route path="/auctions/:id" element={<AuctionDetailPage />} />

			</Route>
		</Routes>
	);
}

export default ClientRoutes;
