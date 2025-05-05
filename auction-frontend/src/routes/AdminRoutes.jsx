// src/routes/AdminRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/admin/Dashboard.jsx';
import Auctions from '../pages/admin/Auctions.jsx';

function AdminRoutes() {
	return (
		<Routes>
			<Route path="/Dashboard" element={<Dashboard />} />
			<Route path="/Auctions" element={<Auctions />} />
		</Routes>
	);
}

export default AdminRoutes;
