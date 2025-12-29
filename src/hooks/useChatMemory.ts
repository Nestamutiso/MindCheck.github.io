import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface ChatMemory {
  id: string;
  user_id: string;
  summary: string;
  key_insights: string[];
  coping_strategies: string[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const useChatMemory = () => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [memory, setMemory] = useState<ChatMemory | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMemory = useCallback(async () => {
    if (!user || !isPremium) {
      setMemory(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('chat_memory')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setMemory(data as ChatMemory);
      }
    } catch {
      // No memory yet, that's ok
    } finally {
      setLoading(false);
    }
  }, [user, isPremium]);

  useEffect(() => {
    fetchMemory();
  }, [fetchMemory]);

  const addToHistory = useCallback((message: Message) => {
    setConversationHistory(prev => [...prev, message]);
  }, []);

  const getContextForAI = useCallback(() => {
    if (!isPremium || !memory) return '';
    
    let context = '';
    
    if (memory.summary) {
      context += `\n\nPrevious conversation context: ${memory.summary}`;
    }
    
    if (memory.key_insights && memory.key_insights.length > 0) {
      context += `\n\nKey insights about this user: ${memory.key_insights.join(', ')}`;
    }
    
    if (memory.coping_strategies && memory.coping_strategies.length > 0) {
      context += `\n\nCoping strategies that have helped this user: ${memory.coping_strategies.join(', ')}`;
    }
    
    return context;
  }, [isPremium, memory]);

  const updateMemory = useCallback(async (newSummary: string, insights: string[], strategies: string[]) => {
    if (!user || !isPremium) return;

    const existingInsights = memory?.key_insights || [];
    const existingStrategies = memory?.coping_strategies || [];

    const mergedInsights = [...new Set([...existingInsights, ...insights])].slice(-20);
    const mergedStrategies = [...new Set([...existingStrategies, ...strategies])].slice(-10);

    try {
      if (memory) {
        await supabase
          .from('chat_memory')
          .update({
            summary: newSummary,
            key_insights: mergedInsights,
            coping_strategies: mergedStrategies
          })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('chat_memory')
          .insert({
            user_id: user.id,
            summary: newSummary,
            key_insights: mergedInsights,
            coping_strategies: mergedStrategies
          });
      }

      await fetchMemory();
    } catch (err) {
      console.error('Error updating memory:', err);
    }
  }, [user, isPremium, memory, fetchMemory]);

  return {
    memory,
    conversationHistory,
    addToHistory,
    getContextForAI,
    updateMemory,
    loading
  };
};
