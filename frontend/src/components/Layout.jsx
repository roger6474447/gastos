import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Toaster } from 'react-hot-toast';

const Layout = ({ children }) => {
    const { user, logout, isAdmin } = useAuth();
    const { settings } = useSettings();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigation = [
        { name: 'Registrar Gasto', path: '/expenses/new', icon: 'M12 4v16m8-8H4' },
        { name: 'Ingresos', path: '/incomes', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'Reportes', path: '/reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { name: 'Usuarios', path: '/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' }
    ];

    if (isAdmin) {
        navigation.push({ name: 'Configuración', path: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' });
    }

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen flex flex-col">
            <Toaster position="top-right" />
            {/* Header */}
            <header
                className="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50 bg-cover bg-center"
                style={{ backgroundImage: 'url(/header-bg.png)' }}
            >
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link to="/" className="flex-shrink-0 flex items-center group">
                                <div className="relative flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
                                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <img src="/logo.png" alt="Logo" className="h-9 w-auto object-contain relative z-10 drop-shadow-md" />
                                </div>
                                <span className="ml-3 text-lg font-bold text-gray-800 hidden sm:block tracking-tight group-hover:text-blue-600 transition-colors duration-200">
                                    {settings?.app_name || 'Sistema de Gastos'}
                                </span>
                            </Link>
                        </div>

                        {/* Navigation */}
                        <nav className="hidden md:flex space-x-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${isActive(item.path)
                                        ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                                        : 'text-gray-700 hover:bg-white/50 hover:text-blue-600'
                                        }`}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {/* User Menu */}
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden text-gray-600 hover:text-blue-600 focus:outline-none p-2 rounded-md transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isMobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                            <div className="hidden sm:flex items-center space-x-3">
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-800">{user?.username}</p>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isAdmin ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {isAdmin ? 'Administrador' : 'Usuario'}
                                    </span>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="btn-secondary py-1.5 px-3 text-sm flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="hidden sm:inline">Salir</span>
                            </button>
                        </div>
                    </div>
                </div>


            </header>

            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 flex">
                    {/* Overlay */}
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>

                    {/* Drawer */}
                    <div className="relative bg-white w-64 h-full shadow-2xl flex flex-col py-6 animate-slide-right">
                        <div className="px-6 mb-8 flex items-center justify-between">
                            <span className="text-xl font-bold text-gray-800">Menú</span>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 px-4 space-y-2 overflow-y-auto">
                            {/* User Info Mobile - Vertical Profile */}
                            <div className="mb-6 flex flex-col items-center justify-center pt-4 pb-6 border-b border-gray-100">
                                {/* Avatar Circle */}
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-3 ring-4 ring-blue-50/50">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>

                                {/* Username */}
                                <h3 className="text-xl font-bold text-gray-800 mb-1">{user?.username}</h3>

                                {/* Role Badge */}
                                <span className={`${isAdmin ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'} text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm`}>
                                    {isAdmin ? 'Administrador' : 'Usuario'}
                                </span>
                            </div>

                            {navigation.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center px-4 py-3 rounded-xl transition-all ${isActive(item.path)
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                                        }`}
                                >
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            ))}
                        </div>

                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-medium"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <p className="text-center text-sm text-gray-500">
                        © 2025 Sistema de Registro de Gastos. Todos los derechos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
