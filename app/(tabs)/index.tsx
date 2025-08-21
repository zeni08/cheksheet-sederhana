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
import { useRouter } from 'expo-router';
import DatabaseService from '../../services/DatabaseService';
import { DashboardStats } from '../../types/database';
import { ChartBar as BarChart3, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Users, QrCode, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    reportsToday: 0,
    notOkItems: 0,
    activeOperators: 0,
    topIssues: []
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const dashboardStats = await DatabaseService.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    onPress 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.statCard, onPress && styles.statCardClickable]}
      onPress={onPress}
      disabled={!onPress}
    >
      <LinearGradient
        colors={[color + '20', color + '10']}
        style={styles.statCardGradient}
      >
        <View style={styles.statCardContent}>
          <Icon size={24} color={color} />
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.nama_lengkap}</Text>
        <Text style={styles.roleText}>
          {user?.role === 'supervisor' ? 'Supervisor Dashboard' : 'Operator Dashboard'}
        </Text>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => router.push('/scanner')}
        >
          <LinearGradient
            colors={['#16A34A', '#15803D']}
            style={styles.quickActionGradient}
          >
            <QrCode size={32} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Start Checklist</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Total Reports"
          value={stats.totalReports}
          icon={BarChart3}
          color="#2563EB"
          onPress={() => router.push('/(tabs)/reports')}
        />
        <StatCard
          title="Today's Reports"
          value={stats.reportsToday}
          icon={CheckCircle}
          color="#16A34A"
        />
        <StatCard
          title="Issues Found"
          value={stats.notOkItems}
          icon={AlertTriangle}
          color="#DC2626"
        />
        {user?.role === 'supervisor' && (
          <StatCard
            title="Active Operators"
            value={stats.activeOperators}
            icon={Users}
            color="#7C3AED"
            onPress={() => router.push('/(tabs)/users')}
          />
        )}
      </View>

      {stats.topIssues.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={24} color="#2563EB" />
            <Text style={styles.sectionTitle}>Top Issues by Machine</Text>
          </View>
          <View style={styles.issuesList}>
            {stats.topIssues.map((issue, index) => (
              <View key={index} style={styles.issueItem}>
                <View style={styles.issueInfo}>
                  <Text style={styles.machineName}>{issue.machine}</Text>
                  <Text style={styles.issueCount}>{issue.issues} issues</Text>
                </View>
                <View style={styles.issueBar}>
                  <View 
                    style={[
                      styles.issueBarFill,
                      { 
                        width: `${Math.min((issue.issues / Math.max(...stats.topIssues.map(i => i.issues))) * 100, 100)}%` 
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.recentActivity}>
        <Text style={styles.sectionTitle}>Quick Tips</Text>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            💡 Scan machine barcodes to quickly access checklist forms
          </Text>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            📸 Take photos of any issues found for better documentation
          </Text>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            ✅ Complete all checklist items for accurate reporting
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  welcomeText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 4,
  },
  roleText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#2563EB',
    marginTop: 4,
  },
  quickActions: {
    padding: 20,
  },
  quickActionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    marginRight: '2%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statCardClickable: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCardGradient: {
    padding: 16,
  },
  statCardContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginVertical: 8,
  },
  statTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginLeft: 8,
  },
  issuesList: {
    gap: 12,
  },
  issueItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
  },
  issueInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  machineName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  issueCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#DC2626',
  },
  issueBar: {
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  issueBarFill: {
    height: '100%',
    backgroundColor: '#DC2626',
    borderRadius: 2,
  },
  recentActivity: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
  },
});