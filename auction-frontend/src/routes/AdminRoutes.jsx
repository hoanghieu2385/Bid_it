// src/routes/AdminRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/admin/Dashboard.jsx';
import Auctions from '../pages/admin/Auctions.jsx';
import AuctionDetail from '../pages/admin/AuctionDetail.jsx';

function AdminRoutes() {
	return (
		<Routes>
			<Route path="/dashboard" element={<Dashboard />} />
			<Route path="/auctions" element={<Auctions />} />
			<Route path="/auction/:id" element={<AuctionDetail />} />
		</Routes>
	);
}

export default AdminRoutes;
