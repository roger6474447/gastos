import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Login from './components/Login';
import Layout from './components/Layout';
import ExpenseForm from './components/ExpenseForm';
import IncomeForm from './components/IncomeForm';
import Reports from './components/Reports';
import UserManagement from './components/UserManagement';
import Settings from './components/Settings';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <span className="spinner text-blue-600 w-12 h-12"></span>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/" replace />;
};

// App Routes
const AppRoutes = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route
                path="/"
                element={isAuthenticated ? <Navigate to="/reports" replace /> : <Login />}
            />
            <Route
                path="/expenses/new"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <ExpenseForm />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/expenses/edit/:id"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <ExpenseForm />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/incomes"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <IncomeForm />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/reports"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Reports />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/users"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <UserManagement />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Settings />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

// Main App
function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <SettingsProvider>
                    <AppRoutes />
                </SettingsProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
