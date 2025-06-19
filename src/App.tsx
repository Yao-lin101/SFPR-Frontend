import { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { PlayerDetailPage } from './pages/PlayerDetailPage';
import { SubmitPage } from './pages/SubmitPage';
import authService from './lib/auth';
import { Toaster } from '@/components/ui/sonner';

// 创建认证上下文
export const AuthContext = createContext<boolean>(false);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // 检查用户是否已登录
  useEffect(() => {
    const { access } = authService.getTokens();
    setIsAuthenticated(!!access);

    // 监听认证状态变更
    const handleAuthChange = () => {
      const { access } = authService.getTokens();
      setIsAuthenticated(!!access);
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={isAuthenticated}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/player/:id" element={<PlayerDetailPage />} />
          <Route path="/submit" element={<SubmitPage />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
