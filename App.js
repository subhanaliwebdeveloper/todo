/**
 * Main Application Root (App.js)
 * Wraps root component hierarchy with:
 * - SafeAreaProvider (handling notch and screen edge insets)
 * - AuthProvider (managing user login, token, and persistence)
 * - NavigationContainer (React Navigation root)
 * - AppNavigator (dynamic stack switching)
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" backgroundColor="#4F46E5" />
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
