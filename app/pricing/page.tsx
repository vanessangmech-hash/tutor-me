"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"
import { Check, Sparkles, Zap, Crown, ArrowRight } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying out Tutor Me",
    features: [
      "Access to 3 AI tutors",
      "2 learning rooms per month",
      "Basic progress tracking",
      "Community support",
      "Mobile app access"
    ],
    notIncluded: [
      "Custom tutors",
      "Priority support",
      "Advanced analytics"
    ],
    icon: Sparkles,
    popular: false,
    bgColor: "bg-card",
    textColor: "text-foreground",
    borderColor: "border-border"
  },
  {
    name: "Student",
    price: "$9",
    description: "Most popular for students",
    features: [
      "Unlimited AI tutors",
      "10 learning rooms per month",
      "Advanced analytics dashboard",
      "Priority email support",
      "Collaborative study groups",
      "Progress certificates",
      "Custom study schedules"
    ],
    notIncluded: [
      "API access"
    ],
    icon: Zap,
    popular: true,
    bgColor: "bg-[#E8F4EA]",
    textColor: "text-foreground",
    borderColor: "border-[#C5E1C9]"
  },
  {
    name: "Professional",
    price: "$19",
    description: "For power learners & educators",
    features: [
      "Everything in Student",
      "Unlimited learning rooms",
      "Create custom AI tutors",
      "API access for integrations",
      "24/7 priority support",
      "Team management tools",
      "White-label options",
      "Advanced reporting"
    ],
    notIncluded: [],
    icon: Crown,
    popular: false,
    bgColor: "bg-[#FDF4E7]",
    textColor: "text-foreground",
    borderColor: "border-[#F5DFC0]"
  }
]

const faqs = [
  {
    question: "Can I switch plans anytime?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the difference."
  },
  {
    question: "Is there a free trial for paid plans?",
    answer: "All paid plans come with a 14-day free trial. No credit card required to start."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and Apple Pay. Enterprise customers can also pay via invoice."
  },
  {
    question: "Can I get a refund?",
    answer: "Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked."
  },
  {
    question: "Can I learn with friends on the free plan?",
    answer: "You can join rooms created by others on any plan! The room limits only apply to rooms you create yourself."
  }
]

export default function PricingPage() {
  const [showAuth, setShowAuth] = useState(false)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  return (
    <div className="min-h-screen bg-background">
      <Navbar onAuthClick={() => setShowAuth(true)} />
      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
        defaultMode="signup"
      />
      
      <main className="px-6 pb-20 pt-32 lg:px-12">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground"
            >
              Pricing
            </motion.span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              {"Simple, transparent pricing".split("").map((char, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    delay: i * 0.03,
                    ease: "easeInOut",
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </h1>
            <motion.p 
              className="mt-4 text-lg text-muted-foreground"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              Choose the plan that fits your learning journey
            </motion.p>
            
            {/* Billing Toggle */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <span className={`text-sm font-medium transition-colors ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                className="relative h-8 w-14 rounded-full bg-muted p-1 transition-colors"
              >
                <motion.div
                  className="h-6 w-6 rounded-full bg-foreground"
                  animate={{ x: billingCycle === "yearly" ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`flex items-center gap-1 text-sm font-medium transition-colors ${billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"}`}>
                Yearly
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                  Save 20%
                </span>
              </span>
            </div>
          </motion.div>
          
          {/* Pricing Cards */}
          <div className="mb-20 grid gap-6 md:grid-cols-3">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ 
                  y: -10, 
                  scale: 1.03,
                  rotateY: 5,
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
                }}
                className={`relative overflow-hidden rounded-3xl border p-8 ${plan.bgColor} ${plan.borderColor}`}
                style={{ transformStyle: "preserve-3d", perspective: 1000 }}
              >
                {/* Floating particles */}
                <motion.div
                  className="absolute right-10 top-20 h-3 w-3 rounded-full bg-accent/40"
                  animate={{ y: [0, -15, 0], x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 3, delay: i * 0.2 }}
                />
                <motion.div
                  className="absolute left-8 bottom-20 h-2 w-2 rounded-full bg-foreground/20"
                  animate={{ y: [0, -10, 0], x: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.3 }}
                />

                {plan.popular && (
                  <motion.div 
                    className="absolute right-4 top-4 rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-card"
                    animate={{ scale: [1, 1.08, 1], rotate: [0, 2, -2, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    Most Popular
                  </motion.div>
                )}
                
                <motion.div 
                  className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
                    plan.popular ? "bg-foreground/10" : "bg-foreground/5"
                  }`}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 3, -3, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 3 + i * 0.5,
                    ease: "easeInOut"
                  }}
                >
                  <plan.icon className="h-7 w-7 text-foreground" />
                </motion.div>
                
                <motion.h3 
                  className={`text-2xl font-bold ${plan.textColor}`}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
                >
                  {plan.name}
                </motion.h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                
                <div className="mt-6">
                  <motion.span 
                    className="text-5xl font-bold text-foreground"
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ repeat: Infinity, duration: 3, delay: i * 0.3 }}
                  >
                    {billingCycle === "yearly" 
                      ? `$${Math.floor(parseInt(plan.price.slice(1)) * 0.8 * 12)}`
                      : plan.price
                    }
                  </motion.span>
                  <span className="text-lg text-muted-foreground">
                    /{billingCycle === "yearly" ? "year" : "month"}
                  </span>
                </div>
                
                <Button
                  className={`mt-6 w-full rounded-full ${
                    plan.popular 
                      ? "bg-foreground text-card hover:bg-foreground/90" 
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => setShowAuth(true)}
                >
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
          
          {/* FAQ Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="mb-8 text-center">
              <motion.span 
                className="inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                FAQ
              </motion.span>
              <motion.h2 
                className="mt-4 text-3xl font-bold text-foreground"
                animate={{ scale: [1, 1.01, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                Frequently asked questions
              </motion.h2>
            </div>
            
            <div className="mx-auto max-w-3xl space-y-4">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20, x: -10 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ 
                    x: 8, 
                    scale: 1.02,
                    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.15)"
                  }}
                  className="rounded-2xl border border-border bg-card p-6"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <motion.h3 
                    className="font-semibold text-foreground"
                    animate={{ x: [0, 2, 0] }}
                    transition={{ repeat: Infinity, duration: 4, delay: i * 0.3 }}
                  >
                    {faq.question}
                  </motion.h3>
                  <p className="mt-2 text-muted-foreground">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  )
}
