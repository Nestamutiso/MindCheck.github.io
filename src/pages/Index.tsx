import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import ChatView from "@/components/ChatView";
import InsightsView from "@/components/InsightsView";
import SettingsView from "@/components/SettingsView";
import BreathingView from "@/components/BreathingView";
import ProfessionalHelpView from "@/components/ProfessionalHelpView";
import ForumsView from "@/components/ForumsView";
import BottomNav from "@/components/BottomNav";
import MusicPlayer from "@/components/MusicPlayer";
import { Loader2 } from "lucide-react";

type View = "home" | "breathing" | "forums" | "help" | "settings";

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();
  const [activeView, setActiveView] = useState<View>("home");
  const [moods, setMoods] = useState<Array<"good" | "heavy" | null>>([null, null, null, null, null, null, null]);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleMoodDetected = (mood: "good" | "heavy") => {
    setMoods((prev) => {
      const newMoods = [...prev];
      const today = new Date().getDay();
      const adjustedDay = today === 0 ? 6 : today - 1;
      newMoods[adjustedDay] = mood;
      return newMoods;
    });
  };

  const handleCrisis = () => {
    setShowCrisisAlert(true);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userName = profile?.display_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Friend";

  return (
    <div className="min-h-screen">
      <div className="h-screen flex flex-col">
        <main className="flex-1 overflow-hidden px-5 pb-24">
          <AnimatePresence mode="wait">
            {activeView === "home" && (
              <ChatView
                key="chat"
                userName={userName}
                onMoodDetected={handleMoodDetected}
                onCrisis={handleCrisis}
              />
            )}
            {activeView === "breathing" && <BreathingView key="breathing" />}
            {activeView === "forums" && <ForumsView key="forums" />}
            {activeView === "help" && <ProfessionalHelpView key="help" />}
            {activeView === "settings" && (
              <SettingsView
                key="settings"
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
                onLogout={handleLogout}
              />
            )}
          </AnimatePresence>
        </main>
        <BottomNav activeView={activeView} onNavigate={setActiveView} />
        <MusicPlayer />
      </div>
    </div>
  );
};

export default Index;
