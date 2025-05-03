"use client"

import type React from "react"
import { useState } from "react"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Flag, Plus, Edit2, Trash2, Check, UserPlus, Crown, DollarSign, Calendar } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { type Goal, GoalType } from "@shared/schema"
import { apiRequest } from "@/lib/queryClient"
import { format } from "date-fns"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  targetValue: z.coerce.number().positive("Target must be a positive number"),
  currentValue: z.coerce.number().min(0, "Current value cannot be negative"),
  goalType: z.string(),
  deadline: z.string().optional(),
  isActive: z.boolean().default(true),
})

const GoalsPage: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [activeTab, setActiveTab] = useState("active")

  const queryClient = useQueryClient()

  const { data: goals, isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/users/1/goals"], // Using static user ID for demo
  })

  const createForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      targetValue: 100,
      currentValue: 0,
      goalType: GoalType.FOLLOWERS,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      isActive: true,
    },
  })

  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      targetValue: 100,
      currentValue: 0,
      goalType: GoalType.FOLLOWERS,
      deadline: "",
      isActive: true,
    },
  })

  const createGoalMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/users/1/goals", {
        ...values,
        userId: 1, // Static user ID for demo
        deadline: values.deadline ? new Date(values.deadline) : undefined,
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/1/goals"] })
      setIsCreateDialogOpen(false)
      createForm.reset()
    },
  })

  const editGoalMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!selectedGoal) return null

      const response = await apiRequest("PUT", `/api/goals/${selectedGoal.id}`, {
        ...values,
        deadline: values.deadline ? new Date(values.deadline) : undefined,
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/1/goals"] })
      setIsEditDialogOpen(false)
      setSelectedGoal(null)
    },
  })

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/goals/${id}`, {})
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/1/goals"] })
    },
  })

  const handleCreateSubmit = (values: z.infer<typeof formSchema>) => {
    createGoalMutation.mutate(values)
  }

  const handleEditSubmit = (values: z.infer<typeof formSchema>) => {
    editGoalMutation.mutate(values)
  }

  const handleEdit = (goal: Goal) => {
    setSelectedGoal(goal)
    editForm.reset({
      title: goal.title,
      targetValue: goal.targetValue,
      currentValue: goal.currentValue,
      goalType: goal.goalType,
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split("T")[0] : undefined,
      isActive: goal.isActive,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      deleteGoalMutation.mutate(id)
    }
  }

  // Filter goals based on active tab
  const filteredGoals = goals?.filter((goal) => (activeTab === "active" ? goal.isActive : !goal.isActive)) || []

  // Sample goals for display when API data is not yet loaded
  const sampleGoals = [
    {
      id: 1,
      title: "Monthly Subscribers",
      targetValue: 500,
      currentValue: 450,
      goalType: GoalType.SUBSCRIBERS,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      title: "Follower Goal",
      targetValue: 50000,
      currentValue: 45745,
      goalType: GoalType.FOLLOWERS,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      id: 3,
      title: "Donation Goal - New PC",
      targetValue: 2500,
      currentValue: 1832,
      goalType: GoalType.DONATIONS,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      id: 4,
      title: "Last Month Subscribers",
      targetValue: 400,
      currentValue: 412,
      goalType: GoalType.SUBSCRIBERS,
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      isActive: false,
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    },
  ]

  const displayGoals =
    filteredGoals.length > 0
      ? filteredGoals
      : sampleGoals.filter((goal) => (activeTab === "active" ? goal.isActive : !goal.isActive))

  // Get goal icon based on type
  const getGoalIcon = (goalType: string) => {
    switch (goalType) {
      case GoalType.FOLLOWERS:
        return <UserPlus size={20} />
      case GoalType.SUBSCRIBERS:
        return <Crown size={20} />
      case GoalType.DONATIONS:
        return <DollarSign size={20} />
      default:
        return <Flag size={20} />
    }
  }

  // Calculate days left or overdue for deadline
  const getDaysLeft = (deadline: Date) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 0) {
      return `${diffDays} days left`
    } else if (diffDays === 0) {
      return "Due today"
    } else {
      return `${Math.abs(diffDays)} days overdue`
    }
  }

  // Format date
  const formatDate = (date: Date) => {
    return format(new Date(date), "MMM d, yyyy")
  }

  return (
    <DashboardLayout title="Goals" subtitle="Track and manage your streaming goals">
      <div className="flex items-center justify-between mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="active">Active Goals</TabsTrigger>
            <TabsTrigger value="completed">Completed Goals</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayGoals.map((goal) => {
          const progress = Math.round((goal.currentValue / goal.targetValue) * 100)
          const isCompleted = goal.currentValue >= goal.targetValue

          return (
            <Card key={goal.id} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle>{goal.title}</CardTitle>
                    <div className="flex items-center text-muted-foreground text-sm space-x-2">
                      <span className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {formatDate(goal.deadline!)}
                      </span>
                      {goal.deadline && (
                        <span
                          className={`${
                            new Date(goal.deadline) < new Date() && !isCompleted
                              ? "text-red-500"
                              : isCompleted
                                ? "text-green-500"
                                : "text-muted-foreground"
                          }`}
                        >
                          {isCompleted ? "Completed" : getDaysLeft(goal.deadline)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      goal.goalType === GoalType.FOLLOWERS
                        ? "bg-green-500/10 text-green-500"
                        : goal.goalType === GoalType.SUBSCRIBERS
                          ? "bg-primary/10 text-primary"
                          : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {getGoalIcon(goal.goalType)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">
                      {goal.currentValue} / {goal.targetValue}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="text-xs text-right text-muted-foreground">{progress}% Complete</div>
                </div>
              </CardContent>
              <CardFooter className="pt-1">
                <div className="flex justify-between w-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-100/10"
                    onClick={() => handleDelete(goal.id)}
                  >
                    <Trash2 size={16} className="mr-1" />
                    Delete
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)}>
                    <Edit2 size={16} className="mr-1" />
                    Edit
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Create Goal Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
          </DialogHeader>

          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Monthly Subscribers" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="goalType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select goal type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={GoalType.FOLLOWERS}>Followers</SelectItem>
                        <SelectItem value={GoalType.SUBSCRIBERS}>Subscribers</SelectItem>
                        <SelectItem value={GoalType.DONATIONS}>Donations</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="currentValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Value</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="targetValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Value</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active Goal</FormLabel>
                      <FormDescription>Active goals will be displayed on your dashboard</FormDescription>
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
                <Button type="submit" disabled={createGoalMutation.isPending}>
                  {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="goalType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select goal type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={GoalType.FOLLOWERS}>Followers</SelectItem>
                        <SelectItem value={GoalType.SUBSCRIBERS}>Subscribers</SelectItem>
                        <SelectItem value={GoalType.DONATIONS}>Donations</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="currentValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Value</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="targetValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Value</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active Goal</FormLabel>
                      <FormDescription>Toggle to show or hide from dashboard</FormDescription>
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
                <Button type="submit" disabled={editGoalMutation.isPending}>
                  {editGoalMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Goal Types Info Card */}
      <Card className="mt-8 border-border">
        <CardHeader>
          <CardTitle>Goal Types Explained</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                <UserPlus size={18} />
              </div>
              <h3 className="font-medium">Follower Goals</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Track follower growth across all platforms. Great for measuring your channel's expansion.
            </p>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Crown size={18} />
              </div>
              <h3 className="font-medium">Subscriber Goals</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Monitor your paid supporters across platforms. This directly impacts your streaming revenue.
            </p>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <DollarSign size={18} />
              </div>
              <h3 className="font-medium">Donation Goals</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Set targets for donations, tips, and bits. Perfect for funding new equipment or projects.
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t border-border pt-4">
          <div className="text-sm text-muted-foreground">
            <p className="flex items-center">
              <Check size={16} className="mr-2 text-green-500" />
              Display goals on stream by using our overlay widget in your streaming software
            </p>
          </div>
        </CardFooter>
      </Card>
    </DashboardLayout>
  )
}

export default GoalsPage
