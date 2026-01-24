import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const UserManagement = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('password');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Change Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Create User State
    const [userData, setUserData] = useState({
        username: '',
        password: '',
        role: 'user'
    });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas nuevas no coinciden' });
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Error al cambiar la contraseña' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setLoading(true);

        try {
            await api.post('/auth/register', userData);
            setMessage({ type: 'success', text: 'Usuario creado correctamente' });
            setUserData({ username: '', password: '', role: 'user' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Error al crear usuario' });
        } finally {
            setLoading(false);
        }
    };

    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Fetch users when tab changes
    useEffect(() => {
        if (activeTab === 'list' && user?.role === 'admin') {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            setMessage({ type: 'error', text: 'Error al cargar usuarios' });
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;

        try {
            await api.delete(`/users/${id}`);
            setMessage({ type: 'success', text: 'Usuario eliminado correctamente' });
            fetchUsers();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Error al eliminar usuario' });
        }
    };

    const handleEditUser = (user) => {
        setEditingUser({ ...user, password: '' });
        setActiveTab('edit');
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const dataToUpdate = {
                username: editingUser.username,
                role: editingUser.role
            };
            if (editingUser.password) {
                dataToUpdate.password = editingUser.password;
            }

            await api.put(`/users/${editingUser.id}`, dataToUpdate);
            setMessage({ type: 'success', text: 'Usuario actualizado correctamente' });
            setActiveTab('list');
            setEditingUser(null);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Error al actualizar usuario' });
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gradient">Gestión de Usuarios</h1>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-200 overflow-x-auto">
                <button
                    className={`pb-2 px-4 font-medium whitespace-nowrap ${activeTab === 'password' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('password')}
                >
                    Mi Contraseña
                </button>
                {user?.role === 'admin' && (
                    <>
                        <button
                            className={`pb-2 px-4 font-medium whitespace-nowrap ${activeTab === 'list' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('list')}
                        >
                            Lista de Usuarios
                        </button>
                        <button
                            className={`pb-2 px-4 font-medium whitespace-nowrap ${activeTab === 'create' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('create')}
                        >
                            Crear Usuario
                        </button>
                    </>
                )}
            </div>

            {/* Message Alert */}
            {message.text && (
                <div className={`p-4 rounded-lg animate-fade-in ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    {message.text}
                </div>
            )}

            {/* Change Password Form */}
            {activeTab === 'password' && (
                <div className="card-glass p-6 animate-fade-in">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Cambiar mi contraseña</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full">
                            {loading ? <span className="spinner"></span> : 'Actualizar Contraseña'}
                        </button>
                    </form>
                </div>
            )}

            {/* Users List */}
            {activeTab === 'list' && user?.role === 'admin' && (
                <div className="card-glass p-0 overflow-hidden animate-fade-in">
                    {/* Mobile View (Cards) */}
                    <div className="md:hidden p-4 space-y-4">
                        {users.map((u) => (
                            <div key={u.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-gray-800">{u.username}</h3>
                                    <span className={u.role === 'admin' ? 'badge-admin' : 'badge-user'}>
                                        {u.role === 'admin' ? 'Admin' : 'Usuario'}
                                    </span>
                                </div>

                                <div className="text-sm text-gray-500">
                                    Registrado: {new Date(u.created_at).toLocaleDateString()}
                                </div>

                                <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => handleEditUser(u)}
                                        className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(u.id)}
                                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                        disabled={u.id === user.id}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop View (Table) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {u.username}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={u.role === 'admin' ? 'badge-admin' : 'badge-user'}>
                                                {u.role === 'admin' ? 'Administrador' : 'Usuario'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEditUser(u)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(u.id)}
                                                className="text-red-600 hover:text-red-900"
                                                disabled={u.id === user.id}
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
            )}

            {/* Edit User Form */}
            {activeTab === 'edit' && editingUser && (
                <div className="card-glass p-6 animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">Editar Usuario: {editingUser.username}</h2>
                        <button onClick={() => { setActiveTab('list'); setEditingUser(null); }} className="text-gray-500 hover:text-gray-700">
                            Cancelar
                        </button>
                    </div>
                    <form onSubmit={handleUpdateUser} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                            <input
                                type="text"
                                value={editingUser.username}
                                onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña (Opcional)</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={editingUser.password}
                                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                                    className="input-field pr-10"
                                    placeholder="Dejar en blanco para mantener la actual"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                <span className="font-semibold">Nota:</span> Por seguridad, la contraseña actual no se muestra. Ingrese una nueva solo si desea cambiarla.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                            <select
                                value={editingUser.role}
                                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                className="input-field"
                            >
                                <option value="user">Usuario Estándar</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="submit" disabled={loading} className="btn-primary flex-1">
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Create User Form */}
            {activeTab === 'create' && user?.role === 'admin' && (
                <div className="card-glass p-6 animate-fade-in">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Crear Nuevo Usuario</h2>
                    <form onSubmit={handleCreateUser} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                            <input
                                type="text"
                                value={userData.username}
                                onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                            <input
                                type="password"
                                value={userData.password}
                                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                            <select
                                value={userData.role}
                                onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                                className="input-field"
                            >
                                <option value="user">Usuario Estándar</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full">
                            {loading ? <span className="spinner"></span> : 'Crear Usuario'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
