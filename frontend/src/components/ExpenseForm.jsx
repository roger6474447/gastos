import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { useSettings } from '../context/SettingsContext';
import { compressImage, isValidImage } from '../utils/imageCompressor';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ExpenseForm = () => {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const { id } = useParams(); // Get ID from URL
    const [loading, setLoading] = useState(false);
    const [loadingBalance, setLoadingBalance] = useState(true);
    const [imagePreview, setImagePreview] = useState(null);
    const [balanceData, setBalanceData] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0
    });
    const [formData, setFormData] = useState({
        product_name: '',
        quantity: '',
        unit_price: '',
        expense_date: new Date().toISOString().split('T')[0],
        receipt: null
    });

    // Fetch expense if in edit mode
    useEffect(() => {
        if (id) {
            const fetchExpense = async () => {
                try {
                    const response = await api.get(`/expenses/${id}`);
                    const expense = response.data;
                    setFormData({
                        product_name: expense.product_name,
                        quantity: expense.quantity,
                        unit_price: expense.unit_price,
                        expense_date: new Date(expense.expense_date).toISOString().split('T')[0],
                        receipt: null // Don't preload file object
                    });
                    if (expense.receipt_image) {
                        setImagePreview(`/${expense.receipt_image}`);
                    }
                } catch (error) {
                    console.error('Error fetching expense:', error);
                    toast.error('Error al cargar el gasto');
                    navigate('/reports');
                }
            };
            fetchExpense();
        }
    }, [id, navigate]);

    // Fetch balance data
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                setLoadingBalance(true);
                const response = await api.get('/reports/summary');
                setBalanceData({
                    totalIncome: response.data.totalIncome || 0,
                    totalExpenses: response.data.totalExpenses || 0,
                    balance: response.data.balance || 0
                });
            } catch (error) {
                console.error('Error fetching balance:', error);
                toast.error('Error al cargar el saldo');
            } finally {
                setLoadingBalance(false);
            }
        };
        fetchBalance();
    }, []);

    const calculateTotal = () => {
        const qty = parseFloat(formData.quantity) || 0;
        const price = parseFloat(formData.unit_price) || 0;
        return (qty * price).toFixed(2);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!isValidImage(file)) {
            e.target.value = '';
            toast.error('Formato de imagen no válido');
            return;
        }

        try {
            // Compress image
            const compressedFile = await compressImage(file);
            setFormData(prev => ({ ...prev, receipt: compressedFile }));

            // Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(compressedFile);
        } catch (error) {
            console.error('Error processing image:', error);
            toast.error('Error al procesar la imagen');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('product_name', formData.product_name);
            data.append('quantity', formData.quantity);
            data.append('unit_price', formData.unit_price);
            data.append('expense_date', formData.expense_date);
            if (formData.receipt) {
                data.append('receipt', formData.receipt);
            }

            if (id) {
                await api.put(`/expenses/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('¡Gasto actualizado exitosamente!');
            } else {
                await api.post('/expenses', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('¡Gasto registrado exitosamente!');
            }

            navigate('/reports');
        } catch (error) {
            console.error('Error saving expense:', error);
            toast.error(error.response?.data?.error || 'Error al guardar el gasto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="card">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gradient mb-2">
                        {id ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
                    </h1>
                    <p className="text-gray-600">Completa el formulario para {id ? 'actualizar el' : 'registrar un nuevo'} gasto</p>
                </div>

                {/* Balance Display */}
                <div className="mb-8">
                    {loadingBalance ? (
                        <div className="p-4 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                            <span className="spinner text-blue-500 mr-2"></span>
                            <span className="text-gray-500 text-sm">Actualizando saldo...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Income */}
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex flex-col items-center justify-center text-center">
                                <span className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Ingresos</span>
                                <span className="text-lg font-bold text-green-700">
                                    {settings?.currency_symbol || 'Bs.'} {balanceData.totalIncome.toFixed(2)}
                                </span>
                            </div>

                            {/* Expenses */}
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col items-center justify-center text-center">
                                <span className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-1">Gastos</span>
                                <span className="text-lg font-bold text-red-700">
                                    {settings?.currency_symbol || 'Bs.'} {balanceData.totalExpenses.toFixed(2)}
                                </span>
                            </div>

                            {/* Available Balance */}
                            <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center shadow-sm ${balanceData.balance >= 0
                                    ? 'bg-blue-600 border-blue-500 text-white'
                                    : 'bg-red-600 border-red-500 text-white'
                                }`}>
                                <span className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-90">
                                    {balanceData.balance >= 0 ? 'Disponible' : 'Deuda'}
                                </span>
                                <span className="text-xl font-bold">
                                    {settings?.currency_symbol || 'Bs.'} {Math.abs(balanceData.balance).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Product Name */}
                    <div>
                        <label htmlFor="product_name" className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre del Producto *
                        </label>
                        <input
                            id="product_name"
                            name="product_name"
                            type="text"
                            value={formData.product_name}
                            onChange={handleInputChange}
                            className="input-field"
                            placeholder="Ej: Laptop Dell XPS 15"
                            required
                        />
                    </div>

                    {/* Quantity and Unit Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                                Cantidad *
                            </label>
                            <input
                                id="quantity"
                                name="quantity"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                className="input-field"
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="unit_price" className="block text-sm font-medium text-gray-700 mb-2">
                                Precio Unitario ($) *
                            </label>
                            <input
                                id="unit_price"
                                name="unit_price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.unit_price}
                                onChange={handleInputChange}
                                className="input-field"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    {/* Total (Calculated) */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-medium text-gray-700">Total Calculado:</span>
                            <span className="text-3xl font-bold text-gradient">
                                ${calculateTotal()}
                            </span>
                        </div>
                    </div>

                    {/* Expense Date */}
                    <div>
                        <label htmlFor="expense_date" className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha del Gasto *
                        </label>
                        <input
                            id="expense_date"
                            name="expense_date"
                            type="date"
                            value={formData.expense_date}
                            onChange={handleInputChange}
                            className="input-field"
                            required
                        />
                    </div>

                    {/* Receipt Image Upload */}
                    <div>
                        <label htmlFor="receipt" className="block text-sm font-medium text-gray-700 mb-2">
                            Foto de la Factura
                        </label>
                        <div className="mt-2">
                            <label
                                htmlFor="receipt"
                                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200 hover:border-blue-400"
                            >
                                {imagePreview ? (
                                    <div className="relative w-full h-full">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-contain rounded-xl"
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setImagePreview(null);
                                                setFormData(prev => ({ ...prev, receipt: null }));
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Click para subir</span> o arrastra la imagen
                                        </p>
                                        <p className="text-xs text-gray-500">JPG o PNG (máx. 10MB)</p>
                                        <p className="text-xs text-blue-600 mt-2">📱 Optimizado para móviles</p>
                                    </div>
                                )}
                                <input
                                    id="receipt"
                                    name="receipt"
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    capture="environment"
                                />
                            </label>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            La imagen se comprimirá automáticamente para optimizar el almacenamiento
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex-1 flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <span className="spinner mr-2"></span>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {id ? 'Actualizar Gasto' : 'Registrar Gasto'}
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/reports')}
                            className="btn-secondary flex-1"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default ExpenseForm;
