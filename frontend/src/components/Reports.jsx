
import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { exportToPDF } from '../utils/exportPDF';
import { exportToExcel } from '../utils/exportExcel';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Reports = () => {
    const { user, isAdmin } = useAuth();
    const { settings } = useSettings();
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        period: 'month',
        date: new Date().toISOString().slice(0, 7) // YYYY-MM
    });
    const [subtotal, setSubtotal] = useState(0);

    useEffect(() => {
        fetchExpenses();
    }, [filters]);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/reports', {
                params: filters
            });
            setExpenses(response.data.expenses);
            setSubtotal(response.data.subtotal);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            toast.error('Error al cargar los gastos');
        } finally {
            setLoading(false);
        }
    };

    const handlePeriodChange = (period) => {
        let dateValue = '';
        const now = new Date();

        switch (period) {
            case 'day':
                dateValue = now.toISOString().split('T')[0]; // YYYY-MM-DD
                break;
            case 'month':
                dateValue = now.toISOString().slice(0, 7); // YYYY-MM
                break;
            case 'year':
                dateValue = now.getFullYear().toString(); // YYYY
                break;
        }

        setFilters({ period, date: dateValue });
    };

    const handleDateChange = (e) => {
        setFilters(prev => ({ ...prev, date: e.target.value }));
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este gasto?')) return;

        try {
            await api.delete(`/expenses/${id}`);
            toast.success('Gasto eliminado exitosamente');
            fetchExpenses();
        } catch (error) {
            console.error('Error deleting expense:', error);
            toast.error('Error al eliminar el gasto');
        }
    };

    const handleExportPDF = () => {
        exportToPDF(expenses, filters, subtotal);
    };

    const handleExportExcel = () => {
        exportToExcel(expenses, filters, subtotal);
    };

    const getDateInputType = () => {
        switch (filters.period) {
            case 'day': return 'date';
            case 'month': return 'month';
            case 'year': return 'number';
            default: return 'date';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gradient">Reportes de Gastos</h1>
                    <p className="text-gray-600 mt-1">
                        {isAdmin ? 'Vista de todos los gastos' : 'Vista de tus gastos'}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/expenses/new')}
                    className="btn-primary flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Gasto
                </button>
            </div>

            {/* Filters Card */}
            <div className="card">
                <h2 className="text-xl font-semibold mb-4">Filtros</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Period Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Período
                        </label>
                        <div className="flex gap-2">
                            {['day', 'month', 'year'].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => handlePeriodChange(period)}
                                    className={`flex - 1 px - 4 py - 2 rounded - lg font - medium transition - all ${filters.period === period
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        } `}
                                >
                                    {period === 'day' ? 'Día' : period === 'month' ? 'Mes' : 'Año'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Selector */}
                    <div>
                        <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha
                        </label>
                        <input
                            id="date-filter"
                            type={getDateInputType()}
                            value={filters.date}
                            onChange={handleDateChange}
                            className="input-field"
                            placeholder={filters.period === 'year' ? 'YYYY' : ''}
                            min={filters.period === 'year' ? '2000' : undefined}
                            max={filters.period === 'year' ? '2100' : undefined}
                        />
                    </div>

                    {/* Export Buttons */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Exportar
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={handleExportPDF}
                                disabled={expenses.length === 0}
                                className="flex-1 btn-secondary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                PDF
                            </button>
                            <button
                                onClick={handleExportExcel}
                                disabled={expenses.length === 0}
                                className="flex-1 btn-secondary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in">
                {/* Total Expenses Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex items-center justify-between group hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm font-medium text-red-500 mb-1">Total Gastos</p>
                        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
                            {settings?.currency_symbol || 'Bs.'} {subtotal.toFixed(2)}
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                    </div>
                </div>

                {/* Total Incomes Card (Placeholder for now) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 flex items-center justify-between group hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm font-medium text-green-600 mb-1">Total Ingresos</p>
                        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
                            {settings?.currency_symbol || 'Bs.'} 0.00
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </div>
                </div>

                {/* Balance Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex items-center justify-between group hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm font-medium text-blue-600 mb-1">Balance</p>
                        <h3 className={`text-2xl font-bold tracking-tight ${subtotal > 0 ? 'text-gray-800' : 'text-gray-800'}`}>
                            {settings?.currency_symbol || 'Bs.'} {subtotal.toFixed(2)}
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                </div>
            </div>

            {/* Expenses Table */}
            <div className="card p-0 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <span className="spinner text-blue-600"></span>
                        <span className="ml-3 text-gray-600">Cargando gastos...</span>
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg">No hay gastos registrados para este período</p>
                        <button
                            onClick={() => navigate('/expenses/new')}
                            className="btn-primary mt-4"
                        >
                            Registrar Primer Gasto
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Mobile View (Cards) */}
                        <div className="md:hidden space-y-4">
                            {expenses.map((expense) => (
                                <div key={expense.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-800">{expense.product_name}</h3>
                                            <p className="text-xs text-gray-500">{new Date(expense.expense_date).toLocaleDateString('es-ES')}</p>
                                        </div>
                                        <span className="text-lg font-bold text-blue-600">
                                            {settings?.currency_symbol || 'Bs.'} {Number(expense.total).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                        <div>
                                            <span className="block text-xs text-gray-400">Cantidad</span>
                                            {expense.quantity}
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-400">Precio Unit.</span>
                                            {settings?.currency_symbol || 'Bs.'} {Number(expense.unit_price).toFixed(2)}
                                        </div>
                                        {isAdmin && (
                                            <div className="col-span-2">
                                                <span className="block text-xs text-gray-400">Usuario</span>
                                                {expense.username}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        {expense.receipt_image ? (
                                            <a
                                                href={`/${expense.receipt_image}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Ver Factura
                                            </a>
                                        ) : (
                                            <span className="text-xs text-gray-400">Sin factura</span>
                                        )}

                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => navigate(`/expenses/edit/${expense.id}`)}
                                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(expense.id)}
                                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View (Table) */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="table-premium">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Cantidad</th>
                                        <th>Precio Unit.</th>
                                        <th>Total</th>
                                        <th>Fecha</th>
                                        {isAdmin && <th>Usuario</th>}
                                        <th>Factura</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map((expense) => (
                                        <tr key={expense.id}>
                                            <td className="font-medium">{expense.product_name}</td>
                                            <td>{expense.quantity}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {settings?.currency_symbol || 'Bs.'} {Number(expense.unit_price).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {settings?.currency_symbol || 'Bs.'} {Number(expense.total).toFixed(2)}
                                            </td>
                                            <td>{new Date(expense.expense_date).toLocaleDateString('es-ES')}</td>
                                            {isAdmin && (
                                                <td>
                                                    <span className="badge badge-user">{expense.username}</span>
                                                </td>
                                            )}
                                            <td>
                                                {expense.receipt_image ? (
                                                    <a
                                                        href={`/ ${expense.receipt_image} `}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 flex items-center"
                                                    >
                                                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        Ver
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400">Sin imagen</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => navigate(`/ expenses / edit / ${expense.id} `)}
                                                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                                        title="Editar"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(expense.id)}
                                                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div >
        </div >
    );
};

export default Reports;
