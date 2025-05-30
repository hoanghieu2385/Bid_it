// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ClientRoutes from './routes/ClientRoutes';
import AdminRoutes from './routes/AdminRoutes';

function App() {
	return (
		<>
			<Routes>
				<Route path="/admin/*" element={<AdminRoutes />} />
				<Route path="/*" element={<ClientRoutes />} />
			</Routes>

			{/* Global Toast Notifications */}
			<ToastContainer
				position="bottom-right"
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>
		</>
	);
}

export default App;
