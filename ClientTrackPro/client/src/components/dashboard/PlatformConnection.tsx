"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PlatformIcon, getPlatformColor, getPlatformName } from "@/components/ui/platform-icon"
import { Button } from "@/components/ui/button"
import { Settings, ExternalLink, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { usePlatformStore } from "@/lib/platformStore"
import { useToast } from "@/hooks/use-toast"

const PlatformConnection: React.FC = () => {
  const [openSettings, setOpenSettings] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("general")
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [connectingPlatform, setConnectingPlatform] = useState("")
  const { toast } = useToast()

  // Get connected streaming platforms from the store
  const connectedPlatforms = usePlatformStore((state) => state.getConnectedPlatforms("streaming"))
  const addPlatform = usePlatformStore((state) => state.addPlatform)

  // Available streaming platforms
  const availablePlatforms = [
    { id: "twitch", name: "Twitch" },
    { id: "youtube", name: "YouTube" },
    { id: "facebook", name: "Facebook Gaming" },
    { id: "tiktok", name: "TikTok" },
    { id: "instagram", name: "Instagram" },
    { id: "kick", name: "Kick" },
    { id: "trovo", name: "Trovo" },
  ]

  // Filter out platforms that are already connected
  const unconnectedPlatforms = availablePlatforms.filter(
    (platform) => !connectedPlatforms.some((p) => p.id === platform.id),
  )

  const handleOpenSettings = (platformId: string) => {
    setOpenSettings(platformId)
    setActiveTab("general")
  }

  const handleCloseSettings = () => {
    setOpenSettings(null)
  }

  const handleOpenConnectDialog = () => {
    setShowConnectDialog(true)
  }

  const handleCloseConnectDialog = () => {
    setShowConnectDialog(false)
    setConnectingPlatform("")
  }

  const handleConnectPlatform = () => {
    if (!connectingPlatform) return

    // In a real app, this would initiate OAuth flow
    // For demo, we'll just add the platform to our store
    addPlatform({
      id: connectingPlatform,
      type: "streaming",
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
      case "facebook":
        return {
          title: "Facebook Gaming Settings",
          tabs: ["general", "chat", "alerts", "monetization"],
          fields: {
            general: [
              { id: "page_name", label: "Page Name", type: "text", value: "GamerPro123" },
              { id: "auto_go_live", label: "Auto Go Live", type: "switch", value: false },
              { id: "stream_key", label: "Stream Key", type: "password", value: "••••••••••••••••" },
            ],
            chat: [
              { id: "chat_commands", label: "Enable Chat Commands", type: "switch", value: true },
              { id: "follower_only", label: "Follower-Only Mode", type: "switch", value: false },
              { id: "slow_mode", label: "Slow Mode (seconds)", type: "number", value: 0 },
            ],
            alerts: [
              { id: "follow_alerts", label: "Follow Alerts", type: "switch", value: true },
              { id: "star_alerts", label: "Stars Alerts", type: "switch", value: true },
              { id: "share_alerts", label: "Share Alerts", type: "switch", value: true },
            ],
            monetization: [
              { id: "stars_enabled", label: "Enable Stars", type: "switch", value: true },
              { id: "fan_subs_enabled", label: "Enable Fan Subscriptions", type: "switch", value: false },
              { id: "ads_enabled", label: "Enable Ads", type: "switch", value: false },
            ],
          },
        }
      case "tiktok":
        return {
          title: "TikTok Settings",
          tabs: ["general", "chat", "alerts", "monetization"],
          fields: {
            general: [
              { id: "username", label: "Username", type: "text", value: "GamerPro123" },
              { id: "auto_go_live", label: "Auto Go Live", type: "switch", value: false },
            ],
            chat: [
              { id: "chat_commands", label: "Enable Chat Commands", type: "switch", value: true },
              { id: "keyword_filter", label: "Keyword Filter", type: "switch", value: true },
            ],
            alerts: [
              { id: "follow_alerts", label: "Follow Alerts", type: "switch", value: true },
              { id: "gift_alerts", label: "Gift Alerts", type: "switch", value: true },
              { id: "like_alerts", label: "Like Alerts", type: "switch", value: false },
            ],
            monetization: [
              { id: "gifts_enabled", label: "Enable Gifts", type: "switch", value: true },
              { id: "coins_enabled", label: "Enable Coins", type: "switch", value: true },
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
              { id: "auto_go_live", label: "Auto Go Live", type: "switch", value: false },
            ],
          },
        }
    }
  }

  return (
    <div className="mt-6 mb-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Connected Platforms</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {connectedPlatforms.map((connection) => {
          const platformColor = getPlatformColor(connection.id)

          return (
            <Card key={connection.id} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-md ${platformColor} flex items-center justify-center text-white`}
                    >
                      <PlatformIcon platform={connection.id} size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{getPlatformName(connection.id)}</h4>
                      <p className="text-xs text-muted-foreground">
                        {connection.isPrimary ? "Primary Platform" : "Connected Platform"}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Platform Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleOpenSettings(connection.id)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Channel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Followers</span>
                    <span className="text-foreground font-medium">
                      {connection.followerCount?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {connection.id === "youtube" ? "Members" : "Subscribers"}
                    </span>
                    <span className="text-foreground font-medium">
                      {connection.subscriberCount?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleOpenSettings(connection.id)}
                    >
                      Platform Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Add new platform card */}
        {unconnectedPlatforms.length > 0 && (
          <Card className="border-border border-dashed">
            <CardContent className="p-4 flex flex-col items-center justify-center h-full">
              <div
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3 cursor-pointer"
                onClick={handleOpenConnectDialog}
              >
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <h4 className="font-medium text-foreground mb-1">Connect Platform</h4>
              <p className="text-xs text-muted-foreground text-center mb-3">
                Add another streaming platform to your account
              </p>
              <Button variant="outline" size="sm" onClick={handleOpenConnectDialog}>
                Connect New Platform
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Platform Settings Dialog */}
      {openSettings && (
        <Dialog open={!!openSettings} onOpenChange={handleCloseSettings}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-md ${getPlatformColor(openSettings)} flex items-center justify-center text-white`}
                >
                  <PlatformIcon platform={openSettings} size={18} />
                </div>
                <DialogTitle>{getPlatformSettings(openSettings).title}</DialogTitle>
              </div>
              <DialogDescription>Configure your {getPlatformName(openSettings)} integration settings</DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                {getPlatformSettings(openSettings).tabs.map((tab) => (
                  <TabsTrigger key={tab} value={tab} className="capitalize">
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              {getPlatformSettings(openSettings).tabs.map((tab) => (
                <TabsContent key={tab} value={tab} className="space-y-4">
                  {getPlatformSettings(openSettings).fields[tab].map((field) => (
                    <div key={field.id} className="flex flex-col space-y-2">
                      {field.type === "switch" ? (
                        <div className="flex items-center justify-between">
                          <Label htmlFor={field.id}>{field.label}</Label>
                          <Switch id={field.id} defaultChecked={field.value as boolean} />
                        </div>
                      ) : (
                        <>
                          <Label htmlFor={field.id}>{field.label}</Label>
                          <Input
                            id={field.id}
                            type={field.type}
                            defaultValue={field.value as string | number}
                            className="w-full"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={handleCloseSettings}>
                Cancel
              </Button>
              <Button onClick={handleCloseSettings}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Connect Platform Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Connect New Platform</DialogTitle>
            <DialogDescription>Select a streaming platform to connect to your account</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-4">
            {unconnectedPlatforms.map((platform) => (
              <div
                key={platform.id}
                className={`flex items-center space-x-3 p-3 rounded-md border cursor-pointer transition-colors ${
                  connectingPlatform === platform.id ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
                }`}
                onClick={() => setConnectingPlatform(platform.id)}
              >
                <div
                  className={`w-10 h-10 rounded-md ${getPlatformColor(platform.id)} flex items-center justify-center text-white`}
                >
                  <PlatformIcon platform={platform.id} size={20} />
                </div>
                <span className="font-medium">{platform.name}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCloseConnectDialog}>
              Cancel
            </Button>
            <Button onClick={handleConnectPlatform} disabled={!connectingPlatform}>
              Connect Platform
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PlatformConnection
