import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext } from 'react';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { PartnerDetailPage } from './pages/PartnerDetailPage';
import { SubmitPage } from './pages/SubmitPage';
import authService from '@/lib/auth';
import './App.css'
import { Toaster } from 'sonner';

// 创建认证上下文
export const AuthContext = createContext<boolean>(false);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const { access } = authService.getTokens();
      const newAuthState = !!access;
      setIsAuthenticated(newAuthState);
    };

    // 初始检查
    checkAuth();

    // 监听 storage 变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        checkAuth();
      }
    };

    // 监听自定义认证事件
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={isAuthenticated}>
      <Router>
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <main className="flex-1 relative">
            <Routes>
              <Route 
                path="/login" 
                element={
                  !isAuthenticated ? (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <LoginForm />
                    </div>
                  ) : (
                    <Navigate to="/" replace />
                  )
                } 
              />
              <Route 
                path="/register" 
                element={
                  !isAuthenticated ? (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <RegisterForm />
                    </div>
                  ) : (
                    <Navigate to="/" replace />
                  )
                } 
              />
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/partner/:id" element={<PartnerDetailPage />} />
              <Route 
                path="/submit" 
                element={
                  isAuthenticated ? (
                    <SubmitPage />
                  ) : (
                    <Navigate to="/login" state={{ from: '/submit' }} replace />
                  )
                } 
              />
              <Route path="/characters" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
      <Toaster richColors />
    </AuthContext.Provider>
  );
}

export default App;
