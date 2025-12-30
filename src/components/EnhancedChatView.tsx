import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, Crown, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import ChatBubble from "./ChatBubble";
import { streamChat } from "@/lib/streamChat";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useChatUsage } from "@/hooks/useChatUsage";
import { useChatMemory } from "@/hooks/useChatMemory";
import { useNavigate } from "react-router-dom";

interface Message {
  text: string;
  isBot: boolean;
}

interface EnhancedChatViewProps {
  userName: string;
  onMoodDetected: (mood: "good" | "heavy") => void;
  onCrisis: () => void;
}

const EnhancedChatView = ({ userName, onMoodDetected, onCrisis }: EnhancedChatViewProps) => {
  const navigate = useNavigate();
  const { isPremium, isTrialActive, trialDaysRemaining } = useSubscription();
  const { canSendMessage, messagesRemaining, incrementUsage, FREE_DAILY_LIMIT } = useChatUsage();
  const { getContextForAI, addToHistory, conversationHistory } = useChatMemory();
  
  const [messages, setMessages] = useState<Message[]>([
    { text: `Hi ${userName}! I'm Aura, your mental wellness companion. How are you feeling today?`, isBot: true },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const detectMood = useCallback((text: string) => {
    const lowerText = text.toLowerCase();
    const heavyKeywords = ["sad", "depressed", "anxious", "worried", "stressed", "tired", "overwhelmed", "lonely", "hurt", "angry", "frustrated"];
    const crisisKeywords = ["suicid", "kill myself", "end it all", "don't want to live", "hurt myself", "self harm"];
    const goodKeywords = ["happy", "great", "good", "wonderful", "excited", "grateful", "peaceful", "calm", "better", "amazing"];

    if (crisisKeywords.some((keyword) => lowerText.includes(keyword))) {
      onCrisis();
      return;
    }

    if (heavyKeywords.some((keyword) => lowerText.includes(keyword))) {
      onMoodDetected("heavy");
    } else if (goodKeywords.some((keyword) => lowerText.includes(keyword))) {
      onMoodDetected("good");
    }
  }, [onCrisis, onMoodDetected]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    if (!canSendMessage) {
      navigate('/premium');
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { text: userMessage, isBot: false }]);
    setIsTyping(true);

    detectMood(userMessage);
    await incrementUsage();
    addToHistory({ role: 'user', content: userMessage });

    // Build conversation history for API
    const memoryContext = getContextForAI();
    const apiMessages = conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }));
    apiMessages.push({ role: 'user', content: userMessage });

    // Add memory context to system if premium
    if (memoryContext) {
      apiMessages.unshift({ role: 'assistant', content: `[Context: ${memoryContext}]` });
    }

    let botResponse = "";
    
    await streamChat({
      messages: apiMessages,
      userName,
      onDelta: (delta) => {
        botResponse += delta;
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg.isBot) {
            return [...prev.slice(0, -1), { text: botResponse, isBot: true }];
          } else {
            return [...prev, { text: botResponse, isBot: true }];
          }
        });
      },
      onDone: () => {
        setIsTyping(false);
        addToHistory({ role: 'assistant', content: botResponse });
      },
      onError: (error) => {
        console.error("Chat error:", error);
        setIsTyping(false);
        setMessages((prev) => [...prev, { text: "I'm having trouble responding right now. Please try again.", isBot: true }]);
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Chat with Aura</h1>
            <p className="text-muted-foreground text-sm">Your mental wellness companion</p>
          </div>
          {isPremium && (
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full">
              <Crown className="w-4 h-4" />
              <span className="text-xs font-medium">Pro</span>
            </div>
          )}
        </div>

        {/* Trial/Free tier banner */}
        {isTrialActive && (
          <Card className="mt-4 p-3 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">
                {trialDaysRemaining} days left in your free trial
              </span>
            </div>
          </Card>
        )}

        {!isPremium && !isTrialActive && (
          <Card className="mt-4 p-3 border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {messagesRemaining}/{FREE_DAILY_LIMIT} messages left today
                </span>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate('/premium')}>
                Upgrade
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto space-y-4 py-4">
        {messages.map((message, index) => (
          <ChatBubble key={index} message={message.text} isBot={message.isBot} index={index} />
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-sm">Aura is typing...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="py-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={canSendMessage ? "Type your message..." : "Upgrade to continue chatting"}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={!canSendMessage}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim() || isTyping || !canSendMessage}>
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedChatView;
