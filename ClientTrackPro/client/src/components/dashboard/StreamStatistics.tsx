"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Download, Users, Watch, UserPlus, DollarSign } from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from "recharts"

// Generate some sample data for the charts
const generateViewerData = (days: number) => {
  const data = []
  const now = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - (days - 1 - i))

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      viewers: Math.floor(Math.random() * 500) + 500,
      followers: Math.floor(Math.random() * 50) + 20,
      subscribers: Math.floor(Math.random() * 10) + 5,
      revenue: Math.floor(Math.random() * 200) + 50,
    })
  }

  return data
}

const StreamStatistics: React.FC = () => {
  const [timeframe, setTimeframe] = useState("7days")
  const data = generateViewerData(timeframe === "7days" ? 7 : 30)

  // Calculate trends
  const calculateTrend = (metricName: string) => {
    const lastIndex = data.length - 1
    const currentValue = data[lastIndex][metricName]
    const previousValue = data[lastIndex - 1][metricName]

    if (previousValue === 0) return { value: 0, isPositive: true }

    const change = ((currentValue - previousValue) / previousValue) * 100
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0,
    }
  }

  const viewersTrend = calculateTrend("viewers")
  const followersTrend = calculateTrend("followers")
  const subscribersTrend = calculateTrend("subscribers")
  const revenueTrend = calculateTrend("revenue")

  const statItems = [
    {
      title: "Avg. Viewers",
      value: "743",
      trend: viewersTrend,
      icon: <Users size={20} />,
      progress: 65,
      color: "bg-green-500",
    },
    {
      title: "Watch Time (hrs)",
      value: "1,254",
      trend: { value: "8.3", isPositive: true },
      icon: <Watch size={20} />,
      progress: 78,
      color: "bg-green-500",
    },
    {
      title: "New Followers",
      value: "583",
      trend: followersTrend,
      icon: <UserPlus size={20} />,
      progress: 42,
      color: "bg-red-500",
    },
    {
      title: "Revenue",
      value: "$1,832",
      trend: revenueTrend,
      icon: <DollarSign size={20} />,
      progress: 85,
      color: "bg-green-500",
    },
    {
      title: "TikTok Followers",
      value: "15600",
      trend: { value: "6.4", isPositive: true }, // Placeholder trend data
      icon: <TrendingUp size={20} />, // Placeholder icon
      progress: 80,
      color: "bg-green-500",
    },
    {
      title: "Instagram Followers",
      value: "12400",
      trend: { value: "4.2", isPositive: true }, // Placeholder trend data
      icon: <TrendingUp size={20} />, // Placeholder icon
      progress: 70,
      color: "bg-green-500",
    },
  ]

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Stream Statistics</h3>
        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statItems.map((item, index) => (
          <Card key={index} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                  <p className="text-2xl font-semibold text-foreground">{item.value}</p>
                </div>
                <div
                  className={`px-2 py-1 rounded-md ${
                    item.trend.isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  } text-xs font-medium flex items-center`}
                >
                  {item.trend.isPositive ? (
                    <TrendingUp size={14} className="mr-1" />
                  ) : (
                    <TrendingDown size={14} className="mr-1" />
                  )}
                  {item.trend.value}%
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.progress}%` }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="border-border">
          <CardHeader className="p-4 border-b border-border">
            <CardTitle className="text-lg">Viewer Growth</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
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
                  <Area type="monotone" dataKey="viewers" stroke="#6441A4" fill="#6441A4" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="p-4 border-b border-border">
            <CardTitle className="text-lg">Followers & Subscribers</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
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
                  <Bar dataKey="followers" fill="#1E88E5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="subscribers" fill="#6441A4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default StreamStatistics
