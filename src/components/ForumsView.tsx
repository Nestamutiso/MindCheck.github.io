import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MessageSquare, Heart, TrendingUp, Clock, ChevronRight, ArrowLeft, Send } from "lucide-react";

interface ForumPost {
  id: string;
  author: string;
  avatar: string;
  content: string;
  likes: number;
  replies: number;
  timeAgo: string;
  topic: string;
}

interface ForumTopic {
  id: string;
  name: string;
  description: string;
  icon: typeof Users;
  color: string;
  members: number;
  posts: ForumPost[];
}

const forumTopics: ForumTopic[] = [
  {
    id: "anxiety",
    name: "Anxiety Support",
    description: "Share coping strategies and find understanding",
    icon: Heart,
    color: "from-pink-500 to-rose-500",
    members: 2847,
    posts: [
      {
        id: "1",
        author: "AnonymousHope",
        avatar: "🌸",
        content: "Had my first panic attack in weeks today, but I used the breathing techniques and it passed faster than usual. Progress! 💪",
        likes: 24,
        replies: 8,
        timeAgo: "2h ago",
        topic: "anxiety",
      },
      {
        id: "2",
        author: "CalmSeeker",
        avatar: "🌊",
        content: "Does anyone else find that journaling before bed helps with anxious thoughts? I started doing it last week and it's been life-changing.",
        likes: 45,
        replies: 12,
        timeAgo: "5h ago",
        topic: "anxiety",
      },
    ],
  },
  {
    id: "depression",
    name: "Depression Journey",
    description: "You're not alone in this fight",
    icon: TrendingUp,
    color: "from-blue-500 to-indigo-500",
    members: 3421,
    posts: [
      {
        id: "3",
        author: "RisingPhoenix",
        avatar: "🌅",
        content: "Today I managed to take a shower AND go for a short walk. Some days these small wins feel huge.",
        likes: 89,
        replies: 23,
        timeAgo: "1h ago",
        topic: "depression",
      },
      {
        id: "4",
        author: "HopefulHeart",
        avatar: "💚",
        content: "Reminder: It's okay to not be okay. We're all here supporting each other. Sending love to everyone reading this. ❤️",
        likes: 156,
        replies: 34,
        timeAgo: "3h ago",
        topic: "depression",
      },
    ],
  },
  {
    id: "selfcare",
    name: "Self-Care Circle",
    description: "Tips and motivation for taking care of yourself",
    icon: Heart,
    color: "from-amber-500 to-orange-500",
    members: 1956,
    posts: [
      {
        id: "5",
        author: "WellnessWarrior",
        avatar: "🌻",
        content: "Started a 5-minute morning meditation routine. It's simple but it sets such a positive tone for the day!",
        likes: 67,
        replies: 15,
        timeAgo: "4h ago",
        topic: "selfcare",
      },
    ],
  },
  {
    id: "general",
    name: "General Support",
    description: "A safe space for any mental health topic",
    icon: Users,
    color: "from-purple-500 to-violet-500",
    members: 5234,
    posts: [
      {
        id: "6",
        author: "NewJourney",
        avatar: "🌟",
        content: "Just joined this community and already feeling less alone. Thank you all for being here. 🙏",
        likes: 203,
        replies: 45,
        timeAgo: "30m ago",
        topic: "general",
      },
    ],
  },
];

const ForumsView = () => {
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [newComment, setNewComment] = useState("");

  const handleLike = (postId: string) => {
    // In a real app, this would update the database
    console.log("Liked post:", postId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full overflow-y-auto"
    >
      <header className="py-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          {selectedTopic && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelectedTopic(null)}
              className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </motion.button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {selectedTopic ? selectedTopic.name : "Community"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {selectedTopic
                ? `${selectedTopic.members.toLocaleString()} members`
                : "Connect with others who understand"}
            </p>
          </div>
        </motion.div>
      </header>

      <AnimatePresence mode="wait">
        {!selectedTopic ? (
          <motion.div
            key="topics"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary/50 rounded-2xl p-4 mb-2"
            >
              <p className="text-sm text-muted-foreground">
                🔒 All posts are anonymous. Share openly in a judgment-free space.
              </p>
            </motion.div>

            {forumTopics.map((topic, idx) => {
              const Icon = topic.icon;
              return (
                <motion.button
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTopic(topic)}
                  className="w-full bg-card rounded-2xl p-5 shadow-soft text-left flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{topic.name}</h3>
                    <p className="text-sm text-muted-foreground">{topic.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {topic.members.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {topic.posts.length} posts
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </motion.button>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="posts"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            {selectedTopic.posts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card rounded-2xl p-4 shadow-soft"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{post.avatar}</span>
                  <div>
                    <p className="font-medium text-foreground text-sm">{post.author}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.timeAgo}
                    </p>
                  </div>
                </div>
                <p className="text-foreground mb-4">{post.content}</p>
                <div className="flex items-center gap-4">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    {post.likes}
                  </motion.button>
                  <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    {post.replies}
                  </button>
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 p-3 bg-card rounded-2xl shadow-soft"
            >
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none px-2"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!newComment.trim()}
                className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shadow-glow disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ForumsView;
