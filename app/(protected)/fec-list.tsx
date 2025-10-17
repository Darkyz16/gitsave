import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { fecAPI, FECHistoryItem } from '../../services/fec-api';

export default function FECListScreen() {
  const [fecList, setFecList] = useState<FECHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const history = await fecAPI.getHistory();
      setFecList(history);
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.response?.data?.detail || "Impossible de charger l'historique"
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>📊 Historique FEC</Text>
          <Text style={styles.subtitle}>
            {fecList.length} fichier{fecList.length > 1 ? 's' : ''} traité{fecList.length > 1 ? 's' : ''}
          </Text>
        </View>

        {fecList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>Aucun fichier FEC</Text>
            <Text style={styles.emptyText}>
              Vous n'avez pas encore traité de fichier FEC.
            </Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => router.push('/upload')}
            >
              <Text style={styles.uploadButtonText}>Uploader un fichier</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {fecList.map((fec) => (
              <TouchableOpacity
                key={fec.id}
                style={styles.card}
                onPress={() => router.push(`/fec/${fec.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>📄 {fec.filename}</Text>
                  <View style={[
                    styles.statusBadge,
                    fec.status === 'completed' ? styles.statusCompleted : styles.statusError
                  ]}>
                    <Text style={styles.statusText}>
                      {fec.status === 'completed' ? '✓ Traité' : '✗ Erreur'}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardInfo}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>📅 Date:</Text>
                    <Text style={styles.infoValue}>{formatDate(fec.processed_at)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>📊 Comptes:</Text>
                    <Text style={styles.infoValue}>{fec.nb_lignes}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.viewDetails}>Voir les détails →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => router.push('/upload')}
          activeOpacity={0.8}
        >
          <Text style={styles.floatingButtonText}>+ Nouveau FEC</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
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
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusCompleted: {
    backgroundColor: '#E8F9F0',
  },
  statusError: {
    backgroundColor: '#FFF0F0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  viewDetails: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  floatingButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
