"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useSubscriptionStore, type SubscriptionTier } from "../../lib/subscriptionStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PlanFeature {
  name: string
  included: boolean
  highlight?: boolean
}

interface Plan {
  name: string
  tier: SubscriptionTier
  monthlyPrice: number
  yearlyPrice: number
  features: PlanFeature[]
  highlight?: boolean
}

export const SubscriptionPlans: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [isProcessing, setIsProcessing] = useState(false)
  const { user, updateSubscription } = useAuth()
  const { setSubscription } = useSubscriptionStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const plans: Plan[] = [
    {
      name: "Free",
      tier: "free",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        { name: "Stream to 1 platform", included: true },
        { name: "Chat functions for 1 channel", included: true },
        { name: "View information tracking", included: true },
        { name: "Run competitions up to 1 hour", included: true },
        { name: "Custom data displays", included: false },
        { name: "Extended competitions", included: false },
      ],
    },
    {
      name: "Streamer",
      tier: "streamer",
      monthlyPrice: 15,
      yearlyPrice: 120,
      features: [
        { name: "Stream to 3 platforms", included: true, highlight: true },
        { name: "Multi-chat for 3 platforms", included: true, highlight: true },
        { name: "View information tracking", included: true },
        { name: "Custom data displays", included: true, highlight: true },
        { name: "Run competitions up to 1 week", included: true, highlight: true },
        { name: "Custom length competitions", included: false },
      ],
      highlight: true,
    },
    {
      name: "Mogul",
      tier: "mogul",
      monthlyPrice: 30,
      yearlyPrice: 300,
      features: [
        { name: "Stream to unlimited platforms", included: true, highlight: true },
        { name: "Multi-chat for all platforms", included: true, highlight: true },
        { name: "View information tracking", included: true },
        { name: "Custom data displays", included: true },
        { name: "Run competitions up to 1 month", included: true, highlight: true },
        { name: "Custom length competitions", included: true, highlight: true },
      ],
    },
  ]

  const handleSubscribe = async (plan: Plan) => {
    if (!user?.isVerified) {
      toast({
        title: "Email not verified",
        description: "Please verify your email before subscribing",
        variant: "destructive",
      })
      return
    }

    if (plan.tier === "free") {
      try {
        await updateSubscription("free", false)
        setSubscription("free", null, false)
        toast({
          title: "Subscription updated",
          description: "You are now on the Free plan",
        })
        navigate("/accounts")
      } catch (error) {
        console.error("Failed to update subscription:", error)
        toast({
          title: "Failed to update subscription",
          description: "Please try again later",
          variant: "destructive",
        })
      }
      return
    }

    setIsProcessing(true)

    try {
      // In a real app, this would initiate the PayPal payment flow
      // For demo purposes, we'll simulate a successful payment

      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const isYearly = billingCycle === "yearly"
      const now = new Date()
      const expiryDate = new Date(now)

      if (isYearly) {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1)
      } else {
        expiryDate.setMonth(expiryDate.getMonth() + 1)
      }

      await updateSubscription(plan.tier, isYearly)
      setSubscription(plan.tier, expiryDate, isYearly)

      toast({
        title: "Subscription successful",
        description: `You are now subscribed to the ${plan.name} plan`,
      })

      navigate("/accounts")
    } catch (error) {
      console.error("Payment failed:", error)
      toast({
        title: "Payment failed",
        description: "There was an issue processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getPrice = (plan: Plan) => {
    return billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice
  }

  const getSavings = (plan: Plan) => {
    if (billingCycle === "yearly" && plan.monthlyPrice > 0) {
      const monthlyCost = plan.monthlyPrice * 12
      const yearlyCost = plan.yearlyPrice
      const savings = monthlyCost - yearlyCost
      const savingsPercentage = Math.round((savings / monthlyCost) * 100)
      return savingsPercentage
    }
    return 0
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-muted-foreground">Select the plan that best fits your streaming needs</p>
      </div>

      <div className="flex justify-center mb-8">
        <Tabs
          defaultValue="monthly"
          value={billingCycle}
          onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")}
          className="w-[400px]"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly (Save up to 20%)</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col ${plan.highlight ? "border-primary shadow-lg" : ""}`}>
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>
                {plan.tier === "free"
                  ? "Basic streaming capabilities"
                  : plan.tier === "streamer"
                    ? "For dedicated streamers"
                    : "For professional streamers"}
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">${getPrice(plan)}</span>
                {plan.tier !== "free" && (
                  <span className="text-muted-foreground">/{billingCycle === "monthly" ? "month" : "year"}</span>
                )}

                {getSavings(plan) > 0 && (
                  <div className="mt-2 inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Save {getSavings(plan)}%
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    {feature.included ? (
                      <Check className={`h-5 w-5 mr-2 ${feature.highlight ? "text-primary" : "text-green-500"}`} />
                    ) : (
                      <div className="h-5 w-5 mr-2 flex items-center justify-center">
                        <div className="h-1 w-1 bg-muted-foreground rounded-full" />
                      </div>
                    )}
                    <span className={feature.highlight ? "font-medium" : ""}>{feature.name}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSubscribe(plan)}
                className="w-full"
                variant={plan.highlight ? "default" : "outline"}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : plan.tier === "free" ? "Select Plan" : "Subscribe"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
