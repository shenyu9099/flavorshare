import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/api';
import { setUser as setInsightsUser, trackEvent } from '../config/appInsights';

// Auth Context
const AuthContext = createContext(null);

// Auth Provider 组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 从 localStorage 恢复登录状态
  useEffect(() => {
    const savedUser = localStorage.getItem('flavorshare_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
      // 设置 Application Insights 用户上下文
      setInsightsUser(userData.id);
    }
    setLoading(false);
  }, []);

  // 登录
  const login = async (email, password) => {
    try {
      const response = await userService.login(email, password);
      
      if (response.success) {
        const userData = response.user;
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('flavorshare_user', JSON.stringify(userData));
        // 记录登录事件到 Application Insights
        setInsightsUser(userData.id);
        trackEvent('UserLogin', { userId: userData.id, email: userData.email });
        return { success: true };
      } else {
        trackEvent('UserLoginFailed', { email, error: response.error });
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.error;
      const errorText = typeof errorMsg === 'object' ? (errorMsg.message || JSON.stringify(errorMsg)) : (errorMsg || 'Login failed. Please try again.');
      trackEvent('UserLoginError', { email, error: errorText });
      return { success: false, error: errorText };
    }
  };

  // 注册
  const register = async (name, email, password) => {
    try {
      const response = await userService.register(name, email, password);
      
      if (response.success) {
        const userData = response.user;
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('flavorshare_user', JSON.stringify(userData));
        // 记录注册事件到 Application Insights
        setInsightsUser(userData.id);
        trackEvent('UserRegistered', { userId: userData.id, email: userData.email });
        return { success: true };
      } else {
        trackEvent('UserRegisterFailed', { email, error: response.error });
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Register error:', error);
      const errorMsg = error.response?.data?.error;
      const errorText = typeof errorMsg === 'object' ? (errorMsg.message || JSON.stringify(errorMsg)) : (errorMsg || 'Registration failed. Please try again.');
      trackEvent('UserRegisterError', { email, error: errorText });
      return { success: false, error: errorText };
    }
  };

  // 登出
  const logout = () => {
    // 记录登出事件
    if (user) {
      trackEvent('UserLogout', { userId: user.id });
    }
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('flavorshare_user');
    // 清除 Application Insights 用户上下文
    setInsightsUser(null);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 自定义 Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthProvider;
