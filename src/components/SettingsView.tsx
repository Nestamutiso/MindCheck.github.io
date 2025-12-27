import { motion } from "framer-motion";
import { Moon, Sun, LogOut, Heart } from "lucide-react";

interface SettingsViewProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
}

const SettingsView = ({ isDarkMode, onToggleDarkMode, onLogout }: SettingsViewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full"
    >
      <header className="py-4">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground"
        >
          Settings
        </motion.h1>
        <p className="text-muted-foreground text-sm">Customize your experience</p>
      </header>

      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-5 shadow-soft"
        >
          <h3 className="font-semibold text-foreground mb-4">Appearance</h3>
          
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onToggleDarkMode}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Moon className="w-5 h-5 text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-primary" />
              )}
              <span className="text-foreground font-medium">
                {isDarkMode ? "Dark Mode" : "Light Mode"}
              </span>
            </div>
            <div
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                isDarkMode ? "bg-primary" : "bg-muted"
              }`}
            >
              <motion.div
                layout
                className={`w-5 h-5 rounded-full bg-primary-foreground shadow-sm ${
                  isDarkMode ? "ml-auto" : ""
                }`}
              />
            </div>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-5 shadow-soft"
        >
          <h3 className="font-semibold text-foreground mb-4">Account</h3>
          
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-destructive/10 hover:bg-destructive/20 transition-colors text-destructive"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-5 shadow-soft"
        >
          <h3 className="font-semibold text-foreground mb-2">About MindCheck</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Your supportive mental wellness companion. We're here to help you
            track your emotions and provide a safe space for your thoughts.
          </p>
          <div className="flex items-center gap-2 text-primary">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">Made with love</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SettingsView;
