// src/contexts/UserContext.jsx
import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);

	const loginUser = (userData) => {
		setUser(userData);
	};

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
