import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set up axios defaults
  axios.defaults.baseURL = 'http://localhost:5000';
  
  
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        
        const payload = JSON.parse(atob(token.split('.')[1]));
        let profileRes;
        if (payload.role === 'student') {
          profileRes = await axios.get('/api/students/profile');
        } else if (payload.role === 'teacher') {
          profileRes = await axios.get('/api/teachers/profile');
        } else {
          profileRes = await axios.get('/api/users/profile');
        }
        setCurrentUser(profileRes.data);
      } catch (error) {
        console.error('Error loading user:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token, user } = res.data;
      
      // Set token first
      setToken(token);
      
      // Set current user
      setCurrentUser(user);
      
      return { user, token };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    const res = await axios.post('/api/auth/register', userData);
    return res.data;
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setCurrentUser(null);
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    let endpoint;
    if (currentUser.role === 'student') {
      endpoint = '/api/students/profile';
    } else if (currentUser.role === 'teacher') {
      endpoint = '/api/teachers/profile';
    } else {
      endpoint = '/api/users/profile';
    }
    
    const res = await axios.put(endpoint, profileData);
    setCurrentUser(res.data);
    return res.data;
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};