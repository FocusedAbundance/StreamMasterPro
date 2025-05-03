"use client"

import type React from "react"
import { useState } from "react"
import {
  Card,
  CardContent,
  Progress,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { type Goal as GoalType, GoalType as GoalTypeEnum } from "@shared/schema"
import { apiRequest } from "@/lib/queryClient"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  targetValue: z.coerce.number().positive("Target must be a positive number"),
  currentValue: z.coerce.number().min(0, "Current value cannot be negative"),
  goalType: z.string(),
  deadline: z.string().optional(),
})

const Goal: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: goals, isLoading } = useQuery<GoalType[]>({
    queryKey: ["/api/users/1/goals", { active: true }], // Using static user ID for demo
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      targetValue: 500,
      currentValue: 0,
      goalType: GoalTypeEnum.FOLLOWERS,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
  })

  const editGoalMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // For this demo, we'll update the first goal
      if (goals && goals[0]) {
        const response = await apiRequest("PUT", `/api/goals/${goals[0].id}`, {
          ...values,
          deadline: values.deadline ? new Date(values.deadline) : undefined,
        })
        return response.json()
      }
      return null
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/1/goals"] })
      setIsDialogOpen(false)
    },
  })

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    editGoalMutation.mutate(values)
  }

  // Default goal to display if API fetch hasn't completed
  const defaultGoal = {
    id: 1,
    title: "Monthly Subscribers",
    targetValue: 500,
    currentValue: 450,
    goalType: GoalTypeEnum.SUBSCRIBERS,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true,
  }

  const goal = goals && goals.length > 0 ? goals[0] : defaultGoal
  const goalPercentage = Math.round((goal.currentValue / goal.targetValue) * 100)

  // Calculate days left
  const deadline = new Date(goal.deadline || Date.now())
  const today = new Date()
  const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  const openEditDialog = () => {
    // Populate form with current goal data
    form.reset({
      title: goal.title,
      targetValue: goal.targetValue,
      currentValue: goal.currentValue,
      goalType: goal.goalType,
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split("T")[0] : undefined,
    })
    setIsDialogOpen(true)
  }

  return (
    <>
      <Card className="border-border overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-foreground">Monthly Goal</h3>
            <button className="text-xs text-primary hover:underline" onClick={openEditDialog}>
              Edit Goal
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {goal.title}: {goal.currentValue}/{goal.targetValue}
          </p>
          <Progress value={goalPercentage} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground">
            {goalPercentage}% achieved - {daysLeft} days left
          </p>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
                        <SelectItem value={GoalTypeEnum.FOLLOWERS}>Followers</SelectItem>
                        <SelectItem value={GoalTypeEnum.SUBSCRIBERS}>Subscribers</SelectItem>
                        <SelectItem value={GoalTypeEnum.DONATIONS}>Donations</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                control={form.control}
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

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
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
    </>
  )
}

export default Goal
