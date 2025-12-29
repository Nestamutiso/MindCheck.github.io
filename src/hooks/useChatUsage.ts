import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

const FREE_DAILY_LIMIT = 10;

export const useChatUsage = () => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    if (!user) {
      setMessageCount(0);
      setLoading(false);
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_chat_usage')
        .select('message_count')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (!error && data) {
        setMessageCount(data.message_count);
      } else {
        setMessageCount(0);
      }
    } catch {
      setMessageCount(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const incrementUsage = useCallback(async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      // Try to update existing record
      const { data: existing } = await supabase
        .from('daily_chat_usage')
        .select('id, message_count')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (existing) {
        await supabase
          .from('daily_chat_usage')
          .update({ message_count: existing.message_count + 1 })
          .eq('id', existing.id);
        
        setMessageCount(existing.message_count + 1);
      } else {
        await supabase
          .from('daily_chat_usage')
          .insert({ user_id: user.id, date: today, message_count: 1 });
        
        setMessageCount(1);
      }
    } catch (err) {
      console.error('Error tracking usage:', err);
    }
  }, [user]);

  const canSendMessage = isPremium || messageCount < FREE_DAILY_LIMIT;
  const messagesRemaining = isPremium ? Infinity : Math.max(0, FREE_DAILY_LIMIT - messageCount);

  return {
    messageCount,
    canSendMessage,
    messagesRemaining,
    incrementUsage,
    loading,
    FREE_DAILY_LIMIT
  };
};
