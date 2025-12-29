import { useEffect, useCallback, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useSubscription } from '@/contexts/SubscriptionContext';

// AdMob Unit IDs (replace with your actual IDs in production)
const AD_UNITS = {
  BANNER_HOME: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  BANNER_CONTENT: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  INTERSTITIAL: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
} as const;

export const useAdMob = () => {
  const { isPremium } = useSubscription();
  const [isInitialized, setIsInitialized] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

  const initializeAdMob = useCallback(async () => {
    if (!Capacitor.isNativePlatform() || isPremium) return;

    try {
      const { AdMob } = await import('@capacitor-community/admob');
      
      await AdMob.initialize({
        testingDevices: ['DEVICE_ID'], // Add test device IDs
        initializeForTesting: true // Set to false in production
      });
      
      setIsInitialized(true);
    } catch (err) {
      console.error('AdMob initialization error:', err);
    }
  }, [isPremium]);

  useEffect(() => {
    initializeAdMob();
  }, [initializeAdMob]);

  const showBanner = useCallback(async (position: 'top' | 'bottom' = 'bottom') => {
    if (!Capacitor.isNativePlatform() || isPremium || !isInitialized) return;

    try {
      const { AdMob, BannerAdSize, BannerAdPosition } = await import('@capacitor-community/admob');
      
      await AdMob.showBanner({
        adId: AD_UNITS.BANNER_HOME,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: position === 'top' ? BannerAdPosition.TOP_CENTER : BannerAdPosition.BOTTOM_CENTER,
        margin: position === 'bottom' ? 80 : 0, // Leave space for bottom nav
        isTesting: true
      });
      
      setBannerVisible(true);
    } catch (err) {
      console.error('Show banner error:', err);
    }
  }, [isPremium, isInitialized]);

  const hideBanner = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.removeBanner();
      setBannerVisible(false);
    } catch (err) {
      console.error('Hide banner error:', err);
    }
  }, []);

  const showInterstitial = useCallback(async () => {
    if (!Capacitor.isNativePlatform() || isPremium || !isInitialized) return;

    try {
      const { AdMob } = await import('@capacitor-community/admob');
      
      await AdMob.prepareInterstitial({
        adId: AD_UNITS.INTERSTITIAL,
        isTesting: true
      });
      
      await AdMob.showInterstitial();
    } catch (err) {
      console.error('Interstitial error:', err);
    }
  }, [isPremium, isInitialized]);

  return {
    isInitialized,
    bannerVisible,
    showBanner,
    hideBanner,
    showInterstitial,
    shouldShowAds: !isPremium && Capacitor.isNativePlatform()
  };
};
