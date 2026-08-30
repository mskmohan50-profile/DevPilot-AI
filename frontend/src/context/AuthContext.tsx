import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('DEV_PILOT_USER');
    return saved ? JSON.parse(saved) : null;
  });

  const [apiKey, setApiKeyState] = useState<string>(
    () => localStorage.getItem('DEV_PILOT_LLM_KEY') || ''
  );

  const login = (email: string) => {
    const u = { email };
    setUser(u);
    localStorage.setItem('DEV_PILOT_USER', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('DEV_PILOT_USER');
  };

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem('DEV_PILOT_LLM_KEY', key);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, apiKey, setApiKey }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
