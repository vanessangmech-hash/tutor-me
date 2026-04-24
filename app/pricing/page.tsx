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
    description: "Perfect for trying out LearnSync",
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
    color: "bg-card border-border"
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
    color: "bg-foreground text-card"
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
    color: "bg-accent text-accent-foreground"
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
            <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the plan that fits your learning journey
            </p>
            
            {/* Billing Toggle */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
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
              <span className={`text-sm font-medium ${billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"}`}>
                Yearly
                <span className="ml-1 rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
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
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`relative overflow-hidden rounded-3xl p-8 ${plan.color} ${
                  plan.popular ? "" : "border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute right-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                    Most Popular
                  </div>
                )}
                
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
                  plan.popular ? "bg-card/10" : "bg-foreground/5"
                }`}>
                  <plan.icon className={`h-7 w-7 ${plan.popular ? "text-card" : "text-foreground"}`} />
                </div>
                
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className={`mt-1 text-sm ${plan.popular ? "text-card/70" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
                
                <div className="mt-6">
                  <span className="text-5xl font-bold">
                    {billingCycle === "yearly" 
                      ? `$${Math.floor(parseInt(plan.price.slice(1)) * 0.8 * 12)}`
                      : plan.price
                    }
                  </span>
                  <span className={`text-lg ${plan.popular ? "text-card/70" : "text-muted-foreground"}`}>
                    /{billingCycle === "yearly" ? "year" : "month"}
                  </span>
                </div>
                
                <Button
                  className={`mt-6 w-full rounded-full ${
                    plan.popular 
                      ? "bg-card text-foreground hover:bg-card/90" 
                      : plan.name === "Professional"
                        ? "bg-accent-foreground text-accent hover:bg-accent-foreground/90"
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
                      <Check className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                        plan.popular ? "text-accent" : "text-accent"
                      }`} />
                      <span className="text-sm">{feature}</span>
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
            <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
              Frequently asked questions
            </h2>
            
            <div className="mx-auto max-w-3xl space-y-4">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <h3 className="font-semibold text-foreground">{faq.question}</h3>
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
