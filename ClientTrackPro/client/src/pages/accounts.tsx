"use client"

import React from "react"

import type { FunctionComponent } from "react"
import { useState } from "react"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PlatformIcon, getPlatformColor, getPlatformName } from "@/components/ui/platform-icon"
import { AlertCircle, CreditCard, Plus, Settings, Upload } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { usePlatformStore } from "@/lib/platformStore"
import { useLocation } from "wouter"
import { loadScript } from "@paypal/paypal-js"

// Define the account types
const streamingAccounts = [
  {
    id: 1,
    username: "GamerPro123",
    email: "gamer@example.com",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
    isActive: true,
  },
  {
    id: 2,
    username: "StreamerX",
    email: "streamerx@example.com",
    avatarUrl: "https://i.pravatar.cc/150?img=2",
    isActive: false,
  },
]

// Subscription plans
const subscriptionPlans = [
  {
    id: "free",
    name: "Free",
    description: "Basic streaming for beginners",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Stream to 1 platform",
      "Basic chat functions",
      "View information tracking",
      "Run competitions up to 1 hour",
    ],
  },
  {
    id: "streamer",
    name: "Streamer",
    description: "Perfect for growing streamers",
    monthlyPrice: 15,
    yearlyPrice: 120,
    features: [
      "Stream to 3 platforms",
      "Multi-chat for 3 platforms",
      "Multiple view options",
      "Run competitions up to 1 week",
      "Custom data displays",
      "Advanced analytics",
    ],
  },
  {
    id: "mogul",
    name: "Mogul",
    description: "Full access for professional streamers",
    monthlyPrice: 30,
    yearlyPrice: 300,
    features: [
      "Stream to unlimited platforms",
      "Multi-chat for all platforms",
      "Full customization options",
      "Run competitions of any length",
      "Custom data displays",
      "Advanced analytics",
      "Priority support",
      "Early access to new features",
    ],
  },
]

const AccountsPage: FunctionComponent = () => {
  const [, setLocation] = useLocation()
  const { toast } = useToast()
  const [activeAccount, setActiveAccount] = useState(
    streamingAccounts.find((account) => account.isActive) || streamingAccounts[0],
  )
  const [profileForm, setProfileForm] = useState({
    username: activeAccount.username,
    email: activeAccount.email,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [openSettings, setOpenSettings] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("general")
  const [showConnectDialog, setShowConnectDialog] = useState<string | null>(null)
  const [connectingPlatform, setConnectingPlatform] = useState("")
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [selectedPlan, setSelectedPlan] = useState<string>("streamer") // Default to Streamer for upgrade
  const [paypalLoaded, setPaypalLoaded] = useState(false)
  const [paypalButtonRendered, setPaypalButtonRendered] = useState(false)
  const [loading, setLoading] = useState(false)

  // Current subscription - in a real app, this would come from the user's data
  const [currentSubscription, setCurrentSubscription] = useState({
    plan: "free",
    billingCycle: "monthly",
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: "active",
  })

  // Get platforms from the store
  const streamingPlatforms = usePlatformStore((state) => state.getConnectedPlatforms("streaming"))
  const socialPlatforms = usePlatformStore((state) => state.getConnectedPlatforms("social"))
  const softwarePlatforms = usePlatformStore((state) => state.getConnectedPlatforms("software"))
  const addPlatform = usePlatformStore((state) => state.addPlatform)
  const removePlatform = usePlatformStore((state) => state.removePlatform)
  const isPlatformConnected = usePlatformStore((state) => state.isPlatformConnected)

  // Available platforms
  const availableStreamingPlatforms = [
    { id: "twitch", name: "Twitch" },
    { id: "youtube", name: "YouTube" },
    { id: "facebook", name: "Facebook Gaming" },
    { id: "tiktok", name: "TikTok" },
    { id: "instagram", name: "Instagram" },
    { id: "kick", name: "Kick" },
    { id: "trovo", name: "Trovo" },
  ]

  const availableSoftware = [
    { id: "obs", name: "OBS Studio" },
    { id: "streamlabs", name: "Streamlabs" },
    { id: "xsplit", name: "XSplit" },
    { id: "lightstream", name: "Lightstream" },
    { id: "vmix", name: "vMix" },
  ]

  // Filter out platforms that are already connected
  const unconnectedStreamingPlatforms = availableStreamingPlatforms.filter(
    (platform) => !isPlatformConnected(platform.id),
  )

  const unconnectedSoftware = availableSoftware.filter((software) => !isPlatformConnected(software.id))

  // Load PayPal when upgrade dialog is opened
  React.useEffect(() => {
    if (showUpgradeDialog && !paypalLoaded) {
      loadScript({
        "client-id": "AYJz-bsyMtMaRUYzMEVSc_5XFkge3tIHS6yoe3rAlNvH8PCQfp5I8ihBZ5kR2460_izvZSvMHcff1aHe",
        currency: "USD",
      }).then((paypal) => {
        if (paypal) {
          setPaypalLoaded(true)
        }
      })
    }
  }, [showUpgradeDialog, paypalLoaded])

  // Render PayPal buttons when loaded
  React.useEffect(() => {
    if (paypalLoaded && showUpgradeDialog && !paypalButtonRendered) {
      const selectedPlanDetails = subscriptionPlans.find((plan) => plan.id === selectedPlan)
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

              // Update subscription
              setCurrentSubscription({
                plan: selectedPlan,
                billingCycle: billingCycle,
                nextBillingDate: new Date(Date.now() + (billingCycle === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000),
                status: "active",
              })

              toast({
                title: "Subscription updated",
                description: `You have successfully subscribed to the ${selectedPlanDetails.name} plan.`,
              })

              setShowUpgradeDialog(false)
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
  }, [paypalLoaded, selectedPlan, billingCycle, paypalButtonRendered, showUpgradeDialog, toast])

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate passwords match if changing password
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your new passwords match.",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would call an API to update the profile
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    })
  }

  const handleOpenConnectDialog = (type: string) => {
    setShowConnectDialog(type)
  }

  const handleCloseConnectDialog = () => {
    setShowConnectDialog(null)
    setConnectingPlatform("")
  }

  const handleConnectPlatform = () => {
    if (!connectingPlatform || !showConnectDialog) return

    // In a real app, this would initiate OAuth flow
    // For demo, we'll just add the platform to our store
    addPlatform({
      id: connectingPlatform,
      type: showConnectDialog === "streaming" ? "streaming" : showConnectDialog === "software" ? "software" : "social",
      username: "NewUser123",
      isPrimary: false,
      followerCount: 0,
      subscriberCount: 0,
    })

    toast({
      title: "Platform connected",
      description: `${getPlatformName(connectingPlatform)} has been connected successfully.`,
    })

    handleCloseConnectDialog()
  }

  const handleDisconnectPlatform = (platformId: string) => {
    removePlatform(platformId)

    toast({
      title: "Platform disconnected",
      description: `${getPlatformName(platformId)} has been disconnected.`,
      variant: "destructive",
    })
  }

  const handleSwitchAccount = (accountId: number) => {
    // In a real app, this would switch the active account
    setActiveAccount(streamingAccounts.find((account) => account.id === accountId) || activeAccount)
    toast({
      title: "Account switched",
      description: "You've switched to a different streaming account.",
    })
  }

  const handleAddAccount = () => {
    // In a real app, this would open a registration/login flow
    toast({
      title: "Add account",
      description: "Opening account creation flow...",
    })
  }

  const handleOpenSettings = (platformId: string) => {
    setOpenSettings(platformId)
    setActiveTab("general")
  }

  const handleCloseSettings = () => {
    setOpenSettings(null)
  }

  const handleOpenUpgradeDialog = () => {
    setShowUpgradeDialog(true)
    setPaypalButtonRendered(false)
  }

  const handleCloseUpgradeDialog = () => {
    setShowUpgradeDialog(false)
  }

  const handleCancelSubscription = () => {
    // In a real app, this would call an API to cancel the subscription
    toast({
      title: "Subscription cancelled",
      description: "Your subscription has been cancelled. You will have access until the end of your billing period.",
    })

    setCurrentSubscription({
      ...currentSubscription,
      status: "cancelled",
    })
  }

  const getPlatformSettings = (platform: string) => {
    switch (platform) {
      case "twitch":
        return {
          title: "Twitch Settings",
          tabs: ["general", "chat", "alerts", "monetization"],
          fields: {
            general: [
              { id: "channel_name", label: "Channel Name", type: "text", value: "GamerPro123" },
              { id: "auto_go_live", label: "Auto Go Live", type: "switch", value: true },
              { id: "stream_key", label: "Stream Key", type: "password", value: "••••••••••••••••" },
            ],
            chat: [
              { id: "chat_commands", label: "Enable Chat Commands", type: "switch", value: true },
              { id: "follower_only", label: "Follower-Only Mode", type: "switch", value: false },
              { id: "slow_mode", label: "Slow Mode (seconds)", type: "number", value: 0 },
            ],
            alerts: [
              { id: "follow_alerts", label: "Follow Alerts", type: "switch", value: true },
              { id: "sub_alerts", label: "Subscription Alerts", type: "switch", value: true },
              { id: "bits_alerts", label: "Bits Alerts", type: "switch", value: true },
            ],
            monetization: [
              { id: "bits_enabled", label: "Enable Bits", type: "switch", value: true },
              { id: "subs_enabled", label: "Enable Subscriptions", type: "switch", value: true },
              { id: "ads_enabled", label: "Enable Ads", type: "switch", value: false },
            ],
          },
        }
      case "youtube":
        return {
          title: "YouTube Settings",
          tabs: ["general", "chat", "alerts", "monetization"],
          fields: {
            general: [
              { id: "channel_name", label: "Channel Name", type: "text", value: "GamerPro123" },
              { id: "auto_go_live", label: "Auto Go Live", type: "switch", value: true },
              { id: "stream_key", label: "Stream Key", type: "password", value: "••••••••••••••••" },
            ],
            chat: [
              { id: "chat_commands", label: "Enable Chat Commands", type: "switch", value: true },
              { id: "members_only", label: "Members-Only Mode", type: "switch", value: false },
              { id: "slow_mode", label: "Slow Mode (seconds)", type: "number", value: 0 },
            ],
            alerts: [
              { id: "subscriber_alerts", label: "Subscriber Alerts", type: "switch", value: true },
              { id: "member_alerts", label: "Member Alerts", type: "switch", value: true },
              { id: "superchat_alerts", label: "Super Chat Alerts", type: "switch", value: true },
            ],
            monetization: [
              { id: "superchat_enabled", label: "Enable Super Chat", type: "switch", value: true },
              { id: "memberships_enabled", label: "Enable Memberships", type: "switch", value: true },
              { id: "ads_enabled", label: "Enable Ads", type: "switch", value: true },
            ],
          },
        }
      case "obs":
        return {
          title: "OBS Studio Settings",
          tabs: ["general", "connection", "recording"],
          fields: {
            general: [
              { id: "version", label: "OBS Version", type: "text", value: "29.1.3", disabled: true },
              { id: "auto_connect", label: "Auto Connect", type: "switch", value: true },
            ],
            connection: [
              { id: "websocket_url", label: "WebSocket URL", type: "text", value: "ws://localhost:4455" },
              { id: "password", label: "WebSocket Password", type: "password", value: "••••••••••••••••" },
            ],
            recording: [
              { id: "auto_record", label: "Auto Record When Streaming", type: "switch", value: true },
              { id: "recording_quality", label: "Recording Quality", type: "text", value: "Same as stream" },
            ],
          },
        }
      case "streamlabs":
        return {
          title: "Streamlabs Settings",
          tabs: ["general", "connection", "alerts"],
          fields: {
            general: [{ id: "auto_connect", label: "Auto Connect", type: "switch", value: false }],
            connection: [
              { id: "api_key", label: "API Key", type: "password", value: "" },
              { id: "socket_token", label: "Socket Token", type: "password", value: "" },
            ],
            alerts: [
              { id: "use_streamlabs_alerts", label: "Use Streamlabs Alerts", type: "switch", value: false },
              { id: "alert_box_url", label: "Alert Box URL", type: "text", value: "" },
            ],
          },
        }
      default:
        return {
          title: `${getPlatformName(platform)} Settings`,
          tabs: ["general"],
          fields: {
            general: [
              { id: "username", label: "Username", type: "text", value: "GamerPro123" },
              { id: "auto_connect", label: "Auto Connect", type: "switch", value: false },
            ],
          },
        }
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    }).format(price)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const getCurrentPlan = () => {
    return subscriptionPlans.find((plan) => plan.id === currentSubscription.plan) || subscriptionPlans[0]
  }

  // Check if user can connect more platforms based on subscription
  const canConnectMorePlatforms = () => {
    if (currentSubscription.plan === "mogul") return true
    if (currentSubscription.plan === "streamer") return streamingPlatforms.length < 3
    return streamingPlatforms.length < 1
  }

  return (
    <DashboardLayout title="Accounts" subtitle="Manage your profile and connected accounts">
      {/* Subscription banner for free users */}
      {currentSubscription.plan === "free" && (
        <Alert className="mb-6 bg-primary/10 border-primary">
          <AlertTitle className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            Upgrade your account to unlock more features
          </AlertTitle>
          <AlertDescription className="flex justify-between items-center mt-2">
            <span>Stream to multiple platforms, access advanced analytics, and run longer competitions.</span>
            <Button onClick={handleOpenUpgradeDialog}>Upgrade Now</Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="flex items-center space-x-4 mb-6">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={activeAccount.avatarUrl || "/placeholder.svg"} alt={activeAccount.username} />
                      <AvatarFallback>{activeAccount.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Button size="sm" variant="outline" className="mb-2">
                        <Upload className="mr-2 h-4 w-4" />
                        Change Avatar
                      </Button>
                      <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size 2MB.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    />
                  </div>

                  <Button type="submit">Save Changes</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Update your password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={profileForm.currentPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={profileForm.newPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={profileForm.confirmPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                    />
                  </div>

                  <Button type="submit">Update Password</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive email notifications about your account</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Desktop Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive desktop notifications when events occur</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-muted-foreground">Receive emails about new features and offers</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Streaming Platforms</CardTitle>
                <CardDescription>Connect your streaming platform accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {streamingPlatforms.map((platform) => (
                    <div key={platform.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-md ${getPlatformColor(platform.id)} flex items-center justify-center text-white`}
                        >
                          <PlatformIcon platform={platform.id} size={20} />
                        </div>
                        <div>
                          <p className="font-medium">{getPlatformName(platform.id)}</p>
                          <p className="text-xs text-muted-foreground">Connected as {platform.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleOpenSettings(platform.id)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDisconnectPlatform(platform.id)}>
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Add new platform option */}
                  {unconnectedStreamingPlatforms.length > 0 && canConnectMorePlatforms() ? (
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => handleOpenConnectDialog("streaming")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Connect New Platform
                    </Button>
                  ) : !canConnectMorePlatforms() ? (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your current plan allows for {currentSubscription.plan === "free" ? "1" : "3"} streaming
                        platforms.{" "}
                        <Button variant="link" className="p-0 h-auto" onClick={handleOpenUpgradeDialog}>
                          Upgrade your plan
                        </Button>{" "}
                        to connect more.
                      </AlertDescription>
                    </Alert>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Streaming Software</CardTitle>
                <CardDescription>Connect your streaming software</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {softwarePlatforms.map((software) => (
                    <div key={software.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center`}>
                          <PlatformIcon platform={software.id} size={20} />
                        </div>
                        <div>
                          <p className="font-medium">{getPlatformName(software.id)}</p>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            Connected
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleOpenSettings(software.id)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDisconnectPlatform(software.id)}>
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Add new software option */}
                  {unconnectedSoftware.length > 0 && (
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => handleOpenConnectDialog("software")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Connect New Software
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>API Access</CardTitle>
                <CardDescription>Manage API keys and webhooks</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Keep your API keys secure. Do not share them with others or expose them in client-side code.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">StreamMasterPro API</p>
                      <p className="text-sm text-muted-foreground">Access your data programmatically</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Generate Key
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Webhooks</p>
                      <p className="text-sm text-muted-foreground">Receive event notifications</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>Manage your subscription plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{getCurrentPlan().name} Plan</h3>
                      <p className="text-sm text-muted-foreground">{getCurrentPlan().description}</p>
                    </div>
                    <Badge className={currentSubscription.plan === "free" ? "bg-gray-500" : "bg-primary"}>
                      {currentSubscription.status === "active" ? "Active" : "Cancelled"}
                    </Badge>
                  </div>

                  {currentSubscription.plan !== "free" && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Billing Cycle:</span>
                          <span>{currentSubscription.billingCycle === "monthly" ? "Monthly" : "Yearly"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Next Billing Date:</span>
                          <span>{formatDate(currentSubscription.nextBillingDate)}</span>
                        </div>
                      </div>
                      <Button variant="destructive" onClick={handleCancelSubscription}>
                        Cancel Subscription
                      </Button>
                    </>
                  )}

                  {currentSubscription.plan === "free" && (
                    <Button onClick={handleOpenUpgradeDialog}>Upgrade Now</Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upgrade Plan</CardTitle>
                <CardDescription>Choose a plan that suits your needs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button
                    variant={billingCycle === "monthly" ? "default" : "outline"}
                    onClick={() => setBillingCycle("monthly")}
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={billingCycle === "yearly" ? "default" : "outline"}
                    onClick={() => setBillingCycle("yearly")}
                  >
                    Yearly
                  </Button>
                </div>

                {subscriptionPlans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`border-2 ${selectedPlan === plan.id ? "border-primary" : "border-transparent"} hover:border-primary cursor-pointer`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-4xl font-bold">
                        {billingCycle === "monthly" ? formatPrice(plan.monthlyPrice) : formatPrice(plan.yearlyPrice)}
                        <span className="text-sm text-muted-foreground">
                          /{billingCycle === "monthly" ? "month" : "year"}
                        </span>
                      </div>
                      <ul className="list-disc pl-5 space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </CardContent>
                    {currentSubscription.plan === plan.id && (
                      <CardFooter>
                        <Badge variant="secondary">Current Plan</Badge>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </CardContent>
              <CardFooter>
                <div className="w-full flex justify-center">
                  <div id="paypal-button-container" className="w-full max-w-sm"></div>
                </div>
                {loading && (
                  <div className="w-full flex justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing Payment...
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Connect Platform Dialog */}
      <Dialog open={!!showConnectDialog} onOpenChange={() => handleCloseConnectDialog()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Connect New{" "}
              {showConnectDialog === "streaming"
                ? "Streaming"
                : showConnectDialog === "software"
                  ? "Software"
                  : "Social"}{" "}
              Platform
            </DialogTitle>
            <DialogDescription>Choose the platform you want to connect to your account.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="platform">Platform</Label>
              <select
                id="platform"
                className="col-span-3 rounded-md border border-gray-200 px-2 py-1 shadow-sm focus:border-primary focus:ring-primary"
                value={connectingPlatform}
                onChange={(e) => setConnectingPlatform(e.target.value)}
              >
                <option value="">Select a platform</option>
                {(showConnectDialog === "streaming" ? unconnectedStreamingPlatforms : unconnectedSoftware).map(
                  (platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
          <Button type="submit" onClick={handleConnectPlatform}>
            Connect Platform
          </Button>
        </DialogContent>
      </Dialog>

      {/* Platform Settings Dialog */}
      <Dialog open={!!openSettings} onOpenChange={() => handleCloseSettings()}>
        <DialogContent className="sm:max-w-[600px]">
          {openSettings && (
            <>
              <DialogHeader>
                <DialogTitle>{getPlatformSettings(openSettings).title}</DialogTitle>
                <DialogDescription>Manage your {getPlatformName(openSettings)} settings.</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                  {getPlatformSettings(openSettings).tabs.map((tab) => (
                    <TabsTrigger key={tab} value={tab} onClick={() => setActiveTab(tab)}>
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {getPlatformSettings(openSettings).tabs.map((tab) => (
                  <TabsContent key={tab} value={tab}>
                    <div className="grid gap-4 py-4">
                      {getPlatformSettings(openSettings).fields[tab].map((field) => (
                        <div key={field.id} className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor={field.id}>{field.label}</Label>
                          {field.type === "text" && (
                            <Input
                              id={field.id}
                              className="col-span-3"
                              type="text"
                              defaultValue={field.value}
                              disabled={field.disabled}
                            />
                          )}
                          {field.type === "password" && (
                            <Input
                              id={field.id}
                              className="col-span-3"
                              type="password"
                              defaultValue={field.value}
                              disabled={field.disabled}
                            />
                          )}
                          {field.type === "number" && (
                            <Input
                              id={field.id}
                              className="col-span-3"
                              type="number"
                              defaultValue={field.value}
                              disabled={field.disabled}
                            />
                          )}
                          {field.type === "switch" && <Switch id={field.id} defaultChecked={field.value} />}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              <Button type="submit">Save Changes</Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Upgrade Plan Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={handleCloseUpgradeDialog}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
            <DialogDescription>Choose the plan that best suits your streaming needs.</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="plans" className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="plans">Choose Plan</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
            </TabsList>
            <TabsContent value="plans">
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button
                    variant={billingCycle === "monthly" ? "default" : "outline"}
                    onClick={() => setBillingCycle("monthly")}
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={billingCycle === "yearly" ? "default" : "outline"}
                    onClick={() => setBillingCycle("yearly")}
                  >
                    Yearly
                  </Button>
                </div>

                {subscriptionPlans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`border-2 ${selectedPlan === plan.id ? "border-primary" : "border-transparent"} hover:border-primary cursor-pointer`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-4xl font-bold">
                        {billingCycle === "monthly" ? formatPrice(plan.monthlyPrice) : formatPrice(plan.yearlyPrice)}
                        <span className="text-sm text-muted-foreground">
                          /{billingCycle === "monthly" ? "month" : "year"}
                        </span>
                      </div>
                      <ul className="list-disc pl-5 space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </CardContent>
                    {currentSubscription.plan === plan.id && (
                      <CardFooter>
                        <Badge variant="secondary">Current Plan</Badge>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </CardContent>
            </TabsContent>
            <TabsContent value="payment">
              <CardContent className="space-y-4">
                <p>Choose your payment method:</p>
                <div id="paypal-button-container"></div>
                {loading && <p>Processing payment...</p>}
              </CardContent>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

export default AccountsPage
