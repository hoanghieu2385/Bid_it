import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ClientLayout from '../layout/ClientLayout.jsx'; 
import Home from '../pages/client/Home.jsx';
import Login from '../pages/client/Login.jsx';
import About from '../pages/client/About.jsx';
import Contact from '../pages/client/Contact.jsx';
import HowItWork from '../pages/client/HowItWork.jsx';

function ClientRoutes() {
	return (
		<Routes>
			<Route element={<ClientLayout />}>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/about" element={<About />} />
				<Route path="/contact" element={<Contact />} />
				<Route path="/how-it-works" element={<HowItWork />} />
			</Route>
		</Routes>
	);
}

export default ClientRoutes;
