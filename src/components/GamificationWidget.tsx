import { motion } from "framer-motion";
import { Trophy, Flame, Target, Star, Award, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useStreaks } from "@/hooks/useStreaks";
import { useBadges } from "@/hooks/useBadges";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const badgeIcons: Record<string, React.ReactNode> = {
  "🔥": <Flame className="w-6 h-6" />,
  "⭐": <Star className="w-6 h-6" />,
  "🏆": <Trophy className="w-6 h-6" />,
  "👑": <Crown className="w-6 h-6" />,
  "🎯": <Target className="w-6 h-6" />,
};

const GamificationWidget = () => {
  const { streak, checkIn, isCheckedInToday, loading: streakLoading } = useStreaks();
  const { earnedBadges, allBadges, checkAndAwardBadges, loading: badgesLoading } = useBadges();

  const handleCheckIn = async () => {
    if (isCheckedInToday) {
      toast.info("You've already checked in today!");
      return;
    }

    await checkIn();
    const newBadges = await checkAndAwardBadges();
    
    if (newBadges.length > 0) {
      newBadges.forEach(badge => {
        toast.success(`🎉 New badge earned: ${badge.name}!`);
      });
    } else {
      toast.success("Daily check-in complete! 🔥");
    }
  };

  if (streakLoading || badgesLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Streak Card */}
      <Card className="p-5 gradient-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">Daily Streak</h3>
            <p className="text-sm text-muted-foreground">Keep it going!</p>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-8 h-8 text-orange-500" />
            <span className="text-3xl font-bold text-foreground">{streak?.current_streak || 0}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-semibold text-foreground">{streak?.longest_streak || 0}</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-semibold text-foreground">{streak?.total_check_ins || 0}</p>
            <p className="text-xs text-muted-foreground">Total Days</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-semibold text-foreground">{earnedBadges.length}</p>
            <p className="text-xs text-muted-foreground">Badges</p>
          </div>
        </div>

        <Button 
          onClick={handleCheckIn} 
          className="w-full"
          variant={isCheckedInToday ? "outline" : "default"}
        >
          {isCheckedInToday ? "✓ Checked in today" : "Check in for today"}
        </Button>
      </Card>

      {/* Badges */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Your Badges</h3>
        </div>

        {earnedBadges.length > 0 ? (
          <div className="grid grid-cols-4 gap-3">
            {earnedBadges.map((userBadge) => (
              <motion.div
                key={userBadge.id}
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-primary-foreground">
                  {badgeIcons[userBadge.badge?.icon || "🏆"] || <Trophy className="w-6 h-6" />}
                </div>
                <span className="text-xs text-muted-foreground mt-1 text-center">
                  {userBadge.badge?.name}
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Trophy className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Check in daily to earn badges!</p>
          </div>
        )}

        {/* Locked badges preview */}
        {allBadges.length > earnedBadges.length && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              {allBadges.length - earnedBadges.length} more badges to unlock
            </p>
            <div className="flex gap-2 overflow-x-auto">
              {allBadges
                .filter(badge => !earnedBadges.some(eb => eb.badge?.id === badge.id))
                .slice(0, 4)
                .map((badge) => (
                  <div
                    key={badge.id}
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground opacity-50 flex-shrink-0"
                  >
                    {badgeIcons[badge.icon] || <Trophy className="w-5 h-5" />}
                  </div>
                ))}
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default GamificationWidget;
