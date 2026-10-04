/**
 * Navigation Hierarchy (AppNavigator.js)
 * Defines:
 * - AuthStack (LoginScreen, RegisterScreen)
 * - MainStack (TodoListScreen, AddEditTodoScreen) with in-header Logout button
 * - AppNavigator root switcher conditionally returning AuthStack or MainStack based on token presence
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TodoListScreen from '../screens/TodoListScreen';
import AddEditTodoScreen from '../screens/AddEditTodoScreen';
import LoadingIndicator from '../components/LoadingIndicator';

const Stack = createNativeStackNavigator();

/**
 * Authentication Navigation Stack (Logged Out)
 */
export const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

/**
 * Main Application Navigation Stack (Logged In)
 */
export const MainStack = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to log out of TaskFlow?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  return (
    <Stack.Navigator
      initialRouteName="TodoList"
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="TodoList"
        component={TodoListScreen}
        options={{
          title: 'TaskFlow',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={18} color={COLORS.white} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="AddEditTodo"
        component={AddEditTodoScreen}
        options={{
          title: 'Task Details',
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * Root Navigator: Switches between AuthStack and MainStack based on user token state
 */
const AppNavigator = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return <LoadingIndicator message="Initializing session..." />;
  }

  return token ? <MainStack /> : <AuthStack />;
};

const styles = StyleSheet.create({
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  logoutText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 13,
  },
});

export default AppNavigator;
