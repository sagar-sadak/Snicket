import { Stack } from 'expo-router/stack';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="user/[id]"
        options={{
          title: "User Profile",
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: "My Profile",
        }}
      />
    </Stack>
    
  );
}