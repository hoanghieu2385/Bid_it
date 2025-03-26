import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
	return (
		<>
			<Router>
				<Routes>
					<Route path="/admin/*" element={<AdminRoutes />} />
					<Route path="/*" element={<ClientRoutes />} />
				</Routes>
			</Router>
		</>
	);
}

export default App;
