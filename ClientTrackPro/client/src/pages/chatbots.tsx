"use client"

import type React from "react"
import { useState } from "react"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bot, Plus, Save, Trash, Edit2, Play, Code, MessageSquare, Timer, Clock, Shield } from "lucide-react"
import { PlatformIcon } from "@/components/ui/platform-icon"

const ChatbotsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("commands")
  const [editingCommand, setEditingCommand] = useState<number | null>(null)
  const [editingTimer, setEditingTimer] = useState<number | null>(null)
  const [editingFilter, setEditingFilter] = useState<number | null>(null)

  const [commands, setCommands] = useState([
    { id: 1, command: "!uptime", response: "Stream has been live for {uptime}", enabled: true },
    {
      id: 2,
      command: "!socials",
      response: "Follow me on Twitter: @GamerPro123 and Instagram: @GamerPro123",
      enabled: true,
    },
    { id: 3, command: "!specs", response: "PC Specs: RTX 3080, i9-10900K, 32GB RAM, 2TB SSD", enabled: true },
  ])

  const [timers, setTimers] = useState([
    {
      id: 1,
      name: "Subscribe Reminder",
      message: "Don't forget to subscribe for stream notifications!",
      interval: 15,
      enabled: true,
    },
    {
      id: 2,
      name: "Discord Plug",
      message: "Join our Discord community at discord.gg/gamerpro",
      interval: 30,
      enabled: true,
    },
  ])

  const [filters, setFilters] = useState([
    { id: 1, name: "Excessive Caps", action: "delete", enabled: true },
    { id: 2, name: "Link Protection", action: "timeout", enabled: true },
    { id: 3, name: "Bad Words", action: "delete", enabled: true },
  ])

  const addCommand = () => {
    const newId = commands.length > 0 ? Math.max(...commands.map((c) => c.id)) + 1 : 1
    setCommands([...commands, { id: newId, command: "", response: "", enabled: true }])
    setEditingCommand(newId)
  }

  const deleteCommand = (id: number) => {
    setCommands(commands.filter((command) => command.id !== id))
    if (editingCommand === id) {
      setEditingCommand(null)
    }
  }

  const updateCommand = (id: number, field: "command" | "response" | "enabled", value: string | boolean) => {
    setCommands(commands.map((command) => (command.id === id ? { ...command, [field]: value } : command)))
  }

  const addTimer = () => {
    const newId = timers.length > 0 ? Math.max(...timers.map((t) => t.id)) + 1 : 1
    setTimers([...timers, { id: newId, name: "", message: "", interval: 15, enabled: true }])
    setEditingTimer(newId)
  }

  const deleteTimer = (id: number) => {
    setTimers(timers.filter((timer) => timer.id !== id))
    if (editingTimer === id) {
      setEditingTimer(null)
    }
  }

  const updateTimer = (
    id: number,
    field: "name" | "message" | "interval" | "enabled",
    value: string | number | boolean,
  ) => {
    setTimers(timers.map((timer) => (timer.id === id ? { ...timer, [field]: value } : timer)))
  }

  return (
    <DashboardLayout title="Chat Bots" subtitle="Manage your automated chat messaging">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="commands" className="flex-1">
                <MessageSquare size={16} className="mr-2" />
                Commands
              </TabsTrigger>
              <TabsTrigger value="timers" className="flex-1">
                <Timer size={16} className="mr-2" />
                Timers
              </TabsTrigger>
              <TabsTrigger value="filters" className="flex-1">
                <Shield size={16} className="mr-2" />
                Chat Filters
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex-1">
                <Code size={16} className="mr-2" />
                Advanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value="commands" className="pt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Chat Commands</CardTitle>
                  <Button size="sm" onClick={addCommand}>
                    <Plus size={16} className="mr-1" /> Add Command
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border">
                    {commands.map((command) => (
                      <div key={command.id} className="py-3">
                        {editingCommand === command.id ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-4 gap-3">
                              <div className="col-span-1">
                                <label className="text-sm font-medium">Command</label>
                                <Input
                                  value={command.command}
                                  onChange={(e) => updateCommand(command.id, "command", e.target.value)}
                                  placeholder="!command"
                                />
                              </div>
                              <div className="col-span-3">
                                <label className="text-sm font-medium">Response</label>
                                <Input
                                  value={command.response}
                                  onChange={(e) => updateCommand(command.id, "response", e.target.value)}
                                  placeholder="Bot response message"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" size="sm" onClick={() => deleteCommand(command.id)}>
                                <Trash size={14} className="mr-1" /> Delete
                              </Button>
                              <Button size="sm" onClick={() => setEditingCommand(null)}>
                                <Save size={14} className="mr-1" /> Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-mono font-medium">{command.command}</span>
                                <Switch
                                  checked={command.enabled}
                                  onCheckedChange={(checked) => updateCommand(command.id, "enabled", checked)}
                                />
                              </div>
                              <p className="text-sm text-muted-foreground">{command.response}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setEditingCommand(command.id)}>
                              <Edit2 size={14} />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timers" className="pt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Scheduled Messages</CardTitle>
                  <Button size="sm" onClick={addTimer}>
                    <Plus size={16} className="mr-1" /> Add Timer
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border">
                    {timers.map((timer) => (
                      <div key={timer.id} className="py-3">
                        {editingTimer === timer.id ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-4 gap-3">
                              <div className="col-span-1">
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                  value={timer.name}
                                  onChange={(e) => updateTimer(timer.id, "name", e.target.value)}
                                  placeholder="Timer name"
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="text-sm font-medium">Message</label>
                                <Input
                                  value={timer.message}
                                  onChange={(e) => updateTimer(timer.id, "message", e.target.value)}
                                  placeholder="Message to send"
                                />
                              </div>
                              <div className="col-span-1">
                                <label className="text-sm font-medium">Interval (min)</label>
                                <Input
                                  type="number"
                                  value={timer.interval.toString()}
                                  onChange={(e) =>
                                    updateTimer(timer.id, "interval", Number.parseInt(e.target.value) || 15)
                                  }
                                  min="1"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" size="sm" onClick={() => deleteTimer(timer.id)}>
                                <Trash size={14} className="mr-1" /> Delete
                              </Button>
                              <Button size="sm" onClick={() => setEditingTimer(null)}>
                                <Save size={14} className="mr-1" /> Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{timer.name}</span>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Clock size={12} className="mr-1" />
                                  <span>Every {timer.interval} min</span>
                                </div>
                                <Switch
                                  checked={timer.enabled}
                                  onCheckedChange={(checked) => updateTimer(timer.id, "enabled", checked)}
                                />
                              </div>
                              <p className="text-sm text-muted-foreground">{timer.message}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setEditingTimer(timer.id)}>
                              <Edit2 size={14} />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="filters" className="pt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Moderation Filters</CardTitle>
                  <Button size="sm">
                    <Plus size={16} className="mr-1" /> Add Filter
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border">
                    {filters.map((filter) => (
                      <div key={filter.id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{filter.name}</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                filter.action === "delete"
                                  ? "bg-yellow-500/20 text-yellow-500"
                                  : filter.action === "timeout"
                                    ? "bg-red-500/20 text-red-500"
                                    : "bg-primary/20 text-primary"
                              }`}
                            >
                              {filter.action}
                            </span>
                            <Switch checked={filter.enabled} />
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit2 size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Bot Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Custom Scripts</h3>
                    <div className="bg-card border border-border rounded-md h-40 font-mono p-4 text-sm overflow-auto">
                      <code>
                        // Example: Custom points system <br />
                        function onUserMessage(user, message, platform) &#123; <br />
                        &nbsp;&nbsp;// Add 1 point for each message <br />
                        &nbsp;&nbsp;addPoints(user, 1); <br />
                        &#125;
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Webhook Integrations</h3>
                    <Input placeholder="https://example.com/webhook" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Receive real-time notifications for chat events
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Bot Response Variables</h3>
                    <div className="bg-muted p-3 rounded-md text-sm">
                      <p className="mb-1">
                        <code>&#123;username&#125;</code> - Current user's name
                      </p>
                      <p className="mb-1">
                        <code>&#123;uptime&#125;</code> - Current stream duration
                      </p>
                      <p className="mb-1">
                        <code>&#123;followers&#125;</code> - Total follower count
                      </p>
                      <p>
                        <code>&#123;subs&#125;</code> - Total subscriber count
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bot Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium">StreamMaster Bot</h3>
                    <p className="text-xs text-green-500 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                      Online
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Play size={14} className="mr-1" /> Test
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <PlatformIcon platform="twitch" />
                    <span className="text-sm">Twitch</span>
                  </div>
                  <span className="text-xs text-green-500">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <PlatformIcon platform="youtube" />
                    <span className="text-sm">YouTube</span>
                  </div>
                  <span className="text-xs text-green-500">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <PlatformIcon platform="facebook" />
                    <span className="text-sm">Facebook</span>
                  </div>
                  <span className="text-xs text-green-500">Connected</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bot Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Bot Username</label>
                <Input defaultValue="StreamMasterBot" />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Command Prefix</label>
                <Input defaultValue="!" placeholder="!" />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Response Cooldown</label>
                <Select defaultValue="5">
                  <SelectTrigger>
                    <SelectValue placeholder="Select cooldown" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No cooldown</SelectItem>
                    <SelectItem value="3">3 seconds</SelectItem>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="text-sm font-medium">Bot Enabled</label>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bot Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 overflow-y-auto bg-card rounded-md border border-border p-2 text-xs space-y-1">
                <div>
                  <span className="text-muted-foreground">[12:34:56]</span> Bot connected to Twitch
                </div>
                <div>
                  <span className="text-muted-foreground">[12:35:01]</span> Bot connected to YouTube
                </div>
                <div>
                  <span className="text-muted-foreground">[12:35:05]</span> Bot connected to Facebook
                </div>
                <div>
                  <span className="text-muted-foreground">[12:40:12]</span>{" "}
                  <span className="text-primary">TwitchUser123</span>: !uptime
                </div>
                <div>
                  <span className="text-muted-foreground">[12:40:12]</span> <span className="text-green-500">Bot</span>:
                  Stream has been live for 02:10:45
                </div>
                <div>
                  <span className="text-muted-foreground">[12:45:00]</span> Sent scheduled message: 'Subscribe Reminder'
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ChatbotsPage
