export const APP_CONFIG = {
  name: 'TRAScolis',
  description: 'Suivi de colis Chine-Cameroun',
  version: '1.0.0',
} as const;

export const COLORS = {
  primary: {
    blue: '#2563eb',
    yellow: '#eab308',
    lightBlue: '#dbeafe',
    lightYellow: '#fef3c7',
    darkBlue: '#1e40af',
    darkYellow: '#ca8a04',
  },
  neutral: {
    white: '#ffffff',
    black: '#000000',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    }
  }
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  TRACKING: '/tracking',
} as const;

export const API_ENDPOINTS = {
  PACKAGES: '/api/packages',
  AUTH: '/api/auth',
  TRACKING: '/api/tracking',
} as const;
