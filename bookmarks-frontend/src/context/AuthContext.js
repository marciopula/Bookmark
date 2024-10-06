import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;

// Add this line to set the base URL for all axios requests
axios.defaults.baseURL = 'http://localhost:5000';

const AuthContext = createContext();

// Remove the unused API_URL constant
// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('token');
    console.log('Initial token from localStorage:', storedToken);
    return storedToken;
  });
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  }, []);

  const fetchUser = useCallback(async () => {
    if (!token) {
      console.log('No token available, skipping user fetch');
      setLoading(false);
      return;
    }
    try {
      console.log('Fetching user with token:', token);
      const res = await axios.get('/api/auth', {
        headers: { 'x-auth-token': token }
      });
      console.log('User fetch response:', res.data);
      setUser(res.data);
    } catch (error) {
      console.error('Error fetching user:', error.response?.data || error.message);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    console.log('Token changed:', token);
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token, fetchUser]);

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Attempting login with:', { email });
      const res = await axios.post('/api/auth/login', { email, password });
      console.log('AuthContext: Login response:', res.data);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      await fetchUser();
      console.log('AuthContext: Login successful, user fetched');
      return true;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw new Error(error.response?.data?.msg || error.message || 'Login failed');
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log('Sending registration request to: /api/users');
      const res = await axios.post('/api/users', { name, email, password });
      console.log('Registration response:', res.data);
      if (res.data && res.data.token) {
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        await fetchUser();
        return true;
      } else {
        console.error('Unexpected response:', res.data);
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      throw new Error(error.response?.data?.msg || error.message || 'Registration failed');
    }
  };

  const checkToken = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      console.log('No token to check');
      return false;
    }
    try {
      console.log('Checking token validity');
      const res = await axios.get('/api/check-auth', {
        headers: { 'x-auth-token': currentToken }
      });
      console.log('Token check response:', res.data);
      return true;
    } catch (error) {
      console.error('Token check failed:', error.response?.data);
      logout();
      return false;
    }
  }, [logout]);

  const fetchDevices = async () => {
    try {
      console.log('Fetching devices...');
      const res = await axios.get('/api/devices', {
        headers: { 'x-auth-token': token }
      });
      console.log('Devices fetch response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching devices:', error.response?.data || error.message);
      console.error('Full error object:', error);
      throw error;
    }
  };

  const deleteDevice = async (deviceId) => {
    try {
      await axios.delete(`/api/devices/${deviceId}`, {
        headers: { 'x-auth-token': token }
      });
      console.log('Device and associated bookmarks deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting device and bookmarks:', error.response?.data || error.message);
      throw error;
    }
  };

  const updateDevice = async (deviceId, newName) => {
    try {
      const res = await axios.put(`/api/devices/${deviceId}`, { name: newName }, {
        headers: { 'x-auth-token': token }
      });
      console.log('Device update response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error updating device:', error.response?.data || error.message);
      throw error;
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      checkToken();
    }
  }, [checkToken]);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, checkToken, fetchDevices, deleteDevice, updateDevice }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);