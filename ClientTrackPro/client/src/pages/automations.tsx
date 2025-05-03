"use client"

import type React from "react"
import { useState } from "react"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Wand2,
  Plus,
  MessageSquare,
  Image,
  Volume2,
  Code,
  Timer,
  User,
  Heart,
  Gift,
  AlertTriangle,
  Edit2,
  Trash2,
  Play,
  Crown,
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { type Automation, ActionType, TriggerType } from "@shared/schema"
import { apiRequest } from "@/lib/queryClient"
import { PlatformIcon } from "@/components/ui/platform-icon"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  triggerType: z.string(),
  triggerValue: z.string().optional(),
  actionType: z.string(),
  actionData: z.record(z.any()),
  isActive: z.boolean().default(true),
})

const AutomationsPage: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null)
  const [activeTab, setActiveTab] = useState("follower")

  const queryClient = useQueryClient()

  const { data: automations, isLoading } = useQuery<Automation[]>({
    queryKey: ["/api/users/1/automations"], // Using static user ID for demo
  })

  const createForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      triggerType: TriggerType.FOLLOWER,
      triggerValue: "1",
      actionType: ActionType.CHAT_MESSAGE,
      actionData: { message: "Thanks for following!" },
      isActive: true,
    },
  })

  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      triggerType: TriggerType.FOLLOWER,
      triggerValue: "1",
      actionType: ActionType.CHAT_MESSAGE,
      actionData: { message: "" },
      isActive: true,
    },
  })

  const createAutomationMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/users/1/automations", {
        ...values,
        userId: 1, // Static user ID for demo
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/1/automations"] })
      setIsCreateDialogOpen(false)
      createForm.reset()
    },
  })

  const editAutomationMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!selectedAutomation) return null

      const response = await apiRequest("PUT", `/api/automations/${selectedAutomation.id}`, {
        ...values,
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/1/automations"] })
      setIsEditDialogOpen(false)
      setSelectedAutomation(null)
    },
  })

  const toggleAutomationMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest("PUT", `/api/automations/${id}`, {
        isActive,
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/1/automations"] })
    },
  })

  const deleteAutomationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/automations/${id}`, {})
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/1/automations"] })
    },
  })

  const handleCreateSubmit = (values: z.infer<typeof formSchema>) => {
    createAutomationMutation.mutate(values)
  }

  const handleEditSubmit = (values: z.infer<typeof formSchema>) => {
    editAutomationMutation.mutate(values)
  }

  const handleEdit = (automation: Automation) => {
    setSelectedAutomation(automation)
    editForm.reset({
      name: automation.name,
      description: automation.description || "",
      triggerType: automation.triggerType,
      triggerValue: automation.triggerValue || "",
      actionType: automation.actionType,
      actionData: automation.actionData,
      isActive: automation.isActive,
    })
    setIsEditDialogOpen(true)
  }

  const handleToggleActive = (id: number, currentState: boolean) => {
    toggleAutomationMutation.mutate({ id, isActive: !currentState })
  }

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this automation?")) {
      deleteAutomationMutation.mutate(id)
    }
  }

  // Filter automations based on active tab
  const filteredAutomations =
    automations?.filter((automation) => (activeTab === "all" ? true : automation.triggerType === activeTab)) || []

  // Sample automations for display when API data is not yet loaded
  const sampleAutomations = [
    {
      id: 1,
      name: "Follower Milestone Alerts",
      description: "Triggers every 10 new followers",
      triggerType: "follower",
      triggerValue: "10",
      actionType: "overlay",
      actionData: { message: "New follower milestone reached!" },
      isActive: true,
      userId: 1,
      createdAt: new Date(),
    },
    {
      id: 2,
      name: "Hourly Giveaway Reminder",
      description: "Posts in chat every 60 minutes",
      triggerType: "timer",
      triggerValue: "3600",
      actionType: "chat_message",
      actionData: { message: "Don't forget to enter the giveaway by typing !enter in chat!" },
      isActive: true,
      userId: 1,
      createdAt: new Date(),
    },
    {
      id: 3,
      name: "New Sub Animation",
      description: "Plays animation on new subscribers",
      triggerType: "subscriber",
      triggerValue: "1",
      actionType: "overlay",
      actionData: { animationType: "celebration" },
      isActive: true,
      userId: 1,
      createdAt: new Date(),
    },
    {
      id: 4,
      name: "Donation Thank You",
      description: "Thanks donors in chat",
      triggerType: "donation",
      triggerValue: "1",
      actionType: "chat_message",
      actionData: { message: "Thank you for your donation, {username}!" },
      isActive: true,
      userId: 1,
      createdAt: new Date(),
    },
  ]

  const displayAutomations =
    filteredAutomations.length > 0
      ? filteredAutomations
      : sampleAutomations.filter((automation) => (activeTab === "all" ? true : automation.triggerType === activeTab))

  // Get automation icon based on trigger type
  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case TriggerType.FOLLOWER:
        return <User size={16} />
      case TriggerType.SUBSCRIBER:
        return <Crown size={16} />
      case TriggerType.DONATION:
        return <Gift size={16} />
      case TriggerType.TIMER:
        return <Timer size={16} />
      case TriggerType.CHAT_COMMAND:
        return <MessageSquare size={16} />
      default:
        return <Wand2 size={16} />
    }
  }

  // Get action icon based on action type
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case ActionType.CHAT_MESSAGE:
        return <MessageSquare size={16} />
      case ActionType.OVERLAY:
        return <Image size={16} />
      case ActionType.SOUND:
        return <Volume2 size={16} />
      case ActionType.CUSTOM_API:
        return <Code size={16} />
      default:
        return <Wand2 size={16} />
    }
  }

  return (
    <DashboardLayout title="Automations" subtitle="Set up automated actions for your stream">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="follower">Follower</TabsTrigger>
            <TabsTrigger value="subscriber">Subscriber</TabsTrigger>
            <TabsTrigger value="donation">Donation</TabsTrigger>
            <TabsTrigger value="timer">Timer</TabsTrigger>
            <TabsTrigger value="chat_command">Chat</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus size={16} className="mr-2" />
          New Automation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayAutomations.map((automation) => (
          <Card key={automation.id} className={`border-border ${!automation.isActive ? "opacity-70" : ""}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{automation.name}</CardTitle>
                <Switch
                  checked={automation.isActive}
                  onCheckedChange={() => handleToggleActive(automation.id, automation.isActive)}
                />
              </div>
              {automation.description && <p className="text-sm text-muted-foreground mt-1">{automation.description}</p>}
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-muted rounded-md">
                  <div
                    className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center ${
                      automation.triggerType === TriggerType.FOLLOWER
                        ? "bg-green-500/10 text-green-500"
                        : automation.triggerType === TriggerType.SUBSCRIBER
                          ? "bg-primary/10 text-primary"
                          : automation.triggerType === TriggerType.DONATION
                            ? "bg-red-500/10 text-red-500"
                            : "bg-secondary/10 text-secondary"
                    }`}
                  >
                    {getTriggerIcon(automation.triggerType)}
                  </div>
                  <div>
                    <div className="font-medium">
                      {automation.triggerType === TriggerType.FOLLOWER && "On Follow"}
                      {automation.triggerType === TriggerType.SUBSCRIBER && "On Subscribe"}
                      {automation.triggerType === TriggerType.DONATION && "On Donation"}
                      {automation.triggerType === TriggerType.TIMER && "Every "}
                      {automation.triggerType === TriggerType.CHAT_COMMAND && "On Chat Command"}

                      {automation.triggerType === TriggerType.TIMER &&
                        (Number.parseInt(automation.triggerValue || "60") < 60
                          ? `${automation.triggerValue} seconds`
                          : `${Math.floor(Number.parseInt(automation.triggerValue || "60") / 60)} minutes`)}

                      {automation.triggerType === TriggerType.CHAT_COMMAND && ` "${automation.triggerValue}"`}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Triggered when this event occurs</div>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-muted rounded-md">
                  <div
                    className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center ${
                      automation.actionType === ActionType.CHAT_MESSAGE
                        ? "bg-blue-500/10 text-blue-500"
                        : automation.actionType === ActionType.OVERLAY
                          ? "bg-purple-500/10 text-purple-500"
                          : automation.actionType === ActionType.SOUND
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-emerald-500/10 text-emerald-500"
                    }`}
                  >
                    {getActionIcon(automation.actionType)}
                  </div>
                  <div>
                    <div className="font-medium">
                      {automation.actionType === ActionType.CHAT_MESSAGE && "Send Chat Message"}
                      {automation.actionType === ActionType.OVERLAY && "Show Overlay"}
                      {automation.actionType === ActionType.SOUND && "Play Sound"}
                      {automation.actionType === ActionType.CUSTOM_API && "Custom API Call"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {automation.actionType === ActionType.CHAT_MESSAGE &&
                      automation.actionData.message &&
                      automation.actionData.message.length > 30
                        ? `"${automation.actionData.message.substring(0, 30)}..."`
                        : `"${automation.actionData.message}"`}
                      {automation.actionType === ActionType.OVERLAY &&
                        `Animation: ${automation.actionData.animationType || "Default"}`}
                      {automation.actionType === ActionType.SOUND &&
                        `Sound: ${automation.actionData.soundName || "Default"}`}
                      {automation.actionType === ActionType.CUSTOM_API &&
                        `Endpoint: ${automation.actionData.endpoint || "Custom endpoint"}`}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="px-6 py-3 flex justify-between border-t border-border mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(automation.id)}
              >
                <Trash2 size={16} className="mr-1" />
                Delete
              </Button>
              <div className="space-x-2">
                <Button variant="ghost" size="sm" onClick={() => console.log("Testing automation")}>
                  <Play size={16} className="mr-1" />
                  Test
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(automation)}>
                  <Edit2 size={16} className="mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Automation Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Automation</DialogTitle>
          </DialogHeader>

          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Automation Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. New Follower Alert" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Brief description of this automation" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="triggerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trigger Type</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          // Set default trigger value based on type
                          if (value === TriggerType.TIMER) {
                            createForm.setValue("triggerValue", "60")
                          } else if (value === TriggerType.CHAT_COMMAND) {
                            createForm.setValue("triggerValue", "!command")
                          } else {
                            createForm.setValue("triggerValue", "1")
                          }
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select trigger" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={TriggerType.FOLLOWER}>New Follower</SelectItem>
                          <SelectItem value={TriggerType.SUBSCRIBER}>New Subscriber</SelectItem>
                          <SelectItem value={TriggerType.DONATION}>Donation/Bits</SelectItem>
                          <SelectItem value={TriggerType.TIMER}>Timer</SelectItem>
                          <SelectItem value={TriggerType.CHAT_COMMAND}>Chat Command</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="triggerValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {createForm.watch("triggerType") === TriggerType.TIMER
                          ? "Interval (seconds)"
                          : createForm.watch("triggerType") === TriggerType.CHAT_COMMAND
                            ? "Command"
                            : "Trigger Threshold"}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="actionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action Type</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        // Set default action data based on type
                        if (value === ActionType.CHAT_MESSAGE) {
                          createForm.setValue("actionData", { message: "Thanks for the support!" })
                        } else if (value === ActionType.OVERLAY) {
                          createForm.setValue("actionData", { animationType: "default", duration: 5 })
                        } else if (value === ActionType.SOUND) {
                          createForm.setValue("actionData", { soundName: "alert", volume: 80 })
                        } else {
                          createForm.setValue("actionData", { endpoint: "", method: "GET" })
                        }
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ActionType.CHAT_MESSAGE}>Send Chat Message</SelectItem>
                        <SelectItem value={ActionType.OVERLAY}>Show Overlay</SelectItem>
                        <SelectItem value={ActionType.SOUND}>Play Sound</SelectItem>
                        <SelectItem value={ActionType.CUSTOM_API}>Custom API Call</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {createForm.watch("actionType") === ActionType.CHAT_MESSAGE && (
                <FormField
                  control={createForm.control}
                  name="actionData.message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Message to send in chat" className="min-h-24" />
                      </FormControl>
                      <FormDescription>You can use {"{username}"} to mention the user.</FormDescription>
                    </FormItem>
                  )}
                />
              )}

              {createForm.watch("actionType") === ActionType.OVERLAY && (
                <div className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="actionData.animationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Animation Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select animation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="celebration">Celebration</SelectItem>
                            <SelectItem value="fireworks">Fireworks</SelectItem>
                            <SelectItem value="hearts">Hearts</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="actionData.duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (seconds)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {createForm.watch("actionType") === ActionType.SOUND && (
                <div className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="actionData.soundName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sound</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sound" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="alert">Alert</SelectItem>
                            <SelectItem value="chime">Chime</SelectItem>
                            <SelectItem value="tada">Tada</SelectItem>
                            <SelectItem value="applause">Applause</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="actionData.volume"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volume (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {createForm.watch("actionType") === ActionType.CUSTOM_API && (
                <div className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="actionData.endpoint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Endpoint</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/api/endpoint" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="actionData.method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HTTP Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="GET">GET</SelectItem>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={createForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>Enable or disable this automation</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAutomationMutation.isPending}>
                  {createAutomationMutation.isPending ? "Creating..." : "Create Automation"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Automation Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Automation</DialogTitle>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              {/* Same form fields as create dialog */}
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Automation Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="triggerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trigger Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select trigger" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={TriggerType.FOLLOWER}>New Follower</SelectItem>
                          <SelectItem value={TriggerType.SUBSCRIBER}>New Subscriber</SelectItem>
                          <SelectItem value={TriggerType.DONATION}>Donation/Bits</SelectItem>
                          <SelectItem value={TriggerType.TIMER}>Timer</SelectItem>
                          <SelectItem value={TriggerType.CHAT_COMMAND}>Chat Command</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="triggerValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {editForm.watch("triggerType") === TriggerType.TIMER
                          ? "Interval (seconds)"
                          : editForm.watch("triggerType") === TriggerType.CHAT_COMMAND
                            ? "Command"
                            : "Trigger Threshold"}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="actionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ActionType.CHAT_MESSAGE}>Send Chat Message</SelectItem>
                        <SelectItem value={ActionType.OVERLAY}>Show Overlay</SelectItem>
                        <SelectItem value={ActionType.SOUND}>Play Sound</SelectItem>
                        <SelectItem value={ActionType.CUSTOM_API}>Custom API Call</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {editForm.watch("actionType") === ActionType.CHAT_MESSAGE && (
                <FormField
                  control={editForm.control}
                  name="actionData.message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-24" />
                      </FormControl>
                      <FormDescription>You can use {"{username}"} to mention the user.</FormDescription>
                    </FormItem>
                  )}
                />
              )}

              {/* Similar fields for other action types */}

              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>Enable or disable this automation</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editAutomationMutation.isPending}>
                  {editAutomationMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Tips section */}
      <Card className="mt-8 border-border">
        <CardHeader>
          <CardTitle>Automation Tips</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Heart size={18} />
              </div>
              <h3 className="font-medium">Engagement Ideas</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Create a welcome message for first-time chatters</li>
              <li>• Thank followers and subscribers automatically</li>
              <li>• Set up hourly reminders for giveaways or social media</li>
            </ul>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <Code size={18} />
              </div>
              <h3 className="font-medium">Variable Reference</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• {"{username}"} - User's display name</li>
              <li>• {"{platform}"} - Twitch, YouTube, etc.</li>
              <li>• {"{amount}"} - Donation amount</li>
              <li>• {"{uptime}"} - Stream duration</li>
            </ul>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                <AlertTriangle size={18} />
              </div>
              <h3 className="font-medium">Best Practices</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Avoid too many overlapping automations</li>
              <li>• Test automations before going live</li>
              <li>• Keep chat messages concise and friendly</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="flex items-center space-x-2">
              <PlatformIcon platform="twitch" size={20} />
              <PlatformIcon platform="youtube" size={20} />
              <PlatformIcon platform="facebook" size={20} />
            </div>
            <span className="ml-2">Platform Support</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            <p>
              Automations work across all your connected streaming platforms. Events from Twitch, YouTube, and Facebook
              will trigger the same automations, providing a consistent experience for your viewers.
            </p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}

export default AutomationsPage
