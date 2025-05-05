// src/contexts/UserContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
    const storedUser = Cookies.get('user');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
    }, []);

    const loginUser = (userData) => {
    Cookies.set('user', JSON.stringify(userData), { expires: 7 });
    setUser(userData);
    };

    const logoutUser = () => {
    Cookies.remove('user');
    Cookies.remove('jwt');
    setUser(null);
    };

    return (
    <UserContext.Provider value={{ user, loginUser, logoutUser }}>
        {children}
    </UserContext.Provider>
    );
};
