// src/components/auth/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('student');
    const token = localStorage.getItem('token');
    if (stored) {
      try {
        setStudent(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('student');
      }
    }
    // optionally check token validity here
    setLoading(false);
  }, []);

  const login = (studentData, token) => {
    setStudent(studentData);
    localStorage.setItem('student', JSON.stringify(studentData));
    if (token) localStorage.setItem('token', token);
  };

  const logout = () => {
    setStudent(null);
    localStorage.removeItem('student');
    localStorage.removeItem('token');
    // redirect can be handled by caller
  };

  const updateStudent = (updates) => {
    const updated = { ...student, ...updates };
    setStudent(updated);
    localStorage.setItem('student', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ student, loading, login, logout, updateStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
