import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import Button from '../../components/Button';
import { fecAPI } from '../../services/fec-api';

export default function UploadScreen() {
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: number;
  } | null>(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({
          name: file.name,
          size: file.size || 0,
        });
        Alert.alert('Fichier sélectionné', `${file.name}\nTaille: ${formatFileSize(file.size || 0)}`);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner le fichier');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const uploadFile = async () => {
    try {
      setIsUploading(true);

      // Sélectionner le fichier
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setIsUploading(false);
        return;
      }

      const file = result.assets[0];
      
      // Lire le fichier
      const response = await fetch(file.uri);
      const blob = await response.blob();

      // Upload
      const uploadResult = await fecAPI.uploadFEC(blob, file.name);

      Alert.alert(
        'Succès ! 🎉',
        `Fichier traité avec succès !\n\nComptes traités: ${uploadResult.nb_lignes}`,
        [
          {
            text: 'Voir les résultats',
            onPress: () => router.push(`/fec/${uploadResult.id}`),
          },
          { text: 'OK' },
        ]
      );

      setSelectedFile(null);
    } catch (error: any) {
      console.error('Erreur upload:', error);
      const errorMessage = error.response?.data?.detail || error.message || "Une erreur est survenue lors du traitement";
      Alert.alert(
        'Erreur de traitement',
        errorMessage
      );
    } finally {
      setIsUploading(false);
    }
  };

  const generateAndUploadSample = async () => {
    try {
      setIsGenerating(true);

      Alert.alert(
        'Génération FEC',
        'Combien de lignes souhaitez-vous générer ?',
        [
          {
            text: '100 lignes (rapide)',
            onPress: () => doGenerateAndUpload(100),
          },
          {
            text: '1000 lignes',
            onPress: () => doGenerateAndUpload(1000),
          },
          {
            text: '5000 lignes',
            onPress: () => doGenerateAndUpload(5000),
          },
          { text: 'Annuler', style: 'cancel' },
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de générer le fichier');
    } finally {
      setIsGenerating(false);
    }
  };

  const doGenerateAndUpload = async (nbLignes: number) => {
    try {
      setIsGenerating(true);

      // Utiliser le nouvel endpoint qui génère ET traite en une seule requête
      // Cela évite complètement le problème de Network Error avec multipart/form-data
      const uploadResult = await fecAPI.generateAndProcess(nbLignes);

      Alert.alert(
        'Succès ! 🎉',
        `Fichier FEC simulé traité !\n\nComptes traités: ${uploadResult.nb_lignes}`,
        [
          {
            text: 'Voir les résultats',
            onPress: () => router.push(`/fec/${uploadResult.id}`),
          },
          { text: 'OK' },
        ]
      );
    } catch (error: any) {
      console.error('Erreur génération + upload:', error);
      Alert.alert(
        'Erreur',
        error.response?.data?.detail || error.message || "Une erreur est survenue"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>📤 Upload FEC</Text>
          <Text style={styles.subtitle}>Téléchargez votre fichier comptable</Text>
        </View>

        {/* Sélection de fichier */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Option 1 : Fichier existant</Text>
          <Text style={styles.cardDescription}>
            Sélectionnez un fichier FEC depuis votre appareil (format .txt avec 18 colonnes)
          </Text>

          <Button
            title="Sélectionner et uploader un fichier"
            onPress={uploadFile}
            loading={isUploading}
            variant="secondary"
            style={styles.button}
          />
        </View>

        {/* Génération fichier simulé */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Option 2 : Fichier FEC simulé</Text>
          <Text style={styles.cardDescription}>
            Générez un fichier FEC avec des données aléatoires pour tester l'application
          </Text>

          <Button
            title="Générer et traiter un FEC simulé"
            onPress={generateAndUploadSample}
            loading={isGenerating}
            variant="primary"
            style={styles.button}
          />
        </View>

        {/* Informations */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Format FEC</Text>
          <Text style={styles.infoText}>
            • Format : Fichier texte (.txt){"\n"}
            • Séparateur : Pipe (|){"\n"}
            • Colonnes : 18 colonnes obligatoires{"\n"}
            • Encodage : UTF-8{"\n"}
            • Structure : JournalCode|JournalLib|...
          </Text>
        </View>

        {/* Navigation */}
        <Button
          title="Voir l'historique"
          onPress={() => router.push('/fec-list')}
          variant="secondary"
          style={styles.button}
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
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  fileInfo: {
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#666666',
  },
  button: {
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#E8F4FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 22,
  },
});
