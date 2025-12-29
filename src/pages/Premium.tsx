import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Check, Sparkles, Brain, Wind, MessageSquare, Palette, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSubscription, PRODUCTS } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";

const PremiumPage = () => {
  const { subscription, isPremium, isTrialActive, trialDaysRemaining, purchaseSubscription, restorePurchases } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  const features = [
    { icon: Brain, title: "Unlimited AI Chats", description: "No daily message limits" },
    { icon: Sparkles, title: "AI Memory", description: "Aura remembers your conversations" },
    { icon: Wind, title: "Guided Audio Exercises", description: "Premium breathing sessions" },
    { icon: MessageSquare, title: "Priority Forum Access", description: "Expert-led discussions" },
    { icon: Palette, title: "Custom Themes", description: "Personalize your experience" },
    { icon: Zap, title: "Early Access", description: "Be first to try new features" },
  ];

  const handlePurchase = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast.info("Subscriptions are available in the mobile app");
      return;
    }

    setIsLoading(true);
    try {
      const productId = selectedPlan === 'yearly' ? PRODUCTS.YEARLY : PRODUCTS.MONTHLY;
      const success = await purchaseSubscription(productId);
      
      if (success) {
        toast.success("Welcome to MindCheck Pro!");
      }
    } catch (error) {
      toast.error("Purchase failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      await restorePurchases();
      toast.success("Purchases restored");
    } catch {
      toast.error("Could not restore purchases");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPremium && !isTrialActive) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen p-6 flex flex-col items-center justify-center"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">You're a Pro Member!</h1>
          <p className="text-muted-foreground">Thank you for supporting MindCheck</p>
          
          {subscription?.current_period_end && (
            <p className="text-sm text-muted-foreground mt-4">
              Renews: {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-6 pb-24"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Upgrade to Pro</h1>
        <p className="text-muted-foreground">Unlock the full MindCheck experience</p>
        
        {isTrialActive && (
          <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">{trialDaysRemaining} days left in trial</span>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 h-full glass">
              <feature.icon className="w-6 h-6 text-primary mb-2" />
              <h3 className="font-medium text-foreground text-sm">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pricing */}
      <div className="space-y-3 mb-6">
        <button
          onClick={() => setSelectedPlan('yearly')}
          className={`w-full p-4 rounded-2xl border-2 transition-all ${
            selectedPlan === 'yearly'
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Yearly</span>
                <span className="text-xs bg-success text-success-foreground px-2 py-0.5 rounded-full">Save 27%</span>
              </div>
              <p className="text-sm text-muted-foreground">$35/year ($2.92/mo)</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              selectedPlan === 'yearly' ? 'border-primary bg-primary' : 'border-border'
            }`}>
              {selectedPlan === 'yearly' && <Check className="w-4 h-4 text-primary-foreground" />}
            </div>
          </div>
        </button>

        <button
          onClick={() => setSelectedPlan('monthly')}
          className={`w-full p-4 rounded-2xl border-2 transition-all ${
            selectedPlan === 'monthly'
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <span className="font-semibold text-foreground">Monthly</span>
              <p className="text-sm text-muted-foreground">$4/month</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              selectedPlan === 'monthly' ? 'border-primary bg-primary' : 'border-border'
            }`}>
              {selectedPlan === 'monthly' && <Check className="w-4 h-4 text-primary-foreground" />}
            </div>
          </div>
        </button>
      </div>

      {/* CTA */}
      <Button
        onClick={handlePurchase}
        disabled={isLoading}
        className="w-full h-14 text-lg font-semibold gradient-primary"
      >
        {isLoading ? "Processing..." : isTrialActive ? "Continue with Pro" : "Start Free Trial"}
      </Button>

      <p className="text-center text-xs text-muted-foreground mt-4">
        {isTrialActive 
          ? "Your trial will continue until it ends"
          : "3-day free trial, cancel anytime"}
      </p>

      <button
        onClick={handleRestore}
        className="w-full text-center text-sm text-primary mt-4"
      >
        Restore Purchases
      </button>
    </motion.div>
  );
};

export default PremiumPage;
