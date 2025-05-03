"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useQuery } from "@tanstack/react-query"
import type { Automation } from "@shared/schema"
import { Timer, Gift, Bell } from "lucide-react"

const Automations: React.FC = () => {
  const { data: automations, isLoading } = useQuery<Automation[]>({
    queryKey: ["/api/users/1/automations"], // Using static user ID for demo
  })

  // Default automations to display if API fetch hasn't completed
  const defaultAutomations = [
    {
      id: 1,
      name: "Follower Milestone Alerts",
      description: "Triggers every 10 new followers",
      triggerType: "follower",
      actionType: "overlay",
      isActive: true,
    },
    {
      id: 2,
      name: "Hourly Giveaway Reminder",
      description: "Posts in chat every 60 minutes",
      triggerType: "timer",
      actionType: "chat_message",
      isActive: true,
    },
    {
      id: 3,
      name: "New Sub Animation",
      description: "Plays animation on new subscribers",
      triggerType: "subscriber",
      actionType: "overlay",
      isActive: true,
    },
  ]

  const automationsToDisplay = automations || defaultAutomations

  const getAutomationIcon = (triggerType: string) => {
    switch (triggerType) {
      case "follower":
        return (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Timer size={16} />
          </div>
        )
      case "timer":
        return (
          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
            <Gift size={16} />
          </div>
        )
      case "subscriber":
        return (
          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <Bell size={16} />
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <Bell size={16} />
          </div>
        )
    }
  }

  const [activeAutomations, setActiveAutomations] = useState<{ [key: number]: boolean }>(() => {
    const initialState: { [key: number]: boolean } = {}
    defaultAutomations.forEach((automation) => {
      initialState[automation.id] = automation.isActive
    })
    return initialState
  })

  const handleToggleAutomation = (id: number) => {
    setActiveAutomations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <Card className="border-border overflow-hidden">
      <CardHeader className="p-4 border-b border-border flex justify-between items-center">
        <CardTitle className="font-medium text-foreground">Active Automations</CardTitle>
        <button className="text-xs text-primary hover:underline">Create New</button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {automationsToDisplay.map((automation) => (
            <div key={automation.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getAutomationIcon(automation.triggerType)}
                <div>
                  <h4 className="font-medium text-foreground">{automation.name}</h4>
                  <p className="text-xs text-muted-foreground">{automation.description}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Switch
                  checked={activeAutomations[automation.id] ?? automation.isActive}
                  onCheckedChange={() => handleToggleAutomation(automation.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default Automations
