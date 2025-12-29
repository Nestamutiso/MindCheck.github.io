import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useStreaks } from './useStreaks';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
}

interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export const useBadges = () => {
  const { user } = useAuth();
  const { streak } = useStreaks();
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBadges = useCallback(async () => {
    try {
      const { data: badges } = await supabase
        .from('badges')
        .select('*');
      
      if (badges) {
        setAllBadges(badges as Badge[]);
      }
    } catch {
      // Error fetching badges
    }
  }, []);

  const fetchEarnedBadges = useCallback(async () => {
    if (!user) {
      setEarnedBadges([]);
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id);
      
      if (data) {
        setEarnedBadges(data as UserBadge[]);
      }
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBadges();
    fetchEarnedBadges();
  }, [fetchBadges, fetchEarnedBadges]);

  const checkAndAwardBadges = useCallback(async () => {
    if (!user || !streak) return [];

    const newBadges: Badge[] = [];
    const earnedBadgeIds = earnedBadges.map(b => b.badge_id);

    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge.id)) continue;

      let earned = false;

      switch (badge.requirement_type) {
        case 'streak':
          earned = streak.current_streak >= badge.requirement_value;
          break;
        case 'total_check_ins':
          earned = streak.total_check_ins >= badge.requirement_value;
          break;
        case 'longest_streak':
          earned = streak.longest_streak >= badge.requirement_value;
          break;
      }

      if (earned) {
        try {
          await supabase
            .from('user_badges')
            .insert({ user_id: user.id, badge_id: badge.id });
          
          newBadges.push(badge);
        } catch {
          // Already earned or error
        }
      }
    }

    if (newBadges.length > 0) {
      await fetchEarnedBadges();
    }

    return newBadges;
  }, [user, streak, allBadges, earnedBadges, fetchEarnedBadges]);

  const getEarnedBadgeDetails = useCallback(() => {
    return earnedBadges.map(eb => ({
      ...eb,
      badge: allBadges.find(b => b.id === eb.badge_id)
    })).filter(eb => eb.badge);
  }, [earnedBadges, allBadges]);

  return {
    allBadges,
    earnedBadges: getEarnedBadgeDetails(),
    checkAndAwardBadges,
    loading
  };
};
