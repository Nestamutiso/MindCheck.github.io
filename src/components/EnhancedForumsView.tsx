import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, MessageCircle, Bookmark, BookmarkCheck, User, Send, Crown, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ForumPost {
  id: string;
  content: string;
  author: string;
  isAnonymous: boolean;
  isExpert: boolean;
  timeAgo: string;
  likes: number;
  replies: number;
  isLiked: boolean;
}

interface ForumTopic {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  memberCount: number;
  posts: ForumPost[];
}

const mockTopics: ForumTopic[] = [
  {
    id: "anxiety",
    name: "Managing Anxiety",
    description: "Share experiences and coping strategies",
    icon: "💭",
    color: "from-blue-400 to-cyan-500",
    memberCount: 2341,
    posts: [
      {
        id: "1",
        content: "Just discovered the 4-7-8 breathing technique and it's been a game changer for my panic attacks. Has anyone else tried it?",
        author: "MindfulMaria",
        isAnonymous: false,
        isExpert: false,
        timeAgo: "2h ago",
        likes: 24,
        replies: 8,
        isLiked: false
      },
      {
        id: "2",
        content: "As a certified therapist, I recommend starting with just 2 minutes of deep breathing daily. Small steps lead to big changes.",
        author: "Dr. Sarah Mitchell",
        isAnonymous: false,
        isExpert: true,
        timeAgo: "5h ago",
        likes: 56,
        replies: 12,
        isLiked: true
      }
    ]
  },
  {
    id: "depression",
    name: "Depression Support",
    description: "A safe space to share and heal",
    icon: "💙",
    color: "from-indigo-400 to-purple-500",
    memberCount: 1892,
    posts: [
      {
        id: "3",
        content: "Some days are harder than others. Today I managed to take a shower and make breakfast. Celebrating small wins.",
        author: "Anonymous",
        isAnonymous: true,
        isExpert: false,
        timeAgo: "1h ago",
        likes: 89,
        replies: 23,
        isLiked: false
      }
    ]
  },
  {
    id: "mindfulness",
    name: "Mindfulness Practice",
    description: "Daily meditation and awareness",
    icon: "🧘",
    color: "from-emerald-400 to-teal-500",
    memberCount: 3120,
    posts: []
  }
];

const EnhancedForumsView = () => {
  const { isPremium } = useSubscription();
  const { user } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [topics, setTopics] = useState(mockTopics);
  const [newPost, setNewPost] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([]);

  const handleLike = (topicId: string, postId: string) => {
    setTopics(prev => prev.map(topic => {
      if (topic.id === topicId) {
        return {
          ...topic,
          posts: topic.posts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                isLiked: !post.isLiked
              };
            }
            return post;
          })
        };
      }
      return topic;
    }));
  };

  const handleBookmark = async (postId: string) => {
    if (!isPremium) {
      toast.info("Bookmarks are a premium feature");
      return;
    }

    if (bookmarkedPosts.includes(postId)) {
      setBookmarkedPosts(prev => prev.filter(id => id !== postId));
      if (user) {
        await supabase
          .from('bookmarked_threads')
          .delete()
          .eq('user_id', user.id)
          .eq('thread_id', postId);
      }
      toast.success("Removed from bookmarks");
    } else {
      setBookmarkedPosts(prev => [...prev, postId]);
      if (user) {
        await supabase
          .from('bookmarked_threads')
          .insert({ user_id: user.id, thread_id: postId });
      }
      toast.success("Saved to bookmarks");
    }
  };

  const handleSubmitPost = () => {
    if (!newPost.trim()) return;
    
    if (selectedTopic) {
      const newPostObj: ForumPost = {
        id: Date.now().toString(),
        content: newPost,
        author: isAnonymous ? "Anonymous" : user?.email?.split("@")[0] || "User",
        isAnonymous,
        isExpert: false,
        timeAgo: "Just now",
        likes: 0,
        replies: 0,
        isLiked: false
      };

      setTopics(prev => prev.map(topic => {
        if (topic.id === selectedTopic.id) {
          return { ...topic, posts: [newPostObj, ...topic.posts] };
        }
        return topic;
      }));

      setSelectedTopic(prev => prev ? { ...prev, posts: [newPostObj, ...prev.posts] } : null);
      setNewPost("");
      toast.success("Post shared!");
    }
  };

  // Topic detail view
  if (selectedTopic) {
    const currentTopic = topics.find(t => t.id === selectedTopic.id) || selectedTopic;
    
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="h-full flex flex-col"
      >
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setSelectedTopic(null)}>
            <ArrowLeft className="w-6 h-6 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{currentTopic.name}</h1>
            <p className="text-sm text-muted-foreground">{currentTopic.memberCount.toLocaleString()} members</p>
          </div>
        </div>

        {/* Posts */}
        <div className="flex-1 overflow-auto space-y-4 mb-4">
          <AnimatePresence>
            {currentTopic.posts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      post.isAnonymous ? 'bg-muted' : 'bg-primary/10'
                    }`}>
                      {post.isAnonymous ? (
                        <User className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <span className="text-lg">{post.author[0]}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{post.author}</span>
                        {post.isExpert && (
                          <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            <Shield className="w-3 h-3" />
                            Expert
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
                      </div>
                      <p className="text-foreground mb-3">{post.content}</p>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleLike(currentTopic.id, post.id)}
                          className={`flex items-center gap-1 text-sm ${post.isLiked ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                          <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                          {post.likes}
                        </button>
                        <button className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MessageCircle className="w-4 h-4" />
                          {post.replies}
                        </button>
                        <button 
                          onClick={() => handleBookmark(post.id)}
                          className="flex items-center gap-1 text-sm text-muted-foreground"
                        >
                          {bookmarkedPosts.includes(post.id) ? (
                            <BookmarkCheck className="w-4 h-4 text-primary" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {currentTopic.posts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No posts yet. Be the first to share!</p>
            </div>
          )}
        </div>

        {/* New post input */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Switch 
              checked={isAnonymous} 
              onCheckedChange={setIsAnonymous} 
              id="anonymous"
            />
            <label htmlFor="anonymous" className="text-sm text-muted-foreground">
              Post anonymously
            </label>
          </div>
          <div className="flex gap-2">
            <Input
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your thoughts..."
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitPost()}
            />
            <Button onClick={handleSubmitPost} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Topics list
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full overflow-auto"
    >
      <h1 className="text-2xl font-bold text-foreground mb-2">Community Forums</h1>
      <p className="text-muted-foreground mb-6">Connect with others on similar journeys</p>

      {isPremium && (
        <Card className="p-4 mb-6 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Premium Member</p>
              <p className="text-sm text-muted-foreground">Anonymous posting & bookmarks enabled</p>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {topics.map((topic) => (
          <motion.div
            key={topic.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setSelectedTopic(topic)}
          >
            <Card className="p-4 cursor-pointer hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${topic.color} flex items-center justify-center text-2xl`}>
                  {topic.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{topic.name}</h3>
                  <p className="text-sm text-muted-foreground">{topic.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {topic.memberCount.toLocaleString()} members • {topic.posts.length} posts
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default EnhancedForumsView;
