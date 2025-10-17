import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authAPI, RegisterData, LoginData, User, secureStorage } from '../services/api';
import { router } from 'expo-router';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await secureStorage.getItem('jwt_token');
      if (token) {
        // Vérifier si le token est valide
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      setIsAuthenticated(false);
      setUser(null);
      // Supprimer le token s'il est invalide
      await secureStorage.deleteItem('jwt_token');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      // Inscription
      const newUser = await authAPI.register(data);
      
      // Connexion automatique après inscription
      const tokenResponse = await authAPI.login({
        email: data.email,
        password: data.password,
      });

      // Stocker le token de manière sécurisée
      await secureStorage.setItem('jwt_token', tokenResponse.access_token);
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      // Rediriger vers l'écran principal
      router.replace('/(protected)/home');
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      throw new Error(
        error.response?.data?.detail || 
        'Une erreur est survenue lors de l\'inscription'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {
      setIsLoading(true);
      // Connexion
      const tokenResponse = await authAPI.login(data);
      
      // Stocker le token de manière sécurisée
      await secureStorage.setItem('jwt_token', tokenResponse.access_token);
      
      // Récupérer les données utilisateur
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      
      // Rediriger vers l'écran principal
      router.replace('/(protected)/home');
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      throw new Error(
        error.response?.data?.detail || 
        'Email ou mot de passe incorrect'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      // Supprimer le token
      await secureStorage.deleteItem('jwt_token');
      setUser(null);
      setIsAuthenticated(false);
      
      // Rediriger vers l'écran de connexion
      router.replace('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
