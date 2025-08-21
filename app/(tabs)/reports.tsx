import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import DatabaseService from '../../services/DatabaseService';
import { ChecklistReport, Machine, User } from '../../types/database';
import { Calendar, FileText, CircleCheck as CheckCircle, Circle as XCircle, Download, Filter, Clock } from 'lucide-react-native';

export default function ReportsScreen() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ChecklistReport[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reportsData, machinesData] = await Promise.all([
        user?.role === 'supervisor' 
          ? DatabaseService.getReports()
          : DatabaseService.getReports(user?.id),
        DatabaseService.getMachines()
      ]);

      setReports(reportsData);
      setMachines(machinesData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getMachineName = (machineId: number) => {
    return machines.find(m => m.id === machineId)?.nama_mesin || 'Unknown Machine';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return '#16A34A';
      case 'draft': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
        <View style={styles.headerStats}>
          <Text style={styles.statsText}>Total: {reports.length}</Text>
        </View>
      </View>

      {user?.role === 'supervisor' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#2563EB" />
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton}>
            <Download size={20} color="#16A34A" />
            <Text style={styles.exportButtonText}>Export</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.reportsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {reports.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Reports Found</Text>
            <Text style={styles.emptyDescription}>
              {user?.role === 'operator' 
                ? 'Start scanning machine barcodes to create reports'
                : 'No reports have been submitted yet'
              }
            </Text>
          </View>
        ) : (
          reports
            .sort((a, b) => new Date(b.tanggal_pengecekan).getTime() - new Date(a.tanggal_pengecekan).getTime())
            .map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportTitleSection}>
                    <Text style={styles.machineName}>
                      {getMachineName(report.id_mesin)}
                    </Text>
                    <View style={styles.reportMeta}>
                      <Clock size={14} color="#6B7280" />
                      <Text style={styles.reportDate}>
                        {formatDate(report.tanggal_pengecekan)}
                      </Text>
                    </View>
                  </View>
                  <View 
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(report.status) + '20' }
                    ]}
                  >
                    <Text 
                      style={[
                        styles.statusText,
                        { color: getStatusColor(report.status) }
                      ]}
                    >
                      {report.status || 'completed'}
                    </Text>
                  </View>
                </View>

                <View style={styles.reportStats}>
                  <View style={styles.statItem}>
                    <CheckCircle size={16} color="#16A34A" />
                    <Text style={styles.statText}>Items OK: 5</Text>
                  </View>
                  <View style={styles.statItem}>
                    <XCircle size={16} color="#DC2626" />
                    <Text style={styles.statText}>Issues: 1</Text>
                  </View>
                </View>

                {user?.role === 'supervisor' && (
                  <View style={styles.operatorInfo}>
                    <Text style={styles.operatorText}>
                      Operator ID: {report.id_operator}
                    </Text>
                  </View>
                )}
              </View>
            ))
        )}
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
    marginBottom: 8,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2563EB',
    gap: 6,
  },
  filterButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 6,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  reportsList: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#4B5563',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportTitleSection: {
    flex: 1,
  },
  machineName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  reportStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  operatorInfo: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  operatorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
});