import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
  purchaseSubscription: (productId: string) => Promise<boolean>;
  restorePurchases: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const PRODUCTS = {
  MONTHLY: 'mindcheck_premium_monthly',
  YEARLY: 'mindcheck_premium_yearly'
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

  const updateSubscriptionAfterPurchase = async (productId: string) => {
    if (!user) return;

    const now = new Date();
    const periodEnd = productId === PRODUCTS.YEARLY 
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

  const purchaseSubscription = async (productId: string): Promise<boolean> => {
    // Google Play Billing integration placeholder
    // This will be implemented when the app is running on native Android
    // For now, we show that in-app purchases require native platform
    console.log('Purchase requested for:', productId);
    console.log('In-app purchases require Google Play Billing on native Android');
    
    // For testing/demo purposes, simulate a successful purchase
    if (import.meta.env.DEV) {
      await updateSubscriptionAfterPurchase(productId);
      await fetchSubscription();
      return true;
    }
    
    return false;
  };

  const restorePurchases = async () => {
    // Google Play Billing restore purchases placeholder
    console.log('Restore purchases requested');
    console.log('This will work with Google Play Billing on native Android');
    await fetchSubscription();
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
