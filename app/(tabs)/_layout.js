import { Tabs } from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  return (
    <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#ffd33d',
          headerStyle: {
            backgroundColor: '#25292e',
          },
          headerShadowVisible: false,
          headerTintColor: '#fff',
          tabBarStyle: {
          backgroundColor: '#25292e',
          
          },
        }}
      >
      <Tabs.Screen
        name='home'
        options={{
          title: 'Explore',
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'book-sharp' : 'book-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name='community'
        options={{
          title: 'Community',
          tabBarLabel: 'Community',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'people-sharp' : 'people-outline'} color={color} size={24}/>
          ),
        }}
      />
      <Tabs.Screen
        name='EventsScreen'
        options={{
          title: 'Events',
          tabBarLabel: 'Events',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'easel-sharp' : 'easel-outline'} color={color} size={24}/>
          ),
        }}
      />
      
      
    </Tabs>
  );
}