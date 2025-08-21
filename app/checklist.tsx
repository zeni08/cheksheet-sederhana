import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import DatabaseService from '../services/DatabaseService';
import { Machine, ChecklistItem, ChecklistDetail } from '../types/database';
import { CircleCheck as CheckCircle2, Circle as XCircle, Minus, Camera, Send, ArrowLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ChecklistScreen() {
  const { machineId } = useLocalSearchParams<{ machineId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  
  const [machine, setMachine] = useState<Machine | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [responses, setResponses] = useState<{[key: number]: ChecklistDetail}>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadChecklistData();
  }, [machineId]);

  const loadChecklistData = async () => {
    if (!machineId) return;

    try {
      const machines = await DatabaseService.getMachines();
      const foundMachine = machines.find(m => m.id === parseInt(machineId));
      
      if (!foundMachine) {
        Alert.alert('Error', 'Machine not found');
        router.back();
        return;
      }

      setMachine(foundMachine);
      const items = await DatabaseService.getChecklistItems(foundMachine.id);
      setChecklistItems(items);

      // Initialize responses
      const initialResponses: {[key: number]: ChecklistDetail} = {};
      items.forEach(item => {
        initialResponses[item.id] = {
          id: 0,
          id_report: 0,
          id_item: item.id,
          status: 'N/A',
          catatan: '',
          url_foto: ''
        };
      });
      setResponses(initialResponses);
    } catch (error) {
      Alert.alert('Error', 'Failed to load checklist data');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const updateResponse = (itemId: number, field: keyof ChecklistDetail, value: any) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const takePicture = async (itemId: number) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      updateResponse(itemId, 'url_foto', result.assets[0].uri);
    }
  };

  const submitChecklist = async () => {
    if (!machine || !user) return;

    // Validate all items have been checked
    const unansweredItems = checklistItems.filter(
      item => responses[item.id]?.status === 'N/A'
    );

    if (unansweredItems.length > 0) {
      Alert.alert(
        'Incomplete Checklist',
        `Please check all items. ${unansweredItems.length} items remaining.`
      );
      return;
    }

    setSubmitting(true);

    try {
      // Create report
      const reportId = await DatabaseService.createReport({
        id_mesin: machine.id,
        id_operator: user.id,
        tanggal_pengecekan: new Date().toISOString(),
        status: 'completed'
      });

      // Save checklist details
      const details = Object.values(responses).map(response => ({
        ...response,
        id_report: reportId
      }));

      await DatabaseService.saveChecklistDetails(details);

      Alert.alert(
        'Success',
        'Checklist submitted successfully!',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit checklist');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading checklist...</Text>
      </View>
    );
  }

  if (!machine) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Machine not found</Text>
      </View>
    );
  }

  const StatusButton = ({ 
    status, 
    currentStatus, 
    onPress, 
    icon: Icon, 
    color 
  }: {
    status: 'OK' | 'Not OK' | 'N/A';
    currentStatus: 'OK' | 'Not OK' | 'N/A';
    onPress: () => void;
    icon: any;
    color: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.statusButton,
        { borderColor: color },
        currentStatus === status && { backgroundColor: color + '20' }
      ]}
      onPress={onPress}
    >
      <Icon 
        size={20} 
        color={currentStatus === status ? color : '#6B7280'} 
      />
      <Text 
        style={[
          styles.statusButtonText,
          { color: currentStatus === status ? color : '#6B7280' }
        ]}
      >
        {status}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#2563EB" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.machineTitle}>{machine.nama_mesin}</Text>
          <Text style={styles.machineLocation}>{machine.lokasi}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {checklistItems.map((item, index) => {
          const response = responses[item.id];
          return (
            <View key={item.id} style={styles.checklistItem}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemNumber}>{index + 1}</Text>
                <Text style={styles.itemQuestion}>{item.item_pengecekan}</Text>
              </View>

              <View style={styles.statusButtons}>
                <StatusButton
                  status="OK"
                  currentStatus={response.status}
                  onPress={() => updateResponse(item.id, 'status', 'OK')}
                  icon={CheckCircle2}
                  color="#16A34A"
                />
                <StatusButton
                  status="Not OK"
                  currentStatus={response.status}
                  onPress={() => updateResponse(item.id, 'status', 'Not OK')}
                  icon={XCircle}
                  color="#DC2626"
                />
                <StatusButton
                  status="N/A"
                  currentStatus={response.status}
                  onPress={() => updateResponse(item.id, 'status', 'N/A')}
                  icon={Minus}
                  color="#6B7280"
                />
              </View>

              <TextInput
                style={styles.notesInput}
                placeholder="Add notes (optional)"
                placeholderTextColor="#9CA3AF"
                value={response.catatan}
                onChangeText={(text) => updateResponse(item.id, 'catatan', text)}
                multiline
              />

              <View style={styles.photoSection}>
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={() => takePicture(item.id)}
                >
                  <Camera size={20} color="#2563EB" />
                  <Text style={styles.photoButtonText}>
                    {response.url_foto ? 'Change Photo' : 'Add Photo'}
                  </Text>
                </TouchableOpacity>

                {response.url_foto && (
                  <Image source={{ uri: response.url_foto }} style={styles.photoPreview} />
                )}
              </View>
            </View>
          );
        })}

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={submitChecklist}
          disabled={submitting}
        >
          <Send size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>
            {submitting ? 'Submitting...' : 'Submit Checklist'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  machineTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  machineLocation: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  checklistItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  itemNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
    backgroundColor: '#EBF4FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
    minWidth: 32,
    textAlign: 'center',
  },
  itemQuestion: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    lineHeight: 24,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 6,
  },
  statusButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  notesInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  photoSection: {
    alignItems: 'flex-start',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#EBF4FF',
    borderRadius: 6,
    gap: 6,
  },
  photoButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginTop: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 16,
    marginVertical: 32,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
});