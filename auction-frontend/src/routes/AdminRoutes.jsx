// src/routes/ClientRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/admin/Dashboard.jsx';

function ClientRoutes() {
	return (
		<Routes>
			<Route path="/admin/dashboard" element={<Dashboard />} />
		</Routes>
	);
}

export default ClientRoutes;
