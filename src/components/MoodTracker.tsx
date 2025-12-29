import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const moodOptions = [
  { score: 1, emoji: "😢", label: "Terrible" },
  { score: 2, emoji: "😔", label: "Bad" },
  { score: 3, emoji: "😐", label: "Okay" },
  { score: 4, emoji: "🙂", label: "Good" },
  { score: 5, emoji: "😊", label: "Great" },
];

const commonTags = ["work", "sleep", "exercise", "family", "social", "health", "anxiety", "grateful"];

const MoodTracker = () => {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [journalEntry, setJournalEntry] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!user || selectedMood === null) return;

    setIsSubmitting(true);
    try {
      const moodLabel = moodOptions.find(m => m.score === selectedMood)?.label || "Okay";
      
      const { error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          mood_score: selectedMood,
          mood_label: moodLabel,
          journal_entry: journalEntry || null,
          tags: selectedTags
        });

      if (error) throw error;

      toast.success("Mood logged successfully!");
      setSelectedMood(null);
      setJournalEntry("");
      setSelectedTags([]);
    } catch (error) {
      console.error('Error saving mood:', error);
      toast.error("Failed to save mood entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">How are you feeling?</h2>
        <p className="text-muted-foreground text-sm">Track your mood to understand patterns</p>
      </div>

      {/* Mood Selection */}
      <div className="flex justify-between">
        {moodOptions.map((mood) => (
          <motion.button
            key={mood.score}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedMood(mood.score)}
            className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${
              selectedMood === mood.score
                ? 'bg-primary/10 ring-2 ring-primary'
                : 'hover:bg-muted'
            }`}
          >
            <span className="text-3xl">{mood.emoji}</span>
            <span className="text-xs text-muted-foreground">{mood.label}</span>
          </motion.button>
        ))}
      </div>

      {selectedMood !== null && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              What's affecting your mood? (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {commonTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Journal Entry */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Journal entry (optional)
            </label>
            <Textarea
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              placeholder="Write about how you're feeling..."
              className="min-h-[100px]"
            />
          </div>

          {/* Submit */}
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log Mood
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MoodTracker;
