import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Brain, Moon, Zap, ArrowLeft, Play, Pause, RotateCcw, Lock, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";

interface BreathingProgram {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  exercises: BreathingExercise[];
  isPremium: boolean;
}

interface BreathingExercise {
  name: string;
  pattern: { inhale: number; hold1: number; exhale: number; hold2: number };
  duration: number;
  hasAudio: boolean;
}

const programs: BreathingProgram[] = [
  {
    id: "anxiety",
    name: "Calm Anxiety",
    description: "Reduce stress and find peace",
    icon: Heart,
    color: "from-rose-400 to-pink-500",
    isPremium: false,
    exercises: [
      { name: "4-7-8 Relaxing Breath", pattern: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 }, duration: 5, hasAudio: false },
      { name: "Extended Exhale", pattern: { inhale: 4, hold1: 0, exhale: 8, hold2: 0 }, duration: 5, hasAudio: false },
    ]
  },
  {
    id: "sleep",
    name: "Better Sleep",
    description: "Drift into restful slumber",
    icon: Moon,
    color: "from-indigo-400 to-purple-500",
    isPremium: true,
    exercises: [
      { name: "Sleep Preparation", pattern: { inhale: 4, hold1: 4, exhale: 6, hold2: 2 }, duration: 10, hasAudio: true },
      { name: "Body Scan Breath", pattern: { inhale: 5, hold1: 5, exhale: 5, hold2: 5 }, duration: 15, hasAudio: true },
    ]
  },
  {
    id: "focus",
    name: "Sharp Focus",
    description: "Enhance concentration",
    icon: Brain,
    color: "from-cyan-400 to-blue-500",
    isPremium: true,
    exercises: [
      { name: "Energizing Breath", pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 }, duration: 5, hasAudio: true },
      { name: "Brain Boost", pattern: { inhale: 3, hold1: 3, exhale: 3, hold2: 3 }, duration: 8, hasAudio: true },
    ]
  },
  {
    id: "energy",
    name: "Quick Energy",
    description: "Boost vitality in minutes",
    icon: Zap,
    color: "from-amber-400 to-orange-500",
    isPremium: false,
    exercises: [
      { name: "Power Breath", pattern: { inhale: 2, hold1: 2, exhale: 2, hold2: 2 }, duration: 3, hasAudio: false },
      { name: "Morning Wake-Up", pattern: { inhale: 3, hold1: 1, exhale: 3, hold2: 1 }, duration: 5, hasAudio: false },
    ]
  }
];

const EnhancedBreathingView = () => {
  const navigate = useNavigate();
  const { isPremium } = useSubscription();
  const [selectedProgram, setSelectedProgram] = useState<BreathingProgram | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold1" | "exhale" | "hold2">("inhale");
  const [countdown, setCountdown] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  const startExercise = (exercise: BreathingExercise) => {
    if (exercise.hasAudio && !isPremium) {
      navigate('/premium');
      return;
    }
    setSelectedExercise(exercise);
    setIsActive(true);
    setPhase("inhale");
    setCountdown(exercise.pattern.inhale);
    setCycleCount(0);
  };

  const stopExercise = () => {
    setIsActive(false);
    setSelectedExercise(null);
    setPhase("inhale");
    setCycleCount(0);
  };

  // Breathing timer logic
  useState(() => {
    if (!isActive || !selectedExercise) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev > 1) return prev - 1;

        const pattern = selectedExercise.pattern;
        if (phase === "inhale") {
          if (pattern.hold1 > 0) {
            setPhase("hold1");
            return pattern.hold1;
          } else {
            setPhase("exhale");
            return pattern.exhale;
          }
        } else if (phase === "hold1") {
          setPhase("exhale");
          return pattern.exhale;
        } else if (phase === "exhale") {
          if (pattern.hold2 > 0) {
            setPhase("hold2");
            return pattern.hold2;
          } else {
            setPhase("inhale");
            setCycleCount(c => c + 1);
            return pattern.inhale;
          }
        } else {
          setPhase("inhale");
          setCycleCount(c => c + 1);
          return pattern.inhale;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  });

  const phaseText = {
    inhale: "Breathe In",
    hold1: "Hold",
    exhale: "Breathe Out",
    hold2: "Hold"
  };

  // Active exercise view
  if (selectedExercise && isActive) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full flex flex-col items-center justify-center p-6"
      >
        <button onClick={stopExercise} className="absolute top-6 left-6 text-muted-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-semibold text-foreground mb-2">{selectedExercise.name}</h2>
        <p className="text-muted-foreground mb-8">Cycle {cycleCount + 1}</p>

        <motion.div
          animate={{
            scale: phase === "inhale" ? 1.3 : phase === "exhale" ? 0.8 : 1,
          }}
          transition={{ duration: countdown, ease: "easeInOut" }}
          className="w-48 h-48 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mb-8"
        >
          <div className="text-center text-primary-foreground">
            <p className="text-4xl font-bold">{countdown}</p>
            <p className="text-sm opacity-80">{phaseText[phase]}</p>
          </div>
        </motion.div>

        {selectedExercise.hasAudio && (
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Volume2 className="w-4 h-4" />
            <span className="text-sm">Guided audio</span>
          </div>
        )}

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setIsActive(!isActive)}>
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          <Button variant="outline" onClick={stopExercise}>
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    );
  }

  // Exercise list for selected program
  if (selectedProgram) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="h-full p-6"
      >
        <button 
          onClick={() => setSelectedProgram(null)} 
          className="flex items-center gap-2 text-muted-foreground mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Programs</span>
        </button>

        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedProgram.color} flex items-center justify-center mb-4`}>
          <selectedProgram.icon className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">{selectedProgram.name}</h1>
        <p className="text-muted-foreground mb-6">{selectedProgram.description}</p>

        <div className="space-y-3">
          {selectedProgram.exercises.map((exercise, idx) => (
            <Card
              key={idx}
              className="p-4 cursor-pointer hover:border-primary transition-colors"
              onClick={() => startExercise(exercise)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{exercise.name}</h3>
                    {exercise.hasAudio && !isPremium && (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                    {exercise.hasAudio && isPremium && (
                      <Volume2 className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {exercise.duration} min • {exercise.pattern.inhale}-{exercise.pattern.hold1}-{exercise.pattern.exhale}-{exercise.pattern.hold2}
                  </p>
                </div>
                <Button size="sm" variant={exercise.hasAudio && !isPremium ? "outline" : "default"}>
                  {exercise.hasAudio && !isPremium ? "Unlock" : "Start"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>
    );
  }

  // Programs list
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full overflow-auto p-6"
    >
      <h1 className="text-2xl font-bold text-foreground mb-2">Breathing Programs</h1>
      <p className="text-muted-foreground mb-6">Choose a program for your needs</p>

      <div className="grid grid-cols-2 gap-4">
        {programs.map((program) => (
          <motion.div
            key={program.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (program.isPremium && !isPremium) {
                navigate('/premium');
              } else {
                setSelectedProgram(program);
              }
            }}
          >
            <Card className="p-4 cursor-pointer relative overflow-hidden h-40">
              {program.isPremium && !isPremium && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${program.color} flex items-center justify-center mb-3`}>
                <program.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">{program.name}</h3>
              <p className="text-xs text-muted-foreground">{program.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default EnhancedBreathingView;
