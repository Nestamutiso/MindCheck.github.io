import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Moon, Sun, User, Bell, Crown, Shield, LogOut, ChevronRight, 
  Palette, Smartphone, HelpCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EnhancedSettingsViewProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
}

const themeColors = [
  { name: "Purple", primary: "252 100% 68%", accent: "280 100% 70%" },
  { name: "Blue", primary: "210 100% 50%", accent: "200 100% 60%" },
  { name: "Green", primary: "142 70% 45%", accent: "160 70% 50%" },
  { name: "Rose", primary: "350 80% 60%", accent: "330 80% 65%" },
  { name: "Orange", primary: "25 100% 50%", accent: "35 100% 55%" },
];

const EnhancedSettingsView = ({ isDarkMode, onToggleDarkMode, onLogout }: EnhancedSettingsViewProps) => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { isPremium, subscription, restorePurchases } = useSubscription();
  const [notifications, setNotifications] = useState({
    dailyCheckin: true,
    weeklySummary: true
  });
  const [selectedTheme, setSelectedTheme] = useState(0);

  useEffect(() => {
    if (profile?.notification_preferences) {
      const prefs = profile.notification_preferences as { daily_checkin?: boolean; weekly_summary?: boolean };
      setNotifications({
        dailyCheckin: prefs.daily_checkin ?? true,
        weeklySummary: prefs.weekly_summary ?? true
      });
    }
  }, [profile]);

  const updateNotificationPref = async (key: string, value: boolean) => {
    if (!user) return;

    const newPrefs = {
      ...notifications,
      [key === 'daily_checkin' ? 'dailyCheckin' : 'weeklySummary']: value
    };
    setNotifications(newPrefs);

    try {
      await supabase
        .from('profiles')
        .update({
          notification_preferences: {
            daily_checkin: key === 'daily_checkin' ? value : notifications.dailyCheckin,
            weekly_summary: key === 'weekly_summary' ? value : notifications.weeklySummary
          }
        })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const handleThemeChange = (index: number) => {
    if (!isPremium) {
      navigate('/premium');
      return;
    }
    setSelectedTheme(index);
    const theme = themeColors[index];
    document.documentElement.style.setProperty('--primary', theme.primary);
    toast.success(`Theme changed to ${theme.name}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full overflow-auto pb-8"
    >
      <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

      {/* Profile */}
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">
              {profile?.display_name || user?.email?.split("@")[0] || "User"}
            </h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          {isPremium && (
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full">
              <Crown className="w-4 h-4" />
              <span className="text-xs font-medium">Pro</span>
            </div>
          )}
        </div>
      </Card>

      {/* Subscription */}
      <Card className="p-4 mb-4">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => navigate('/premium')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">
                {isPremium ? "Pro Subscription" : "Upgrade to Pro"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isPremium 
                  ? subscription?.current_period_end 
                    ? `Renews ${new Date(subscription.current_period_end).toLocaleDateString()}`
                    : "Active"
                  : "Unlock all features"}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
        
        {!isPremium && (
          <Button className="w-full mt-4" onClick={() => navigate('/premium')}>
            Start Free Trial
          </Button>
        )}

        {isPremium && (
          <button 
            onClick={restorePurchases}
            className="w-full text-center text-sm text-primary mt-3"
          >
            Restore Purchases
          </button>
        )}
      </Card>

      {/* Appearance */}
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-6">
        Appearance
      </h2>
      <Card className="divide-y divide-border">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDarkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
            <span className="text-foreground">Dark Mode</span>
          </div>
          <Switch checked={isDarkMode} onCheckedChange={onToggleDarkMode} />
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Palette className="w-5 h-5 text-primary" />
            <span className="text-foreground">Theme Color</span>
            {!isPremium && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Pro</span>
            )}
          </div>
          <div className="flex gap-3">
            {themeColors.map((theme, index) => (
              <button
                key={theme.name}
                onClick={() => handleThemeChange(index)}
                className={`w-8 h-8 rounded-full transition-transform ${
                  selectedTheme === index ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                }`}
                style={{ backgroundColor: `hsl(${theme.primary})` }}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-6">
        Notifications
      </h2>
      <Card className="divide-y divide-border">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <div>
              <span className="text-foreground">Daily Check-in</span>
              <p className="text-xs text-muted-foreground">Remind me to check in</p>
            </div>
          </div>
          <Switch 
            checked={notifications.dailyCheckin} 
            onCheckedChange={(v) => updateNotificationPref('daily_checkin', v)} 
          />
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <div>
              <span className="text-foreground">Weekly Summary</span>
              <p className="text-xs text-muted-foreground">Weekly mood insights</p>
            </div>
          </div>
          <Switch 
            checked={notifications.weeklySummary} 
            onCheckedChange={(v) => updateNotificationPref('weekly_summary', v)} 
          />
        </div>
      </Card>

      {/* Support */}
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-6">
        Support
      </h2>
      <Card className="divide-y divide-border">
        <div className="p-4 flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-primary" />
            <span className="text-foreground">Help & FAQ</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="p-4 flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-foreground">Privacy Policy</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </Card>

      {/* Logout */}
      <Button 
        variant="outline" 
        onClick={onLogout}
        className="w-full mt-6 text-destructive hover:text-destructive"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Log Out
      </Button>

      <p className="text-center text-xs text-muted-foreground mt-4">
        MindCheck Pro v1.0.0
      </p>
    </motion.div>
  );
};

export default EnhancedSettingsView;
