// File: src/contexts/UserContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getCurrentUser } from '../services/user-api';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isOnline, setIsOnline] = useState(navigator.onLine);
	const location = useLocation();

	const fetchUser = async () => {
		const token = localStorage.getItem('jwt');
		if (!token || !isOnline) {
			setLoading(false);
			return;
		}

		try {
			const userData = await getCurrentUser();
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

	// Check network status
	useEffect(() => {
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);
		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);
		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, []);

	// Fetch user when first load or route changes
useEffect(() => {
	const token = localStorage.getItem('jwt');
	if (!token || !isOnline || user) return;

	setLoading(true);
	const timer = setTimeout(() => {
		fetchUser();
	}, 300); // Delay 300ms

	return () => clearTimeout(timer); // Clear khi unmount
}, [location]);


	const loginUser = (userData) => setUser(userData);
	const logoutUser = () => {
		localStorage.removeItem('jwt');
		setUser(null);
	};

	return (
		<UserContext.Provider value={{ user, loginUser, logoutUser, loading, isOnline }}>
			{children}
		</UserContext.Provider>
	);
};
