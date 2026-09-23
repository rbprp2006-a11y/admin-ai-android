import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.adminai.app',
  appName: 'ADMIN AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true // Permits local-network HTTP access e.g. http://192.168.1.100:8000
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    backgroundColor: '#0f172a'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      backgroundColor: '#0f172a',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
