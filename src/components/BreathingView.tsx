import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Play, Pause, RotateCcw, Heart, Sparkles, Moon } from "lucide-react";

type BreathingExercise = {
  id: string;
  name: string;
  description: string;
  icon: typeof Wind;
  pattern: { inhale: number; hold: number; exhale: number; holdAfter?: number };
  color: string;
};

const exercises: BreathingExercise[] = [
  {
    id: "box",
    name: "Box Breathing",
    description: "4-4-4-4 pattern for calm and focus",
    icon: Wind,
    pattern: { inhale: 4, hold: 4, exhale: 4, holdAfter: 4 },
    color: "from-primary to-purple-400",
  },
  {
    id: "relaxing",
    name: "Relaxing Breath",
    description: "4-7-8 pattern for deep relaxation",
    icon: Moon,
    pattern: { inhale: 4, hold: 7, exhale: 8 },
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: "energizing",
    name: "Energizing Breath",
    description: "Quick bursts to boost energy",
    icon: Sparkles,
    pattern: { inhale: 2, hold: 1, exhale: 2 },
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "calming",
    name: "Heart Coherence",
    description: "5-5 pattern for emotional balance",
    icon: Heart,
    pattern: { inhale: 5, hold: 0, exhale: 5 },
    color: "from-pink-500 to-rose-500",
  },
];

const BreathingView = () => {
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "holdAfter">("inhale");
  const [countdown, setCountdown] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  const getPhaseInstruction = () => {
    switch (phase) {
      case "inhale": return "Breathe In";
      case "hold": return "Hold";
      case "exhale": return "Breathe Out";
      case "holdAfter": return "Hold";
    }
  };

  const getCircleScale = () => {
    switch (phase) {
      case "inhale": return 1.3;
      case "hold": return 1.3;
      case "exhale": return 1;
      case "holdAfter": return 1;
    }
  };

  const startExercise = useCallback((exercise: BreathingExercise) => {
    setSelectedExercise(exercise);
    setIsActive(true);
    setPhase("inhale");
    setCountdown(exercise.pattern.inhale);
    setCycleCount(0);
  }, []);

  const stopExercise = useCallback(() => {
    setIsActive(false);
    setSelectedExercise(null);
    setCycleCount(0);
  }, []);

  const togglePause = useCallback(() => {
    setIsActive((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isActive || !selectedExercise) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          const pattern = selectedExercise.pattern;
          if (phase === "inhale") {
            if (pattern.hold > 0) {
              setPhase("hold");
              return pattern.hold;
            } else {
              setPhase("exhale");
              return pattern.exhale;
            }
          } else if (phase === "hold") {
            setPhase("exhale");
            return pattern.exhale;
          } else if (phase === "exhale") {
            if (pattern.holdAfter && pattern.holdAfter > 0) {
              setPhase("holdAfter");
              return pattern.holdAfter;
            } else {
              setPhase("inhale");
              setCycleCount((c) => c + 1);
              return pattern.inhale;
            }
          } else {
            setPhase("inhale");
            setCycleCount((c) => c + 1);
            return pattern.inhale;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, selectedExercise]);

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
          Breathe
        </motion.h1>
        <p className="text-muted-foreground text-sm">Guided breathing exercises for calm</p>
      </header>

      <AnimatePresence mode="wait">
        {!selectedExercise ? (
          <motion.div
            key="exercises"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {exercises.map((exercise, idx) => {
              const Icon = exercise.icon;
              return (
                <motion.button
                  key={exercise.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startExercise(exercise)}
                  className="w-full bg-card rounded-2xl p-5 shadow-soft text-left flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${exercise.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{exercise.name}</h3>
                    <p className="text-sm text-muted-foreground">{exercise.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex-1 flex flex-col items-center justify-center py-8"
          >
            <p className="text-muted-foreground mb-2">{selectedExercise.name}</p>
            <p className="text-sm text-muted-foreground/70 mb-8">Cycle {cycleCount + 1}</p>

            <div className="relative flex items-center justify-center mb-8">
              <motion.div
                animate={{ scale: getCircleScale() }}
                transition={{ duration: countdown, ease: "easeInOut" }}
                className={`w-48 h-48 rounded-full bg-gradient-to-br ${selectedExercise.color} opacity-20`}
              />
              <motion.div
                animate={{ scale: getCircleScale() * 0.7 }}
                transition={{ duration: countdown, ease: "easeInOut" }}
                className={`absolute w-48 h-48 rounded-full bg-gradient-to-br ${selectedExercise.color} opacity-40`}
              />
              <div className="absolute flex flex-col items-center">
                <motion.span
                  key={phase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl font-semibold text-foreground"
                >
                  {getPhaseInstruction()}
                </motion.span>
                <span className="text-4xl font-bold text-primary mt-2">{countdown}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePause}
                className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shadow-glow"
              >
                {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopExercise}
                className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground"
              >
                <RotateCcw className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BreathingView;
