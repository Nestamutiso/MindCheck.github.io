import { motion } from "framer-motion";
import { Phone, MessageCircle, Globe, Heart, ExternalLink, Shield, Clock } from "lucide-react";

const resources = [
  {
    id: "crisis",
    name: "Crisis Hotline",
    description: "24/7 immediate support for mental health emergencies",
    phone: "0722178177",
    icon: Phone,
    color: "from-red-500 to-rose-500",
    urgent: true,
  },
  {
    id: "counseling",
    name: "Text Counseling",
    description: "Connect with a counselor via text message",
    phone: "SMS: HELLO to 741741",
    icon: MessageCircle,
    color: "from-green-500 to-emerald-500",
    urgent: false,
  },
  {
    id: "online",
    name: "Online Therapy",
    description: "Schedule sessions with licensed therapists",
    link: "https://www.betterhelp.com",
    icon: Globe,
    color: "from-blue-500 to-cyan-500",
    urgent: false,
  },
  {
    id: "support",
    name: "Support Groups",
    description: "Find local and online peer support groups",
    link: "https://www.nami.org/Support-Education/Support-Groups",
    icon: Heart,
    color: "from-purple-500 to-violet-500",
    urgent: false,
  },
];

const tips = [
  { icon: Shield, text: "All conversations with professionals are confidential" },
  { icon: Clock, text: "Most hotlines are available 24 hours a day" },
  { icon: Heart, text: "It's okay to ask for help - it's a sign of strength" },
];

const ProfessionalHelpView = () => {
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
          Get Help
        </motion.h1>
        <p className="text-muted-foreground text-sm">Connect with mental health professionals</p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 mb-4"
      >
        <p className="text-sm text-destructive font-medium">
          🆘 If you're in immediate danger, please call emergency services (999/112) or go to your nearest emergency room.
        </p>
      </motion.div>

      <div className="space-y-3 mb-6">
        {resources.map((resource, idx) => {
          const Icon = resource.icon;
          return (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-card rounded-2xl p-5 shadow-soft ${resource.urgent ? "ring-2 ring-destructive/30" : ""}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${resource.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{resource.name}</h3>
                    {resource.urgent && (
                      <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full">
                        24/7
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                  
                  {resource.phone && (
                    <motion.a
                      href={`tel:${resource.phone.replace(/[^0-9]/g, "")}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-glow"
                    >
                      <Phone className="w-4 h-4" />
                      {resource.phone}
                    </motion.a>
                  )}
                  
                  {resource.link && (
                    <motion.a
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit Website
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-2xl p-5 shadow-soft"
      >
        <h3 className="font-semibold text-foreground mb-3">Good to Know</h3>
        <div className="space-y-3">
          {tips.map((tip, idx) => {
            const Icon = tip.icon;
            return (
              <div key={idx} className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{tip.text}</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfessionalHelpView;
