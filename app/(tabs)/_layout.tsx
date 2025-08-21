import { Tabs, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Chrome as Home, ChartBar as BarChart3, Settings, User, QrCode, Users, Monitor } from 'lucide-react-native';
import { TouchableOpacity, Alert } from 'react-native';
import { useEffect } from 'react';
import DatabaseService from '../../services/DatabaseService';

export default function TabLayout() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    
    // Initialize mock data
    DatabaseService.initializeMockData();
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: logout 
        }
      ]
    );
  };

  if (!user) return null;

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2563EB',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontFamily: 'Inter-SemiBold',
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: {
          fontFamily: 'Inter-Regular',
          fontSize: 12,
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={handleLogout}
            style={{ marginRight: 16 }}
          >
            <User size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ),
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scan QR',
          tabBarIcon: ({ size, color }) => (
            <QrCode size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ size, color }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />

      {user.role === 'supervisor' && (
        <>
          <Tabs.Screen
            name="machines"
            options={{
              title: 'Machines',
              tabBarIcon: ({ size, color }) => (
                <Monitor size={size} color={color} />
              ),
            }}
          />
          
          <Tabs.Screen
            name="users"
            options={{
              title: 'Users',
              tabBarIcon: ({ size, color }) => (
                <Users size={size} color={color} />
              ),
            }}
          />
        </>
      )}

      {user.role === 'operator' && (
        <Tabs.Screen
          name="machines"
          options={{
            href: null,
          }}
        />
      )}

      {user.role === 'operator' && (
        <Tabs.Screen
          name="users"
          options={{
            href: null,
          }}
        />
      )}
    </Tabs>
  );
}