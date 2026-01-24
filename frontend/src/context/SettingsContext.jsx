import { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        app_name: 'Sistema de Gastos',
        currency_symbol: 'Bs.'
    });
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings');
            setSettings(response.data);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const updateSettings = async (newSettings) => {
        try {
            const response = await api.put('/settings', newSettings);
            setSettings(response.data.settings);
            return { success: true };
        } catch (error) {
            console.error('Error updating settings:', error);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al actualizar configuración'
            };
        }
    };

    const value = {
        settings,
        loading,
        updateSettings,
        refreshSettings: fetchSettings
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
};
