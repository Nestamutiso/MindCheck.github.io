import { motion } from "framer-motion";
import { Phone } from "lucide-react";

interface InsightsViewProps {
  moods: Array<"good" | "heavy" | null>;
  showCrisisAlert: boolean;
}

const InsightsView = ({ moods, showCrisisAlert }: InsightsViewProps) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full overflow-y-auto"
    >
      <header className="py-4">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground"
        >
          Your Vibe
        </motion.h1>
        <p className="text-muted-foreground text-sm">Track your emotional journey</p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-5 shadow-soft mb-4"
      >
        <h3 className="font-semibold text-foreground mb-4">Mood Calendar</h3>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => (
            <div key={day} className="text-center">
              <span className="text-xs text-muted-foreground mb-2 block">
                {day}
              </span>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.05, type: "spring" }}
                className={`h-10 rounded-lg ${
                  moods[idx] === "good"
                    ? "bg-mood-good"
                    : moods[idx] === "heavy"
                    ? "bg-mood-heavy"
                    : "bg-mood-neutral"
                }`}
              />
            </div>
          ))}
        </div>
        
        <div className="flex gap-4 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-mood-good" />
            <span className="text-xs text-muted-foreground">Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-mood-heavy" />
            <span className="text-xs text-muted-foreground">Heavy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-mood-neutral" />
            <span className="text-xs text-muted-foreground">No data</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl p-5 shadow-soft mb-4"
      >
        <h3 className="font-semibold text-foreground mb-2">Weekly Summary</h3>
        <p className="text-muted-foreground text-sm">
          You've logged {moods.filter(Boolean).length} mood entries this week.
          {moods.filter((m) => m === "good").length > 0 && (
            <span className="text-success"> Keep up the positive vibes! </span>
          )}
        </p>
      </motion.div>

      {showCrisisAlert && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-destructive rounded-2xl p-5 shadow-soft"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive-foreground/20 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-destructive-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-destructive-foreground mb-1">
                Need Help?
              </h3>
              <p className="text-destructive-foreground/90 text-sm">
                I detected some heavy words. If you need support, please reach out
                to someone you trust or call a helpline.
              </p>
              <a
                href="tel:0722178177"
                className="inline-block mt-3 px-4 py-2 bg-destructive-foreground text-destructive rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Call 0722178177
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default InsightsView;
