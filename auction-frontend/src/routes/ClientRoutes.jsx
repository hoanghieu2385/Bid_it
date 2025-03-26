// src/routes/ClientRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/client/Home.jsx';
import Login from '../pages/client/login.jsx';

function ClientRoutes() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/login" element={<Login />} />
		</Routes>
	);
}

export default ClientRoutes;
