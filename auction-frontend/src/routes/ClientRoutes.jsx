import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ClientLayout from '../layout/ClientLayout.jsx'; 
import Home from '../pages/client/Home.jsx';
import Login from '../pages/client/Login.jsx';

function ClientRoutes() {
	return (
		<Routes>
			<Route element={<ClientLayout />}>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
			</Route>
		</Routes>
	);
}

export default ClientRoutes;
