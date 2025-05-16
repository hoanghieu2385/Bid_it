// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ClientRoutes from './routes/ClientRoutes';
import AdminRoutes from './routes/AdminRoutes';

function App() {
	return (
		<Routes>
			<Route path="/admin/*" element={<AdminRoutes />} />
			<Route path="/*" element={<ClientRoutes />} />
		</Routes>
	);
}

export default App;
