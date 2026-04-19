import React, { createContext, useState, useContext, useEffect } from 'react';

export type UserRole = 'guest' | 'client' | 'admin';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isClient: boolean;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Моковые пользователи для демонстрации
const MOCK_USERS = [
  { id: 1, username: 'guest', password: 'guest', email: 'guest@fleet.ru', full_name: 'Гость', role: 'guest' as UserRole },
  { id: 2, username: 'client', password: 'client', email: 'client@fleet.ru', full_name: 'Иван Петров', role: 'client' as UserRole },
  { id: 3, username: 'admin', password: 'admin', email: 'admin@fleet.ru', full_name: 'Администратор', role: 'admin' as UserRole },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username: string, password: string) => {
    const mockUser = MOCK_USERS.find(u => u.username === username && u.password === password);
    if (!mockUser) {
      throw new Error('Неверный логин или пароль');
    }
    
    const { password: _, ...userWithoutPassword } = mockUser;
    setUser(userWithoutPassword as User);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const register = async (userData: any) => {
    const newUser: User = {
      id: MOCK_USERS.length + 1,
      username: userData.username,
      email: userData.email,
      full_name: userData.full_name,
      role: 'client',
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const isAdmin = user?.role === 'admin';
  const isClient = user?.role === 'client';
  const isGuest = !user || user?.role === 'guest';

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      isAuthenticated: !!user,
      isAdmin,
      isClient,
      isGuest
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
