import api from './api';

export interface FECUploadResponse {
  id: string;
  filename: string;
  uploaded_at: string;
  status: string;
  message: string;
  nb_lignes: number;
}

export interface FECHistoryItem {
  id: string;
  filename: string;
  processed_at: string;
  nb_lignes: number;
  status: string;
}

export interface PosteBilan {
  poste: string;
  montant: number;
}

export interface BilanData {
  actif: PosteBilan[];
  passif: PosteBilan[];
  total_actif: number;
  total_passif: number;
}

export interface CompteResultatData {
  charges: PosteBilan[];
  produits: PosteBilan[];
  total_charges: number;
  total_produits: number;
  resultat: number;
}

export interface BalanceItem {
  CompteNum: string;
  CompteLib: string;
  Debit: number;
  Credit: number;
  Solde: number;
}

export interface FECDetailResponse {
  id: string;
  user_id: string;
  filename: string;
  processed_at: string;
  nb_lignes: number;
  status: string;
  balance_generale: BalanceItem[];
  bilan: BilanData;
  compte_resultat: CompteResultatData;
}

export const fecAPI = {
  uploadFEC: async (file: File | Blob, filename: string): Promise<FECUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file, filename);

    // Axios gère automatiquement le Content-Type multipart/form-data
    // Ne pas le définir manuellement pour éviter les problèmes de boundary
    const response = await api.post<FECUploadResponse>('/fec/upload', formData);
    return response.data;
  },

  generateSample: async (nbLignes: number = 1000): Promise<Blob> => {
    const response = await api.get(`/fec/generate-sample?nb_lignes=${nbLignes}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  generateAndProcess: async (nbLignes: number = 100): Promise<FECUploadResponse> => {
    const response = await api.post<FECUploadResponse>(`/fec/generate-and-process?nb_lignes=${nbLignes}`);
    return response.data;
  },

  getHistory: async (): Promise<FECHistoryItem[]> => {
    const response = await api.get<FECHistoryItem[]>('/fec/history');
    return response.data;
  },

  getDetails: async (fecId: string): Promise<FECDetailResponse> => {
    const response = await api.get<FECDetailResponse>(`/fec/${fecId}`);
    return response.data;
  },
};
