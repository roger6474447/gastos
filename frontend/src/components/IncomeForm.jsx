import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

import { useNavigate } from 'react-router-dom';

const IncomeForm = () => {
    const { user } = useAuth();
    const { settings } = useSettings();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [incomes, setIncomes] = useState([]);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        source: '',
        amount: '',
        income_date: new Date().toISOString().split('T')[0],
        description: ''
    });

    useEffect(() => {
        fetchIncomes();
    }, []);

    const fetchIncomes = async () => {
        try {
            console.log('Fetching incomes...');
            const response = await api.get('/incomes');
            console.log('Incomes fetched:', response.data);
            setIncomes(response.data);
        } catch (error) {
            console.error('Error fetching incomes:', error);
            const msg = error.response?.data?.error || error.message || 'Error desconocido';
            toast.error(`Error al cargar ingresos: ${msg}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log('Submitting income:', formData);
            if (editId) {
                await api.put(`/incomes/${editId}`, formData);
                toast.success('Ingreso actualizado exitosamente');
                setEditId(null);
            } else {
                await api.post('/incomes', formData);
                toast.success('Ingreso registrado exitosamente');
            }

            setFormData({
                source: '',
                amount: '',
                income_date: new Date().toISOString().split('T')[0],
                description: ''
            });
            fetchIncomes();
        } catch (error) {
            console.error('Error submitting income:', error);
            const msg = error.response?.data?.error || error.message || 'Error desconocido';
            toast.error(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (income) => {
        setFormData({
            source: income.source,
            amount: income.amount,
            income_date: new Date(income.income_date).toISOString().split('T')[0],
            description: income.description || ''
        });
        setEditId(income.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditId(null);
        setFormData({
            source: '',
            amount: '',
            income_date: new Date().toISOString().split('T')[0],
            description: ''
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este ingreso?')) return;

        try {
            await api.delete(`/incomes/${id}`);
            fetchIncomes();
            toast.success('Ingreso eliminado');
        } catch (error) {
            console.error('Error deleting income:', error);
            toast.error('Error al eliminar ingreso');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="card-glass p-6 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {editId ? 'Editar Ingreso' : 'Registrar Ingreso'}
                    </h2>
                    {editId && (
                        <button
                            onClick={handleCancelEdit}
                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            Cancelar Edición
                        </button>
                    )}
                </div>


                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fuente de Ingreso
                        </label>
                        <input
                            type="text"
                            value={formData.source}
                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            className="input-field"
                            placeholder="Ej: Salario, Venta, etc."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Monto
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">{settings?.currency_symbol || 'Bs.'}</span>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="input-field pl-8"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha
                        </label>
                        <input
                            type="date"
                            value={formData.income_date}
                            onChange={(e) => setFormData({ ...formData, income_date: e.target.value })}
                            className="input-field"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descripción (Opcional)
                        </label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input-field"
                            placeholder="Detalles adicionales..."
                        />
                    </div>

                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center"
                        >
                            {loading ? (
                                <span className="spinner mr-2"></span>
                            ) : (
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            )}
                            {editId ? 'Actualizar Ingreso' : 'Registrar Ingreso'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Income History */}
            <div className="card-glass p-6 animate-fade-in">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Historial de Ingresos</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {incomes.map((income) => (
                                <tr key={income.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(income.income_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {income.source}
                                        {income.description && (
                                            <span className="block text-xs text-gray-500">{income.description}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                        ${parseFloat(income.amount).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex gap-3">
                                        <button
                                            onClick={() => handleEdit(income)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(income.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default IncomeForm;
