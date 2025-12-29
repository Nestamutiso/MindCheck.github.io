import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_check_in: string | null;
  total_check_ins: number;
}

export const useStreaks = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    if (!user) {
      setStreak(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setStreak(data as UserStreak);
      }
    } catch {
      // No streak yet
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  const checkIn = useCallback(async () => {
    if (!user || !streak) return;

    const today = new Date().toISOString().split('T')[0];
    const lastCheckIn = streak.last_check_in;

    // Already checked in today
    if (lastCheckIn === today) return streak;

    let newCurrentStreak = streak.current_streak;
    
    if (lastCheckIn) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastCheckIn === yesterdayStr) {
        // Continuing streak
        newCurrentStreak += 1;
      } else {
        // Streak broken
        newCurrentStreak = 1;
      }
    } else {
      newCurrentStreak = 1;
    }

    const newLongestStreak = Math.max(streak.longest_streak, newCurrentStreak);

    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .update({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_check_in: today,
          total_check_ins: streak.total_check_ins + 1
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (!error && data) {
        setStreak(data as UserStreak);
        return data;
      }
    } catch (err) {
      console.error('Check-in error:', err);
    }

    return streak;
  }, [user, streak]);

  const isCheckedInToday = streak?.last_check_in === new Date().toISOString().split('T')[0];

  return {
    streak,
    checkIn,
    isCheckedInToday,
    loading
  };
};
