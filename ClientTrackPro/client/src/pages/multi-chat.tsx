"use client"

import type React from "react"
import { useEffect } from "react"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import MultiChat from "@/components/dashboard/MultiChat"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWebSocketStore } from "@/lib/websocket"
import { useTwitchApi, useYouTubeApi, useFacebookApi } from "@/lib/platformApis"
import { Settings, Users, Bot } from "lucide-react"

const MultiChatPage: React.FC = () => {
  const connectWebsocket = useWebSocketStore((state) => state.connect)
  const authenticate = useWebSocketStore((state) => state.authenticate)
  const connected = useWebSocketStore((state) => state.connected)
  const simulateTwitchChat = useTwitchApi().simulateChatMessage
  const simulateYoutubeChat = useYouTubeApi().simulateChatMessage
  const simulateFacebookChat = useFacebookApi().simulateChatMessage

  // Connect to websocket when component mounts
  useEffect(() => {
    connectWebsocket()
  }, [connectWebsocket])

  // Authenticate when connected
  useEffect(() => {
    if (connected) {
      // Using demo credentials for now
      authenticate("GamerPro123", "password123")
    }
  }, [connected, authenticate])

  // Simulate some messages for demo purposes
  useEffect(() => {
    if (connected) {
      const messages = [
        "Hi everyone! How's the stream quality today?",
        "That was an amazing play!",
        "Where are you from?",
        "Can you explain that game mechanic again?",
        "Love the new overlay!",
        "How long have you been streaming?",
        "!uptime",
        "GG!",
        "When's the next giveaway?",
        "I subscribed yesterday, loving the content!",
      ]

      // Send a random message every few seconds
      const interval = setInterval(() => {
        const platform = Math.random() > 0.66 ? "twitch" : Math.random() > 0.5 ? "youtube" : "facebook"

        const message = messages[Math.floor(Math.random() * messages.length)]

        if (platform === "twitch") {
          simulateTwitchChat(message)
        } else if (platform === "youtube") {
          simulateYoutubeChat(message)
        } else {
          simulateFacebookChat(message)
        }
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [connected, simulateTwitchChat, simulateYoutubeChat, simulateFacebookChat])

  return (
    <DashboardLayout title="Multi-Chat" subtitle="Manage all your platform chats in one place">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="h-[calc(100vh-12rem)]">
            <MultiChat />
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chat Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="moderation">
                <TabsList className="w-full">
                  <TabsTrigger value="moderation" className="flex-1">
                    <Settings size={16} className="mr-2" />
                    Moderation
                  </TabsTrigger>
                  <TabsTrigger value="users" className="flex-1">
                    <Users size={16} className="mr-2" />
                    Users
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm">Auto-delete spam</div>
                  <div className="text-sm text-primary">Enabled</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">Links filter</div>
                  <div className="text-sm text-primary">Enabled</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">Slow mode</div>
                  <div className="text-sm text-muted-foreground">Disabled</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">Subscriber only</div>
                  <div className="text-sm text-muted-foreground">Disabled</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Responses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-2 bg-muted rounded-md cursor-pointer hover:bg-accent transition-colors text-sm">
                Welcome to the stream! Don't forget to follow for notifications.
              </div>

              <div className="p-2 bg-muted rounded-md cursor-pointer hover:bg-accent transition-colors text-sm">
                Thanks for the sub! Really appreciate the support.
              </div>

              <div className="p-2 bg-muted rounded-md cursor-pointer hover:bg-accent transition-colors text-sm">
                We're running a giveaway at the end of the stream. Type !enter to participate!
              </div>

              <div className="p-2 bg-muted rounded-md cursor-pointer hover:bg-accent transition-colors text-sm">
                My PC specs and gear can be found in the !specs command or in the channel description.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot size={18} className="mr-2" />
                Bot Commands
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-2 bg-muted rounded-md cursor-pointer hover:bg-accent transition-colors text-sm">
                <span className="font-bold">!uptime</span> - Shows how long the stream has been live
              </div>

              <div className="p-2 bg-muted rounded-md cursor-pointer hover:bg-accent transition-colors text-sm">
                <span className="font-bold">!schedule</span> - Shows upcoming stream schedule
              </div>

              <div className="p-2 bg-muted rounded-md cursor-pointer hover:bg-accent transition-colors text-sm">
                <span className="font-bold">!socials</span> - Shows all social media links
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default MultiChatPage
