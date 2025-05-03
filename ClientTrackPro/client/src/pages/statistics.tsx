"use client"

import type React from "react"
import { useState } from "react"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Download,
  Calendar,
  BarChart2,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Users,
} from "lucide-react"
import { PlatformIcon } from "@/components/ui/platform-icon"
import { useQuery } from "@tanstack/react-query"
import type { StreamStats } from "@shared/schema"

// Mock data generator for statistics
const generateDataForPeriod = (days: number) => {
  const data = []
  const now = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(now.getTime() - (days - i - 1) * 24 * 60 * 60 * 1000)
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      viewers: Math.floor(Math.random() * 500) + 500,
      followers: Math.floor(Math.random() * 50) + 20,
      subscribers: Math.floor(Math.random() * 10) + 5,
      chatMessages: Math.floor(Math.random() * 1000) + 500,
      revenue: Math.floor(Math.random() * 200) + 50,
    })
  }

  return data
}

const COLORS = ["#6441A4", "#1E88E5", "#1877F2", "#F44336", "#4CAF50"]

const StatisticsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState("7days")
  const [chartType, setChartType] = useState("overview")
  const data = generateDataForPeriod(timeframe === "7days" ? 7 : timeframe === "30days" ? 30 : 90)

  // Platform distribution data
  const platformData = [
    { name: "Twitch", value: 65 },
    { name: "YouTube", value: 25 },
    { name: "Facebook", value: 10 },
  ]

  // Viewer retention data
  const retentionData = [
    { name: "0-5 min", viewers: 1200 },
    { name: "5-15 min", viewers: 950 },
    { name: "15-30 min", viewers: 750 },
    { name: "30-60 min", viewers: 600 },
    { name: "60+ min", viewers: 450 },
  ]

  const { data: streamStats, isLoading } = useQuery<StreamStats[]>({
    queryKey: ["/api/users/1/streams", { limit: 10 }], // Using static user ID for demo
  })

  // Calculate aggregate stats
  const calculateAggregateStats = () => {
    if (!data || data.length === 0)
      return {
        totalViewers: 0,
        avgViewers: 0,
        totalFollowers: 0,
        totalSubscribers: 0,
        totalRevenue: 0,
      }

    const totalViewers = data.reduce((sum, item) => sum + item.viewers, 0)
    const avgViewers = Math.round(totalViewers / data.length)
    const totalFollowers = data.reduce((sum, item) => sum + item.followers, 0)
    const totalSubscribers = data.reduce((sum, item) => sum + item.subscribers, 0)
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)

    return { totalViewers, avgViewers, totalFollowers, totalSubscribers, totalRevenue }
  }

  const stats = calculateAggregateStats()

  return (
    <DashboardLayout title="Statistics" subtitle="Detailed analytics of your streaming performance">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Calendar size={20} className="text-muted-foreground" />
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <Download size={16} />
          <span>Export Data</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Avg. Viewers</p>
              <h3 className="text-2xl font-bold mt-1">{stats.avgViewers}</h3>
              <p className="text-xs text-green-500">+12.5%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Watch Time (hrs)</p>
              <h3 className="text-2xl font-bold mt-1">1,254</h3>
              <p className="text-xs text-green-500">+8.3%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Total Followers</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalFollowers}</h3>
              <p className="text-xs text-green-500">+5.2%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Total Subscribers</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalSubscribers}</h3>
              <p className="text-xs text-green-500">+15.7%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Revenue</p>
              <h3 className="text-2xl font-bold mt-1">${stats.totalRevenue}</h3>
              <p className="text-xs text-green-500">+10.2%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={chartType} onValueChange={setChartType} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart2 size={16} className="mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="viewers">
            <Users size={16} className="mr-2" />
            Viewers
          </TabsTrigger>
          <TabsTrigger value="platforms">
            <PieChartIcon size={16} className="mr-2" />
            Platforms
          </TabsTrigger>
          <TabsTrigger value="growth">
            <LineChartIcon size={16} className="mr-2" />
            Channel Growth
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Viewer Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1E1E1E",
                        borderColor: "#333",
                        color: "#E0E0E0",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="viewers" name="Average Viewers" fill="#6441A4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="chatMessages" name="Chat Messages" fill="#1E88E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Followers & Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1E1E1E",
                          borderColor: "#333",
                          color: "#E0E0E0",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="followers"
                        name="Followers"
                        stroke="#4CAF50"
                        activeDot={{ r: 8 }}
                      />
                      <Line type="monotone" dataKey="subscribers" name="Subscribers" stroke="#6441A4" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1E1E1E",
                          borderColor: "#333",
                          color: "#E0E0E0",
                        }}
                        formatter={(value) => [`$${value}`, "Revenue"]}
                      />
                      <Bar dataKey="revenue" name="Revenue ($)" fill="#F44336" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="viewers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Viewer Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={retentionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1E1E1E",
                          borderColor: "#333",
                          color: "#E0E0E0",
                        }}
                      />
                      <Bar dataKey="viewers" name="Viewers" fill="#6441A4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Stream Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 overflow-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2">Date</th>
                        <th className="text-left py-2">Title</th>
                        <th className="text-left py-2">Duration</th>
                        <th className="text-right py-2">Avg. Viewers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(streamStats &&
                        streamStats.map((stream, index) => (
                          <tr key={stream.id || index} className="border-b border-border">
                            <td className="py-2">
                              {new Date(stream.startTime).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td className="py-2">{stream.title}</td>
                            <td className="py-2">
                              {stream.endTime
                                ? `${Math.floor((new Date(stream.endTime).getTime() - new Date(stream.startTime).getTime()) / (1000 * 60 * 60))}h ${Math.floor((new Date(stream.endTime).getTime() - new Date(stream.startTime).getTime()) / (1000 * 60)) % 60}m`
                                : "Live"}
                            </td>
                            <td className="text-right py-2">{stream.averageViewers}</td>
                          </tr>
                        ))) ||
                        Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <tr key={i} className="border-b border-border">
                              <td className="py-2">May {15 + i}, 2023</td>
                              <td className="py-2">Streaming with Viewers</td>
                              <td className="py-2">2h 45m</td>
                              <td className="text-right py-2">{750 + i * 50}</td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Viewer Activity by Hour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    data={[
                      { hour: "12am", viewers: 120 },
                      { hour: "2am", viewers: 80 },
                      { hour: "4am", viewers: 40 },
                      { hour: "6am", viewers: 30 },
                      { hour: "8am", viewers: 50 },
                      { hour: "10am", viewers: 120 },
                      { hour: "12pm", viewers: 230 },
                      { hour: "2pm", viewers: 350 },
                      { hour: "4pm", viewers: 480 },
                      { hour: "6pm", viewers: 700 },
                      { hour: "8pm", viewers: 900 },
                      { hour: "10pm", viewers: 650 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="hour" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1E1E1E",
                        borderColor: "#333",
                        color: "#E0E0E0",
                      }}
                    />
                    <Line type="monotone" dataKey="viewers" name="Average Viewers" stroke="#6441A4" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {platformData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1E1E1E",
                          borderColor: "#333",
                          color: "#E0E0E0",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Platform Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <PlatformIcon platform="twitch" size={20} />
                        <h3 className="font-medium">Twitch</h3>
                      </div>
                      <span className="text-sm">65% of viewers</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Avg. Viewers</span>
                        <span>482</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Chat Messages</span>
                        <span>2,145</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Engagement Rate</span>
                        <span>8.2%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <PlatformIcon platform="youtube" size={20} />
                        <h3 className="font-medium">YouTube</h3>
                      </div>
                      <span className="text-sm">25% of viewers</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Avg. Viewers</span>
                        <span>186</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Chat Messages</span>
                        <span>932</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Engagement Rate</span>
                        <span>6.5%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <PlatformIcon platform="facebook" size={20} />
                        <h3 className="font-medium">Facebook</h3>
                      </div>
                      <span className="text-sm">10% of viewers</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Avg. Viewers</span>
                        <span>75</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Chat Messages</span>
                        <span>421</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Engagement Rate</span>
                        <span>5.8%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Cross-Platform Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { metric: "Followers", twitch: 24531, youtube: 12785, facebook: 8429 },
                      { metric: "Subscribers", twitch: 437, youtube: 215, facebook: 126 },
                      { metric: "Avg. Viewers", twitch: 482, youtube: 186, facebook: 75 },
                      { metric: "Growth Rate", twitch: 5.2, youtube: 3.8, facebook: 2.1 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="metric" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1E1E1E",
                        borderColor: "#333",
                        color: "#E0E0E0",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="twitch" name="Twitch" fill="#6441A4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="youtube" name="YouTube" fill="#1E88E5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="facebook" name="Facebook" fill="#1877F2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Channel Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1E1E1E",
                        borderColor: "#333",
                        color: "#E0E0E0",
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="followers" name="New Followers" stroke="#4CAF50" strokeWidth={2} />
                    <Line
                      type="monotone"
                      dataKey="subscribers"
                      name="New Subscribers"
                      stroke="#6441A4"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Growth Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: "Jan", followers: 2.1, subscribers: 1.5 },
                        { month: "Feb", followers: 2.5, subscribers: 1.8 },
                        { month: "Mar", followers: 3.2, subscribers: 2.1 },
                        { month: "Apr", followers: 4.1, subscribers: 2.4 },
                        { month: "May", followers: 5.2, subscribers: 3.2 },
                        { month: "Jun", followers: 6.5, subscribers: 4.5 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="month" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1E1E1E",
                          borderColor: "#333",
                          color: "#E0E0E0",
                        }}
                        formatter={(value) => [`${value}%`, "Growth Rate"]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="followers"
                        name="Follower Growth %"
                        stroke="#4CAF50"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="subscribers"
                        name="Subscriber Growth %"
                        stroke="#6441A4"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { platform: "Twitch", rate: 1.78 },
                        { platform: "YouTube", rate: 1.68 },
                        { platform: "Facebook", rate: 1.49 },
                        { platform: "Overall", rate: 1.72 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="platform" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1E1E1E",
                          borderColor: "#333",
                          color: "#E0E0E0",
                        }}
                        formatter={(value) => [`${value}%`, "Follower to Subscriber Conversion"]}
                      />
                      <Bar dataKey="rate" name="Conversion Rate %" fill="#F44336" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}

export default StatisticsPage
