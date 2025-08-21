import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import DatabaseService from '../../services/DatabaseService';
import { Machine } from '../../types/database';
import { Monitor, MapPin, QrCode, Plus, Settings, CreditCard as Edit3 } from 'lucide-react-native';

export default function MachinesScreen() {
  const { user } = useAuth();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMachines();
  }, []);

  const loadMachines = async () => {
    try {
      const machinesData = await DatabaseService.getMachines();
      setMachines(machinesData);
    } catch (error) {
      console.error('Error loading machines:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMachines();
    setRefreshing(false);
  };

  const handleAddMachine = () => {
    Alert.alert('Add Machine', 'This feature would open a form to add a new machine');
  };

  const handleEditMachine = (machine: Machine) => {
    Alert.alert('Edit Machine', `Edit ${machine.nama_mesin}`);
  };

  const handleManageChecklist = (machine: Machine) => {
    Alert.alert('Manage Checklist', `Manage checklist for ${machine.nama_mesin}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading machines...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Machines</Text>
        <Text style={styles.headerSubtitle}>
          {machines.length} machine{machines.length !== 1 ? 's' : ''} registered
        </Text>
      </View>

      {user?.role === 'supervisor' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddMachine}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Machine</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.machinesList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {machines.map((machine) => (
          <View key={machine.id} style={styles.machineCard}>
            <View style={styles.machineHeader}>
              <View style={styles.machineIcon}>
                <Monitor size={24} color="#2563EB" />
              </View>
              <View style={styles.machineInfo}>
                <Text style={styles.machineName}>{machine.nama_mesin}</Text>
                <View style={styles.locationRow}>
                  <MapPin size={16} color="#6B7280" />
                  <Text style={styles.machineLocation}>{machine.lokasi}</Text>
                </View>
                <View style={styles.barcodeRow}>
                  <QrCode size={16} color="#6B7280" />
                  <Text style={styles.machineBarcode}>{machine.kode_barcode}</Text>
                </View>
              </View>
            </View>

            {user?.role === 'supervisor' && (
              <View style={styles.machineActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditMachine(machine)}
                >
                  <Edit3 size={16} color="#2563EB" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.manageButton]}
                  onPress={() => handleManageChecklist(machine)}
                >
                  <Settings size={16} color="#16A34A" />
                  <Text style={styles.manageButtonText}>Checklist</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Machine Statistics */}
            <View style={styles.machineStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>24</Text>
                <Text style={styles.statLabel}>Total Checks</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>3</Text>
                <Text style={styles.statLabel}>Issues Found</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#16A34A' }]}>5</Text>
                <Text style={styles.statLabel}>Days Clean</Text>
              </View>
            </View>
          </View>
        ))}
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  machinesList: {
    flex: 1,
    padding: 20,
  },
  machineCard: {
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
  machineHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  machineIcon: {
    backgroundColor: '#EBF4FF',
    borderRadius: 50,
    padding: 12,
    marginRight: 16,
  },
  machineInfo: {
    flex: 1,
  },
  machineName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  machineLocation: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 6,
  },
  barcodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  machineBarcode: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  machineActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  editButton: {
    borderColor: '#2563EB',
    backgroundColor: '#EBF4FF',
  },
  editButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  manageButton: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  manageButtonText: {
    color: '#16A34A',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  machineStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
});