import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Users, User, Shield, Plus, CreditCard as Edit3, Activity, Calendar } from 'lucide-react-native';

export default function UsersScreen() {
  const { user } = useAuth();

  // Mock user data - in real app, this would come from database
  const [users] = useState([
    {
      id: 1,
      nama_lengkap: 'John Operator',
      username: 'operator1',
      role: 'operator' as const,
      last_active: '2024-01-15T10:30:00Z',
      reports_count: 45,
      status: 'active'
    },
    {
      id: 2,
      nama_lengkap: 'Jane Supervisor',
      username: 'supervisor1',
      role: 'supervisor' as const,
      last_active: '2024-01-15T09:15:00Z',
      reports_count: 120,
      status: 'active'
    },
    {
      id: 3,
      nama_lengkap: 'Mike Worker',
      username: 'operator2',
      role: 'operator' as const,
      last_active: '2024-01-14T16:45:00Z',
      reports_count: 32,
      status: 'inactive'
    }
  ]);

  const handleAddUser = () => {
    Alert.alert('Add User', 'This feature would open a form to add a new user');
  };

  const handleEditUser = (userData: any) => {
    Alert.alert('Edit User', `Edit user: ${userData.nama_lengkap}`);
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    return `${diffDays - 1} days ago`;
  };

  const getRoleColor = (role: string) => {
    return role === 'supervisor' ? '#2563EB' : '#16A34A';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? '#16A34A' : '#6B7280';
  };

  if (user?.role !== 'supervisor') {
    return (
      <View style={styles.container}>
        <View style={styles.accessDenied}>
          <Shield size={64} color="#DC2626" />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            Only supervisors can manage users
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Management</Text>
        <Text style={styles.headerSubtitle}>
          {users.length} user{users.length !== 1 ? 's' : ''} registered
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddUser}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add User</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsCards}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Users size={24} color="#2563EB" />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statValue}>{users.filter(u => u.role === 'operator').length}</Text>
            <Text style={styles.statLabel}>Operators</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Shield size={24} color="#7C3AED" />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statValue}>{users.filter(u => u.role === 'supervisor').length}</Text>
            <Text style={styles.statLabel}>Supervisors</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Activity size={24} color="#16A34A" />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statValue}>{users.filter(u => u.status === 'active').length}</Text>
            <Text style={styles.statLabel}>Active Users</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.usersList} showsVerticalScrollIndicator={false}>
        {users.map((userData) => (
          <View key={userData.id} style={styles.userCard}>
            <View style={styles.userHeader}>
              <View style={styles.userAvatar}>
                <User size={24} color="#6B7280" />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userData.nama_lengkap}</Text>
                <Text style={styles.userUsername}>@{userData.username}</Text>
                <View style={styles.userMeta}>
                  <View style={styles.lastActiveRow}>
                    <Calendar size={12} color="#6B7280" />
                    <Text style={styles.lastActiveText}>
                      {formatLastActive(userData.last_active)}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.userBadges}>
                <View 
                  style={[
                    styles.roleBadge,
                    { backgroundColor: getRoleColor(userData.role) + '20' }
                  ]}
                >
                  <Text 
                    style={[
                      styles.roleText,
                      { color: getRoleColor(userData.role) }
                    ]}
                  >
                    {userData.role}
                  </Text>
                </View>
                <View 
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(userData.status) + '20' }
                  ]}
                >
                  <Text 
                    style={[
                      styles.statusText,
                      { color: getStatusColor(userData.status) }
                    ]}
                  >
                    {userData.status}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.userStats}>
              <View style={styles.userStatItem}>
                <Text style={styles.userStatValue}>{userData.reports_count}</Text>
                <Text style={styles.userStatLabel}>Reports</Text>
              </View>
            </View>

            <View style={styles.userActions}>
              <TouchableOpacity
                style={styles.editUserButton}
                onPress={() => handleEditUser(userData)}
              >
                <Edit3 size={16} color="#2563EB" />
                <Text style={styles.editUserButtonText}>Edit User</Text>
              </TouchableOpacity>
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
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
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
  statsCards: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
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
    marginTop: 2,
  },
  usersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userCard: {
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
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userAvatar: {
    backgroundColor: '#F3F4F6',
    borderRadius: 50,
    padding: 12,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastActiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lastActiveText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  userBadges: {
    alignItems: 'flex-end',
    gap: 6,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  userStatItem: {
    alignItems: 'center',
  },
  userStatValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  userStatLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  userActions: {
    paddingTop: 12,
  },
  editUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF4FF',
    borderRadius: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#2563EB',
    gap: 6,
  },
  editUserButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});