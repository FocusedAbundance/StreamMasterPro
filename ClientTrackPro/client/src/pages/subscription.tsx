"use client"

import { useState, useEffect } from "react"
import { useLocation } from "wouter"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Check, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { loadScript } from "@paypal/paypal-js"
import { Badge } from "@/components/ui/badge"

interface PlanFeature {
  name: string
  included: boolean
}

interface Plan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  features: PlanFeature[]
  badge?: string
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "Basic streaming for beginners",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { name: "Stream to 1 platform", included: true },
      { name: "Basic chat functions", included: true },
      { name: "View information tracking", included: true },
      { name: "Run competitions up to 1 hour", included: true },
      { name: "Multi-platform streaming", included: false },
      { name: "Multi-chat functionality", included: false },
      { name: "Custom data displays", included: false },
      { name: "Extended competitions", included: false },
    ],
  },
  {
    id: "streamer",
    name: "Streamer",
    description: "Perfect for growing streamers",
    monthlyPrice: 15,
    yearlyPrice: 120,
    features: [
      { name: "Stream to 3 platforms", included: true },
      { name: "Multi-chat for 3 platforms", included: true },
      { name: "Multiple view options", included: true },
      { name: "Run competitions up to 1 week", included: true },
      { name: "Custom data displays", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Custom length competitions", included: false },
      { name: "1-month long competitions", included: false },
    ],
    badge: "Popular",
  },
  {
    id: "mogul",
    name: "Mogul",
    description: "Full access for professional streamers",
    monthlyPrice: 30,
    yearlyPrice: 300,
    features: [
      { name: "Stream to unlimited platforms", included: true },
      { name: "Multi-chat for all platforms", included: true },
      { name: "Full customization options", included: true },
      { name: "Run competitions of any length", included: true },
      { name: "Custom data displays", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Priority support", included: true },
      { name: "Early access to new features", included: true },
    ],
  },
]

export default function SubscriptionPage() {
  const [, setLocation] = useLocation()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [paypalLoaded, setPaypalLoaded] = useState(false)
  const [paypalButtonRendered, setPaypalButtonRendered] = useState(false)

  useEffect(() => {
    if (selectedPlan && selectedPlan !== "free" && !paypalLoaded) {
      loadScript({
        "client-id": "AYJz-bsyMtMaRUYzMEVSc_5XFkge3tIHS6yoe3rAlNvH8PCQfp5I8ihBZ5kR2460_izvZSvMHcff1aHe",
        currency: "USD",
      }).then((paypal) => {
        if (paypal) {
          setPaypalLoaded(true)
        }
      })
    }
  }, [selectedPlan, paypalLoaded])

  useEffect(() => {
    if (paypalLoaded && selectedPlan && selectedPlan !== "free" && !paypalButtonRendered) {
      const selectedPlanDetails = plans.find((plan) => plan.id === selectedPlan)
      if (!selectedPlanDetails) return

      const amount = billingCycle === "monthly" ? selectedPlanDetails.monthlyPrice : selectedPlanDetails.yearlyPrice

      // @ts-ignore - PayPal types are not available
      window.paypal
        ?.Buttons({
          style: {
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "pay",
          },
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [
                {
                  description: `StreamMasterPro ${selectedPlanDetails.name} Plan (${billingCycle})`,
                  amount: {
                    value: amount.toString(),
                    breakdown: {
                      item_total: {
                        currency_code: "USD",
                        value: amount.toString(),
                      },
                    },
                  },
                  payee: {
                    email: "cognizansthenextlevel@gmail.com",
                    business_name: "Cognizans - The Next Level",
                  },
                },
              ],
            })
          },
          onApprove: async (data: any, actions: any) => {
            setLoading(true)
            try {
              const order = await actions.order.capture()

              // In a real app, this would call an API endpoint to update the user's subscription
              await new Promise((resolve) => setTimeout(resolve, 1000))

              toast({
                title: "Subscription successful",
                description: `You have successfully subscribed to the ${selectedPlanDetails.name} plan.`,
              })

              // Redirect to dashboard
              setLocation("/")
            } catch (error) {
              toast({
                title: "Payment failed",
                description: "There was an error processing your payment. Please try again.",
                variant: "destructive",
              })
            } finally {
              setLoading(false)
            }
          },
        })
        .render("#paypal-button-container")

      setPaypalButtonRendered(true)
    }
  }, [paypalLoaded, selectedPlan, billingCycle, paypalButtonRendered, setLocation, toast])

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
    setPaypalButtonRendered(false)

    if (planId === "free") {
      setLoading(true)

      // In a real app, this would call an API endpoint to update the user's subscription
      setTimeout(() => {
        toast({
          title: "Free plan selected",
          description: "You have successfully signed up for the Free plan.",
        })

        // Redirect to dashboard
        setLocation("/")
        setLoading(false)
      }, 1500)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    }).format(price)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-6xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Choose Your Plan</h1>
          <p className="text-muted-foreground">Select the plan that best fits your streaming needs</p>
        </div>

        <Tabs
          defaultValue="monthly"
          className="w-full"
          onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")}
        >
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly (Save up to 20%)</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="monthly" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative ${selectedPlan === plan.id ? "border-primary ring-2 ring-primary" : ""}`}
                >
                  {plan.badge && <Badge className="absolute top-4 right-4 bg-primary">{plan.badge}</Badge>}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">{formatPrice(plan.monthlyPrice)}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          {feature.included ? (
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                          ) : (
                            <div className="mr-2 h-4 w-4 rounded-full border border-muted-foreground" />
                          )}
                          <span className={feature.included ? "" : "text-muted-foreground"}>{feature.name}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={selectedPlan === plan.id ? "default" : "outline"}
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={loading}
                    >
                      {selectedPlan === plan.id && plan.id === "free" && loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : selectedPlan === plan.id ? (
                        "Selected"
                      ) : (
                        "Select Plan"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {selectedPlan && selectedPlan !== "free" && (
              <Card>
                <CardHeader>
                  <CardTitle>Complete Your Subscription</CardTitle>
                  <CardDescription>
                    You've selected the {plans.find((p) => p.id === selectedPlan)?.name} plan at{" "}
                    {formatPrice(plans.find((p) => p.id === selectedPlan)?.monthlyPrice || 0)} per month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div id="paypal-button-container" className="min-h-[150px]"></div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="yearly" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative ${selectedPlan === plan.id ? "border-primary ring-2 ring-primary" : ""}`}
                >
                  {plan.badge && <Badge className="absolute top-4 right-4 bg-primary">{plan.badge}</Badge>}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">{formatPrice(plan.yearlyPrice)}</span>
                      <span className="text-muted-foreground">/year</span>
                      {plan.yearlyPrice > 0 && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatPrice(plan.yearlyPrice / 12)}/month billed annually
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          {feature.included ? (
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                          ) : (
                            <div className="mr-2 h-4 w-4 rounded-full border border-muted-foreground" />
                          )}
                          <span className={feature.included ? "" : "text-muted-foreground"}>{feature.name}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={selectedPlan === plan.id ? "default" : "outline"}
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={loading}
                    >
                      {selectedPlan === plan.id && plan.id === "free" && loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : selectedPlan === plan.id ? (
                        "Selected"
                      ) : (
                        "Select Plan"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {selectedPlan && selectedPlan !== "free" && (
              <Card>
                <CardHeader>
                  <CardTitle>Complete Your Subscription</CardTitle>
                  <CardDescription>
                    You've selected the {plans.find((p) => p.id === selectedPlan)?.name} plan at{" "}
                    {formatPrice(plans.find((p) => p.id === selectedPlan)?.yearlyPrice || 0)} per year.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div id="paypal-button-container" className="min-h-[150px]"></div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
