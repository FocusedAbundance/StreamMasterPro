"use client"

import type React from "react"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import ActivityFeed from "@/components/dashboard/ActivityFeed"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useWebSocketStore } from "@/lib/websocket"
import { useTwitchApi, useYouTubeApi, useFacebookApi } from "@/lib/platformApis"
import { Bell, Volume2, Edit2, Play, Image, Palette } from "lucide-react"

const AlertsPage: React.FC = () => {
  const connectWebsocket = useWebSocketStore((state) => state.connect)
  const authenticate = useWebSocketStore((state) => state.authenticate)
  const connected = useWebSocketStore((state) => state.connected)

  const [selectedAlertType, setSelectedAlertType] = useState("followers")

  const twitchApi = useTwitchApi()
  const youtubeApi = useYouTubeApi()
  const facebookApi = useFacebookApi()

  // Connect to websocket when component mounts
  useEffect(() => {
    connectWebsocket()
  }, [connectWebsocket])

  // Authenticate when connected
  useEffect(() => {
    if (connected) {
      authenticate("GamerPro123", "password123")
    }
  }, [connected, authenticate])

  const handleTestAlert = (type: string) => {
    switch (type) {
      case "followers":
        twitchApi.simulateFollow()
        break
      case "subscribers":
        twitchApi.simulateSubscription()
        break
      case "donations":
        youtubeApi.simulateSuperchat()
        break
      case "cheers":
        twitchApi.simulateCheer()
        break
      case "raids":
        twitchApi.simulateRaid()
        break
    }
  }

  return (
    <DashboardLayout title="Alerts" subtitle="Customize and manage your stream alerts">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="followers" onValueChange={setSelectedAlertType}>
                <TabsList className="mb-4">
                  <TabsTrigger value="followers">Followers</TabsTrigger>
                  <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
                  <TabsTrigger value="donations">Donations</TabsTrigger>
                  <TabsTrigger value="cheers">Cheers/Bits</TabsTrigger>
                  <TabsTrigger value="raids">Raids</TabsTrigger>
                </TabsList>

                <TabsContent value="followers" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Alert Message</label>
                      <input
                        type="text"
                        className="w-full p-2 rounded-md bg-muted border border-border"
                        defaultValue="Thanks for the follow, {username}!"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Duration (seconds)</label>
                      <input
                        type="number"
                        className="w-full p-2 rounded-md bg-muted border border-border"
                        defaultValue="5"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Sound Effect</label>
                      <Select defaultValue="default">
                        <SelectTrigger>
                          <SelectValue placeholder="Select sound" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default Pop</SelectItem>
                          <SelectItem value="chime">Chime</SelectItem>
                          <SelectItem value="tada">Tada</SelectItem>
                          <SelectItem value="custom">Custom...</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Volume</label>
                      <div className="flex items-center">
                        <Volume2 size={18} className="mr-2 text-muted-foreground" />
                        <input type="range" min="0" max="100" defaultValue="75" className="w-full" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Alert Animation</label>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="border border-border rounded-md p-2 bg-muted hover:bg-accent cursor-pointer">
                        <div className="aspect-video bg-card rounded flex items-center justify-center mb-2">
                          <Bell size={24} className="text-primary" />
                        </div>
                        <p className="text-xs text-center">Simple</p>
                      </div>
                      <div className="border border-border rounded-md p-2 bg-muted hover:bg-accent cursor-pointer">
                        <div className="aspect-video bg-card rounded flex items-center justify-center mb-2">
                          <Bell size={24} className="text-primary animate-bounce" />
                        </div>
                        <p className="text-xs text-center">Bounce</p>
                      </div>
                      <div className="border border-primary rounded-md p-2 bg-accent cursor-pointer">
                        <div className="aspect-video bg-card rounded flex items-center justify-center mb-2">
                          <Bell size={24} className="text-primary animate-pulse" />
                        </div>
                        <p className="text-xs text-center">Pulse</p>
                      </div>
                      <div className="border border-border rounded-md p-2 bg-muted hover:bg-accent cursor-pointer">
                        <div className="aspect-video bg-card rounded flex items-center justify-center mb-2">
                          <Image size={24} className="text-muted-foreground" />
                        </div>
                        <p className="text-xs text-center">Custom</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium">Enable Follower Alerts</label>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit2 size={16} className="mr-1" /> Customize
                      </Button>
                      <Button size="sm" onClick={() => handleTestAlert("followers")}>
                        <Play size={16} className="mr-1" /> Test Alert
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="subscribers" className="space-y-4">
                  {/* Similar structure to followers tab, just different default values */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Alert Message</label>
                      <input
                        type="text"
                        className="w-full p-2 rounded-md bg-muted border border-border"
                        defaultValue="Thanks for subscribing, {username}!"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Duration (seconds)</label>
                      <input
                        type="number"
                        className="w-full p-2 rounded-md bg-muted border border-border"
                        defaultValue="8"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium">Enable Subscriber Alerts</label>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit2 size={16} className="mr-1" /> Customize
                      </Button>
                      <Button size="sm" onClick={() => handleTestAlert("subscribers")}>
                        <Play size={16} className="mr-1" /> Test Alert
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Other tabs would have similar structure */}
                <TabsContent value="donations" className="space-y-4">
                  <div className="pt-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium">Enable Donation Alerts</label>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit2 size={16} className="mr-1" /> Customize
                      </Button>
                      <Button size="sm" onClick={() => handleTestAlert("donations")}>
                        <Play size={16} className="mr-1" /> Test Alert
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="cheers" className="space-y-4">
                  <div className="pt-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium">Enable Cheer Alerts</label>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit2 size={16} className="mr-1" /> Customize
                      </Button>
                      <Button size="sm" onClick={() => handleTestAlert("cheers")}>
                        <Play size={16} className="mr-1" /> Test Alert
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="raids" className="space-y-4">
                  <div className="pt-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium">Enable Raid Alerts</label>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit2 size={16} className="mr-1" /> Customize
                      </Button>
                      <Button size="sm" onClick={() => handleTestAlert("raids")}>
                        <Play size={16} className="mr-1" /> Test Alert
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alert Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-card rounded-md flex items-center justify-center border border-border">
                <div className="text-center">
                  <div className="inline-block mb-2 animate-pulse">
                    {selectedAlertType === "followers" && <Bell size={48} className="text-primary mx-auto" />}
                    {selectedAlertType === "subscribers" && <Bell size={48} className="text-secondary mx-auto" />}
                    {selectedAlertType === "donations" && <Bell size={48} className="text-green-500 mx-auto" />}
                    {selectedAlertType === "cheers" && <Bell size={48} className="text-yellow-500 mx-auto" />}
                    {selectedAlertType === "raids" && <Bell size={48} className="text-red-500 mx-auto" />}
                  </div>
                  <p className="text-lg font-medium">
                    {selectedAlertType === "followers" && "Thanks for the follow, UserName!"}
                    {selectedAlertType === "subscribers" && "Thanks for subscribing, UserName!"}
                    {selectedAlertType === "donations" && "UserName donated $5.00!"}
                    {selectedAlertType === "cheers" && "UserName cheered 100 bits!"}
                    {selectedAlertType === "raids" && "UserName is raiding with 20 viewers!"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <Button variant="outline" className="w-full">
                  <Palette size={16} className="mr-2" />
                  Theme
                </Button>
                <Button variant="outline" className="w-full">
                  <Edit2 size={16} className="mr-2" />
                  Text Style
                </Button>
                <Button variant="outline" className="w-full">
                  <Image size={16} className="mr-2" />
                  Overlays
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="sticky top-4">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Alert Widget URL</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Add this URL to your OBS or streaming software as a browser source:
                </p>
                <div className="flex">
                  <input
                    type="text"
                    readOnly
                    value={`https://${window.location.host}/api/alerts/widget?token=demo123`}
                    className="w-full p-2 rounded-l-md bg-muted border border-border"
                  />
                  <Button className="rounded-l-none">Copy</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended size: 1920x1080, Refresh on load, Custom CSS: body &#123; background-color: rgba(0, 0, 0,
                  0); &#125;
                </p>
              </CardContent>
            </Card>

            <ActivityFeed />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AlertsPage
