import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import LoginScreen from "@/components/LoginScreen";
import ChatView from "@/components/ChatView";
import InsightsView from "@/components/InsightsView";
import SettingsView from "@/components/SettingsView";
import BottomNav from "@/components/BottomNav";

type View = "home" | "insights" | "settings";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [activeView, setActiveView] = useState<View>("home");
  const [moods, setMoods] = useState<Array<"good" | "heavy" | null>>([null, null, null, null, null, null, null]);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleLogin = (name: string) => {
    setUserName(name);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("");
    setActiveView("home");
    setMoods([null, null, null, null, null, null, null]);
    setShowCrisisAlert(false);
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

  return (
    <div className="min-h-screen">
      <AnimatePresence>
        {!isLoggedIn && <LoginScreen onLogin={handleLogin} />}
      </AnimatePresence>

      {isLoggedIn && (
        <div className="h-screen flex flex-col">
          <main className="flex-1 overflow-hidden px-5 pb-24">
            {activeView === "home" && (
              <ChatView
                userName={userName}
                onMoodDetected={handleMoodDetected}
                onCrisis={handleCrisis}
              />
            )}
            {activeView === "insights" && (
              <InsightsView moods={moods} showCrisisAlert={showCrisisAlert} />
            )}
            {activeView === "settings" && (
              <SettingsView
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
                onLogout={handleLogout}
              />
            )}
          </main>
          <BottomNav activeView={activeView} onNavigate={setActiveView} />
        </div>
      )}
    </div>
  );
};

export default Index;
