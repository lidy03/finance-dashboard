import React, { createContext, usecontext, useState, useEffect, Children, useContext } from 'react';

const AuthContext = createContext(null);

const loadUser = () => {
    try {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
        console.error("Erro ao carregar usuário do localStorage:", e);
        return null;
    }
};

export const AuthProvider = ({ Children }) => {
    const [user, setUser] = useState(loadUser());
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect (() =>{
        setIsAuthReady(true);
    }, []);

    const login = (userData) => {
        setUser(userData);
        saveUser(userData);
    };

    const logout = () =>{
        setUser(null);
        saveUser(null);
    };

    const isAuthenticated = !!user;

    const value = {
        user, 
        isAuthenticated,
        isAuthReady,
        login,
        logout
    };

    if (!isAuthReady) {
        return (
            <div className='flex items-center justify-center min-h-screen bg-gray-100'>
                <div className='text-gray-500 text-lg'>Carregando autenticação</div>
            </div>
        );
    }
    
    return <AuthContext.Provider value={value}></AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
}