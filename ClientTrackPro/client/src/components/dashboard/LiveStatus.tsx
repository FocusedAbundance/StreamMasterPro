"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useWebSocketStore } from "@/lib/websocket"

interface StreamStats {
  id?: number
  title: string
  platform: string
  startTime: Date
  endTime?: Date | null
  peakViewers: number
  averageViewers: number
  newFollowers: number
  newSubscribers: number
  chatMessages: number
  revenue?: number
}

const LiveStatus: React.FC = () => {
  const [isLive, setIsLive] = useState(true)
  const [streamDuration, setStreamDuration] = useState("00:00:00")
  const [streamStats, setStreamStats] = useState<StreamStats>({
    title: "Fortnite - Season 8",
    platform: "twitch",
    startTime: new Date(Date.now() - 9000000), // Started 2.5 hours ago
    endTime: null,
    peakViewers: 1500,
    averageViewers: 1243,
    newFollowers: 147,
    newSubscribers: 24,
    chatMessages: 3256,
  })
  const [goal, setGoal] = useState({
    title: "Monthly Subscribers",
    current: 450,
    target: 500,
    daysLeft: 7,
  })

  const subscribeToEvents = useWebSocketStore((state) => state.subscribeToEvents)

  // Update stream duration every second
  useEffect(() => {
    if (!isLive || !streamStats.startTime) return

    const updateDuration = () => {
      const start = new Date(streamStats.startTime).getTime()
      const now = Date.now()
      const diff = Math.floor((now - start) / 1000)

      const hours = Math.floor(diff / 3600)
      const minutes = Math.floor((diff % 3600) / 60)
      const seconds = diff % 60

      setStreamDuration(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      )
    }

    updateDuration()
    const interval = setInterval(updateDuration, 1000)

    return () => clearInterval(interval)
  }, [isLive, streamStats.startTime])

  // Listen for stream status updates
  useEffect(() => {
    const unsubscribe = subscribeToEvents((event) => {
      if (event.type === "stream_started") {
        setIsLive(true)
        setStreamStats({
          ...event.stream,
          startTime: new Date(event.stream.startTime),
        })
      } else if (event.type === "stream_ended") {
        setIsLive(false)
        setStreamStats({
          ...event.stream,
          startTime: new Date(event.stream.startTime),
          endTime: event.stream.endTime ? new Date(event.stream.endTime) : null,
        })
      } else if (event.type === "stream_stats_updated") {
        setStreamStats((prev) => ({
          ...prev,
          ...event.stream,
          startTime: new Date(event.stream.startTime),
          endTime: event.stream.endTime ? new Date(event.stream.endTime) : null,
        }))
      }
    })

    return () => unsubscribe()
  }, [subscribeToEvents])

  const goalPercentage = Math.round((goal.current / goal.target) * 100)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <Card className="border-border overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-card to-primary/10">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-foreground">Current Stream</h3>
            {isLive ? (
              <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-500 text-xs font-medium flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                Live
              </span>
            ) : (
              <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">Offline</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">Playing: {streamStats.title}</p>
          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span data-bind="viewerCount">{streamStats.averageViewers.toLocaleString()}</span>
            </div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span data-bind="streamDuration">{streamDuration}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-border overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-foreground">Today's Summary</h3>
            <span className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground mb-1">New Followers</p>
              <p className="text-lg font-semibold text-foreground">+{streamStats.newFollowers}</p>
            </div>
            <div className="p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground mb-1">New Subscribers</p>
              <p className="text-lg font-semibold text-primary">+{streamStats.newSubscribers}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-border overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-foreground">Monthly Goal</h3>
            <button className="text-xs text-primary hover:underline">Edit Goal</button>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {goal.title}: {goal.current}/{goal.target}
          </p>
          <Progress value={goalPercentage} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground">
            {goalPercentage}% achieved - {goal.daysLeft} days left
          </p>
        </div>
      </Card>
    </div>
  )
}

export default LiveStatus
