import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { fecAPI, FECDetailResponse } from '../../../services/fec-api';

export default function FECDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [fecData, setFecData] = useState<FECDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bilan' | 'resultat' | 'balance'>('bilan');

  useEffect(() => {
    loadDetails();
  }, [id]);

  const loadDetails = async () => {
    try {
      setIsLoading(true);
      const data = await fecAPI.getDetails(id);
      setFecData(data);
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.response?.data?.detail || 'Impossible de charger les détails',
        [{ text: 'Retour', onPress: () => router.back() }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
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

  if (!fecData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Aucune donnée disponible</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>📊 Résultats FEC</Text>
          <Text style={styles.filename}>{fecData.filename}</Text>
          <Text style={styles.date}>{formatDate(fecData.processed_at)}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Comptes traités</Text>
            <Text style={styles.statValue}>{fecData.nb_lignes}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Statut</Text>
            <Text style={[styles.statValue, { color: '#34C759' }]}>✓ Traité</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'bilan' && styles.activeTab]}
            onPress={() => setActiveTab('bilan')}
          >
            <Text style={[styles.tabText, activeTab === 'bilan' && styles.activeTabText]}>
              Bilan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'resultat' && styles.activeTab]}
            onPress={() => setActiveTab('resultat')}
          >
            <Text style={[styles.tabText, activeTab === 'resultat' && styles.activeTabText]}>
              Résultat
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'balance' && styles.activeTab]}
            onPress={() => setActiveTab('balance')}
          >
            <Text style={[styles.tabText, activeTab === 'balance' && styles.activeTabText]}>
              Balance
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'bilan' && (
          <View>
            {/* Actif */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>💰 ACTIF</Text>
              {fecData.bilan.actif.map((item, index) => (
                <View key={index} style={styles.row}>
                  <Text style={styles.rowLabel}>{item.poste}</Text>
                  <Text style={styles.rowValue}>{formatCurrency(item.montant)}</Text>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Actif</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(fecData.bilan.total_actif)}
                </Text>
              </View>
            </View>

            {/* Passif */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>🏦 PASSIF</Text>
              {fecData.bilan.passif.map((item, index) => (
                <View key={index} style={styles.row}>
                  <Text style={styles.rowLabel}>{item.poste}</Text>
                  <Text style={styles.rowValue}>{formatCurrency(item.montant)}</Text>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Passif</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(fecData.bilan.total_passif)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'resultat' && (
          <View>
            {/* Charges */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📉 CHARGES</Text>
              {fecData.compte_resultat.charges.map((item, index) => (
                <View key={index} style={styles.row}>
                  <Text style={styles.rowLabel}>{item.poste}</Text>
                  <Text style={[styles.rowValue, { color: '#FF3B30' }]}>
                    {formatCurrency(item.montant)}
                  </Text>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Charges</Text>
                <Text style={[styles.totalValue, { color: '#FF3B30' }]}>
                  {formatCurrency(fecData.compte_resultat.total_charges)}
                </Text>
              </View>
            </View>

            {/* Produits */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📈 PRODUITS</Text>
              {fecData.compte_resultat.produits.map((item, index) => (
                <View key={index} style={styles.row}>
                  <Text style={styles.rowLabel}>{item.poste}</Text>
                  <Text style={[styles.rowValue, { color: '#34C759' }]}>
                    {formatCurrency(item.montant)}
                  </Text>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Produits</Text>
                <Text style={[styles.totalValue, { color: '#34C759' }]}>
                  {formatCurrency(fecData.compte_resultat.total_produits)}
                </Text>
              </View>
            </View>

            {/* Résultat */}
            <View style={[
              styles.resultCard,
              fecData.compte_resultat.resultat >= 0 ? styles.profitCard : styles.lossCard
            ]}>
              <Text style={styles.resultLabel}>
                {fecData.compte_resultat.resultat >= 0 ? '🎉 BÉNÉFICE' : '⚠️ PERTE'}
              </Text>
              <Text style={styles.resultValue}>
                {formatCurrency(Math.abs(fecData.compte_resultat.resultat))}
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'balance' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>📋 Balance Générale</Text>
            <Text style={styles.balanceInfo}>
              {fecData.balance_generale.length} comptes
            </Text>
            {fecData.balance_generale.slice(0, 20).map((item, index) => (
              <View key={index} style={styles.balanceRow}>
                <View style={styles.balanceLeft}>
                  <Text style={styles.balanceCompte}>{item.CompteNum}</Text>
                  <Text style={styles.balanceLibelle}>{item.CompteLib}</Text>
                </View>
                <View style={styles.balanceRight}>
                  <Text style={styles.balanceSolde}>
                    {formatCurrency(item.Solde)}
                  </Text>
                </View>
              </View>
            ))}
            {fecData.balance_generale.length > 20 && (
              <Text style={styles.moreText}>
                ... et {fecData.balance_generale.length - 20} autres comptes
              </Text>
            )}
          </View>
        )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  filename: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666666',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  sectionCard: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rowLabel: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#007AFF',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  resultCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  profitCard: {
    backgroundColor: '#E8F9F0',
  },
  lossCard: {
    backgroundColor: '#FFF0F0',
  },
  resultLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
  },
  balanceInfo: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  balanceLeft: {
    flex: 1,
    marginRight: 12,
  },
  balanceCompte: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  balanceLibelle: {
    fontSize: 12,
    color: '#666666',
  },
  balanceRight: {
    justifyContent: 'center',
  },
  balanceSolde: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  moreText: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
});
