// src/routes/AdminRoutes.jsx
import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext.jsx';
import Dashboard from '../pages/admin/Dashboard.jsx';
import Auctions from '../pages/admin/Auctions.jsx';
import AuctionDetail from '../pages/admin/AuctionDetail.jsx';
import Categories from '../pages/admin/Categories.jsx';
import User from '../pages/admin/User.jsx';
import UserDetail from '../pages/admin/UserDetail.jsx';
import Security from '../pages/admin/Security.jsx';
import VerifyRequests from "../pages/admin/VerifyRequests.jsx";

function AdminRoutes() {
	const { user, loading } = useContext(UserContext);

	if (loading) return null;

	if (!user || !user.roles.includes('ADMIN')) {
		return <Navigate to="/" />;
	}

	return (
		<Routes>
			<Route path="/dashboard" element={<Dashboard />} />
			<Route path="/auctions" element={<Auctions />} />
			<Route path="/auction/:id" element={<AuctionDetail />} />
			<Route path="/categories" element={<Categories />} />
			<Route path="/users" element={<User />} />
      		<Route path="/user/:userId" element={<UserDetail />} />
			<Route path="/security" element={<Security />} />
			<Route path="/verify-requests" element={<VerifyRequests />} />

		</Routes>
	);
}

export default AdminRoutes;
