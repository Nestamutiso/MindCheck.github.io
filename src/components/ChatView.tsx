import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import ChatBubble from "./ChatBubble";

interface Message {
  text: string;
  isBot: boolean;
}

interface ChatViewProps {
  userName: string;
  onMoodDetected: (mood: "good" | "heavy") => void;
  onCrisis: () => void;
}

const ChatView = ({ userName, onMoodDetected, onCrisis }: ChatViewProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: `Welcome ${userName}. I'm your thought partner. How is your heart today?`,
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { text: userMessage, isBot: false }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = "Tell me more about that.";
      
      if (/sad|bad|hard|tired|stressed|anxious|worried|scared|lonely|hurt|pain|cry/i.test(userMessage)) {
        reply = "I hear you. It sounds heavy. I'm right here with you. 💜";
        onMoodDetected("heavy");
        onCrisis();
      } else if (/good|happy|win|great|amazing|wonderful|excited|joy|grateful|blessed/i.test(userMessage)) {
        reply = "That's a win! I'm so happy for you. Keep shining! ✨";
        onMoodDetected("good");
      } else if (/hello|hi|hey/i.test(userMessage)) {
        reply = `Hey there ${userName}! How are you feeling right now?`;
      } else if (/thank/i.test(userMessage)) {
        reply = "You're always welcome. I'm here whenever you need me. 💜";
      }

      setMessages((prev) => [...prev, { text: reply, isBot: true }]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
          Hi, {userName}
        </motion.h1>
        <p className="text-muted-foreground text-sm">How are you feeling today?</p>
      </header>

      <div
        ref={chatLogRef}
        className="flex-1 overflow-y-auto space-y-3 py-4 pr-2 -mr-2"
      >
        {messages.map((msg, idx) => (
          <ChatBubble
            key={idx}
            message={msg.text}
            isBot={msg.isBot}
            index={idx}
          />
        ))}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-chat-bot text-chat-bot-foreground px-4 py-3 rounded-2xl rounded-bl-sm">
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex gap-1"
              >
                <span className="w-2 h-2 bg-primary-foreground/60 rounded-full" />
                <span className="w-2 h-2 bg-primary-foreground/60 rounded-full" />
                <span className="w-2 h-2 bg-primary-foreground/60 rounded-full" />
              </motion.span>
            </div>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-3 p-3 bg-card rounded-2xl shadow-soft"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a thought..."
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none px-2"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shadow-glow"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default ChatView;
