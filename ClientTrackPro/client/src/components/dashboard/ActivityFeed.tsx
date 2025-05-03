"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWebSocketStore } from "@/lib/websocket"
import { useTwitchApi, useYouTubeApi, useFacebookApi } from "@/lib/platformApis"
import { UserPlus, Crown, Gift, Clock, Star, MessageSquare } from "lucide-react"
import { format } from "date-fns"

type ActivityEvent = {
  id: string
  type: string
  platform: string
  username: string
  displayName: string
  timestamp: Date
  data?: any
}

const ActivityFeed: React.FC = () => {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const subscribeToEvents = useWebSocketStore((state) => state.subscribeToEvents)

  const { simulateFollow: simulateTwitchFollow, simulateSubscription: simulateTwitchSub } = useTwitchApi()

  const { simulateSubscription: simulateYoutubeSub } = useYouTubeApi()

  const { simulateStars } = useFacebookApi()

  useEffect(() => {
    const unsubscribe = subscribeToEvents((event) => {
      if (event.type === "stream_event") {
        setEvents((prev) =>
          [
            {
              id: `${Date.now()}-${Math.random()}`,
              type: event.eventType || "unknown",
              platform: event.platform || "unknown",
              username: event.data?.username || "Anonymous",
              displayName: event.data?.displayName || "Anonymous",
              timestamp: new Date(),
              data: event.data,
            },
            ...prev,
          ].slice(0, 20),
        )
      }
    })

    return () => unsubscribe()
  }, [subscribeToEvents])

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes === 1) return "1 minute ago"
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours === 1) return "1 hour ago"
    if (diffInHours < 24) return `${diffInHours} hours ago`

    return format(date, "MMM d")
  }

  const renderIcon = (type: string, platform: string) => {
    switch (type) {
      case "follow":
        return (
          <div className="w-8 h-8 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground">
            <UserPlus size={16} />
          </div>
        )
      case "subscription":
      case "membership":
        return (
          <div
            className={`w-8 h-8 rounded-full ${
              platform === "twitch" ? "bg-primary" : platform === "youtube" ? "bg-secondary" : "bg-blue-500"
            } flex items-center justify-center text-white`}
          >
            <Crown size={16} />
          </div>
        )
      case "cheer":
      case "superchat":
      case "stars":
        return (
          <div
            className={`w-8 h-8 rounded-full ${
              platform === "twitch" ? "bg-purple-500" : platform === "youtube" ? "bg-secondary" : "bg-blue-500"
            } flex items-center justify-center text-white`}
          >
            <Star size={16} />
          </div>
        )
      case "raid":
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
            <MessageSquare size={16} />
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <MessageSquare size={16} />
          </div>
        )
    }
  }

  const renderEventText = (event: ActivityEvent) => {
    switch (event.type) {
      case "follow":
        return (
          <p className="text-sm text-foreground">
            <span className="font-medium">{event.displayName}</span> followed you on{" "}
            <span
              className={
                event.platform === "twitch"
                  ? "text-primary"
                  : event.platform === "youtube"
                    ? "text-secondary"
                    : "text-blue-500"
              }
            >
              {event.platform.charAt(0).toUpperCase() + event.platform.slice(1)}
            </span>
          </p>
        )
      case "subscription":
        return (
          <p className="text-sm text-foreground">
            <span className="font-medium">{event.displayName}</span>{" "}
            {event.data?.isGift ? "was gifted a subscription" : "subscribed"}{" "}
            {event.data?.tier ? `(Tier ${event.data.tier})` : ""}
          </p>
        )
      case "membership":
        return (
          <p className="text-sm text-foreground">
            <span className="font-medium">{event.displayName}</span> became a channel member
          </p>
        )
      case "cheer":
        return (
          <p className="text-sm text-foreground">
            <span className="font-medium">{event.displayName}</span> cheered{" "}
            <span className="font-medium">{event.data?.amount}</span> bits
          </p>
        )
      case "superchat":
        return (
          <p className="text-sm text-foreground">
            <span className="font-medium">{event.displayName}</span> sent a Super Chat{" "}
            <span className="font-medium">${event.data?.amount}</span>
          </p>
        )
      case "stars":
        return (
          <p className="text-sm text-foreground">
            <span className="font-medium">{event.displayName}</span> sent{" "}
            <span className="font-medium">{event.data?.amount}</span> stars
          </p>
        )
      case "raid":
        return (
          <p className="text-sm text-foreground">
            <span className="font-medium">{event.displayName}</span> raided with{" "}
            <span className="font-medium">{event.data?.viewers}</span> viewers
          </p>
        )
      default:
        return (
          <p className="text-sm text-foreground">
            <span className="font-medium">{event.displayName}</span> triggered an event
          </p>
        )
    }
  }

  const handleStartGiveaway = () => {
    // In a real app, this would trigger a giveaway
    console.log("Starting a giveaway")
  }

  const handleStartPoll = () => {
    // In a real app, this would trigger a poll
    console.log("Starting a poll")
  }

  return (
    <Card className="border-border h-full">
      <CardHeader className="border-b border-border p-3">
        <CardTitle className="text-lg">Activity Feed</CardTitle>
      </CardHeader>

      <CardContent className="p-0 h-64">
        <div className="h-full overflow-y-auto scrollbar-thin p-4 space-y-3">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p>No activity yet</p>
              <p className="text-sm">Events will appear here during your stream</p>
              <Button variant="outline" className="mt-2" onClick={simulateTwitchFollow}>
                Simulate Follow
              </Button>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="flex items-start space-x-3">
                {renderIcon(event.type, event.platform)}
                <div>
                  {renderEventText(event)}
                  <p className="text-xs text-muted-foreground">{getTimeAgo(event.timestamp)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t border-border p-3">
        <h4 className="font-medium text-foreground mb-2">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button variant="outline" size="sm" className="w-full" onClick={handleStartGiveaway}>
            <Gift size={16} className="mr-1" /> Giveaway
          </Button>
          <Button variant="outline" size="sm" className="w-full" onClick={handleStartPoll}>
            <Clock size={16} className="mr-1" /> Poll
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default ActivityFeed
