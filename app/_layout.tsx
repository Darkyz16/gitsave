import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import React from 'react';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(protected)" />
      </Stack>
    </AuthProvider>
  );
}
