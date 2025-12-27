import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

interface LoginScreenProps {
  onLogin: (name: string) => void;
}

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center gradient-primary p-5"
    >
      {/* Floating decorations */}
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 opacity-30"
      >
        <Sparkles className="w-8 h-8 text-primary-foreground" />
      </motion.div>
      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-32 right-10 opacity-30"
      >
        <Heart className="w-10 h-10 text-primary-foreground" />
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <div className="bg-card rounded-3xl p-8 shadow-soft">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-glow">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-center text-foreground mb-2"
          >
            MindCheck
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground text-center mb-8"
          >
            Your wellness companion
          </motion.p>

          <form onSubmit={handleSubmit}>
            <motion.input
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-5 py-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all mb-4"
            />
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-glow hover:shadow-lg transition-all"
            >
              Get Started
            </motion.button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoginScreen;
