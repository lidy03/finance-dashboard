import React, { useState } from 'react';
import { LayoutDashboard, Wallet, TredingUp, BarChart3, Settings, LogOut, Menu, X, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ currentSection, setCurrentSection, isSidebarOpen, setIsSidebarOpen, user, logout }) => {
    const navItems = [
        { name: "Visão Geral", icon: LayoutDashboard, section: 'home' },
        { name: "Transações", icon: Wallet, section: 'transactions' },
        { name: "Relatórios", icon: BarChart3, section: 'reports' },
        { name: "Configurações", icon: Settings, section: 'settings' },
    ];


}