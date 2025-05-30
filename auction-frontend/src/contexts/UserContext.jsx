// File: src/contexts/UserContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/user-api';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUser = async () => {
			const token = localStorage.getItem('jwt');
			if (!token) {
				setLoading(false);
				return;
			}

			try {
				const userData = await getCurrentUser();
				// Set user data only if it has changed
				setUser((prevUser) => {
					if (JSON.stringify(prevUser) === JSON.stringify(userData)) return prevUser;
					return userData;
				});

			} catch (error) {
				console.error('[UserContext] Error fetching user:', error?.response?.status);
				// localStorage.removeItem('jwt');
			} finally {
				setLoading(false);
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
		<UserContext.Provider value={{ user, loginUser, logoutUser, loading }}>
			{children}
		</UserContext.Provider>
	);
};
