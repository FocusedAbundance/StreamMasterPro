"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, Radio } from "lucide-react"
import { useStreamStats } from "@/lib/platformApis"

interface HeaderProps {
  title: string
  subtitle?: string
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const [isStreaming, setIsStreaming] = useState(false)
  const [notificationCount, setNotificationCount] = useState(3)
  const streamStats = useStreamStats()

  const handleStreamToggle = () => {
    if (isStreaming) {
      streamStats.endStream("twitch")
    } else {
      streamStats.startStream("twitch", "My Awesome Stream")
    }
    setIsStreaming(!isStreaming)
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-4">
        <Button
          onClick={handleStreamToggle}
          variant={isStreaming ? "destructive" : "default"}
          className="flex items-center gap-2"
        >
          <Radio size={16} className={isStreaming ? "animate-pulse" : ""} />
          <span>{isStreaming ? "End Stream" : "Go Live"}</span>
        </Button>

        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell size={18} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3 border-b border-border">
                <h3 className="font-medium">Notifications</h3>
              </div>
              <DropdownMenuItem onClick={() => setNotificationCount(0)}>
                <span className="text-xs text-muted-foreground">New follower from Twitch</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="text-xs text-muted-foreground">New subscriber from YouTube</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="text-xs text-muted-foreground">Raid alert - 24 viewers</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default Header
