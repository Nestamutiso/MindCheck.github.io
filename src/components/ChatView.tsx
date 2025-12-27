import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import ChatBubble from "./ChatBubble";
import { streamChat } from "@/lib/streamChat";
import { toast } from "@/hooks/use-toast";

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
      text: `Hello ${userName} 💜 I'm Aura, your mental wellness companion. I'm here to listen without judgment and support you through whatever you're feeling. How are you doing today?`,
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatLogRef = useRef<HTMLDivElement>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: "user" | "assistant"; content: string}>>([]);

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages]);

  const detectMood = useCallback((text: string) => {
    const heavyPatterns = /\b(sad|depressed|anxious|scared|lonely|hurt|pain|cry|hopeless|worthless|suicide|kill|die|end it|give up|can't go on|exhausted|overwhelmed|broken|desperate|miserable|terrible|awful|stressed|panic)\b/i;
    const goodPatterns = /\b(good|happy|great|amazing|wonderful|excited|joy|grateful|blessed|better|hopeful|calm|peaceful|content|relieved|proud|loved|safe|optimistic)\b/i;
    
    if (heavyPatterns.test(text)) {
      onMoodDetected("heavy");
      if (/\b(suicide|kill myself|end it|die|can't go on|no point|give up on life)\b/i.test(text)) {
        onCrisis();
      }
    } else if (goodPatterns.test(text)) {
      onMoodDetected("good");
    }
  }, [onMoodDetected, onCrisis]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { text: userMessage, isBot: false }]);
    setInput("");
    setIsTyping(true);

    detectMood(userMessage);

    const newHistory = [...conversationHistory, { role: "user" as const, content: userMessage }];
    setConversationHistory(newHistory);

    let assistantResponse = "";

    await streamChat({
      messages: newHistory,
      userName,
      onDelta: (chunk) => {
        assistantResponse += chunk;
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.isBot && prev.length > 1 && prev[prev.length - 2].text === userMessage) {
            return prev.map((m, i) => 
              i === prev.length - 1 ? { ...m, text: assistantResponse } : m
            );
          }
          return [...prev, { text: assistantResponse, isBot: true }];
        });
      },
      onDone: () => {
        setConversationHistory((prev) => [...prev, { role: "assistant", content: assistantResponse }]);
        setIsTyping(false);
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Connection Issue",
          description: error,
        });
        setIsTyping(false);
      },
    });
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
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <h1 className="text-2xl font-bold text-foreground">Hi, {userName}</h1>
          <Sparkles className="w-5 h-5 text-primary" />
        </motion.div>
        <p className="text-muted-foreground text-sm">Your safe space to share and heal</p>
      </header>

      <div
        ref={chatLogRef}
        className="flex-1 overflow-y-auto space-y-3 py-4 pr-2 -mr-2"
      >
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <ChatBubble
              key={idx}
              message={msg.text}
              isBot={msg.isBot}
              index={idx}
            />
          ))}
        </AnimatePresence>
        {isTyping && messages[messages.length - 1]?.isBot === false && (
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
          placeholder="Share what's on your mind..."
          disabled={isTyping}
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none px-2 disabled:opacity-50"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={isTyping || !input.trim()}
          className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default ChatView;
