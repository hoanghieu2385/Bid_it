// src/contexts/UserContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/user-api';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);

	useEffect(() => {
		const fetchUser = async () => {
			const token = localStorage.getItem('jwt');
			if (token) {
				try {
					const userData = await getCurrentUser();
					setUser(userData);
				} catch (error) {
					console.error('Error fetching user:', error);
					localStorage.removeItem('jwt'); // Clear token nếu lỗi (ví dụ hết hạn)
				}
			}
		};

		fetchUser();
	}, []);

	const loginUser = (userData) => setUser(userData);
	const logoutUser = () => {
		localStorage.removeItem('jwt');
		setUser(null);
	};

	return (
		<UserContext.Provider value={{ user, loginUser, logoutUser }}>
			{children}
		</UserContext.Provider>
	);
};