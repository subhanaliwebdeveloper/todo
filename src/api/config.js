/**
 * API Configuration Module
 * Defines the backend REST API base URL.
 *
 * =========================================================================
 * HOW TO CONFIGURE YOUR BACKEND URL:
 * =========================================================================
 * 1. Android Emulator:
 *    Leave default -> 'http://10.0.2.2:5000/api'
 *
 * 2. iOS Simulator or Web:
 *    Leave default -> 'http://localhost:5000/api'
 *
 * 3. Physical Mobile Device (Expo Go via Wi-Fi):
 *    Set the PC's local Wi-Fi LAN IP address below (e.g. 'http://192.168.1.15:5000/api').
 *    (Find your IP by running `ipconfig` on Windows or `ifconfig` on macOS/Linux).
 * =========================================================================
 */

import { Platform } from 'react-native';

// Set this variable to your computer's LAN IP when testing on a physical phone:
// Example: const PHYSICAL_DEVICE_LAN_URL = 'http://192.168.1.50:5000/api';
const PHYSICAL_DEVICE_LAN_URL = '';

export const API_BASE_URL = PHYSICAL_DEVICE_LAN_URL || (
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api'     // Android emulator alias for host localhost
    : 'http://localhost:5000/api'    // iOS simulator / Web localhost
);

export const API_TIMEOUT = 10000; // 10 seconds timeout
