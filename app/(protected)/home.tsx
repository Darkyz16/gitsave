import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import Button from '../../components/Button';

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isTestingAuth, setIsTestingAuth] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestAuth = async () => {
    try {
      setIsTestingAuth(true);
      setTestResult(null);
      
      const result = await authAPI.testAuth();
      
      setTestResult(`✅ Authentification réussie !\n\nMessage: ${result.message}\nEmail: ${result.user_email}`);
      
      Alert.alert(
        'Test réussi ✅',
        `JWT valide !\n\nUtilisateur: ${result.user_email}`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Erreur inconnue';
      setTestResult(`❌ Erreur d'authentification\n\n${errorMessage}`);
      
      Alert.alert(
        'Test échoué ❌',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsTestingAuth(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnecter', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📊 FEC Analyzer</Text>
          <Text style={styles.subtitle}>Tableau de bord</Text>
        </View>

        {/* User Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profil Utilisateur</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nom :</Text>
            <Text style={styles.infoValue}>{user?.username}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email :</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Statut :</Text>
            <Text style={[styles.infoValue, styles.activeStatus]}>
              {user?.is_active ? '✅ Actif' : '❌ Inactif'}
            </Text>
          </View>
        </View>

        {/* JWT Test Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Test d'Authentification JWT</Text>
          <Text style={styles.cardDescription}>
            Testez l'accès sécurisé aux endpoints protégés avec votre token JWT.
          </Text>

          <Button
            title="Tester l'authentification"
            onPress={handleTestAuth}
            loading={isTestingAuth}
            style={styles.testButton}
          />

          {testResult && (
            <View style={[
              styles.resultContainer,
              testResult.includes('✅') ? styles.successResult : styles.errorResult
            ]}>
              <Text style={styles.resultText}>{testResult}</Text>
            </View>
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>🛡️ Sécurité JWT</Text>
          <Text style={styles.infoCardText}>
            • Votre token JWT est stocké de manière sécurisée dans SecureStore{"\n"}
            • Expiration automatique après 24 heures{"\n"}
            • Tous les appels API sont automatiquement authentifiés{"\n"}
            • Protection bcrypt pour votre mot de passe
          </Text>
        </View>

        {/* Actions FEC */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Analyse FEC</Text>
          <Text style={styles.cardDescription}>
            Téléchargez et analysez vos fichiers FEC pour obtenir automatiquement la Balance, le Bilan et le Compte de Résultat.
          </Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/upload')}
          >
            <Text style={styles.actionButtonIcon}>📤</Text>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonTitle}>Upload FEC</Text>
              <Text style={styles.actionButtonDescription}>
                Télécharger un fichier comptable
              </Text>
            </View>
            <Text style={styles.actionButtonArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/fec-list')}
          >
            <Text style={styles.actionButtonIcon}>📋</Text>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonTitle}>Historique</Text>
              <Text style={styles.actionButtonDescription}>
                Voir les fichiers traités
              </Text>
            </View>
            <Text style={styles.actionButtonArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <Button
          title="Se déconnecter"
          onPress={handleLogout}
          variant="secondary"
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#333333',
  },
  activeStatus: {
    fontWeight: '600',
    color: '#34C759',
  },
  testButton: {
    marginTop: 8,
  },
  resultContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  successResult: {
    backgroundColor: '#E8F9F0',
    borderColor: '#34C759',
  },
  errorResult: {
    backgroundColor: '#FFF0F0',
    borderColor: '#FF3B30',
  },
  resultText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#E8F4FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 12,
  },
  infoCardText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 22,
  },
  nextStepsCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9500',
    marginBottom: 12,
  },
  nextStepsText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 22,
  },
  logoutButton: {
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionButtonIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  actionButtonDescription: {
    fontSize: 13,
    color: '#666666',
  },
  actionButtonArrow: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});
