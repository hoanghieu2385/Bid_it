import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ClientLayout from '../layout/ClientLayout.jsx'; 
import Home from '../pages/client/Home.jsx';
import Login from '../pages/client/Login.jsx';
import About from '../pages/client/About.jsx';
import Contact from '../pages/client/Contact.jsx';
import HowItWork from '../pages/client/HowItWork.jsx';
import Auction from '../pages/client/Auction.jsx';
import ViewDetail from '../pages/client/ViewDetail.jsx';
import Blog from '../pages/client/Blog.jsx';
import BlogPostDetail from '../pages/client/BlogPostDetail.jsx';

function ClientRoutes() {
	return (
		<Routes>
			<Route element={<ClientLayout />}>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/about" element={<About />} />
				<Route path="/contact" element={<Contact />} />
				<Route path="/how-it-works" element={<HowItWork />} />
				<Route path="/auctions" element={<Auction />} />
				<Route path="/auctions/viewdetail" element={<ViewDetail />} />
				<Route path="/blog" element={<Blog />} />
				<Route path="/blog/:id" element={<BlogPostDetail />} />
			</Route>
		</Routes>
	);
}

export default ClientRoutes;
