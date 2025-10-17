import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configuration de l'URL de l'API
// En environnement Kubernetes, le backend est accessible via le même domaine
// Les routes /api/* sont automatiquement redirigées vers le backend (port 8001)

// URL de l'API - même domaine pour web et mobile car ingress gère le routing
const API_URL = 'https://nf864ajqb2.execute-api.eu-west-3.amazonaws.com/default/FEC_Analyzer_API';

console.log('🔧 API URL configurée:', API_URL);
console.log('📱 Platform:', Platform.OS);

// Créer une instance axios
const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper pour le stockage sécurisé cross-platform
const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      // Fallback to localStorage for web
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export { secureStorage };

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await secureStorage.getItem('jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token invalide ou expiré, supprimer le token
      await secureStorage.deleteItem('jwt_token');
    }
    return Promise.reject(error);
  }
);

// Types
export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Fonctions API
export const authAPI = {
  register: async (data: RegisterData): Promise<User> => {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/auth/login', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  testAuth: async (): Promise<{ message: string; user_email: string }> => {
    const response = await api.get('/fec/test-auth');
    return response.data;
  },
};

export default api;
