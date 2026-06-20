// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { useApp } from '../_layout';
import { MaterialIcons, FontAwesome6 } from '@expo/vector-icons';

export default function TabsLayout() {
  const { isDarkMode } = useApp();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDarkMode ? '#38BDF8' : '#1A73E8', 
        tabBarInactiveTintColor: isDarkMode ? '#64748B' : '#94A3B8', 
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', 
          borderTopColor: isDarkMode ? '#334155' : '#E2E8F0',
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontWeight: '700',
          fontSize: 10.5,
          marginTop: 2,
        },
        headerStyle: { 
          backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: isDarkMode ? '#334155' : '#E2E8F0',
        },
        headerTitleStyle: { 
          fontWeight: '800',
          color: isDarkMode ? '#F8FAFC' : '#1E293B',
          fontSize: 18,
          letterSpacing: -0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'VeloFeed',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="assignment" size={size ? size : 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="swipe"
        options={{
          title: 'Daily Summary Dispatches',
          tabBarLabel: 'Headlines',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="flash-on" size={size ? size : 22} color={color} />
          ),
          headerShown: false,
        }}
      />
      
      <Tabs.Screen
        name="market"
        options={{
          title: 'Market Indices',
          tabBarLabel: 'Markets',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="trending-up" size={size ? size : 22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
          name="explore"
          options={{
          title: 'Live News',
          tabBarLabel: 'Live',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="analytics" size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Settings ',
          tabBarLabel: 'Preferences',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="tune" size={size ? size : 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}