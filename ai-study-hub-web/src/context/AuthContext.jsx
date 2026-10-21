import React, { createContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Khôi phục trạng thái đăng nhập từ LocalStorage khi tải lại trang
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Hàm Đăng nhập (Auth-02)
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      
      // Backend bọc kết quả trong ApiResponse<AuthResponse> (data.data) hoặc trả trực tiếp (data)
      const responsePayload = response.data?.data || response.data;
      const jwtToken = responsePayload?.accessToken || responsePayload?.token;
      const refreshToken = responsePayload?.refreshToken;
      const userData = responsePayload?.user;

      if (!jwtToken) {
        throw new Error(response.data?.message || 'Không nhận được token xác thực từ máy chủ.');
      }

      localStorage.setItem('token', jwtToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
      }

      setToken(jwtToken);
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, data: responsePayload };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Đăng nhập thất bại. Vui lòng thử lại!';
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm Đăng ký (Auth-01)
  const register = async (registerData) => {
    setIsLoading(true);
    try {
      const response = await axiosClient.post('/auth/register', registerData);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại!';
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm Đăng xuất (Auth-03)
  const logout = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (err) {
      console.warn('Lỗi khi gọi API logout:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
