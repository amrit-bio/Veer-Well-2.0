import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole;
  isAnonymized: boolean;
  toggleAnonymization: () => void;
  login: (email?: string, role?: UserRole) => Promise<void>;
  signup: (data: {
    name: string;
    email: string;
    role: UserRole;
    department: string;
    designation: string;
  }) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('veerwell_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAnonymized, setIsAnonymized] = useState<boolean>(true);

  // Initialize with stored or default user
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('veerwell_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // Default pre-login state or load first demo user
          const res = await api.getDemoUsers();
          if (res.demoUsers && res.demoUsers.length > 0) {
            setUser(res.demoUsers[0]);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email?: string, role?: UserRole) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, role);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('veerwell_token', res.token);
      localStorage.setItem('veerwell_user', JSON.stringify(res.user));
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: {
    name: string;
    email: string;
    role: UserRole;
    department: string;
    designation: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.signup(data);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('veerwell_token', res.token);
      localStorage.setItem('veerwell_user', JSON.stringify(res.user));
    } catch (err) {
      console.error('Signup error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (newRole: UserRole) => {
    await login(undefined, newRole);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('veerwell_token');
    localStorage.removeItem('veerwell_user');
  };

  const toggleAnonymization = () => {
    setIsAnonymized((prev) => !prev);
  };

  const currentRole: UserRole = user?.role || 'hr_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        role: currentRole,
        isAnonymized,
        toggleAnonymization,
        login,
        signup,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
