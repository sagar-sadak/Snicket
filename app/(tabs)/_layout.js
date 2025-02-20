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
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="weather"
        options={{
          title: 'Weather',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'cloud-sharp' : 'cloud-outline'} color={color} size={24}/>
          ),
        }}
      />
      <Tabs.Screen
        name="TodoScreen"
        options={{
          title: 'To Do',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'today-sharp' : 'today-outline'} color={color} size={24}/>
          ),
        }}
      />
      <Tabs.Screen
        name="CurrencyExchangeScreen"
        options={{
          title: 'Forex',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'card-sharp' : 'card-outline'} color={color} size={24}/>
          ),
        }}
      />
    </Tabs>
  );
}