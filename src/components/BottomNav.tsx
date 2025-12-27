import { motion } from "framer-motion";
import { Home, BarChart2, Settings } from "lucide-react";

type View = "home" | "insights" | "settings";

interface BottomNavProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

const BottomNav = ({ activeView, onNavigate }: BottomNavProps) => {
  const navItems: { id: View; icon: typeof Home; label: string }[] = [
    { id: "home", icon: Home, label: "Chat" },
    { id: "insights", icon: BarChart2, label: "Insights" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
      className="fixed bottom-0 left-0 right-0 h-20 bg-foreground flex justify-around items-center px-4 z-40"
      style={{ borderTopLeftRadius: "24px", borderTopRightRadius: "24px" }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        
        return (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors relative ${
              isActive
                ? "text-background"
                : "text-muted-foreground hover:text-background/70"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-background rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </motion.button>
        );
      })}
    </motion.nav>
  );
};

export default BottomNav;
