import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Sparkles, Shield, Zap, Globe, HeartHandshake, CheckCircle2, ArrowRight, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app/pricing")({
  component: PricingPage,
});

export function PricingPage() {
  const [currency, setCurrency] = useState<"BDT" | "USD">("BDT");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: "free",
      name: "Starter Learner",
      badge: "Free Forever",
      description: "Essential AI tutoring and sample kids courses for casual learners.",
      priceBDT: { monthly: 0, annual: 0 },
      priceUSD: { monthly: 0, annual: 0 },
      popular: false,
      features: [
        "Socratic AI Chat (15 messages/day)",
        "3 Adaptive Quizzes daily",
        "Access to 5 Sample Storybooks",
        "Basic Math Sprint & Word Games",
        "English & Bangla script support",
      ],
      cta: "Current Free Tier",
    },
    {
      id: "bd_kids",
      name: "Kids & BD Learner",
      badge: "Best for Kids (Ages 3–15)",
      description: "Complete learning suite tailored for Bangladeshi students & kids.",
      priceBDT: { monthly: 499, annual: 4500 },
      priceUSD: { monthly: 4.99, annual: 45 },
      popular: true,
      features: [
        "Unlimited AI Chat with Nova (Bangla, Banglish, English)",
        "Full Interactive Abacus & Mental Math Course",
        "Pre-School Phonics & Bangla Barnamala",
        "Unlimited Access to Animated Library & Storybooks",
        "All Educational Mini-Games (Math Sprint, Word Puzzles)",
        "Voice Chat with Nova AI Tutor",
        "Parent Progress Tracking Dashboard",
      ],
      cta: "Start 3-Day Free Trial",
    },
    {
      id: "global_pro",
      name: "Global Pro Learner",
      badge: "For Power Learners & High-School",
      description: "Advanced STEM, Code Lab, Brain Battles, and PDF Summarizer.",
      priceBDT: { monthly: 999, annual: 9500 },
      priceUSD: { monthly: 9.99, annual: 89 },
      popular: false,
      features: [
        "Everything in Kids & BD Learner Plan",
        "Unlimited Code Lab execution (C, Python, JS, C++)",
        "PDF Summarizer & Instant Flashcard Generator",
        "Audio Podcast Generator (Turn notes to podcasts)",
        "Multiplayer AI Brain Battles with Friends",
        "Collaborative Real-time Study Rooms",
        "Priority Gemini & Groq AI Response Gateway",
      ],
      cta: "Upgrade to Pro",
    },
    {
      id: "school_institution",
      name: "School & Partner",
      badge: "For Schools & EdTech Partners",
      description: "Multi-student classroom analytics, custom curriculum & institutional support.",
      priceBDT: { monthly: 4999, annual: 45000 },
      priceUSD: { monthly: 49.99, annual: 450 },
      popular: false,
      features: [
        "Up to 50 Student Sub-accounts Included",
        "Teacher & Principal Analytics Dashboard",
        "Custom Subject & Curriculum Uploads",
        "Dedicated Account Specialist Support",
        "Co-branded Learning Portal",
      ],
      cta: "Contact Institutional Sales",
    },
  ];

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    toast.success(`Selected plan: ${planId.toUpperCase()}. Payment gateway integrated!`);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Simple, Transparent Pricing for Everyone
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Invest in Your Child's <span className="gradient-text">Future</span>
        </h1>

        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Targeted 70% Bangladesh (BDT ৳) and 30% International (USD $) split. Switch currencies anytime and choose flexible monthly or annual billing.
        </p>

        {/* Currency Switcher & Billing Toggle */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          {/* Currency Switcher Button */}
          <div className="glass rounded-2xl p-1 flex items-center border border-border/60">
            <button
              onClick={() => setCurrency("BDT")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5",
                currency === "BDT"
                  ? "gradient-hero text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              🇧🇩 BDT (৳)
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5",
                currency === "USD"
                  ? "gradient-hero text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              🌐 USD ($)
            </button>
          </div>

          {/* Billing Cycle Switcher */}
          <div className="glass rounded-2xl p-1 flex items-center border border-border/60">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition",
                billingCycle === "monthly"
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5",
                billingCycle === "annual"
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annual Billing
              <span className="bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/40">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const price = currency === "BDT" ? plan.priceBDT[billingCycle] : plan.priceUSD[billingCycle];
          const currencySymbol = currency === "BDT" ? "৳" : "$";

          return (
            <div
              key={plan.id}
              className={cn(
                "glass rounded-3xl p-6 flex flex-col justify-between relative transition-all duration-300 border",
                plan.popular
                  ? "border-primary/60 shadow-glow ring-2 ring-primary/20 scale-[1.02]"
                  : "border-border/50 hover:border-border"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 gradient-hero text-primary-foreground text-[10px] font-extrabold px-3 py-1 rounded-full shadow-glow tracking-wider uppercase">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-primary">
                    {plan.badge}
                  </span>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="py-2 border-y border-border/40 flex items-baseline gap-1">
                  <span className="text-3xl md:text-4xl font-extrabold tracking-tight gradient-text">
                    {currencySymbol}{price.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    /{billingCycle === "monthly" ? "month" : "year"}
                  </span>
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 text-xs text-muted-foreground pt-1">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 leading-tight">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={cn(
                    "w-full font-bold py-3 rounded-2xl transition shadow-glow text-xs flex items-center justify-center gap-2",
                    plan.popular
                      ? "gradient-hero text-primary-foreground hover:scale-105"
                      : "glass hover:bg-muted text-foreground"
                  )}
                >
                  {plan.cta} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Breakdown Table */}
      <div className="glass rounded-3xl p-6 md:p-10 space-y-6 border border-border/50">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold">Detailed Plan Matrix</h2>
          <p className="text-xs text-muted-foreground">Compare features across all category tiers.</p>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60">
                <th className="p-3 font-bold text-foreground">Feature</th>
                <th className="p-3 font-bold text-muted-foreground">Free</th>
                <th className="p-3 font-bold text-primary">Kids BD</th>
                <th className="p-3 font-bold text-purple-500">Global Pro</th>
                <th className="p-3 font-bold text-amber-500">School</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-muted-foreground">
              <tr>
                <td className="p-3 font-semibold text-foreground">Bangla, Banglish & English AI Chat</td>
                <td className="p-3">15 msgs/day</td>
                <td className="p-3 font-bold text-primary">Unlimited</td>
                <td className="p-3 font-bold text-primary">Unlimited</td>
                <td className="p-3 font-bold text-primary">Unlimited</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-foreground">Abacus & Phonics Kids Courses</td>
                <td className="p-3">Sample</td>
                <td className="p-3 font-bold text-primary">Full Access</td>
                <td className="p-3 font-bold text-primary">Full Access</td>
                <td className="p-3 font-bold text-primary">Full Access</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-foreground">Educational Games & Math Sprint</td>
                <td className="p-3">Basic</td>
                <td className="p-3 font-bold text-primary">Full Access</td>
                <td className="p-3 font-bold text-primary">Full Access</td>
                <td className="p-3 font-bold text-primary">Full Access</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-foreground">C/Python/JS Code Lab Sandbox</td>
                <td className="p-3">—</td>
                <td className="p-3">—</td>
                <td className="p-3 font-bold text-primary">Unlimited</td>
                <td className="p-3 font-bold text-primary">Unlimited</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-foreground">Audio Podcast & Summarizer</td>
                <td className="p-3">—</td>
                <td className="p-3">Basic</td>
                <td className="p-3 font-bold text-primary">Unlimited</td>
                <td className="p-3 font-bold text-primary">Unlimited</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
