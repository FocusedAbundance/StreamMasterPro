"use client"

import type React from "react"
import { useEffect } from "react"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import LiveStatus from "@/components/dashboard/LiveStatus"
import MultiChat from "@/components/dashboard/MultiChat"
import ActivityFeed from "@/components/dashboard/ActivityFeed"
import StreamStatistics from "@/components/dashboard/StreamStatistics"
import StreamingSetup from "@/components/dashboard/StreamingSetup"
import PlatformConnection from "@/components/dashboard/PlatformConnection"
import UpcomingStreams from "@/components/dashboard/UpcomingStreams"
import Automations from "@/components/dashboard/Automations"
import SocialMedia from "@/components/dashboard/SocialMedia"
import { useWebSocketStore } from "@/lib/websocket"

const Dashboard: React.FC = () => {
  const connectWebsocket = useWebSocketStore((state) => state.connect)
  const authenticate = useWebSocketStore((state) => state.authenticate)
  const connected = useWebSocketStore((state) => state.connected)

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

  return (
    <DashboardLayout title="Dashboard" subtitle="Overview of your streaming activity">
      <LiveStatus />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MultiChat />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>

      <StreamStatistics />

      <StreamingSetup />

      <PlatformConnection />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <UpcomingStreams />
        <Automations />
      </div>

      <SocialMedia />
    </DashboardLayout>
  )
}

export default Dashboard
