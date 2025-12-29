import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from '@capacitor/core';

interface Subscription {
  id: string;
  user_id: string;
  tier: 'free' | 'premium';
  status: 'trial' | 'active' | 'cancelled' | 'expired';
  trial_ends_at: string | null;
  trial_started_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  isPremium: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
  purchaseSubscription: (packageId: string) => Promise<boolean>;
  restorePurchases: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const PRODUCTS = {
  MONTHLY: '$rc_monthly',
  YEARLY: '$rc_annual'
} as const;

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setSubscription(data as Subscription);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const isTrialActive = useCallback(() => {
    if (!subscription) return false;
    if (subscription.status !== 'trial') return false;
    if (!subscription.trial_ends_at) return false;
    return new Date(subscription.trial_ends_at) > new Date();
  }, [subscription]);

  const trialDaysRemaining = useCallback(() => {
    if (!subscription?.trial_ends_at) return 0;
    const diff = new Date(subscription.trial_ends_at).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [subscription]);

  const isPremium = useCallback(() => {
    if (!subscription) return false;
    if (subscription.tier === 'premium' && subscription.status === 'active') return true;
    return isTrialActive();
  }, [subscription, isTrialActive]);

  const updateSubscriptionAfterPurchase = async (packageIdentifier: string) => {
    if (!user) return;

    const now = new Date();
    const periodEnd = packageIdentifier === PRODUCTS.YEARLY 
      ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await supabase
      .from('subscriptions')
      .update({
        tier: 'premium',
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString()
      })
      .eq('user_id', user.id);
  };

  const purchaseSubscription = async (packageIdentifier: string): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      console.log('In-app purchases are only available on native platforms');
      return false;
    }

    try {
      const { CapacitorPurchases } = await import('@capgo/capacitor-purchases');
      
      const { offerings } = await CapacitorPurchases.getOfferings();
      const currentOffering = offerings.current;
      
      if (!currentOffering) {
        console.error('No offerings available');
        return false;
      }
      
      const pkg = currentOffering.availablePackages.find(p => p.identifier === packageIdentifier);
      
      if (!pkg) {
        console.error('Package not found:', packageIdentifier);
        return false;
      }
      
      const { customerInfo } = await CapacitorPurchases.purchasePackage({
        identifier: pkg.identifier,
        offeringIdentifier: currentOffering.identifier
      });
      
      if (customerInfo?.entitlements?.active?.['premium']) {
        await updateSubscriptionAfterPurchase(packageIdentifier);
        await fetchSubscription();
        return true;
      }
      
      return false;
    } catch (err: unknown) {
      console.error('Purchase error:', err);
      return false;
    }
  };

  const restorePurchases = async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const { CapacitorPurchases } = await import('@capgo/capacitor-purchases');
      const { customerInfo } = await CapacitorPurchases.restorePurchases();
      
      if (customerInfo?.entitlements?.active?.['premium']) {
        if (user) {
          await supabase
            .from('subscriptions')
            .update({
              tier: 'premium',
              status: 'active'
            })
            .eq('user_id', user.id);
        }
        await fetchSubscription();
      }
    } catch (err) {
      console.error('Restore purchases error:', err);
    }
  };

  return (
    <SubscriptionContext.Provider 
      value={{ 
        subscription, 
        isPremium: isPremium(), 
        isTrialActive: isTrialActive(), 
        trialDaysRemaining: trialDaysRemaining(),
        loading,
        refreshSubscription: fetchSubscription,
        purchaseSubscription,
        restorePurchases
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};

export { PRODUCTS };
