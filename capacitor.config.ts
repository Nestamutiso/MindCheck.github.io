import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nesta.mindcheck',
  appName: 'MindCheck',
  webDir: 'dist',
  server: {
    url: 'https://cfd02d2c-7b91-4ca7-aa03-b6c6bfcfb6dc.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#7C3AED'
    },
    AdMob: {
      appId: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX',
      bannerOptions: {
        isTesting: true
      }
    }
  }
};

export default config;
