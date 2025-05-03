"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlatformIcon, getPlatformColor, getPlatformName } from "@/components/ui/platform-icon"
import { Plus, Share, Settings } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { usePlatformStore } from "@/lib/platformStore"
import { useToast } from "@/hooks/use-toast"

const SocialMedia: React.FC = () => {
  const [openSettings, setOpenSettings] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("general")
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [connectingPlatform, setConnectingPlatform] = useState("")
  const { toast } = useToast()

  // Get connected social platforms from the store
  const connectedPlatforms = usePlatformStore((state) => state.getConnectedPlatforms("social"))
  const addPlatform = usePlatformStore((state) => state.addPlatform)
  const removePlatform = usePlatformStore((state) => state.removePlatform)

  // Available social platforms
  const availablePlatforms = [
    { id: "instagram", name: "Instagram" },
    { id: "twitter", name: "Twitter" },
    { id: "discord", name: "Discord" },
    { id: "tiktok", name: "TikTok" },
    { id: "linkedin", name: "LinkedIn" },
    { id: "reddit", name: "Reddit" },
    { id: "snapchat", name: "Snapchat" },
    { id: "pinterest", name: "Pinterest" },
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
      type: "social",
      username: "GamerPro123",
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

  const getPlatformSettings = (platform: string) => {
    switch (platform) {
      case "instagram":
        return {
          title: "Instagram Settings",
          tabs: ["general", "posting", "notifications"],
          fields: {
            general: [
              { id: "username", label: "Username", type: "text", value: "GamerPro123" },
              { id: "auto_share", label: "Auto Share Streams", type: "switch", value: true },
            ],
            posting: [
              { id: "post_clips", label: "Auto Post Clips", type: "switch", value: true },
              { id: "post_schedule", label: "Post Stream Schedule", type: "switch", value: true },
              { id: "hashtags", label: "Default Hashtags", type: "text", value: "#gaming #livestream #gamer" },
            ],
            notifications: [
              { id: "notify_comments", label: "Comment Notifications", type: "switch", value: true },
              { id: "notify_messages", label: "Message Notifications", type: "switch", value: false },
            ],
          },
        }
      case "twitter":
        return {
          title: "Twitter Settings",
          tabs: ["general", "posting", "notifications"],
          fields: {
            general: [
              { id: "username", label: "Username", type: "text", value: "GamerPro123" },
              { id: "auto_tweet", label: "Auto Tweet Streams", type: "switch", value: true },
            ],
            posting: [
              { id: "tweet_clips", label: "Auto Tweet Clips", type: "switch", value: true },
              { id: "tweet_schedule", label: "Tweet Stream Schedule", type: "switch", value: true },
              { id: "hashtags", label: "Default Hashtags", type: "text", value: "#gaming #livestream #gamer" },
            ],
            notifications: [
              { id: "notify_mentions", label: "Mention Notifications", type: "switch", value: true },
              { id: "notify_dms", label: "DM Notifications", type: "switch", value: false },
            ],
          },
        }
      case "discord":
        return {
          title: "Discord Settings",
          tabs: ["general", "notifications", "webhooks"],
          fields: {
            general: [
              { id: "server_name", label: "Server Name", type: "text", value: "GamerPro123's Server" },
              { id: "auto_announce", label: "Auto Announce Streams", type: "switch", value: true },
            ],
            notifications: [
              { id: "notify_mentions", label: "Mention Notifications", type: "switch", value: true },
              { id: "notify_dms", label: "DM Notifications", type: "switch", value: true },
            ],
            webhooks: [
              {
                id: "stream_webhook",
                label: "Stream Announcements Webhook",
                type: "text",
                value: "https://discord.com/api/webhooks/...",
              },
              { id: "clips_webhook", label: "Clips Webhook", type: "text", value: "" },
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
              { id: "auto_share", label: "Auto Share Content", type: "switch", value: false },
            ],
          },
        }
    }
  }

  return (
    <Card className="border-border overflow-hidden mb-6">
      <CardHeader className="p-4 border-b border-border">
        <CardTitle className="font-medium text-foreground">Social Media Integration</CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {connectedPlatforms.map(
            (platform) =>
              (
                <div
              key={platform.id}
              className="bg-muted p-4 rounded-lg flex flex-col items-center space-y-2 hover:bg-accent transition-colors"
            >
              <div
                className={`w-12 h-12 rounded-full ${getPlatformColor(platform.id)} flex items-center justify-center text-white`
              >
                <PlatformIcon platform={platform.id} size={20} />\
              </div>
              <span className="text-sm font-medium text-foreground">{getPlatformName(platform.id)}</span>
              <div className="flex space-x-1">
                <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-500">Connected</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenSettings(platform.id)
                  }}
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </div>
              ),
          )}

          {/* Add new platform card */}
          {unconnectedPlatforms.length > 0 && (
            <div
              className="bg-muted p-4 rounded-lg flex flex-col items-center space-y-2 hover:bg-accent transition-colors cursor-pointer"
              onClick={handleOpenConnectDialog}
            >
              <div className="w-12 h-12 rounded-full bg-muted-foreground/20 flex items-center justify-center text-muted-foreground">
                <Plus size={20} />
              </div>
              <span className="text-sm font-medium text-foreground">Add Platform</span>
              <span className="text-xs text-muted-foreground">Connect New</span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <Button className="flex items-center space-x-2">
            <Share size={16} />
            <span>Auto-Share Stream</span>
          </Button>
        </div>
      </CardContent>

      {/* Social Media Settings Dialog */}
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
              <TabsList className="grid grid-cols-3 mb-4">
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

            <div className="flex justify-between space-x-2 mt-4">
              <Button
                variant="destructive"
                onClick={() => {
                  handleDisconnectPlatform(openSettings)
                  handleCloseSettings()
                }}
              >
                Disconnect
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleCloseSettings}>
                  Cancel
                </Button>
                <Button onClick={handleCloseSettings}>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Connect Platform Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Connect Social Platform</DialogTitle>
            <DialogDescription>Select a social media platform to connect to your account</DialogDescription>
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
    </Card>
  )
}

export default SocialMedia
