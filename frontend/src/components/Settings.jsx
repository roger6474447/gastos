import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Settings = () => {
    const { settings, updateSettings, loading } = useSettings();
    const [formData, setFormData] = useState({
        app_name: '',
        currency_symbol: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (settings) {
            setFormData({
                app_name: settings.app_name,
                currency_symbol: settings.currency_symbol
            });
        }
    }, [settings]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const result = await updateSettings(formData);
            if (result.success) {
                toast.success('Configuración actualizada correctamente');
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Error al guardar la configuración');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="spinner text-blue-600 w-8 h-8"></span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
        >
            <div className="card-glass p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gradient mb-2">Configuración General</h1>
                    <p className="text-gray-600">Personaliza los aspectos generales de la aplicación</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre de la Aplicación
                        </label>
                        <input
                            type="text"
                            value={formData.app_name}
                            onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
                            className="input-field"
                            placeholder="Ej: Mi Sistema de Gastos"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Este nombre aparecerá en la barra superior.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Símbolo de Moneda
                        </label>
                        <input
                            type="text"
                            value={formData.currency_symbol}
                            onChange={(e) => setFormData({ ...formData, currency_symbol: e.target.value })}
                            className="input-field w-32"
                            placeholder="Ej: Bs., $, €"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Se mostrará en todos los reportes y formularios.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary w-full sm:w-auto"
                        >
                            {saving ? (
                                <>
                                    <span className="spinner w-4 h-4 mr-2"></span>
                                    Guardando...
                                </>
                            ) : (
                                'Guardar Cambios'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default Settings;
