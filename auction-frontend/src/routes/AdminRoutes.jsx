// src/routes/AdminRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/admin/Dashboard.jsx';

function AdminRoutes() {
	return (
		<Routes>
			<Route path="/admin/Dashboard" element={<Dashboard />} />
		</Routes>
	);
}

export default AdminRoutes;
