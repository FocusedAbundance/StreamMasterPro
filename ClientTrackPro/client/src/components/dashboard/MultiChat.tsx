"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlatformIcon } from "@/components/ui/platform-icon"
import { useWebSocketStore } from "@/lib/websocket"
import { format } from "date-fns"

type Message = {
  id: number
  platform: string
  senderUsername: string
  senderDisplayName: string
  message: string
  timestamp: Date
  userBadges: Record<string, string>
}

const MultiChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [activePlatform, setActivePlatform] = useState<string>("all")
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const subscribeToEvents = useWebSocketStore((state) => state.subscribeToEvents)
  const sendChatMessage = useWebSocketStore((state) => state.sendChatMessage)

  // Handle incoming chat messages
  useEffect(() => {
    const unsubscribe = subscribeToEvents((event) => {
      if (event.type === "chat_message" && event.message) {
        setMessages((prev) => [
          ...prev,
          {
            ...event.message,
            timestamp: new Date(event.message.timestamp),
          },
        ])
      }
    })

    return () => unsubscribe()
  }, [subscribeToEvents])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!messageInput.trim()) return

    const platforms = activePlatform === "all" ? ["twitch", "youtube", "facebook"] : [activePlatform]

    platforms.forEach((platform) => {
      sendChatMessage(
        platform,
        messageInput,
        "GamerPro123", // Current user's username
        "GamerPro123", // Current user's display name
        { broadcaster: "1" }, // Current user's badges
      )
    })

    setMessageInput("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes === 1) return "1m ago"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours === 1) return "1h ago"
    if (diffInHours < 24) return `${diffInHours}h ago`

    return format(date, "MMM d")
  }

  const filteredMessages =
    activePlatform === "all" ? messages : messages.filter((msg) => msg.platform === activePlatform)

  const renderBadges = (badges: Record<string, string>, platform: string) => {
    return Object.entries(badges).map(([type, level]) => {
      let badgeText = ""
      let bgColor = ""

      if (platform === "twitch") {
        if (type === "subscriber") {
          badgeText = "Subscriber"
          bgColor = "bg-primary/20 text-primary"
        } else if (type === "moderator") {
          badgeText = "Mod"
          bgColor = "bg-emerald-500/20 text-emerald-500"
        } else if (type === "broadcaster") {
          badgeText = "Streamer"
          bgColor = "bg-destructive/20 text-destructive"
        }
      } else if (platform === "youtube") {
        if (type === "member") {
          badgeText = "Member"
          bgColor = "bg-secondary/20 text-secondary"
        } else if (type === "moderator") {
          badgeText = "Mod"
          bgColor = "bg-emerald-500/20 text-emerald-500"
        }
      } else if (platform === "facebook") {
        if (type === "subscriber") {
          badgeText = "Subscriber"
          bgColor = "bg-blue-500/20 text-blue-500"
        }
      } else if (platform === "tiktok") {
        if (type === "subscriber") {
          badgeText = "Premium"
          bgColor = "bg-black/20 text-black"
        } else if (type === "moderator") {
          badgeText = "Mod"
          bgColor = "bg-emerald-500/20 text-emerald-500"
        }
      } else if (platform === "instagram") {
        if (type === "verified") {
          badgeText = "Verified"
          bgColor = "bg-pink-500/20 text-pink-500"
        } else if (type === "moderator") {
          badgeText = "Mod"
          bgColor = "bg-emerald-500/20 text-emerald-500"
        }
      }

      if (!badgeText) return null

      return (
        <span key={type} className={`text-xs px-2 py-0.5 rounded ${bgColor}`}>
          {badgeText}
        </span>
      )
    })
  }

  return (
    <Card className="border-border h-full">
      <CardHeader className="border-b border-border p-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Multi-Chat</CardTitle>
          <Tabs value={activePlatform} onValueChange={setActivePlatform} className="h-8">
            <TabsList className="bg-background">
              <TabsTrigger value="all" className="h-8 text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="twitch" className="h-8 text-xs">
                <PlatformIcon platform="twitch" className="mr-1" />
                Twitch
              </TabsTrigger>
              <TabsTrigger value="youtube" className="h-8 text-xs">
                <PlatformIcon platform="youtube" className="mr-1" />
                YouTube
              </TabsTrigger>
              <TabsTrigger value="facebook" className="h-8 text-xs">
                <PlatformIcon platform="facebook" className="mr-1" />
                Facebook
              </TabsTrigger>
              <TabsTrigger value="tiktok" className="h-8 text-xs">
                <PlatformIcon platform="tiktok" className="mr-1" />
                TikTok
              </TabsTrigger>
              <TabsTrigger value="instagram" className="h-8 text-xs">
                <PlatformIcon platform="instagram" className="mr-1" />
                Instagram
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-hidden flex-grow h-[calc(100%-6rem)]">
        <div ref={chatContainerRef} className="h-full overflow-y-auto scrollbar-thin p-4 space-y-3">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p>No messages yet</p>
              <p className="text-sm">Messages will appear here as viewers chat</p>
            </div>
          ) : (
            filteredMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 ${
                  msg.platform === "twitch"
                    ? "border-l-4 border-primary pl-2"
                    : msg.platform === "youtube"
                      ? "border-l-4 border-secondary pl-2"
                      : "border-l-4 border-blue-500 pl-2"
                }`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden text-xs">
                  {msg.senderDisplayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`font-medium ${
                        msg.platform === "twitch"
                          ? "text-primary"
                          : msg.platform === "youtube"
                            ? "text-secondary"
                            : "text-blue-500"
                      }`}
                    >
                      {msg.senderDisplayName}
                    </span>

                    {renderBadges(msg.userBadges, msg.platform)}

                    <span className="text-xs text-muted-foreground">{getTimeAgo(msg.timestamp)}</span>
                  </div>
                  <p className="text-foreground">{msg.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      <CardFooter className="p-3 border-t border-border">
        <div className="flex space-x-2 w-full">
          <Input
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default MultiChat
