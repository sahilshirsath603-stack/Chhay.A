import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import axios from 'axios';
import Home from './components/home/Home';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';
import AppLayout from './layout/AppLayout';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import { SocketProvider } from './context/SocketContext';
import ProfilePage from './pages/ProfilePage';
import Rooms from './components/Rooms';

// Placeholder empty components for missing routes to prevent app crash
const Groups = () => <div style={{ padding: 20 }}>Groups Coming Soon</div>;

function ProtectedRoute({ children, token }) {
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SocketProvider token={token}>
      {children}
    </SocketProvider>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const THEME_CHHAYA = "chhaya";
  const THEME_PRAKASH = "prakash";
  const [theme, setTheme] = useState(localStorage.getItem("theme") || THEME_CHHAYA);

  const toggleTheme = () => {
    const newTheme = theme === THEME_CHHAYA ? THEME_PRAKASH : THEME_CHHAYA;
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    window.location.href = "/login";
  };

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Native Android hardware Back Button handling
  useEffect(() => {
    const handleBackButton = async () => {
      CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          CapacitorApp.exitApp();
        } else {
          window.history.back();
        }
      });
    };
    
    handleBackButton();

    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes inside AppLayout */}
        <Route
          element={
            token ? (
              <ProtectedRoute token={token}>
                <AppLayout onLogout={handleLogout} />
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/home" element={<Home token={token} />} />
          <Route path="/messages" element={<Chat token={token} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/messages/:id" element={<Chat token={token} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/rooms" element={<Chat token={token} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/rooms/:id" element={<Chat token={token} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/notifications" element={<Notifications token={token} />} />
          <Route path="/groups" element={<Groups token={token} />} />
          <Route path="/profile" element={<ProfilePage token={token} />} />
          <Route path="/profile/:id" element={<ProfilePage token={token} />} />
          <Route path="/settings" element={<Settings theme={theme} toggleTheme={toggleTheme} />} />
        </Route>

        {/* Default Redirect */}
        <Route
          path="*"
          element={<Navigate to={token ? "/home" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
