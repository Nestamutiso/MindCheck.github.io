import { motion } from "framer-motion";

interface ChatBubbleProps {
  message: string;
  isBot: boolean;
  index: number;
}

const ChatBubble = ({ message, isBot, index }: ChatBubbleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`flex ${isBot ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[80%] px-4 py-3 text-[15px] leading-relaxed ${
          isBot
            ? "bg-chat-bot text-chat-bot-foreground rounded-2xl rounded-bl-sm"
            : "bg-chat-user text-chat-user-foreground rounded-2xl rounded-br-sm"
        }`}
      >
        {message}
      </div>
    </motion.div>
  );
};

export default ChatBubble;
